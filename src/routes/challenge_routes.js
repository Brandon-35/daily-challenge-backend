const express = require('express');
const router = express.Router();
const challenge_controller = require('../controllers/challenge_controller');
const auth = require('../middlewares/auth');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// Public routes
router.get('/challenges', challenge_controller.get_all_challenges);
router.get('/challenges/:id', challenge_controller.get_challenge);

// Protected routes - Only admin, moderator, and editor can manage challenges
router.post(
  '/challenges',
  [auth, check_role(['admin', 'moderator', 'editor'], User.CAPABILITIES.CREATE)],
  challenge_controller.create_challenge
);

router.put(
  '/challenges/:id',
  [auth, check_role(['admin', 'moderator', 'editor'], User.CAPABILITIES.UPDATE)],
  challenge_controller.update_challenge
);

router.delete(
  '/challenges/:id',
  [auth, check_role(['admin', 'moderator'], User.CAPABILITIES.DELETE)],
  challenge_controller.delete_challenge
);

module.exports = router; 