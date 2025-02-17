const User = require('../models/User');

const check_role = (allowed_roles, required_capability = null) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.user_id);
    const user_role = user.role;

    if (!allowed_roles.includes(user_role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient role permissions'
      });
    }

    if (required_capability && (!user.capabilities || !user.capabilities.includes(required_capability))) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. ${required_capability} permission required`
      });
    }

    next();
  };
};

module.exports = { check_role }; 
module.exports = { check_role }; 