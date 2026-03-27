const pool = require('./backend/config/db');

async function checkData() {
    try {
        const [routes] = await pool.query('SELECT route_id, source, destination, dest_lat, dest_lng FROM routes');
        const [trips] = await pool.query('SELECT trip_id, bus_id, route_id, start_lat, start_lng FROM trips');
        const [tracking] = await pool.query('SELECT * FROM live_tracking ORDER BY timestamp DESC LIMIT 1');

        const output = { routes, trips, tracking };
        console.log(JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
}

checkData();
