

const check_role = (allowed_roles, required_capability) => {
    return (req, res, next) => {
        try {
            console.log('Checking role:', {
                user_role: req.user?.role,
                allowed_roles,
                required_capability
            });

            // Kiểm tra xem có token và role không
            if (!req.user || !req.user.role) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No role found in token'
                });
            }

            // Kiểm tra role có được phép không
            if (!allowed_roles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied. Insufficient role permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error checking role permissions'
            });
        }
    };
};

module.exports = { check_role }; 