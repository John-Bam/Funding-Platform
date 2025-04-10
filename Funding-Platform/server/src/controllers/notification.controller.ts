// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import pool from '../config/database';

class NotificationController {
  // Get all notifications for the current user
  public static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      const { limit = 10, offset = 0, unreadOnly = false } = req.query;
      
      // Build query
      let query = `
        SELECT * FROM notifications 
        WHERE (user_id = $1 OR (target_role = $2 AND user_id IS NULL))
      `;
      
      const queryParams = [userId, req.user?.role];
      
      if (unreadOnly === 'true') {
        query += ' AND read = false';
      }
      
      query += ' ORDER BY created_at DESC LIMIT $3 OFFSET $4';
      queryParams.push(String(limit), String(offset));
      
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) FROM notifications 
        WHERE (user_id = $1 OR (target_role = $2 AND user_id IS NULL))
        ${unreadOnly === 'true' ? 'AND read = false' : ''}
      `;
      
      const countResult = await pool.query(countQuery, [userId, req.user?.role]);
      
      res.status(200).json({
        notifications: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get unread notification count
  public static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      
      const result = await pool.query(
        `SELECT COUNT(*) FROM notifications 
         WHERE (user_id = $1 OR (target_role = $2 AND user_id IS NULL))
         AND read = false`,
        [userId, req.user?.role]
      );
      
      res.status(200).json({
        unreadCount: parseInt(result.rows[0].count)
      });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark notification as read
  public static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.user_id;
      
      // Check if notification exists and belongs to user
      const notificationCheck = await pool.query(
        `SELECT * FROM notifications 
         WHERE notification_id = $1 
         AND (user_id = $2 OR (target_role = $3 AND user_id IS NULL))`,
        [notificationId, userId, req.user?.role]
      );
      
      if (notificationCheck.rows.length === 0) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      
      // Update notification
      await pool.query(
        'UPDATE notifications SET read = true WHERE notification_id = $1',
        [notificationId]
      );
      
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark all notifications as read
  public static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.user_id;
      
      await pool.query(
        `UPDATE notifications 
         SET read = true 
         WHERE (user_id = $1 OR (target_role = $2 AND user_id IS NULL))
         AND read = false`,
        [userId, req.user?.role]
      );
      
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a notification (admin only)
  public static async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, targetRole, title, message, priority, relatedEntityType, relatedEntityId } = req.body;
      
      // Validate either userId or targetRole is provided
      if (!userId && !targetRole) {
        res.status(400).json({ message: 'Either userId or targetRole must be provided' });
        return;
      }
      
      // Create notification
      const result = await pool.query(
        `INSERT INTO notifications (
          user_id, target_role, title, message, priority, 
          related_entity_type, related_entity_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          userId || null, 
          targetRole || null, 
          title, 
          message, 
          priority || 'standard',
          relatedEntityType || null,
          relatedEntityId || null
        ]
      );
      
      res.status(201).json({
        message: 'Notification created successfully',
        notification: result.rows[0]
      });
    } catch (error: any) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Delete a notification
  public static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const userId = req.user?.user_id;
      
      // Check if notification exists and belongs to user
      const notificationCheck = await pool.query(
        `SELECT * FROM notifications 
         WHERE notification_id = $1 
         AND (user_id = $2 OR (target_role = $3 AND user_id IS NULL))`,
        [notificationId, userId, req.user?.role]
      );
      
      if (notificationCheck.rows.length === 0) {
        res.status(404).json({ message: 'Notification not found' });
        return;
      }
      
      // Delete notification
      await pool.query(
        'DELETE FROM notifications WHERE notification_id = $1',
        [notificationId]
      );
      
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default NotificationController;