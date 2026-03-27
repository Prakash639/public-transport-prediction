const pool = require('../../config/db');

const getDriverTrips = async (driverId) => {
    const [rows] = await pool.query('SELECT * FROM trips WHERE driver_id = ? ORDER BY start_time DESC', [driverId]);
    return rows;
};

module.exports = {
    getDriverTrips
};
