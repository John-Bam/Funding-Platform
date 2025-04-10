// src/controllers/milestone.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

class MilestoneController {
  // Get all milestones for a project
  public static async getProjectMilestones(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM milestones WHERE project_id = $1 ORDER BY display_order, created_at',
        [projectId]
      );
      
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single milestone by ID
  public static async getMilestoneById(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM milestones WHERE milestone_id = $1',
        [milestoneId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Milestone not found' });
        return;
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching milestone:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a new milestone
  public static async createMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { 
        title, 
        description,
        start_date,
        target_completion_date,
        funding_required,
        verification_method,
        display_order
      } = req.body;
      
      // Verify the user is the innovator of this project
      const projectCheck = await pool.query(
        'SELECT innovator_id FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectCheck.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      if (projectCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to add milestones to this project' });
        return;
      }
      
      const result = await pool.query(
        `INSERT INTO milestones (
          project_id, title, description, start_date, target_completion_date,
          funding_required, verification_method, display_order, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          projectId, title, description, start_date, target_completion_date,
          funding_required, verification_method, display_order, 'Planned'
        ]
      );
      
      res.status(201).json({
        message: 'Milestone created successfully',
        milestone: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating milestone:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update a milestone
  public static async updateMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      const { 
        title, 
        description,
        start_date,
        target_completion_date,
        funding_required,
        verification_method,
        display_order
      } = req.body;
      
      // Verify the user is the innovator of the project this milestone belongs to
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
      
      if (milestoneCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to update this milestone' });
        return;
      }
      
      const result = await pool.query(
        `UPDATE milestones SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_date = COALESCE($3, start_date),
          target_completion_date = COALESCE($4, target_completion_date),
          funding_required = COALESCE($5, funding_required),
          verification_method = COALESCE($6, verification_method),
          display_order = COALESCE($7, display_order),
          updated_at = CURRENT_TIMESTAMP
        WHERE milestone_id = $8 RETURNING *`,
        [title, description, start_date, target_completion_date, 
         funding_required, verification_method, display_order, milestoneId]
      );
      
      res.status(200).json({
        message: 'Milestone updated successfully',
        milestone: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a milestone
  public static async deleteMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      
      // Verify the user is the innovator of the project this milestone belongs to
      const milestoneCheck = await pool.query(
        `SELECT m.milestone_id, p.innovator_id, m.status
         FROM milestones m 
         JOIN projects p ON m.project_id = p.project_id 
         WHERE m.milestone_id = $1`,
        [milestoneId]
      );
      
      if (milestoneCheck.rows.length === 0) {
        res.status(404).json({ message: 'Milestone not found' });
        return;
      }
      
      if (milestoneCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to delete this milestone' });
        return;
      }
      
      if (milestoneCheck.rows[0].status !== 'Planned') {
        res.status(400).json({ message: 'Only planned milestones can be deleted' });
        return;
      }
      
      await pool.query('DELETE FROM milestones WHERE milestone_id = $1', [milestoneId]);
      
      res.status(200).json({ message: 'Milestone deleted successfully' });
    } catch (error) {
      console.error('Error deleting milestone:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark milestone as completed (by Innovator)
  public static async completeMilestone(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      
      // Verify the user is the innovator of the project this milestone belongs to
      const milestoneCheck = await pool.query(
        `SELECT m.milestone_id, p.innovator_id, m.status
         FROM milestones m 
         JOIN projects p ON m.project_id = p.project_id 
         WHERE m.milestone_id = $1`,
        [milestoneId]
      );
      
      if (milestoneCheck.rows.length === 0) {
        res.status(404).json({ message: 'Milestone not found' });
        return;
      }
      
      if (milestoneCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to complete this milestone' });
        return;
      }
      
      if (milestoneCheck.rows[0].status !== 'Active') {
        res.status(400).json({ message: 'Only active milestones can be marked as completed' });
        return;
      }
      
      const result = await pool.query(
        `UPDATE milestones SET 
          status = 'Completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE milestone_id = $1 RETURNING *`,
        [milestoneId]
      );
      
      res.status(200).json({
        message: 'Milestone marked as completed',
        milestone: result.rows[0]
      });
    } catch (error) {
      console.error('Error completing milestone:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Submit milestone verification
  public static async submitVerification(req: Request, res: Response): Promise<void> {
    try {
      const { milestoneId } = req.params;
      
      // Verify the user is the innovator of the project this milestone belongs to
      const milestoneCheck = await pool.query(
        `SELECT m.milestone_id, p.innovator_id, m.status
         FROM milestones m 
         JOIN projects p ON m.project_id = p.project_id 
         WHERE m.milestone_id = $1`,
        [milestoneId]
      );
      
      if (milestoneCheck.rows.length === 0) {
        res.status(404).json({ message: 'Milestone not found' });
        return;
      }
      
      if (milestoneCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to submit verification for this milestone' });
        return;
      }
      
      if (milestoneCheck.rows[0].status !== 'Completed') {
        res.status(400).json({ message: 'Only completed milestones can be submitted for verification' });
        return;
      }
      
      // Create verification record
      const verificationResult = await pool.query(
        `INSERT INTO milestone_verifications (
          milestone_id, submitted_by, status, submission_date
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
        [milestoneId, req.user?.user_id, 'PendingReview']
      );
      
      // Update milestone status
      await pool.query(
        `UPDATE milestones SET 
          status = 'PendingVerification',
          updated_at = CURRENT_TIMESTAMP
        WHERE milestone_id = $1`,
        [milestoneId]
      );
      
      // Create notification for admins
      await pool.query(
        `INSERT INTO notifications (
          title, message, related_entity_type, related_entity_id, target_role
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'Milestone Verification Requested',
          `A milestone verification has been submitted and requires review`,
          'milestone',
          milestoneId,
          'Admin'
        ]
      );
      
      res.status(200).json({
        message: 'Milestone verification submitted successfully',
        verification: verificationResult.rows[0]
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default MilestoneController;