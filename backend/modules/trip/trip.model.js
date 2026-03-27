const pool = require('../../config/db');

const createTrip = async (busId, driverId, routeId, startLat, startLng) => {
    const [result] = await pool.query(
        'INSERT INTO trips (bus_id, driver_id, route_id, start_lat, start_lng, start_time, status) VALUES (?, ?, ?, ?, ?, NOW(), "in_progress")',
        [busId, driverId, routeId, startLat, startLng]
    );
    return result.insertId;
};

const endTrip = async (tripId) => {
    await pool.query(
        'UPDATE trips SET end_time = NOW(), status = "completed" WHERE trip_id = ?',
        [tripId]
    );
};

const getTripById = async (tripId) => {
    const [rows] = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    return rows[0];
};

const getActiveTrips = async (routeId) => {
    let query = `
        SELECT t.*, b.bus_number, r.source, r.destination, r.dest_lat, r.dest_lng 
        FROM trips t 
        JOIN buses b ON t.bus_id = b.bus_id 
        JOIN routes r ON t.route_id = r.route_id 
        WHERE t.status = "in_progress"
    `;
    const params = [];

    if (routeId) {
        query += ' AND t.route_id = ?';
        params.push(routeId);
    }

    const [rows] = await pool.query(query, params);
    return rows;
};

const updateLocation = async (tripId, latitude, longitude) => {
    await pool.query(
        'INSERT INTO live_tracking (trip_id, latitude, longitude) VALUES (?, ?, ?)',
        [tripId, latitude, longitude]
    );
};

const getLatestLocation = async (tripId) => {
    const [rows] = await pool.query(
        'SELECT * FROM live_tracking WHERE trip_id = ? ORDER BY timestamp DESC LIMIT 1',
        [tripId]
    );
    return rows[0];
};

module.exports = {
    createTrip,
    endTrip,
    getTripById,
    getActiveTrips,
    updateLocation,
    getLatestLocation
};
