require('dotenv').config();
const host = process.env.BASE_URL || 'http://localhost:5000';
const baseUrl = `${host}/api/map`;

try {
    const style = {
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
    console.log(JSON.stringify(style, null, 2));
} catch (err) {
    console.error(err);
}
