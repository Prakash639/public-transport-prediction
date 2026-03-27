const pool = require('../../config/db');

const getDashboardStats = async () => {
    const [users] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const [buses] = await pool.query('SELECT COUNT(*) as count FROM buses');
    const [routes] = await pool.query('SELECT COUNT(*) as count FROM routes');
    const [activeTrips] = await pool.query('SELECT COUNT(*) as count FROM trips WHERE status = "in_progress"');
    const [issues] = await pool.query('SELECT status, COUNT(*) as count FROM issues GROUP BY status');

    return {
        
        users,
        totalBuses: buses[0].count,
        totalRoutes: routes[0].count,
        activeTrips: activeTrips[0].count,
        issues
    };
};

module.exports = {
    getDashboardStats
};
