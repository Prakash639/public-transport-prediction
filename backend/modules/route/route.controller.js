const routeModel = require('./route.model');

const createRoute = async (req, res) => {
    const { source, destination, dest_lat, dest_lng } = req.body;
    try {
        const routeId = await routeModel.createRoute(source, destination, dest_lat, dest_lng);
        res.status(201).json({ message: 'Route created', routeId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllRoutes = async (req, res) => {
    try {
        const routes = await routeModel.getAllRoutes();
        res.json(routes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getRouteById = async (req, res) => {
    try {
        const route = await routeModel.getRouteById(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.json(route);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const searchRoutes = async (req, res) => {
    const { source, destination } = req.query;
    try {
        const routes = await routeModel.searchRoutes(source, destination);
        res.json(routes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    searchRoutes
};
