const express = require('express');
const router = express.Router();
const badge_controller = require('../controllers/badge_controller');
const auth = require('../middlewares/auth');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// Public routes
router.get('/badges', badge_controller.get_all_badges);
router.get('/badges/:id', badge_controller.get_badge);

// User routes
router.get(
    '/badges/user/progress',
    auth,
    badge_controller.get_user_badges
);

// Admin routes
router.post(
    '/admin/badges',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    badge_controller.create_badge
);

router.put(
    '/admin/badges/:id',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    badge_controller.update_badge
);

router.delete(
    '/admin/badges/:id',
    [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)],
    badge_controller.delete_badge
);

module.exports = router; 