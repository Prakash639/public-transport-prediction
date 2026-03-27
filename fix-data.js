const pool = require('./backend/config/db');

async function fixData() {
    try {
        // Madurai -> Chennai (Route 1)
        // Chennai Dest: (13.0827, 80.2707)
        // Madurai Start: (9.9252, 78.1198)
        await pool.query('UPDATE routes SET dest_lat = 13.0827, dest_lng = 80.2707 WHERE route_id = 1');
        await pool.query('UPDATE trips SET start_lat = 9.9252, start_lng = 78.1198 WHERE route_id = 1');

        // Chennai -> Bangalore (Route 2)
        // Bangalore Dest: (12.9716, 77.5946)
        // Chennai Start: (13.0827, 80.2707)
        await pool.query('UPDATE routes SET dest_lat = 12.9716, dest_lng = 77.5946 WHERE route_id = 2');
        await pool.query('UPDATE trips SET start_lat = 13.0827, start_lng = 80.2707 WHERE route_id = 2');

        console.log('Data fix applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing data:', error);
        process.exit(1);
    }
}

fixData();
