import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import config from '../config/config';

class AuthController {
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, full_name, phone_number, date_of_birth, role } = req.body;
      
      // Check if user already exists
      const userExists = await db.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
      );
      
      if (userExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Transaction to create user and role-specific record
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Create user
        const userId = uuidv4();
        await client.query(
          `INSERT INTO users (
            user_id, email, password_hash, full_name, phone_number, date_of_birth, role, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PendingApproval')`,
          [userId, email, passwordHash, full_name, phone_number || null, date_of_birth || null, role]
        );
        
        // Create wallet
        await client.query(
          'INSERT INTO wallets (user_id, balance) VALUES ($1, 0)',
          [userId]
        );
        
        // Create role-specific record
        if (role === 'Innovator') {
          await client.query(
            'INSERT INTO innovators (user_id) VALUES ($1)',
            [userId]
          );
        } else if (role === 'Investor') {
          await client.query(
            'INSERT INTO investors (user_id) VALUES ($1)',
            [userId]
          );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully. Pending approval.',
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user'
      });
    }
  }
  
  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const result = await db.query(
        'SELECT user_id, email, password_hash, role, status FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const user = result.rows[0];
      
      // Check if user is verified
      if (user.status !== 'Verified') {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status.toLowerCase()}. Please wait for admin approval.`
        });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Create JWT token
      const payload = {
        userId: user.user_id,
        email: user.email,
        role: user.role
      };
      
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });
      
      res.status(200).json({
        success: true,
        token,
        user: {
          userId: user.user_id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in'
      });
    }
  }
}

export default new AuthController();