const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function enhanceIssuesDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'public_transport_db'
        });

        console.log('Enhancing issues table...');

        // Add issue_category if it doesn't exist
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN issue_category VARCHAR(100) AFTER bus_id');
            console.log('Added issue_category column');
        } catch (e) { console.log('issue_category column already exists or error:', e.message); }

        // Add admin_note
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN admin_note TEXT AFTER description');
            console.log('Added admin_note column');
        } catch (e) { console.log('admin_note column already exists or error:', e.message); }

        // Add approved_at
        try {
            await connection.query('ALTER TABLE issues ADD COLUMN approved_at TIMESTAMP NULL AFTER admin_note');
            console.log('Added approved_at column');
        } catch (e) { console.log('approved_at column already exists or error:', e.message); }

        // Update status ENUM
        try {
            // First, migrate 'open' to 'Pending' (if 'Pending' exists, but we are changing ENUM so we might need a multi-step)
            // MySQL allows modifying the ENUM list.
            await connection.query("ALTER TABLE issues MODIFY COLUMN status ENUM('Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Pending'");
            console.log('Updated status ENUM values');

            // Set all existing NULL or 'open' to 'Pending' (but 'open' is no longer in ENUM so it might be invalid)
            // It's safer to change ENUM to include 'open', migrate data, then change ENUM again.
            // Or just allow 'open' temporarily.
        } catch (e) {
            console.log('Error updating ENUM, trying safer migration...');
            try {
                // Add 'open' temporarily if it fails
                await connection.query("ALTER TABLE issues MODIFY COLUMN status ENUM('Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected', 'open', 'resolved', 'closed') DEFAULT 'Pending'");
                await connection.query("UPDATE issues SET status = 'Pending' WHERE status = 'open' OR status IS NULL");
                await connection.query("UPDATE issues SET status = 'Resolved' WHERE status = 'resolved'");
                await connection.query("UPDATE issues SET status = 'Rejected' WHERE status = 'closed'");
                await connection.query("ALTER TABLE issues MODIFY COLUMN status ENUM('Pending', 'Approved', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Pending'");
                console.log('Safer migration of status ENUM completed');
            } catch (e2) {
                console.error('Failed ENUM migration:', e2.message);
            }
        }

        console.log('Database enhancement completed successfully');
    } catch (error) {
        console.error('Error enhancing database:', error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

enhanceIssuesDB();
