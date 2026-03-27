const pool = require('../../config/db');

const createRoute = async (source, destination, destLat, destLng) => {
    const [result] = await pool.query(
        'INSERT INTO routes (source, destination, dest_lat, dest_lng) VALUES (?, ?, ?, ?)',
        [source, destination, destLat, destLng]
    );
    return result.insertId;
};

const getAllRoutes = async () => {
    const [rows] = await pool.query('SELECT * FROM routes');
    return rows;
};

const getRouteById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM routes WHERE route_id = ?', [id]);
    return rows[0];
};

const searchRoutes = async (source, destination) => {
    let query = 'SELECT * FROM routes WHERE 1=1';
    const params = [];

    if (source) {
        query += ' AND source LIKE ?';
        params.push(`%${source}%`);
    }

    if (destination) {
        query += ' AND destination LIKE ?';
        params.push(`%${destination}%`);
    }

    // Prioritize results that start with the search term
    if (source || destination) {
        query += ' ORDER BY ';
        const orderClauses = [];
        if (source) orderClauses.push(`CASE WHEN source LIKE ? THEN 1 ELSE 2 END`);
        if (destination) orderClauses.push(`CASE WHEN destination LIKE ? THEN 1 ELSE 2 END`);
        
        query += orderClauses.join(', ');
        
        if (source) params.push(`${source}%`);
        if (destination) params.push(`${destination}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows;
};

module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    searchRoutes
};
