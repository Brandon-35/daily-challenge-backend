const user_controller = require('../controllers/user_controller'); 
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validate_user } = require('../middlewares/validation');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// Public routes
router.post('/register', validate_user, user_controller.register);
router.post('/login', user_controller.login);

// Protected routes
router.get('/profile', auth, user_controller.get_profile);
router.put('/profile', [auth, check_role(['user', 'editor', 'moderator', 'admin'], User.CAPABILITIES.UPDATE)], user_controller.update_profile);
router.put('/change-password', auth, user_controller.change_password);

// Admin routes
router.post(
  '/admin/users', 
  [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)], 
  user_controller.create_user
);

router.get(
  '/admin/users', 
  [auth, check_role(['admin', 'moderator'], User.CAPABILITIES.READ)], 
  user_controller.get_all_users
);

router.get(
  '/admin/users/:id', 
  [auth, check_role(['admin', 'moderator'], User.CAPABILITIES.READ)], 
  user_controller.get_user
);

router.put(
  '/admin/users/:id', 
  [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)], 
  user_controller.update_user
);

router.delete(
  '/admin/users/:id', 
  [auth, check_role(['admin'], User.CAPABILITIES.MANAGE_USERS)], 
  user_controller.delete_user
);

module.exports = router; 