const express = require('express');
const mapRoutes = require('./modules/map/map.routes');
const app = express();

app.use('/api/map', mapRoutes);

app.get('/', (req, res) => res.send('Standalone test server'));

app.listen(5001, () => {
    console.log('Test server running on port 5001');
});
