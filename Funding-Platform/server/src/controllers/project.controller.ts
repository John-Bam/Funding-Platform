// src/controllers/project.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

class ProjectController {
  // Get all projects with optional filters
  public static async getAllProjects(req: Request, res: Response): Promise<void> {
    try {
      const { category, status, innovator_id } = req.query;
      
      let query = 'SELECT * FROM projects WHERE 1=1';
      const queryParams: any[] = [];
      
      if (category) {
        queryParams.push(category);
        query += ` AND category = $${queryParams.length}`;
      }
      
      if (status) {
        queryParams.push(status);
        query += ` AND status = $${queryParams.length}`;
      }
      
      if (innovator_id) {
        queryParams.push(innovator_id);
        query += ` AND innovator_id = $${queryParams.length}`;
      }
      
      const result = await pool.query(query, queryParams);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a single project by ID
  public static async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const result = await pool.query('SELECT * FROM projects WHERE project_id = $1', [projectId]);
      
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a new project
  public static async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { 
        title, 
        short_description, 
        full_description, 
        category, 
        funding_goal, 
        min_investment,
        duration_months,
        sdg_alignment,
        geo_focus
      } = req.body;
      
      // Get innovator ID from authenticated user
      const innovator_id = req.user?.user_id;
      
      const result = await pool.query(
        `INSERT INTO projects (
          innovator_id, title, short_description, full_description, 
          category, funding_goal, min_investment, duration_months,
          sdg_alignment, geo_focus, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          innovator_id, title, short_description, full_description, 
          category, funding_goal, min_investment, duration_months,
          sdg_alignment, geo_focus, 'Draft'
        ]
      );
      
      res.status(201).json({
        message: 'Project created successfully',
        project: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update a project
  public static async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { 
        title, 
        short_description, 
        full_description, 
        category, 
        funding_goal, 
        min_investment,
        duration_months,
        sdg_alignment,
        geo_focus,
        status
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
        res.status(403).json({ message: 'You are not authorized to update this project' });
        return;
      }
      
      const result = await pool.query(
        `UPDATE projects SET 
          title = COALESCE($1, title),
          short_description = COALESCE($2, short_description),
          full_description = COALESCE($3, full_description),
          category = COALESCE($4, category),
          funding_goal = COALESCE($5, funding_goal),
          min_investment = COALESCE($6, min_investment),
          duration_months = COALESCE($7, duration_months),
          sdg_alignment = COALESCE($8, sdg_alignment),
          geo_focus = COALESCE($9, geo_focus),
          status = COALESCE($10, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $11 RETURNING *`,
        [title, short_description, full_description, category, funding_goal, 
         min_investment, duration_months, sdg_alignment, geo_focus, status, projectId]
      );
      
      res.status(200).json({
        message: 'Project updated successfully',
        project: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Submit project for approval
  public static async submitProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      // Verify the user is the innovator of this project
      const projectCheck = await pool.query(
        'SELECT innovator_id, status FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectCheck.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      if (projectCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to submit this project' });
        return;
      }
      
      if (projectCheck.rows[0].status !== 'Draft') {
        res.status(400).json({ message: 'This project has already been submitted' });
        return;
      }
      
      const result = await pool.query(
        `UPDATE projects SET 
          status = 'PendingApproval',
          submitted_date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $1 RETURNING *`,
        [projectId]
      );
      
      // Create notification for admins
      await pool.query(
        `INSERT INTO notifications (
          title, message, related_entity_type, related_entity_id, target_role
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'New Project Submission',
          `New project "${result.rows[0].title}" has been submitted for approval`,
          'project',
          projectId,
          'Admin'
        ]
      );
      
      res.status(200).json({
        message: 'Project submitted for approval',
        project: result.rows[0]
      });
    } catch (error) {
      console.error('Error submitting project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a project (only if in Draft status)
  public static async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      
      // Verify the user is the innovator of this project
      const projectCheck = await pool.query(
        'SELECT innovator_id, status FROM projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectCheck.rows.length === 0) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
      
      if (projectCheck.rows[0].innovator_id !== req.user?.user_id) {
        res.status(403).json({ message: 'You are not authorized to delete this project' });
        return;
      }
      
      if (projectCheck.rows[0].status !== 'Draft') {
        res.status(400).json({ message: 'Only draft projects can be deleted' });
        return;
      }
      
      await pool.query('DELETE FROM projects WHERE project_id = $1', [projectId]);
      
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default ProjectController;