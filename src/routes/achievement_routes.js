const express = require('express');
const router = express.Router();
const achievement_controller = require('../controllers/achievement_controller');
const auth = require('../middlewares/auth');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// Public routes
router.get('/achievements', achievement_controller.get_all_achievements);
router.get('/achievements/:id', achievement_controller.get_achievement);

// User routes
router.get(
    '/achievements/user/progress',
    auth,
    achievement_controller.get_user_achievements
);

// Admin routes
router.post(
    '/admin/achievements',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    achievement_controller.create_achievement
);

router.put(
    '/admin/achievements/:id',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    achievement_controller.update_achievement
);

router.delete(
    '/admin/achievements/:id',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    achievement_controller.delete_achievement
);

module.exports = router; 