// server/controllers/investorController.js
const db = require('../config/db');

// Get investor profile
exports.getInvestorProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT i.investor_id, i.preferred_sdg, i.preferred_geo, 
             i.investment_min, i.investment_max,
             COUNT(DISTINCT inv.project_id) as investments,
             SUM(inv.amount) as "totalInvested",
             (SELECT COUNT(*) FROM investor_syndicates WHERE initiator_id = i.investor_id AND status = 'Active') as "activeSyndicates"
      FROM investors i
      LEFT JOIN investments inv ON i.investor_id = inv.investor_id
      WHERE i.user_id = $1
      GROUP BY i.investor_id
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Investor profile not found' 
      });
    }
    
    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching investor profile:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get investments for the investor
exports.getInvestments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const query = `
      SELECT inv.investment_id as id, inv.amount, inv.investment_date as "investmentDate",
             p.project_id as "projectId", p.title as project, p.status as "projectStatus",
             p.funding_goal as "projectFundingGoal", p.current_funding as "projectCurrentFunding",
             p.category as "projectCategory"
      FROM investments inv
      JOIN investors i ON inv.investor_id = i.investor_id
      JOIN projects p ON inv.project_id = p.project_id
      WHERE i.user_id = $1
      ORDER BY inv.investment_date DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Invest in a project
exports.investInProject = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { projectId, amount } = req.body;
    
    // Validate input
    if (!projectId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and valid amount are required'
      });
    }
    
    // Start a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get investor ID
      const investorQuery = `SELECT investor_id FROM investors WHERE user_id = $1`;
      const investorResult = await client.query(investorQuery, [userId]);
      
      if (investorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false, 
          error: 'Investor profile not found' 
        });
      }
      
      const investorId = investorResult.rows[0].investor_id;
      
      // Check if project exists and is accepting investments
      const projectQuery = `
        SELECT project_id, status, funding_goal, current_funding
        FROM projects
        WHERE project_id = $1 AND (status = 'SeekingFunding' OR status = 'PartiallyFunded')
      `;
      
      const projectResult = await client.query(projectQuery, [projectId]);
      
      if (projectResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found or not accepting investments' 
        });
      }
      
      const project = projectResult.rows[0];
      
      // Check if wallet has enough balance
      const walletQuery = `SELECT balance FROM wallets WHERE user_id = $1`;
      const walletResult = await client.query(walletQuery, [userId]);
      
      if (walletResult.rows.length === 0 || walletResult.rows[0].balance < amount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient wallet balance' 
        });
      }
      
      // Create the investment
      const investmentQuery = `
        INSERT INTO investments (investor_id, project_id, amount, investment_date)
        VALUES ($1, $2, $3, NOW())
        RETURNING investment_id
      `;
      
      const investmentResult = await client.query(investmentQuery, [investorId, projectId, amount]);
      
      // Update project funding
      const newFunding = parseFloat(project.current_funding) + amount;
      const newStatus = newFunding >= project.funding_goal ? 'FullyFunded' : 'PartiallyFunded';
      
      const updateProjectQuery = `
        UPDATE projects
        SET current_funding = $1, status = $2
        WHERE project_id = $3
      `;
      
      await client.query(updateProjectQuery, [newFunding, newStatus, projectId]);
      
      // Update wallet balance
      const updateWalletQuery = `
        UPDATE wallets
        SET balance = balance - $1
        WHERE user_id = $2
      `;
      
      await client.query(updateWalletQuery, [amount, userId]);
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        data: {
          investmentId: investmentResult.rows[0].investment_id,
          amount,
          projectId
        },
        message: 'Investment successful'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error investing in project:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};