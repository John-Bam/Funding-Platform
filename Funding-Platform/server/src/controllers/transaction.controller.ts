// src/controllers/transaction.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

class TransactionController {
  // Get user's transactions
  public static async getUserTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      
      // Get user's wallet
      const walletQuery = await pool.query(
        'SELECT wallet_id FROM wallets WHERE user_id = $1',
        [userId]
      );
      
      if (walletQuery.rows.length === 0) {
        res.status(404).json({ message: 'Wallet not found' });
        return;
      }
      
      const walletId = walletQuery.rows[0].wallet_id;
      
      // Get transactions
      const result = await pool.query(
        `SELECT t.*, tt.type_name, ts.status_name
         FROM transactions t
         JOIN transaction_types tt ON t.type_id = tt.type_id
         JOIN txn_status_table ts ON t.status_id = ts.status_id
         WHERE t.wallet_id = $1
         ORDER BY t.created_at DESC`,
        [walletId]
      );
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create deposit transaction
  public static async createDeposit(req: Request, res: Response): Promise<void> {
    try {
      const { amount, payment_method } = req.body;
      const userId = req.user?.user_id;
      
      // Get wallet
      const walletQuery = await pool.query(
        'SELECT wallet_id FROM wallets WHERE user_id = $1',
        [userId]
      );
      
      if (walletQuery.rows.length === 0) {
        res.status(404).json({ message: 'Wallet not found' });
        return;
      }
      
      const walletId = walletQuery.rows[0].wallet_id;
      
      // Get transaction type and status
      const typeQuery = await pool.query(
        'SELECT type_id FROM transaction_types WHERE type_name = $1',
        ['deposit']
      );
      
      const statusQuery = await pool.query(
        'SELECT status_id FROM txn_status_table WHERE status_name = $1',
        ['pending']
      );
      
      // Get payment method
      const methodQuery = await pool.query(
        'SELECT method_id FROM payment_methods WHERE method_name = $1',
        [payment_method]
      );
      
      if (methodQuery.rows.length === 0) {
        res.status(400).json({ message: 'Invalid payment method' });
        return;
      }
      
      // Create transaction
      const result = await pool.query(
        `INSERT INTO transactions (
          wallet_id, type_id, status_id, amount, payment_method_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          walletId,
          typeQuery.rows[0].type_id,
          statusQuery.rows[0].status_id,
          amount,
          methodQuery.rows[0].method_id,
          'Deposit initiated'
        ]
      );
      
      // Create notification for admin approval
      await pool.query(
        `INSERT INTO notifications (
          title, message, related_entity_type, related_entity_id, target_role
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'New Deposit Transaction',
          `A new deposit of $${amount} requires verification`,
          'transaction',
          result.rows[0].transaction_id,
          'Admin'
        ]
      );
      
      res.status(201).json({
        message: 'Deposit initiated and pending approval',
        transaction: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating deposit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create withdrawal transaction
  public static async createWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const { amount, payment_method } = req.body;
      const userId = req.user?.user_id;
      
      // Get wallet and check balance
      const walletQuery = await pool.query(
        'SELECT wallet_id, balance FROM wallets WHERE user_id = $1',
        [userId]
      );
      
      if (walletQuery.rows.length === 0) {
        res.status(404).json({ message: 'Wallet not found' });
        return;
      }
      
      const wallet = walletQuery.rows[0];
      
      // Check if sufficient balance
      if (wallet.balance < amount) {
        res.status(400).json({ message: 'Insufficient funds for withdrawal' });
        return;
      }
      
      // Get transaction type and status
      const typeQuery = await pool.query(
        'SELECT type_id FROM transaction_types WHERE type_name = $1',
        ['withdrawal']
      );
      
      const statusQuery = await pool.query(
        'SELECT status_id FROM txn_status_table WHERE status_name = $1',
        ['pending']
      );
      
      // Get payment method
      const methodQuery = await pool.query(
        'SELECT method_id FROM payment_methods WHERE method_name = $1',
        [payment_method]
      );
      
      if (methodQuery.rows.length === 0) {
        res.status(400).json({ message: 'Invalid payment method' });
        return;
      }
      
      // Create transaction
      const result = await pool.query(
        `INSERT INTO transactions (
          wallet_id, type_id, status_id, amount, payment_method_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          wallet.wallet_id,
          typeQuery.rows[0].type_id,
          statusQuery.rows[0].status_id,
          amount,
          methodQuery.rows[0].method_id,
          'Withdrawal requested'
        ]
      );
      
      // Create notification for admin approval
      await pool.query(
        `INSERT INTO notifications (
          title, message, related_entity_type, related_entity_id, target_role
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'New Withdrawal Request',
          `A withdrawal request of $${amount} requires verification`,
          'transaction',
          result.rows[0].transaction_id,
          'Admin'
        ]
      );
      
      res.status(201).json({
        message: 'Withdrawal requested and pending approval',
        transaction: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Verify transaction (Admin only)
  public static async verifyTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const { approved } = req.body;
      const adminId = req.user?.user_id;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get transaction details
        const txnQuery = await client.query(
          `SELECT t.*, tt.type_name, w.user_id 
           FROM transactions t
           JOIN transaction_types tt ON t.type_id = tt.type_id
           JOIN wallets w ON t.wallet_id = w.wallet_id
           WHERE t.transaction_id = $1`,
          [transactionId]
        );
        
        if (txnQuery.rows.length === 0) {
          throw new Error('Transaction not found');
        }
        
        const transaction = txnQuery.rows[0];
        
        // Get status IDs
        const completedStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['completed']
        );
        
        const rejectedStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['rejected']
        );
        
        if (approved) {
          // Update transaction status to completed
          await client.query(
            `UPDATE transactions 
             SET status_id = $1, verified_by = $2, completed_at = CURRENT_TIMESTAMP 
             WHERE transaction_id = $3`,
            [completedStatusQuery.rows[0].status_id, adminId, transactionId]
          );
          
          // Update wallet balance
          if (transaction.type_name === 'deposit') {
            await client.query(
              'UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2',
              [transaction.amount, transaction.wallet_id]
            );
          } else if (transaction.type_name === 'withdrawal') {
            await client.query(
              'UPDATE wallets SET balance = balance - $1 WHERE wallet_id = $2',
              [transaction.amount, transaction.wallet_id]
            );
          }
          
          // Create notification for user
          await client.query(
            `INSERT INTO notifications (
              user_id, title, message, related_entity_type, related_entity_id
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              transaction.user_id,
              `${transaction.type_name.charAt(0).toUpperCase() + transaction.type_name.slice(1)} Approved`,
              `Your ${transaction.type_name} of $${transaction.amount} has been approved`,
              'transaction',
              transactionId
            ]
          );
        } else {
          // Update transaction status to rejected
          await client.query(
            `UPDATE transactions 
             SET status_id = $1, verified_by = $2 
             WHERE transaction_id = $3`,
            [rejectedStatusQuery.rows[0].status_id, adminId, transactionId]
          );
          
          // Create notification for user
          await client.query(
            `INSERT INTO notifications (
              user_id, title, message, related_entity_type, related_entity_id
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              transaction.user_id,
              `${transaction.type_name.charAt(0).toUpperCase() + transaction.type_name.slice(1)} Rejected`,
              `Your ${transaction.type_name} of $${transaction.amount} has been rejected`,
              'transaction',
              transactionId
            ]
          );
        }
        
        await client.query('COMMIT');
        
        res.status(200).json({
          message: approved ? 'Transaction approved' : 'Transaction rejected'
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default TransactionController;