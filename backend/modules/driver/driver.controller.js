const driverModel = require('./driver.model');

const getMyTrips = async (req, res) => {
    try {
        const trips = await driverModel.getDriverTrips(req.user.id);
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyTrips
};
