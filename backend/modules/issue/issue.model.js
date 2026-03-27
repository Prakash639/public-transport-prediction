const pool = require('../../config/db');

const createIssue = async (userId, busId, issueType, issueOption, description) => {
    const [result] = await pool.query(
        'INSERT INTO issues (user_id, bus_id, issue_category, issue_type, issue_option, description) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, busId || null, issueType, issueOption, '', description || '']
    );
    return result.insertId;
};

const getAllIssues = async () => {
    const query = `
        SELECT issues.*, 
               users.name as user_name, 
               users.email,
               buses.bus_number,
               routes.source as route_source,
               routes.destination as route_destination
        FROM issues 
        JOIN users ON issues.user_id = users.id 
        LEFT JOIN buses ON issues.bus_id = buses.bus_id
        LEFT JOIN routes ON buses.route_id = routes.route_id
        ORDER BY issues.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const updateIssueStatus = async (issueId, status, adminNote = null, approvedAt = null) => {
    await pool.query(
        'UPDATE issues SET status = ?, admin_note = ?, approved_at = ? WHERE id = ?',
        [status, adminNote, approvedAt, issueId]
    );
};

module.exports = {
    createIssue,
    getAllIssues,
    updateIssueStatus
};
