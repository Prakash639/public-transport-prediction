const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await authModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await authModel.createUser(name, email, hashedPassword, role);

        const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: userId, name, email, role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login
};
