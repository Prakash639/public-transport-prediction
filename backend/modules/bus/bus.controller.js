const busModel = require('./bus.model');

const createBus = async (req, res) => {
    const { bus_number, route_id, status } = req.body;
    try {
        const busId = await busModel.createBus(bus_number, route_id, status);
        res.status(201).json({ message: 'Bus created', busId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllBuses = async (req, res) => {
    try {
        const { route_id } = req.query;
        const buses = await busModel.getAllBuses(route_id);
        res.json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getBusById = async (req, res) => {
    try {
        const bus = await busModel.getBusById(req.params.id);
        if (!bus) return res.status(404).json({ message: 'Bus not found' });
        res.json(bus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateBusStatus = async (req, res) => {
    try {
        await busModel.updateBusStatus(req.params.id, req.body.status);
        res.json({ message: 'Bus status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createBus,
    getAllBuses,
    getBusById,
    updateBusStatus
};
