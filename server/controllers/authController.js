// server/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Check if user exists
    const query = `
      SELECT user_id, email, full_name, password_hash, role, status
      FROM users
      WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    // Check if account is verified
    if (user.status !== 'Verified') {
      return res.status(401).json({ 
        success: false, 
        error: 'Account not verified. Please contact admin.' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Create token
    const payload = {
      userId: user.user_id,
      email: user.email,
      role: user.role
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password hash from response
    delete user.password_hash;
    
    return res.json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, full_name, phone_number, date_of_birth, role } = req.body;
    
    // Validate input
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, full name, and role'
      });
    }
    
    // Check if user already exists
    const checkQuery = `SELECT email FROM users WHERE email = $1`;
    const checkResult = await db.query(checkQuery, [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const insertQuery = `
      INSERT INTO users (
        email, password_hash, full_name, phone_number, date_of_birth, role, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'PendingApproval', NOW(), NOW())
      RETURNING user_id, email, full_name, role, status
    `;
    
    const insertResult = await db.query(insertQuery, [
      email,
      passwordHash,
      full_name,
      phone_number || null,
      date_of_birth || null,
      role
    ]);
    
    const user = insertResult.rows[0];
    
    return res.status(201).json({
      success: true,
      data: {
        user,
        message: 'Registration successful. Your account is pending approval.'
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already available from the auth middleware
    const { user_id } = req.user;
    
    // Get fresh user data
    const query = `
      SELECT user_id, email, full_name, phone_number, date_of_birth, address, role, status, created_at, updated_at
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [user_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};