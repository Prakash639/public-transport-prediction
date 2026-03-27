const pool = require('../../config/db');

const createBus = async (busNumber, routeId, status = 'active') => {
    const [result] = await pool.query(
        'INSERT INTO buses (bus_number, route_id, status) VALUES (?, ?, ?)',
        [busNumber, routeId, status]
    );
    return result.insertId;
};

const getAllBuses = async (routeId) => {
    let query = 'SELECT * FROM buses';
    const params = [];

    if (routeId) {
        query += ' WHERE route_id = ?';
        params.push(routeId);
    }

    const [rows] = await pool.query(query, params);
    return rows;
};


const getBusById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM buses WHERE bus_id = ?', [id]);
    return rows[0];
};

const updateBusStatus = async (id, status) => {
    await pool.query('UPDATE buses SET status = ? WHERE bus_id = ?', [status, id]);
};

module.exports = {
    createBus,
    getAllBuses,
    getBusById,
    updateBusStatus
};
