const express = require('express');
const router = express.Router();
const challenge_controller = require('../controllers/challenge_controller');
const auth = require('../middlewares/auth');
const { check_role } = require('../middlewares/check_role');
const User = require('../models/User');

// Public routes
router.get('/challenges', challenge_controller.get_all_challenges);
router.get('/challenges/:id', challenge_controller.get_challenge);

// Protected routes
router.post(
    '/challenges',
    [auth, check_role(['admin', 'moderator', 'editor'])],
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

// Submission routes
router.post(
    '/challenges/:id/submit',
    auth,
    challenge_controller.submit_solution
);

// Recommendation routes
router.get(
    '/challenges/recommended',
    auth,
    challenge_controller.get_recommended
);

// Leaderboard routes
router.get(
    '/leaderboard/global',
    challenge_controller.get_global_leaderboard
);

router.get(
    '/leaderboard/weekly',
    challenge_controller.get_weekly_leaderboard
);

router.get(
    '/leaderboard/user/:userId',
    challenge_controller.get_user_rank
);

// Streak routes
router.get(
    '/streak/status',
    auth,
    challenge_controller.get_streak_status
);

router.get(
    '/streak/history',
    auth,
    challenge_controller.get_streak_history
);

router.get(
    '/streak/leaderboard',
    challenge_controller.get_streak_leaderboard
);

// Daily/Weekly challenge routes
router.get(
    '/challenges/daily',
    auth,
    challenge_controller.get_daily_challenge
);

router.get(
    '/challenges/weekly',
    auth,
    challenge_controller.get_weekly_challenge
);

module.exports = router; 