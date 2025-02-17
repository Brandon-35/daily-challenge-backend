const express = require('express');
const router = express.Router();
const user_controller = require('../controllers/userController');
const auth = require('../middlewares/auth');
const { validate_user } = require('../middlewares/validation');

// Public routes
router.post('/register', validate_user, user_controller.register);
router.post('/login', user_controller.login);

// Protected routes
router.get('/profile', auth, user_controller.get_profile);
router.put('/profile', auth, user_controller.update_profile);
router.put('/change-password', auth, user_controller.change_password);

module.exports = router; 