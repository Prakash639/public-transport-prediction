const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const MBTilesHandler = require('../../utils/mbtiles-handler');
const dotenv = require('dotenv');

dotenv.config();

// Path to your .mbtiles file
const MBTILES_PATH = path.join(__dirname, '../../tiles/data.mbtiles');
const handler = new MBTilesHandler(MBTILES_PATH);

// Initialize handler
let hasLocalTiles = false;
handler.init().then(async (success) => {
    if (success) {
        console.log('MBTiles handler initialized successfully');
        hasLocalTiles = await handler.hasTiles();
        if (!hasLocalTiles) {
            console.log('Local MBTiles file is empty (no tiles found).');
        }
    } else {
        console.warn('MBTiles handler failed to initialize. Map tiles will not be available.');
    }
});

// Route to serve tiles (XYZ format)
router.get('/tiles/:z/:x/:y.pbf', async (req, res) => {
    const { z, x, y } = req.params;
    try {
        const tile = await handler.getTile(parseInt(z), parseInt(x), parseInt(y));
        if (tile) {
            // MBTiles are typically gzipped PBFs
            res.set('Content-Type', 'application/x-protobuf');
            res.set('Content-Encoding', 'gzip');
            res.send(tile);
        } else {
            res.status(404).send('Tile not found');
        }
    } catch (err) {
        console.error('Error serving tile:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to serve style.json
router.get('/style.json', (req, res) => {
    try {
        const host = req.get('host') || 'localhost:5000';
        const protocol = req.protocol || 'http';
        const baseUrl = `${protocol}://${host}/api/map`;

        const useOnlineMap = process.env.USE_ONLINE_MAP === 'true';

        // If local MBTiles is empty/missing OR we explicitly want online map
        if (!hasLocalTiles || useOnlineMap) {
            // Serve a style that uses OpenStreetMap public tiles
            const style = {
                "version": 8,
                "name": "OSM Online Fallback",
                "sources": {
                    "osm-raster": {
                        "type": "raster",
                        "tiles": [
                            "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256,
                        "attribution": "&copy; OpenStreetMap contributors"
                    }
                },
                "layers": [
                    {
                        "id": "osm-raster-layer",
                        "type": "raster",
                        "source": "osm-raster",
                        "minzoom": 0,
                        "maxzoom": 19
                    }
                ]
            };
            return res.json(style);
        }

        // Try to load custom style or fallback to default offline vector style
        const stylePath = path.join(__dirname, '../../assets/map/style.json');
        let style;

        if (fs.existsSync(stylePath)) {
            style = JSON.parse(fs.readFileSync(stylePath, 'utf8'));
            if (style.sources && style.sources.osm) {
                style.sources.osm.tiles = [`${baseUrl}/tiles/{z}/{x}/{y}.pbf`];
            }
        } else {
            style = {
                "version": 8,
                "name": "Local OSM Fallback",
                "sources": {
                    "osm": {
                        "type": "vector",
                        "tiles": [`${baseUrl}/tiles/{z}/{x}/{y}.pbf`],
                        "minzoom": 0,
                        "maxzoom": 14
                    }
                },
                "layers": [
                    {
                        "id": "background",
                        "type": "background",
                        "paint": { "background-color": "#f8f9fa" }
                    }
                ]
            };
        }
        res.json(style);
    } catch (err) {
        console.error('Error serving style.json:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

module.exports = router;
