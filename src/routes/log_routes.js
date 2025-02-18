const express = require('express');
const router = express.Router();
const log_controller = require('../controllers/log_controller');
const auth = require('../middlewares/auth');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// User log routes
router.post('/logs', auth, log_controller.create_log);
router.get('/logs', auth, log_controller.get_user_logs);
router.get('/logs/:id', auth, log_controller.get_log);
router.put('/logs/:id', auth, log_controller.update_log);
router.delete('/logs/:id', auth, log_controller.delete_log);

// Admin routes
router.get(
    '/admin/logs',
    [auth, check_role(['admin', 'moderator'], User.CAPABILITIES.READ)],
    log_controller.get_all_logs
);

router.get(
    '/admin/logs/analytics',
    [auth, check_role(['admin'], User.CAPABILITIES.ADMIN_PANEL)],
    log_controller.get_logs_analytics
);

module.exports = router; 