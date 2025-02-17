const user_controller = require('../controllers/user_controller'); 
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { validate_user } = require('../middlewares/validation');
const User = require('../models/User');

// Public routes
router.post('/register', validate_user, user_controller.register);
router.post('/login', user_controller.login);

// Protected routes
router.get('/profile', auth, user_controller.get_profile);
router.put('/profile', auth, user_controller.update_profile);
router.put('/change-password', auth, user_controller.change_password);

// Admin routes - thêm middleware kiểm tra role admin
router.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
    }

    const users = await User.find({}, '-password');
    res.status(200).json({
      status: 'success',
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router; 