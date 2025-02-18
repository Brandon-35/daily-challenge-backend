const { check_visibility } = require('../utils/social_utils');

const social_middleware = {
    check_follow_permission: async (req, res, next) => {
        try {
            const target_user = await User.findById(req.params.user_id);
            if (!target_user.social_settings.allow_follows) {
                return res.status(403).json({
                    status: 'error',
                    message: 'This user does not accept followers'
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    check_content_visibility: async (req, res, next) => {
        try {
            const content = await Activity.findById(req.params.id);
            const has_access = await check_visibility(
                req.user.user_id,
                content.user,
                content.privacy
            );
            
            if (!has_access) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You do not have permission to view this content'
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    }
};

module.exports = social_middleware; 