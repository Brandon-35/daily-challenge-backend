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

// New routes
router.post('/challenges/:id/submit', auth, challenge_controller.submit_solution);
router.get('/challenges/:id/submissions', auth, challenge_controller.get_submissions);
router.get('/challenges/:id/leaderboard', challenge_controller.get_leaderboard);
router.get('/challenges/recommended', auth, challenge_controller.get_recommended);
router.post('/challenges/:id/test', auth, challenge_controller.test_solution);
router.get('/challenges/daily', challenge_controller.get_daily_challenge);

// Leaderboard routes
router.get('/leaderboard', challenge_controller.get_global_leaderboard);
router.get('/leaderboard/weekly', challenge_controller.get_weekly_leaderboard);
router.get('/leaderboard/monthly', challenge_controller.get_monthly_leaderboard);
router.get('/leaderboard/user/:user_id', challenge_controller.get_user_rank);

module.exports = router; 