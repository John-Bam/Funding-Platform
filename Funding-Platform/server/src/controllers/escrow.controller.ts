import { Request, Response } from 'express';
import pool from '../config/database';

class EscrowController {
  /**
   * Get all escrow accounts
   * Restricted to Admin and EscrowManager roles
   */
  public static async getAllEscrowAccounts(req: Request, res: Response): Promise<void> {
    try {
      const result = await pool.query(
        `SELECT e.*, 
                m.title as milestone_title, 
                p.title as project_title, 
                p.innovator_id
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN projects p ON m.project_id = p.project_id
         ORDER BY e.created_at DESC`
      );
      
      res.status(200).json(result.rows);
    } catch (error: any) {
      console.error('Error fetching escrow accounts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get escrow account by ID
   * Accessible by Admin, EscrowManager, and the project's Innovator
   */
  public static async getEscrowById(req: Request, res: Response): Promise<void> {
    try {
      const { escrowId } = req.params;
      
      const result = await pool.query(
        `SELECT e.*, 
                m.title as milestone_title, 
                p.title as project_title,
                p.innovator_id,
                u.full_name as innovator_name
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN projects p ON m.project_id = p.project_id
         JOIN users u ON p.innovator_id = u.user_id
         WHERE e.escrow_id = $1`,
        [escrowId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Escrow account not found' });
        return;
      }
      
      // Check if user is authorized to view this escrow
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = result.rows[0].innovator_id === req.user?.user_id;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to view this escrow account' });
        return;
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching escrow account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all escrow accounts for a project
   * Accessible by Admin, EscrowManager, and the project's Innovator
   */
  public static async getProjectEscrowAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      // Check if project exists and user has access
      const projectCheck = await pool.query(
        'SELECT innovator_id FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectCheck.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      // Check authorization
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = projectCheck.rows[0].innovator_id === req.user?.user_id;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to view project escrow accounts' });
        return;
      }
      
      const result = await pool.query(
        `SELECT e.*, 
                m.title as milestone_title,
                m.status as milestone_status
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         WHERE m.project_id = $1
         ORDER BY m.display_order, m.created_at`,
        [projectId]
      );
      
      res.status(200).json(result.rows);
    } catch (error: any) {
      console.error('Error fetching project escrow accounts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get escrow account for a milestone
   * Accessible by Admin, EscrowManager, and the project's Innovator
   */
  public static async getMilestoneEscrow(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      
      // Check if milestone exists and user has access
      const milestoneCheck = await pool.query(
        `SELECT m.milestone_id, p.innovator_id 
         FROM milestones m
         JOIN projects p ON m.project_id = p.project_id
         WHERE m.milestone_id = $1`,
        [milestoneId]
      );
      
      if (milestoneCheck.rows.length === 0) {
        res.status(404).json({ message: 'Milestone not found' });
        return;
      }
      
      // Check authorization
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = milestoneCheck.rows[0].innovator_id === req.user?.user_id;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to view milestone escrow account' });
        return;
      }
      
      const result = await pool.query(
        `SELECT e.*
         FROM escrow_accounts e
         WHERE e.milestone_id = $1`,
        [milestoneId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'No escrow account found for this milestone' });
        return;
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error fetching milestone escrow account:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Create an escrow account for a milestone
   * Restricted to Admin and EscrowManager roles
   */
  public static async createEscrowAccount(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      const { amount } = req.body;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if milestone exists and is in the right state
        const milestoneCheck = await client.query(
          `SELECT m.milestone_id, m.funding_required, m.status, p.project_id, p.innovator_id 
           FROM milestones m
           JOIN projects p ON m.project_id = p.project_id
           WHERE m.milestone_id = $1`,
          [milestoneId]
        );
        
        if (milestoneCheck.rows.length === 0) {
          throw new Error('Milestone not found');
        }
        
        const milestone = milestoneCheck.rows[0];
        
        // Verify milestone is in correct state
        if (milestone.status !== 'Approved') {
          throw new Error('Only approved milestones can have escrow accounts created');
        }
        
        // Check if escrow already exists
        const escrowCheck = await client.query(
          'SELECT escrow_id FROM escrow_accounts WHERE milestone_id = $1',
          [milestoneId]
        );
        
        if (escrowCheck.rows.length > 0) {
          throw new Error('Escrow account already exists for this milestone');
        }
        
        // Verify amount
        if (amount !== milestone.funding_required) {
          throw new Error(`Escrow amount must match milestone funding requirement of ${milestone.funding_required}`);
        }
        
        // Check project has sufficient funding
        const projectQuery = await client.query(
          'SELECT current_funding FROM projects WHERE project_id = $1',
          [milestone.project_id]
        );
        
        if (projectQuery.rows[0].current_funding < amount) {
          throw new Error('Insufficient project funding to create escrow account');
        }
        
        // Create escrow account
        const escrowResult = await client.query(
          `INSERT INTO escrow_accounts (
            milestone_id, amount, status
          ) VALUES ($1, $2, $3) RETURNING *`,
          [milestoneId, amount, 'Locked']
        );
        
        // Create transaction record
        const txnTypeQuery = await client.query(
          'SELECT type_id FROM transaction_types WHERE type_name = $1',
          ['escrow_lock']
        );
        
        const txnStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['completed']
        );
        
        // Create notification for project innovator
        await client.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            milestone.innovator_id,
            'Escrow Account Created',
            `An escrow account of $${amount} has been created for milestone: ${milestone.title}`,
            'milestone',
            milestoneId
          ]
        );
        
        await client.query('COMMIT');
        
        res.status(201).json({
          message: 'Escrow account created successfully',
          escrow: escrowResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error creating escrow account:', error);
      res.status(400).json({ message: error.message || 'Error creating escrow account' });
    }
  }

  /**
   * Release funds from escrow
   * Restricted to EscrowManager role
   */
  public static async releaseFunds(req: Request, res: Response): Promise<void> {
    try {
      const { escrowId } = req.params;
      const { notes } = req.body;
      const managerId = req.user?.user_id;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if escrow exists and is in locked state
        const escrowCheck = await client.query(
          `SELECT e.escrow_id, e.amount, e.status, e.milestone_id, 
                 m.title as milestone_title, m.project_id,
                 p.innovator_id
           FROM escrow_accounts e
           JOIN milestones m ON e.milestone_id = m.milestone_id
           JOIN projects p ON m.project_id = p.project_id
           WHERE e.escrow_id = $1`,
          [escrowId]
        );
        
        if (escrowCheck.rows.length === 0) {
          throw new Error('Escrow account not found');
        }
        
        const escrow = escrowCheck.rows[0];
        
        if (escrow.status !== 'Locked') {
          throw new Error('Funds have already been released or returned');
        }
        
        // Get innovator's wallet
        const walletQuery = await client.query(
          'SELECT wallet_id FROM wallets WHERE user_id = $1',
          [escrow.innovator_id]
        );
        
        if (walletQuery.rows.length === 0) {
          throw new Error('Innovator wallet not found');
        }
        
        const walletId = walletQuery.rows[0].wallet_id;
        
        // Release funds to innovator's wallet
        await client.query(
          'UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2',
          [escrow.amount, walletId]
        );
        
        // Update escrow status
        await client.query(
          `UPDATE escrow_accounts 
           SET status = 'Released', released_at = CURRENT_TIMESTAMP, released_by = $1
           WHERE escrow_id = $2`,
          [managerId, escrowId]
        );
        
        // Create transaction record
        const txnTypeQuery = await client.query(
          'SELECT type_id FROM transaction_types WHERE type_name = $1',
          ['escrow_release']
        );
        
        const txnStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['completed']
        );
        
        await client.query(
          `INSERT INTO transactions (
            wallet_id, type_id, status_id, amount, notes, completed_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [
            walletId,
            txnTypeQuery.rows[0].type_id,
            txnStatusQuery.rows[0].status_id,
            escrow.amount,
            notes || `Funds released from escrow for milestone: ${escrow.milestone_title}`
          ]
        );
        
        // Create notification for project innovator
        await client.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            escrow.innovator_id,
            'Escrow Funds Released',
            `$${escrow.amount} has been released from escrow to your wallet for milestone: ${escrow.milestone_title}`,
            'milestone',
            escrow.milestone_id
          ]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({
          message: 'Funds released successfully from escrow'
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error releasing escrow funds:', error);
      res.status(400).json({ message: error.message || 'Error releasing escrow funds' });
    }
  }
  /**
   * Return funds from escrow to project funding pool
   * Restricted to EscrowManager role
   */
  public static async returnFunds(req: Request, res: Response): Promise<void> {
    try {
      const { escrowId } = req.params;
      const { reason } = req.body;
      const managerId = req.user?.user_id;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if escrow exists and is in locked state
        const escrowCheck = await client.query(
          `SELECT e.escrow_id, e.amount, e.status, e.milestone_id, 
                 m.title as milestone_title, m.project_id,
                 p.innovator_id, p.title as project_title
           FROM escrow_accounts e
           JOIN milestones m ON e.milestone_id = m.milestone_id
           JOIN projects p ON m.project_id = p.project_id
           WHERE e.escrow_id = $1`,
          [escrowId]
        );
        
        if (escrowCheck.rows.length === 0) {
          throw new Error('Escrow account not found');
        }
        
        const escrow = escrowCheck.rows[0];
        
        if (escrow.status !== 'Locked') {
          throw new Error('Funds have already been released or returned');
        }
        
        // Return funds to project funding
        await client.query(
          'UPDATE projects SET current_funding = current_funding + $1 WHERE project_id = $2',
          [escrow.amount, escrow.project_id]
        );
        
        // Update escrow status
        await client.query(
          `UPDATE escrow_accounts 
           SET status = 'Returned', released_at = CURRENT_TIMESTAMP, released_by = $1, return_reason = $2
           WHERE escrow_id = $3`,
          [managerId, reason, escrowId]
        );
        
        // Create transaction record
        const txnTypeQuery = await client.query(
          'SELECT type_id FROM transaction_types WHERE type_name = $1',
          ['escrow_return']
        );
        
        const txnStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['completed']
        );
        
        // Create notification for project innovator
        await client.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            escrow.innovator_id,
            'Escrow Funds Returned to Project',
            `${escrow.amount} has been returned from escrow to the project funding pool for milestone: ${escrow.milestone_title}. Reason: ${reason}`,
            'milestone',
            escrow.milestone_id
          ]
        );
        
        // Update milestone status
        await client.query(
          `UPDATE milestones
           SET status = 'Pending'
           WHERE milestone_id = $1`,
          [escrow.milestone_id]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({
          message: 'Funds returned successfully from escrow to project funding'
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error returning escrow funds:', error);
      res.status(400).json({ message: error.message || 'Error returning escrow funds' });
    }
  }

  /**
   * Create a dispute for an escrow account
   * Can be initiated by Innovator or EscrowManager
   */
  public static async createDispute(req: Request, res: Response): Promise<void> {
    try {
      const { escrowId } = req.params;
      const { reason, description } = req.body;
      const userId = req.user?.user_id;
      
      // Check if escrow exists
      const escrowCheck = await pool.query(
        `SELECT e.escrow_id, e.status, e.milestone_id, 
                m.title as milestone_title, p.project_id, p.innovator_id,
                p.title as project_title
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN projects p ON m.project_id = p.project_id
         WHERE e.escrow_id = $1`,
        [escrowId]
      );
      
      if (escrowCheck.rows.length === 0) {
        res.status(404).json({ message: 'Escrow account not found' });
        return;
      }
      
      const escrow = escrowCheck.rows[0];
      
      // Check authorization
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = escrow.innovator_id === userId;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to create dispute for this escrow account' });
        return;
      }
      
      // Check if escrow is in a state where a dispute can be created
      if (escrow.status !== 'Locked') {
        res.status(400).json({ message: 'Disputes can only be created for locked escrow accounts' });
        return;
      }
      
      // Create dispute
      const dispute = await pool.query(
        `INSERT INTO escrow_disputes (
          escrow_id, raised_by, reason, description, status
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [escrowId, userId, reason, description, 'Open']
      );
      
      // Create notification for relevant parties
      // If innovator created dispute, notify escrow managers
      // If escrow manager created dispute, notify innovator
      if (isInnovator) {
        await pool.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) 
          SELECT 
            user_id, 
            'New Escrow Dispute', 
            $1, 
            'escrow', 
            $2
          FROM users 
          WHERE role = 'EscrowManager' OR role = 'Admin'`,
          [
            `A dispute has been raised for milestone: ${escrow.milestone_title} in project: ${escrow.project_title}`,
            escrowId
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            escrow.innovator_id,
            'New Escrow Dispute',
            `An escrow manager has raised a dispute for milestone: ${escrow.milestone_title} in project: ${escrow.project_title}`,
            'escrow',
            escrowId
          ]
        );
      }
      
      res.status(201).json({
        message: 'Dispute created successfully',
        dispute: dispute.rows[0]
      });
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      res.status(500).json({ message: 'Error creating dispute' });
    }
  }

  /**
   * Get all disputes for an escrow account
   */
  public static async getEscrowDisputes(req: Request, res: Response): Promise<void> {
    try {
      const { escrowId } = req.params;
      
      // Check if escrow exists and user has access
      const escrowCheck = await pool.query(
        `SELECT e.escrow_id, p.innovator_id 
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN projects p ON m.project_id = p.project_id
         WHERE e.escrow_id = $1`,
        [escrowId]
      );
      
      if (escrowCheck.rows.length === 0) {
        res.status(404).json({ message: 'Escrow account not found' });
        return;
      }
      
      // Check authorization
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = escrowCheck.rows[0].innovator_id === req.user?.user_id;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to view disputes for this escrow account' });
        return;
      }
      
      // Get disputes
      const disputes = await pool.query(
        `SELECT ed.*, 
                u.full_name as raised_by_name,
                ur.full_name as resolved_by_name
         FROM escrow_disputes ed
         JOIN users u ON ed.raised_by = u.user_id
         LEFT JOIN users ur ON ed.resolved_by = ur.user_id
         WHERE ed.escrow_id = $1
         ORDER BY ed.created_at DESC`,
        [escrowId]
      );
      
      res.status(200).json(disputes.rows);
    } catch (error: any) {
      console.error('Error fetching escrow disputes:', error);
      res.status(500).json({ message: 'Error fetching escrow disputes' });
    }
  }

  /**
   * Resolve a dispute
   * Restricted to EscrowManager role
   */
  public static async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      const { disputeId } = req.params;
      const { resolution, action, amount } = req.body;
      const managerId = req.user?.user_id;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if dispute exists and is open
        const disputeCheck = await client.query(
          `SELECT ed.*, e.escrow_id, e.amount as escrow_amount, e.status as escrow_status,
                 m.milestone_id, m.title as milestone_title, 
                 p.project_id, p.innovator_id, p.title as project_title
           FROM escrow_disputes ed
           JOIN escrow_accounts e ON ed.escrow_id = e.escrow_id
           JOIN milestones m ON e.milestone_id = m.milestone_id
           JOIN projects p ON m.project_id = p.project_id
           WHERE ed.dispute_id = $1`,
          [disputeId]
        );
        
        if (disputeCheck.rows.length === 0) {
          throw new Error('Dispute not found');
        }
        
        const dispute = disputeCheck.rows[0];
        
        if (dispute.status !== 'Open') {
          throw new Error('Dispute has already been resolved');
        }
        
        if (dispute.escrow_status !== 'Locked') {
          throw new Error('Escrow funds have already been released or returned');
        }
        
        // Handle different resolution actions
        if (action === 'release') {
          // Release full amount to innovator
          // Get innovator's wallet
          const walletQuery = await client.query(
            'SELECT wallet_id FROM wallets WHERE user_id = $1',
            [dispute.innovator_id]
          );
          
          if (walletQuery.rows.length === 0) {
            throw new Error('Innovator wallet not found');
          }
          
          const walletId = walletQuery.rows[0].wallet_id;
          
          // Release funds to innovator's wallet
          await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2',
            [dispute.escrow_amount, walletId]
          );
          
          // Update escrow status
          await client.query(
            `UPDATE escrow_accounts 
             SET status = 'Released', released_at = CURRENT_TIMESTAMP, released_by = $1
             WHERE escrow_id = $2`,
            [managerId, dispute.escrow_id]
          );
          
          // Create transaction record
          const txnTypeQuery = await client.query(
            'SELECT type_id FROM transaction_types WHERE type_name = $1',
            ['escrow_release']
          );
          
          const txnStatusQuery = await client.query(
            'SELECT status_id FROM txn_status_table WHERE status_name = $1',
            ['completed']
          );
          
          await client.query(
            `INSERT INTO transactions (
              wallet_id, type_id, status_id, amount, notes, completed_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
            [
              walletId,
              txnTypeQuery.rows[0].type_id,
              txnStatusQuery.rows[0].status_id,
              dispute.escrow_amount,
              `Funds released from escrow after dispute resolution. Milestone: ${dispute.milestone_title}`
            ]
          );
          
        } else if (action === 'return') {
          // Return full amount to project
          // Return funds to project funding
          await client.query(
            'UPDATE projects SET current_funding = current_funding + $1 WHERE project_id = $2',
            [dispute.escrow_amount, dispute.project_id]
          );
          
          // Update escrow status
          await client.query(
            `UPDATE escrow_accounts 
             SET status = 'Returned', released_at = CURRENT_TIMESTAMP, released_by = $1, return_reason = $2
             WHERE escrow_id = $3`,
            [managerId, resolution, dispute.escrow_id]
          );
          
          // Update milestone status
          await client.query(
            `UPDATE milestones
             SET status = 'Pending'
             WHERE milestone_id = $1`,
            [dispute.milestone_id]
          );
          
        } else if (action === 'partial_release') {
          // Partial release - some to innovator, some back to project
          if (!amount) {
            throw new Error('Amount is required for partial release');
          }
          
          if (amount <= 0 || amount >= dispute.escrow_amount) {
            throw new Error('Partial release amount must be greater than 0 and less than the escrow amount');
          }
          
          // Get innovator's wallet
          const walletQuery = await client.query(
            'SELECT wallet_id FROM wallets WHERE user_id = $1',
            [dispute.innovator_id]
          );
          
          if (walletQuery.rows.length === 0) {
            throw new Error('Innovator wallet not found');
          }
          
          const walletId = walletQuery.rows[0].wallet_id;
          
          // Release partial funds to innovator's wallet
          await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2',
            [amount, walletId]
          );
          
          // Return remaining funds to project
          const remainingAmount = parseFloat(dispute.escrow_amount) - parseFloat(amount.toString());
          await client.query(
            'UPDATE projects SET current_funding = current_funding + $1 WHERE project_id = $2',
            [remainingAmount, dispute.project_id]
          );
          
          // Update escrow status
          await client.query(
            `UPDATE escrow_accounts 
             SET status = 'Partially_Released', released_at = CURRENT_TIMESTAMP, released_by = $1, 
                 partial_amount = $2, return_reason = $3
             WHERE escrow_id = $4`,
            [managerId, amount, resolution, dispute.escrow_id]
          );
          
          // Create transaction record for innovator
          const txnTypeQuery = await client.query(
            'SELECT type_id FROM transaction_types WHERE type_name = $1',
            ['escrow_partial_release']
          );
          
          const txnStatusQuery = await client.query(
            'SELECT status_id FROM txn_status_table WHERE status_name = $1',
            ['completed']
          );
          
          await client.query(
            `INSERT INTO transactions (
              wallet_id, type_id, status_id, amount, notes, completed_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
            [
              walletId,
              txnTypeQuery.rows[0].type_id,
              txnStatusQuery.rows[0].status_id,
              amount,
              `Partial funds released from escrow after dispute resolution. Milestone: ${dispute.milestone_title}`
            ]
          );
        }
        
        // Update dispute status
        await client.query(
          `UPDATE escrow_disputes 
           SET status = 'Resolved', 
               resolved_at = CURRENT_TIMESTAMP, 
               resolved_by = $1, 
               resolution = $2, 
               resolution_action = $3,
               resolution_amount = $4
           WHERE dispute_id = $5`,
          [managerId, resolution, action, amount || null, disputeId]
        );
        
        // Create notification for project innovator
        await client.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            dispute.innovator_id,
            'Escrow Dispute Resolved',
            `The dispute for milestone: ${dispute.milestone_title} has been resolved. Action: ${action}`,
            'escrow',
            dispute.escrow_id
          ]
        );
        
        await client.query('COMMIT');
        
        res.status(200).json({
          message: 'Dispute resolved successfully'
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      res.status(400).json({ message: error.message || 'Error resolving dispute' });
    }
  }

  /**
   * Get summary report of all escrow accounts
   * Restricted to Admin and EscrowManager roles
   */
  public static async getEscrowSummaryReport(req: Request, res: Response): Promise<void> {
    try {
      // Status counts
      const statusCounts = await pool.query(
        `SELECT status, COUNT(*) as count, SUM(amount) as total_amount
         FROM escrow_accounts
         GROUP BY status
         ORDER BY status`
      );
      
      // Monthly statistics
      const monthlyStats = await pool.query(
        `SELECT 
           DATE_TRUNC('month', created_at) as month,
           COUNT(*) as accounts_created,
           SUM(amount) as total_locked,
           SUM(CASE WHEN status = 'Released' THEN amount ELSE 0 END) as total_released,
           SUM(CASE WHEN status = 'Returned' THEN amount ELSE 0 END) as total_returned
         FROM escrow_accounts
         WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP - INTERVAL '11 months')
         GROUP BY DATE_TRUNC('month', created_at)
         ORDER BY month DESC`
      );
      
      // Dispute statistics
      const disputeStats = await pool.query(
        `SELECT 
           COUNT(*) as total_disputes,
           SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_disputes,
           SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_disputes,
           COUNT(DISTINCT escrow_id) as accounts_with_disputes
         FROM escrow_disputes`
      );
      
      // Top innovators by escrow amount
      const topInnovators = await pool.query(
        `SELECT 
           u.user_id, u.full_name, u.email,
           COUNT(DISTINCT e.escrow_id) as escrow_count,
           SUM(e.amount) as total_escrow_amount
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN projects p ON m.project_id = p.project_id
         JOIN users u ON p.innovator_id = u.user_id
         GROUP BY u.user_id, u.full_name, u.email
         ORDER BY total_escrow_amount DESC
         LIMIT 10`
      );
      
      res.status(200).json({
        status_summary: statusCounts.rows,
        monthly_statistics: monthlyStats.rows,
        dispute_statistics: disputeStats.rows[0],
        top_innovators: topInnovators.rows
      });
    } catch (error: any) {
      console.error('Error generating escrow summary report:', error);
      res.status(500).json({ message: 'Error generating escrow summary report' });
    }
  }

  /**
   * Get detailed report of escrow accounts for a project
   */
  public static async getProjectEscrowReport(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      // Check if project exists and user has access
      const projectCheck = await pool.query(
        'SELECT innovator_id, title FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectCheck.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      // Check authorization
      const isAdmin = req.user?.role === 'Admin';
      const isEscrowManager = req.user?.role === 'EscrowManager';
      const isInnovator = projectCheck.rows[0].innovator_id === req.user?.user_id;
      
      if (!isAdmin && !isEscrowManager && !isInnovator) {
        res.status(403).json({ message: 'Not authorized to view project escrow report' });
        return;
      }
      
      // Project summary
      const projectSummary = await pool.query(
        `SELECT 
           p.title as project_title,
           u.full_name as innovator_name,
           COUNT(e.escrow_id) as total_escrows,
           SUM(CASE WHEN e.status = 'Locked' THEN e.amount ELSE 0 END) as locked_amount,
           SUM(CASE WHEN e.status = 'Released' THEN e.amount ELSE 0 END) as released_amount,
           SUM(CASE WHEN e.status = 'Returned' THEN e.amount ELSE 0 END) as returned_amount,
           SUM(CASE WHEN e.status = 'Partially_Released' THEN e.partial_amount ELSE 0 END) as partially_released_amount
         FROM projects p
         JOIN users u ON p.innovator_id = u.user_id
         LEFT JOIN milestones m ON p.project_id = m.project_id
         LEFT JOIN escrow_accounts e ON m.milestone_id = e.milestone_id
         WHERE p.project_id = $1
         GROUP BY p.title, u.full_name`,
        [projectId]
      );
      
      // Milestone escrow details
      const milestoneDetails = await pool.query(
        `SELECT 
           m.milestone_id, m.title as milestone_title, m.display_order, m.status as milestone_status,
           e.escrow_id, e.amount, e.status as escrow_status,
           e.created_at as escrow_created_at, e.released_at,
           ur.full_name as released_by_name,
           COUNT(ed.dispute_id) as dispute_count
         FROM milestones m
         LEFT JOIN escrow_accounts e ON m.milestone_id = e.milestone_id
         LEFT JOIN users ur ON e.released_by = ur.user_id
         LEFT JOIN escrow_disputes ed ON e.escrow_id = ed.escrow_id
         WHERE m.project_id = $1
         GROUP BY 
           m.milestone_id, m.title, m.display_order, m.status,
           e.escrow_id, e.amount, e.status, e.created_at, e.released_at,
           ur.full_name
         ORDER BY m.display_order, m.created_at`,
        [projectId]
      );
      
      // Timeline of escrow events
      const escrowTimeline = await pool.query(
        `SELECT 
           e.escrow_id,
           m.title as milestone_title,
           'created' as event_type,
           e.created_at as event_date,
           NULL as user_name,
           NULL as notes
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         WHERE m.project_id = $1
         
         UNION ALL
         
         SELECT 
           e.escrow_id,
           m.title as milestone_title,
           CASE 
             WHEN e.status = 'Released' THEN 'released'
             WHEN e.status = 'Returned' THEN 'returned'
             WHEN e.status = 'Partially_Released' THEN 'partially_released'
             ELSE e.status
           END as event_type,
           e.released_at as event_date,
           u.full_name as user_name,
           e.return_reason as notes
         FROM escrow_accounts e
         JOIN milestones m ON e.milestone_id = m.milestone_id
         LEFT JOIN users u ON e.released_by = u.user_id
         WHERE m.project_id = $1 AND e.released_at IS NOT NULL
         
         UNION ALL
         
         SELECT 
           e.escrow_id,
           m.title as milestone_title,
           'dispute_created' as event_type,
           ed.created_at as event_date,
           u.full_name as user_name,
           ed.reason as notes
         FROM escrow_disputes ed
         JOIN escrow_accounts e ON ed.escrow_id = e.escrow_id
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN users u ON ed.raised_by = u.user_id
         WHERE m.project_id = $1
         
         UNION ALL
         
         SELECT 
           e.escrow_id,
           m.title as milestone_title,
           'dispute_resolved' as event_type,
           ed.resolved_at as event_date,
           u.full_name as user_name,
           ed.resolution as notes
         FROM escrow_disputes ed
         JOIN escrow_accounts e ON ed.escrow_id = e.escrow_id
         JOIN milestones m ON e.milestone_id = m.milestone_id
         JOIN users u ON ed.resolved_by = u.user_id
         WHERE m.project_id = $1 AND ed.resolved_at IS NOT NULL
         
         ORDER BY event_date DESC`,
        [projectId]
      );
      
      res.status(200).json({
        project_summary: projectSummary.rows[0] || null,
        milestone_details: milestoneDetails.rows,
        escrow_timeline: escrowTimeline.rows
      });
    } catch (error: any) {
      console.error('Error generating project escrow report:', error);
      res.status(500).json({ message: 'Error generating project escrow report' });
    }
  }
}

export default EscrowController;