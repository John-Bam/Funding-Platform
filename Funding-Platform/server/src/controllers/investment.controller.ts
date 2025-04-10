// src/controllers/investment.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

class InvestmentController {
  // Get all investments for an investor
  public static async getInvestorInvestments(req: Request, res: Response): Promise<void> {
    try {
      // Get investor_id from the authenticated user
      const userId = req.user?.user_id;
      
      const investorQuery = await pool.query(
        'SELECT investor_id FROM investors WHERE user_id = $1',
        [userId]
      );
      
      if (investorQuery.rows.length === 0) {
        res.status(404).json({ message: 'Investor profile not found' });
        return;
      }
      
      const investorId = investorQuery.rows[0].investor_id;
      
      const result = await pool.query(
        `SELECT i.*, p.title, p.short_description, p.status as project_status 
         FROM investments i
         JOIN projects p ON i.project_id = p.project_id
         WHERE i.investor_id = $1
         ORDER BY i.investment_date DESC`,
        [investorId]
      );
      
      res.status(200).json(result.rows);
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all investments for a project
  public static async getProjectInvestments(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      // Check project exists and user has access
      const projectQuery = await pool.query(
        'SELECT innovator_id FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      // Only project innovator or admin can see all investments
      const isInnovator = projectQuery.rows[0].innovator_id === req.user?.user_id;
      const isAdmin = req.user?.role === 'Admin';
      
      if (!isInnovator && !isAdmin) {
        res.status(403).json({ message: 'Not authorized to view project investments' });
        return;
      }
      
      const result = await pool.query(
        `SELECT i.*, u.full_name as investor_name
         FROM investments i
         JOIN investors inv ON i.investor_id = inv.investor_id
         JOIN users u ON inv.user_id = u.user_id
         WHERE i.project_id = $1
         ORDER BY i.investment_date DESC`,
        [projectId]
      );
      
      res.status(200).json(result.rows);
    } catch (error: any) {
      console.error('Error fetching project investments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Make a new investment
  public static async makeInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { amount, investment_note } = req.body;
      const userId = req.user?.user_id;
      
      // Start transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check project status
        const projectQuery = await client.query(
          'SELECT status, funding_goal, current_funding, min_investment FROM projects WHERE project_id = $1',
          [projectId]
        );
        
        if (projectQuery.rows.length === 0) {
          throw new Error('Project not found');
        }
        
        const project = projectQuery.rows[0];
        
        // Verify project is seeking funding or partially funded
        if (project.status !== 'SeekingFunding' && project.status !== 'PartiallyFunded') {
          throw new Error('Project is not currently accepting investments');
        }
        
        // Verify minimum investment
        if (amount < project.min_investment) {
          throw new Error(`Minimum investment amount is ${project.min_investment}`);
        }
        
        // Get investor ID
        const investorQuery = await client.query(
          'SELECT investor_id FROM investors WHERE user_id = $1',
          [userId]
        );
        
        if (investorQuery.rows.length === 0) {
          throw new Error('Investor profile not found');
        }
        
        const investorId = investorQuery.rows[0].investor_id;
        
        // Check wallet balance
        const walletQuery = await client.query(
          'SELECT wallet_id, balance FROM wallets WHERE user_id = $1',
          [userId]
        );
        
        if (walletQuery.rows.length === 0) {
          throw new Error('Wallet not found');
        }
        
        const wallet = walletQuery.rows[0];
        
        if (wallet.balance < amount) {
          throw new Error('Insufficient funds in wallet');
        }
        
        // Create investment
        const investmentResult = await client.query(
          `INSERT INTO investments (
            investor_id, project_id, amount, investment_note
          ) VALUES ($1, $2, $3, $4) RETURNING *`,
          [investorId, projectId, amount, investment_note]
        );
        
        // Update wallet balance
        await client.query(
          'UPDATE wallets SET balance = balance - $1 WHERE wallet_id = $2',
          [amount, wallet.wallet_id]
        );
        
        // Update project funding
        const newTotalFunding = project.current_funding + amount;
        let newStatus = project.status;
        
        if (newTotalFunding >= project.funding_goal) {
          newStatus = 'FullyFunded';
        } else if (project.status === 'SeekingFunding') {
          newStatus = 'PartiallyFunded';
        }
        
        await client.query(
          'UPDATE projects SET current_funding = $1, status = $2 WHERE project_id = $3',
          [newTotalFunding, newStatus, projectId]
        );
        
        // Create transaction record
        const txnStatusQuery = await client.query(
          'SELECT status_id FROM txn_status_table WHERE status_name = $1',
          ['completed']
        );
        
        const txnTypeQuery = await client.query(
          'SELECT type_id FROM transaction_types WHERE type_name = $1',
          ['investment']
        );
        
        await client.query(
          `INSERT INTO transactions (
            wallet_id, type_id, status_id, amount, notes, completed_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
          [
            wallet.wallet_id, 
            txnTypeQuery.rows[0].type_id, 
            txnStatusQuery.rows[0].status_id, 
            amount, 
            `Investment in project ${projectId}`
          ]
        );
        
        // Create notification for project innovator
        const projectOwnerQuery = await client.query(
          'SELECT innovator_id FROM projects WHERE project_id = $1',
          [projectId]
        );
        
        await client.query(
          `INSERT INTO notifications (
            user_id, title, message, related_entity_type, related_entity_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            projectOwnerQuery.rows[0].innovator_id,
            'New Investment Received',
            `Your project has received a new investment of $${amount}`,
            'project',
            projectId
          ]
        );
        
        await client.query('COMMIT');
        
        res.status(201).json({
          message: 'Investment successful',
          investment: investmentResult.rows[0]
        });
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Error making investment:', error);
      res.status(400).json({ message: error.message || 'Error making investment' });
    }
  }

  // Get investment simulation
  public static async simulateInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { amount } = req.body;
      const userId = req.user?.user_id;
      
      // Get project details
      const projectQuery = await pool.query(
        'SELECT funding_goal, current_funding, min_investment FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      const project = projectQuery.rows[0];
      
      // Validate amount
      if (amount < project.min_investment) {
        res.status(400).json({ message: `Minimum investment amount is ${project.min_investment}` });
        return;
      }
      
      // Calculate simulation stats
      const newTotalFunding = project.current_funding + amount;
      const sharePercentage = (amount / project.funding_goal) * 100;
      const simulatedShareCount = Math.floor(sharePercentage * 100); // Simple calculation for demonstration
      
      // Record simulation
      const simulationResult = await pool.query(
        `INSERT INTO investment_simulations (
          user_id, project_id, amount, simulated_share_percentage, 
          simulated_share_count, simulated_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
        [userId, projectId, amount, sharePercentage, simulatedShareCount]
      );
      
      res.status(200).json({
        message: 'Investment simulation completed',
        simulation: {
          amount,
          share_percentage: sharePercentage.toFixed(2) + '%',
          share_count: simulatedShareCount,
          new_total_funding: newTotalFunding,
          remaining_to_goal: Math.max(0, project.funding_goal - newTotalFunding),
          funding_percentage: ((newTotalFunding / project.funding_goal) * 100).toFixed(2) + '%'
        }
      });
    } catch (error: any) {
      console.error('Error simulating investment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default InvestmentController;