const pool = require('./backend/config/db');

async function migrate() {
    try {
        console.log('Migrating database...');
        
        // Add coordinates to routes
        try {
            await pool.query('ALTER TABLE routes ADD COLUMN dest_lat DECIMAL(10,8) AFTER destination');
            await pool.query('ALTER TABLE routes ADD COLUMN dest_lng DECIMAL(11,8) AFTER dest_lat');
            console.log('Added dest_lat and dest_lng to routes');
        } catch (e) {
            console.log('Routes columns might already exist:', e.message);
        }

        // Add coordinates to trips
        try {
            await pool.query('ALTER TABLE trips ADD COLUMN start_lat DECIMAL(10,8) AFTER route_id');
            await pool.query('ALTER TABLE trips ADD COLUMN start_lng DECIMAL(11,8) AFTER start_lat');
            console.log('Added start_lat and start_lng to trips');
        } catch (e) {
            console.log('Trips columns might already exist:', e.message);
        }

        // Optional: Update some existing data with mock coordinates for testing
        // For example, if there's a route with ID 1, set its destination to some point in Bangalore
        await pool.query('UPDATE routes SET dest_lat = 12.9716, dest_lng = 77.5946 WHERE dest_lat IS NULL');
        await pool.query('UPDATE trips SET start_lat = 12.9279, start_lng = 77.6271 WHERE start_lat IS NULL');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
