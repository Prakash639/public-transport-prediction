const tripModel = require('./trip.model');

const createTrip = async (req, res) => {
    const { bus_id, driver_id, route_id, start_lat, start_lng } = req.body;
    try {
        // Validation could be added here to check if bus is already in a trip
        const tripId = await tripModel.createTrip(bus_id, driver_id, route_id, start_lat, start_lng);
        res.status(201).json({ message: 'Trip started', tripId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const endTrip = async (req, res) => {
    try {
        await tripModel.endTrip(req.params.id);
        res.json({ message: 'Trip ended' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getActiveTrips = async (req, res) => {
    try {
        const { routeId } = req.query;
        const trips = await tripModel.getActiveTrips(routeId);
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        await tripModel.updateLocation(req.params.id, latitude, longitude);
        res.json({ message: 'Location updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTripLocation = async (req, res) => {
    try {
        const location = await tripModel.getLatestLocation(req.params.id);
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTrip,
    endTrip,
    getActiveTrips,
    updateLocation,
    getTripLocation
};
