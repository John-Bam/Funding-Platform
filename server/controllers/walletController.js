// server/controllers/walletController.js
const db = require('../config/db');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT wallet_id, balance
      FROM wallets
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Create a wallet if it doesn't exist
      const createWalletQuery = `
        INSERT INTO wallets (user_id, balance)
        VALUES ($1, 0)
        RETURNING wallet_id, balance
      `;
      
      const createResult = await db.query(createWalletQuery, [userId]);
      
      return res.json({
        success: true,
        data: {
          walletId: createResult.rows[0].wallet_id,
          balance: parseFloat(createResult.rows[0].balance)
        }
      });
    }
    
    return res.json({
      success: true,
      data: {
        walletId: result.rows[0].wallet_id,
        balance: parseFloat(result.rows[0].balance)
      }
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get wallet transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT t.transaction_id as id, 
             tt.type_name as type, 
             ts.status_name as status, 
             t.amount, 
             t.notes,
             t.created_at as date,
             pm.method_name as "paymentMethod",
             t.proof_document_path as "proofOfPayment",
             p.project_id as "projectId",
             p.title as project
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.wallet_id
      JOIN transaction_types tt ON t.type_id = tt.type_id
      JOIN transaction_status ts ON t.status_id = ts.status_id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.method_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE w.user_id = $1
      ORDER BY t.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Create a deposit transaction
exports.createDeposit = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { amount, paymentMethod } = req.body;
    
    // Validate input
    if (!amount || amount <= 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount and payment method are required'
      });
    }
    
    // Get wallet ID
    const walletQuery = `SELECT wallet_id FROM wallets WHERE user_id = $1`;
    const walletResult = await db.query(walletQuery, [userId]);
    
    if (walletResult.rows.length === 0) {
      // Create wallet if it doesn't exist
      const createWalletQuery = `
        INSERT INTO wallets (user_id, balance)
        VALUES ($1, 0)
        RETURNING wallet_id
      `;
      
      const createResult = await db.query(createWalletQuery, [userId]);
      var walletId = createResult.rows[0].wallet_id;
    } else {
      var walletId = walletResult.rows[0].wallet_id;
    }
    
    // Create transaction
    const transactionQuery = `
      INSERT INTO transactions (
        wallet_id, type_id, status_id, amount, payment_method_id, notes, created_at
      )
      VALUES (
        $1,
        (SELECT type_id FROM transaction_types WHERE type_name = 'deposit'),
        (SELECT status_id FROM transaction_status WHERE status_name = 'pending'),
        $2,
        (SELECT method_id FROM payment_methods WHERE method_name = $3),
        $4,
        NOW()
      )
      RETURNING transaction_id
    `;
    
    const notes = `Deposit request via ${paymentMethod}`;
    const transactionResult = await db.query(transactionQuery, [
      walletId,
      amount,
      paymentMethod,
      notes
    ]);
    
    return res.json({
      success: true,
      data: {
        transactionId: transactionResult.rows[0].transaction_id,
        amount,
        paymentMethod,
        status: 'pending'
      },
      message: 'Deposit request created. Please upload proof of payment.'
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Upload proof of payment
exports.uploadProofOfPayment = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.user_id;
    
    // Check if transaction exists and belongs to user
    const checkQuery = `
      SELECT t.transaction_id 
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.wallet_id
      WHERE t.transaction_id = $1 AND w.user_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [transactionId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Transaction not found or does not belong to user' 
      });
    }
    
    // Handle file upload - in a real app, this would store the file
    // For demo purposes, we'll just store the file name
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // Update transaction with proof document path
    const updateQuery = `
      UPDATE transactions
      SET proof_document_path = $1,
          status_id = (SELECT status_id FROM transaction_status WHERE status_name = 'verifying')
      WHERE transaction_id = $2
      RETURNING transaction_id
    `;
    
    const documentPath = req.file.filename || 'proof_' + Date.now() + '.pdf'; // Demo path
    await db.query(updateQuery, [documentPath, transactionId]);
    
    return res.json({
      success: true,
      data: {
        transactionId,
        proofDocument: documentPath,
        status: 'verifying'
      },
      message: 'Proof of payment uploaded successfully. Your deposit is being verified.'
    });
  } catch (error) {
    console.error('Error uploading proof of payment:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Process a withdrawal
exports.createWithdrawal = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { amount, withdrawalMethod, accountDetails } = req.body;
    
    // Validate input
    if (!amount || amount <= 0 || !withdrawalMethod || !accountDetails) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount, withdrawal method, and account details are required'
      });
    }
    
    // Get wallet
    const walletQuery = `SELECT wallet_id, balance FROM wallets WHERE user_id = $1`;
    const walletResult = await db.query(walletQuery, [userId]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }
    
    const wallet = walletResult.rows[0];
    
    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create withdrawal transaction
      const transactionQuery = `
        INSERT INTO transactions (
          wallet_id, type_id, status_id, amount, payment_method_id, notes, created_at
        )
        VALUES (
          $1,
          (SELECT type_id FROM transaction_types WHERE type_name = 'withdrawal'),
          (SELECT status_id FROM transaction_status WHERE status_name = 'pending'),
          $2,
          (SELECT method_id FROM payment_methods WHERE method_name = $3),
          $4,
          NOW()
        )
        RETURNING transaction_id
      `;
      
      const notes = `Withdrawal request via ${withdrawalMethod}: ${accountDetails}`;
      const transactionResult = await client.query(transactionQuery, [
        wallet.wallet_id,
        amount,
        withdrawalMethod,
        notes
      ]);
      
      // Update wallet balance
      const updateWalletQuery = `
        UPDATE wallets
        SET balance = balance - $1
        WHERE wallet_id = $2
      `;
      
      await client.query(updateWalletQuery, [amount, wallet.wallet_id]);
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        data: {
          transactionId: transactionResult.rows[0].transaction_id,
          amount,
          withdrawalMethod,
          status: 'pending'
        },
        message: 'Withdrawal request submitted. It will be processed within 1-3 business days.'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get pending transactions for admin approval
exports.getPendingTransactions = async (req, res) => {
  try {
    // Check if user is admin or escrow manager
    if (req.user.role !== 'Admin' && req.user.role !== 'EscrowManager') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    const query = `
      SELECT t.transaction_id as id, 
             tt.type_name as type, 
             ts.status_name as status, 
             t.amount, 
             t.notes,
             t.created_at as date,
             pm.method_name as "paymentMethod",
             t.proof_document_path as "proofOfPayment",
             u.user_id as "userId",
             u.full_name as "userName",
             p.project_id as "projectId",
             p.title as project
      FROM transactions t
      JOIN wallets w ON t.wallet_id = w.wallet_id
      JOIN users u ON w.user_id = u.user_id
      JOIN transaction_types tt ON t.type_id = tt.type_id
      JOIN transaction_status ts ON t.status_id = ts.status_id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.method_id
      LEFT JOIN projects p ON t.project_id = p.project_id
      WHERE ts.status_name = 'pending' OR ts.status_name = 'verifying'
      ORDER BY t.created_at DESC
    `;
    
    const result = await db.query(query);
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Approve or reject transaction (admin only)
exports.processTransaction = async (req, res) => {
  try {
    // Check if user is admin or escrow manager
    if (req.user.role !== 'Admin' && req.user.role !== 'EscrowManager') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    const { transactionId } = req.params;
    const { action, notes } = req.body;
    
    if (!action || (action !== 'approve' && action !== 'reject')) {
      return res.status(400).json({
        success: false,
        error: 'Valid action (approve or reject) is required'
      });
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get transaction details
      const transactionQuery = `
        SELECT t.transaction_id, t.type_id, t.amount, t.wallet_id,
               tt.type_name as type
        FROM transactions t
        JOIN transaction_types tt ON t.type_id = tt.type_id
        WHERE t.transaction_id = $1
      `;
      
      const transactionResult = await client.query(transactionQuery, [transactionId]);
      
      if (transactionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }
      
      const transaction = transactionResult.rows[0];
      
      // Update transaction status
      const updateQuery = `
        UPDATE transactions
        SET status_id = (SELECT status_id FROM transaction_status WHERE status_name = $1),
            processed_by = $2,
            processed_at = NOW(),
            notes = CASE WHEN $3 IS NOT NULL THEN $3 ELSE notes END
        WHERE transaction_id = $4
        RETURNING transaction_id
      `;
      
      const newStatus = action === 'approve' ? 'completed' : 'rejected';
      await client.query(updateQuery, [
        newStatus,
        req.user.user_id,
        notes,
        transactionId
      ]);
      
      // If it's a deposit and approved, add to wallet balance
      if (transaction.type === 'deposit' && action === 'approve') {
        const updateWalletQuery = `
          UPDATE wallets
          SET balance = balance + $1
          WHERE wallet_id = $2
        `;
        
        await client.query(updateWalletQuery, [transaction.amount, transaction.wallet_id]);
      }
      
      // If it's a withdrawal and rejected, return funds to wallet
      if (transaction.type === 'withdrawal' && action === 'reject') {
        const updateWalletQuery = `
          UPDATE wallets
          SET balance = balance + $1
          WHERE wallet_id = $2
        `;
        
        await client.query(updateWalletQuery, [transaction.amount, transaction.wallet_id]);
      }
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        data: {
          transactionId,
          status: newStatus,
          action
        },
        message: `Transaction ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};