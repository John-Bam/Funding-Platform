// server/controllers/messageController.js
const db = require('../config/db');

// Get all messages for a user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT m.message_id as id,
             s.full_name as "from",
             s.user_id as "fromId",
             m.subject,
             m.content,
             m.created_at as "received",
             m.read,
             m.priority
      FROM messages m
      JOIN users s ON m.sender_id = s.user_id
      WHERE m.recipient_id = $1
      ORDER BY m.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.user_id;
    const { recipientId, subject, content } = req.body;
    
    // Validate input
    if (!recipientId || !subject || !content) {
      return res.status(400).json({
        success: false,
        error: 'Recipient, subject, and content are required'
      });
    }
    
    // Check if recipient exists
    const userQuery = `SELECT user_id FROM users WHERE user_id = $1`;
    const userResult = await db.query(userQuery, [recipientId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recipient not found' 
      });
    }
    
    // Create message
    const messageQuery = `
      INSERT INTO messages (sender_id, recipient_id, subject, content, created_at, read, priority)
      VALUES ($1, $2, $3, $4, NOW(), false, 'medium')
      RETURNING message_id
    `;
    
    const messageResult = await db.query(messageQuery, [
      senderId,
      recipientId,
      subject,
      content
    ]);
    
    return res.json({
      success: true,
      data: {
        messageId: messageResult.rows[0].message_id,
        recipientId,
        subject,
        sent: true
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const messageId = req.params.id;
    
    // Check if message exists and belongs to user
    const checkQuery = `
      SELECT message_id 
      FROM messages 
      WHERE message_id = $1 AND recipient_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [messageId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Message not found or does not belong to user' 
      });
    }
    
    // Update message to mark as read
    const updateQuery = `
      UPDATE messages
      SET read = true
      WHERE message_id = $1
      RETURNING message_id
    `;
    
    await db.query(updateQuery, [messageId]);
    
    return res.json({
      success: true,
      data: {
        messageId,
        read: true
      },
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};