const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validate_user } = require('../middlewares/validation');

const user_controller = {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, full_name } = req.body;
      
      // Check existing email
      const existing_user = await User.findOne({ email });
      if (existing_user) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        full_name
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const is_match = await user.compare_password(password);
      if (!is_match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get user profile
  async get_profile(req, res) {
    try {
      const user = await User.findById(req.user.user_id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Update user profile
  async update_profile(req, res) {
    try {
      const updates = req.body;
      delete updates.password; // Don't allow password update through this route

      const user = await User.findByIdAndUpdate(
        req.user.user_id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Change password
  async change_password(req, res) {
    try {
      const { current_password, new_password } = req.body;
      
      const user = await User.findById(req.user.user_id);
      const is_match = await user.compare_password(current_password);
      
      if (!is_match) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = new_password;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = user_controller; 