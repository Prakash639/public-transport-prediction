const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class MBTilesHandler {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.metadata = {};
    }

    async init() {
        if (!fs.existsSync(this.dbPath)) {
            console.warn(`MBTiles file not found at: ${this.dbPath}`);
            return false;
        }

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error('Error opening MBTiles database:', err);
                    reject(err);
                } else {
                    this.loadMetadata().then(() => resolve(true)).catch(reject);
                }
            });
        });
    }

    async loadMetadata() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT name, value FROM metadata', (err, rows) => {
                if (err) return reject(err);
                rows.forEach(row => {
                    this.metadata[row.name] = row.value;
                });
                resolve();
            });
        });
    }

    async getTile(z, x, y) {
        // MBTiles stores tiles with y coordinate flipped (TMS format)
        // We convert from OSM/XYZ to TMS
        const tmsY = (1 << z) - 1 - y;

        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?',
                [z, x, tmsY],
                (err, row) => {
                    if (err) return reject(err);
                    if (!row) return resolve(null);
                    resolve(row.tile_data);
                }
            );
        });
    }

    async hasTiles() {
        if (!this.db) return false;
        return new Promise((resolve) => {
            this.db.get('SELECT COUNT(*) as count FROM tiles', (err, row) => {
                if (err || !row) return resolve(false);
                resolve(row.count > 0);
            });
        });
    }

    getMetadata() {
        return this.metadata;
    }
}

module.exports = MBTilesHandler;
