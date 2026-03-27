const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const tilesDir = path.join(__dirname, '../tiles');
const dbPath = path.join(tilesDir, 'data.mbtiles');

// Ensure tiles directory exists
if (!fs.existsSync(tilesDir)) {
    fs.mkdirSync(tilesDir, { recursive: true });
}

if (fs.existsSync(dbPath)) {
    console.log('MBTiles file already exists at:', dbPath);
    process.exit(0);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error creating MBTiles database:', err);
        process.exit(1);
    }
    console.log('Created new MBTiles database at:', dbPath);

    db.serialize(() => {
        // Create metadata table
        db.run('CREATE TABLE metadata (name text, value text)');

        // Insert basic metadata
        const stmt = db.prepare('INSERT INTO metadata VALUES (?, ?)');
        stmt.run('name', 'Local OSM Placeholder');
        stmt.run('type', 'baselayer');
        stmt.run('version', '1');
        stmt.run('description', 'A minimal placeholder MBTiles file');
        stmt.run('format', 'pbf');
        stmt.finalize();

        // Create tiles table
        db.run('CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob)');

        console.log('MBTiles schema initialized successfully');
        db.close();
    });
});
