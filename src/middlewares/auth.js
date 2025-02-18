const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No auth token found'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user_id);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Add user and role info to request
        req.user = {
            user_id: user._id,
            role: user.role,
            capabilities: user.capabilities
        };

        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Please authenticate'
        });
    }
};

module.exports = auth; 