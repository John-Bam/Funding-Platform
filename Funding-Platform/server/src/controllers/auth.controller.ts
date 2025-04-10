import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { generateUUID } from '../utils/uuid';

class AuthController {
  /**
   * Register a new user
   */
  public static async register(req: Request, res: Response): Promise<void> {
    const { email, password, full_name, phone_number, date_of_birth, role, address } = req.body;

    try {
      // Check if user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (userExists.rows.length > 0) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert new user
      const newUser = await pool.query(
        `INSERT INTO users (
          email, 
          password_hash, 
          full_name, 
          phone_number, 
          date_of_birth, 
          role, 
          address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [email, passwordHash, full_name, phone_number, date_of_birth, role, address]
      );

      // If user is an investor, create investor record
      if (role === 'Investor') {
        await pool.query(
          'INSERT INTO investors (user_id) VALUES ($1)',
          [newUser.rows[0].user_id]
        );
      }

      // Create audit log
      await pool.query(
        `INSERT INTO audit_logs (
          user_id, 
          action, 
          entity_type, 
          entity_id, 
          details,
          ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newUser.rows[0].user_id,
          'USER_REGISTERED',
          'user',
          newUser.rows[0].user_id,
          JSON.stringify({ role }),
          req.ip
        ]
      );

      // Create notification for admin
      await pool.query(
        `INSERT INTO notifications (
          user_id, 
          title, 
          message, 
          related_entity_type, 
          related_entity_id
        ) 
        SELECT 
          user_id, 
          'New User Registration', 
          $1, 
          'user', 
          $2
        FROM users 
        WHERE role = 'Admin'`,
        [`New ${role} ${full_name} has registered and requires verification.`, newUser.rows[0].user_id]
      );

      res.status(201).json({
        message: 'User registered successfully. Awaiting verification by admin.',
        user: {
          user_id: newUser.rows[0].user_id,
          email: newUser.rows[0].email,
          full_name: newUser.rows[0].full_name,
          role: newUser.rows[0].role,
          status: newUser.rows[0].status,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  /**
   * Login a user
   */
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // Find user by email
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const user = result.rows[0];

      // Check if user is verified
      if (user.status !== 'Verified') {
        res.status(401).json({ 
          message: 'Your account is pending approval. Please wait for admin verification.',
          status: user.status
        });
        return;
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      // Create audit log
      await pool.query(
        `INSERT INTO audit_logs (
          user_id, 
          action, 
          entity_type, 
          entity_id, 
          ip_address
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          user.user_id,
          'USER_LOGIN',
          'user',
          user.user_id,
          req.ip
        ]
      );

      // Return user data and token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }

  /**
   * Request password reset
   */
  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      // Check if user exists
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        // Still return success to prevent email enumeration
        res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
        return;
      }

      const user = result.rows[0];
      
      // Generate reset token
      const resetToken = generateUUID();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
      
      // Store reset token in database
      // Note: In a real application, you'd want a dedicated password_resets table
      await pool.query(
        `UPDATE users SET 
          reset_token = $1, 
          reset_token_expires = $2 
        WHERE user_id = $3`,
        [resetToken, tokenExpiry, user.user_id]
      );

      // In a real application, you would send an email with the reset link
      // For this demo, we'll just return the token
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link',
        // Only include token in development
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Error processing request' });
    }
  }

  /**
   * Reset password with token
   */
  public static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    try {
      // Find user by reset token and check if token is still valid
      const result = await pool.query(
        `SELECT * FROM users 
        WHERE reset_token = $1 
        AND reset_token_expires > NOW()`,
        [token]
      );
      
      if (result.rows.length === 0) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
      }

      const user = result.rows[0];

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Update user password and clear reset token
      await pool.query(
        `UPDATE users SET 
          password_hash = $1, 
          reset_token = NULL, 
          reset_token_expires = NULL,
          updated_at = NOW()
        WHERE user_id = $2`,
        [passwordHash, user.user_id]
      );

      // Create audit log
      await pool.query(
        `INSERT INTO audit_logs (
          user_id, 
          action, 
          entity_type, 
          entity_id, 
          ip_address
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          user.user_id,
          'PASSWORD_RESET',
          'user',
          user.user_id,
          req.ip
        ]
      );

      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Error resetting password' });
    }
  }
}

export default AuthController;