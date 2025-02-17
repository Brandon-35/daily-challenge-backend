const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const user_validation = {
  validate_user: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscore')
      .custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (user) {
          throw new Error('Username already exists');
        }
        return true;
      }),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .custom(async (value) => {
        if (!value) {
          throw new Error('Email is required');
        }
        const user = await User.findOne({ 
          email: value.toLowerCase() 
        });
        if (user) {
          throw new Error('Email already exists');
        }
        return true;
      }),
    
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('first_name')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]*$/).withMessage('First name can only contain letters and spaces'),
    
    body('last_name')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]*$/).withMessage('Last name can only contain letters and spaces'),
    
    // Validation handler
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      next();
    }
  ]
};

module.exports = user_validation; 