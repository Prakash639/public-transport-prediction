const adminModel = require('./admin.model');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminModel.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboardStats
};
