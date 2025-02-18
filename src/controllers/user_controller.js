const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const user_controller = {
  // Register new user
  async register(req, res) {
    try {
      const { 
        username, 
        email, 
        password, 
        confirm_password,
        first_name, 
        last_name,
        role // Allow role to be set during registration
      } = req.body;

      // Validate password match
      if (password !== confirm_password) {
        return res.status(400).json({
          status: 'error',
          message: 'Passwords do not match'
        });
      }

      // Check if user already exists
      const existing_user = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existing_user) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email or username already exists'
        });
      }

      // Create new user with explicit role
      const user = new User({
        username,
        email,
        password,
        first_name,
        last_name,
        role: role || 'user', // Use provided role or default to 'user'
        is_active: true
      });

      await user.save();

      // Log the created user for debugging
      console.log('Created user:', {
        id: user._id,
        username: user.username,
        role: user.role,
        capabilities: user.capabilities
      });

      // Generate token
      const token = jwt.sign(
        { 
          user_id: user._id,
          role: user.role,
          capabilities: user.capabilities
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            capabilities: user.capabilities
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const is_valid = await user.compare_password(password);
      if (!is_valid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { 
          user_id: user._id,
          role: user.role,
          capabilities: user.capabilities
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return token directly in response
      res.json({
        status: 'success',
        token,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
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
  },

  // Create User (Admin only)
  async create_user(req, res) {
    try {
      const { username, email, password, first_name, last_name, role } = req.body;
      
      const user = new User({
        username,
        email,
        password,
        first_name,
        last_name,
        role: role || 'user'
      });

      await user.save();

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          capabilities: user.capabilities
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get All Users (Admin only)
  async get_all_users(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const role = req.query.role;

      let query = {};
      
      // Search by username, email, or name
      if (search) {
        query.$or = [
          { username: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { first_name: new RegExp(search, 'i') },
          { last_name: new RegExp(search, 'i') }
        ];
      }

      // Filter by role
      if (role) {
        query.role = role;
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: {
          users,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_items: total,
            per_page: limit
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get Single User
  async get_user(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Update User
  async update_user(req, res) {
    try {
      const updates = { ...req.body };
      delete updates.password; // Don't allow password update through this route

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        message: 'User updated successfully',
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Delete User
  async delete_user(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = user_controller; 