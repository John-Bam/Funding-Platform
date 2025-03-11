// server/controllers/userController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT user_id, email, full_name, phone_number, date_of_birth, 
             address, role, status, created_at, updated_at
      FROM users
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
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
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, phone_number, date_of_birth, address } = req.body;
    
    // Validate input
    if (!full_name) {
      return res.status(400).json({
        success: false,
        error: 'Full name is required'
      });
    }
    
    const query = `
      UPDATE users
      SET full_name = $1, 
          phone_number = $2, 
          date_of_birth = $3, 
          address = $4,
          updated_at = NOW()
      WHERE user_id = $5
      RETURNING user_id, email, full_name, phone_number, date_of_birth, address, role
    `;
    
    const result = await db.query(query, [
      full_name, 
      phone_number || null, 
      date_of_birth || null, 
      address || null,
      userId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};