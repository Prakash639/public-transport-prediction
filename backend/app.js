const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
// Other routes will be imported here as they are implemented
const passengerRoutes = require('./modules/passenger/passenger.routes');
const driverRoutes = require('./modules/driver/driver.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const busRoutes = require('./modules/bus/bus.routes');
const routeRoutes = require('./modules/route/route.routes');
const tripRoutes = require('./modules/trip/trip.routes');
const issueRoutes = require('./modules/issue/issue.routes');
const mapRoutes = require('./modules/map/map.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passenger', passengerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);

app.use('/api/trips', tripRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/map', mapRoutes);


app.get('/', (req, res) => {
    res.send('Smart Public Transport System API is running');
});

module.exports = app;
