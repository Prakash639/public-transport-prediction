const pool = require('./backend/config/db');
const fs = require('fs');

async function checkSchema() {
    try {
        const [routes] = await pool.query('DESCRIBE routes');
        const [trips] = await pool.query('DESCRIBE trips');
        const [live_tracking] = await pool.query('DESCRIBE live_tracking');

        const output = {
            routes,
            trips,
            live_tracking
        };

        fs.writeFileSync('db-schema.json', JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
