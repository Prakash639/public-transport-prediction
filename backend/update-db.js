const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function updateDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'public_transport_db'
        });

        console.log('Updating issues table...');

        // Add bus_id if it doesn't exist
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN bus_id INT NULL AFTER user_id');
            await connection.query('ALTER TABLE issues ADD FOREIGN KEY (bus_id) REFERENCES buses(bus_id)');
            console.log('Added bus_id column');
        } catch (e) { console.log('bus_id column already exists or error:', e.message); }

        // Add issue_type if it doesn't exist
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN issue_type VARCHAR(100) AFTER bus_id');
            console.log('Added issue_type column');
        } catch (e) { console.log('issue_type column already exists or error:', e.message); }

        // Add issue_option if it doesn't exist
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN issue_option VARCHAR(255) AFTER issue_type');
            console.log('Added issue_option column');
        } catch (e) { console.log('issue_option column already exists or error:', e.message); }

        console.log('Database updated successfully');
    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

updateDB();
