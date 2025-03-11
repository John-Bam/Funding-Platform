// server/controllers/projectController.js
const db = require('../config/db');

// Get all projects with optional filtering
exports.getProjects = async (req, res) => {
  try {
    // Extract filter parameters
    const { category, status, search } = req.query;
    
    let query = `
      SELECT p.project_id as id, p.title, p.description, p.category, p.status, 
             p.funding_goal as "fundingGoal", p.current_funding as "currentFunding",
             p.geo_focus as "geoFocus", p.sdg_alignment as "sdgAlignment",
             p.submitted_date as "submittedDate", 
             p.innovator_id as "innovatorId", u.full_name as innovator,
             (SELECT COUNT(*) FROM investments WHERE project_id = p.project_id) as "investorsCount",
             (SELECT MIN(i.investment_min) FROM investors i JOIN investments inv ON inv.investor_id = i.investor_id WHERE inv.project_id = p.project_id) as "minimumInvestment"
      FROM projects p
      JOIN users u ON p.innovator_id = u.user_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (category && category !== 'All') {
      queryParams.push(category);
      query += ` AND p.category = $${queryParams.length}`;
    }
    
    if (status && status !== 'All') {
      queryParams.push(status);
      query += ` AND p.status = $${queryParams.length}`;
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
    }
    
    // Add ordering
    query += ` ORDER BY p.submitted_date DESC`;
    
    const result = await db.query(query, queryParams);
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Get project by ID with details
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    const projectQuery = `
      SELECT p.project_id as id, p.title, p.description, p.full_description as "fullDescription",
             p.impact_statement as "impactStatement", p.category, p.status, 
             p.funding_goal as "fundingGoal", p.current_funding as "currentFunding",
             p.geo_focus as "geoFocus", p.sdg_alignment as "sdgAlignment",
             p.duration_months as "durationMonths", p.submitted_date as "submittedDate", 
             p.innovator_id as "innovatorId", u.full_name as innovator,
             (SELECT COUNT(*) FROM investments WHERE project_id = p.project_id) as "investorsCount",
             (SELECT MIN(i.investment_min) FROM investors i JOIN investments inv ON inv.investor_id = i.investor_id WHERE inv.project_id = p.project_id) as "minimumInvestment",
             (SELECT ARRAY_AGG(document_path) FROM project_documents WHERE project_id = p.project_id) as documents
      FROM projects p
      JOIN users u ON p.innovator_id = u.user_id
      WHERE p.project_id = $1
    `;
    
    const teamQuery = `
      SELECT tm.name, tm.role, tm.bio
      FROM team_members tm
      WHERE tm.project_id = $1
    `;
    
    const updatesQuery = `
      SELECT pu.title, pu.content, pu.created_at as date
      FROM project_updates pu
      WHERE pu.project_id = $1
      ORDER BY pu.created_at DESC
    `;
    
    const projectResult = await db.query(projectQuery, [projectId]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    const project = projectResult.rows[0];
    
    // Get team members and updates
    const teamResult = await db.query(teamQuery, [projectId]);
    const updatesResult = await db.query(updatesQuery, [projectId]);
    
    // Add team and updates to project
    project.teamMembers = teamResult.rows;
    project.updates = updatesResult.rows;
    
    return res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};