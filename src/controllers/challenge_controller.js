const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { get_current_season, calculate_points, check_for_achievements } = require('../utils/ranking');

// Utility function to update user's points and rank
async function update_user_rank(user_id, points) {
    const leaderboard = await Leaderboard.findOne({ 
        user: user_id, 
        season: get_current_season() 
    });
    
    if (!leaderboard) {
        await Leaderboard.create({
            user: user_id,
            points: points,
            season: get_current_season()
        });
    } else {
        leaderboard.points += points;
        leaderboard.last_active = new Date();
        await leaderboard.save();
    }

    // Update ranks for all users
    const users = await Leaderboard.find({ season: get_current_season() })
        .sort({ points: -1 });
    
    for (let i = 0; i < users.length; i++) {
        users[i].rank = i + 1;
        await users[i].save();
    }
}

const challenge_controller = {
  // Create new challenge
  async create_challenge(req, res) {
    try {
      const { title, description, difficulty, points, category } = req.body;
      
      const challenge = new Challenge({
        title,
        description,
        difficulty,
        points,
        category,
        created_by: req.user.user_id
      });

      await challenge.save();

      res.status(201).json({
        status: 'success',
        message: 'Challenge created successfully',
        data: { challenge }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get all challenges with filtering and pagination
  async get_all_challenges(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const difficulty = req.query.difficulty;
      const category = req.query.category;

      let query = { is_active: true };
      
      // Search by title or description
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      // Filter by difficulty
      if (difficulty) {
        query.difficulty = difficulty;
      }

      // Filter by category
      if (category) {
        query.category = category;
      }

      const total = await Challenge.countDocuments(query);
      const challenges = await Challenge.find(query)
        .populate('created_by', 'username')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: {
          challenges,
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

  // Get single challenge
  async get_challenge(req, res) {
    try {
      const challenge = await Challenge.findById(req.params.id)
        .populate('created_by', 'username');
      
      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge not found'
        });
      }

      res.json({
        status: 'success',
        data: { challenge }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Update challenge
  async update_challenge(req, res) {
    try {
      const challenge = await Challenge.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('created_by', 'username');

      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Challenge updated successfully',
        data: { challenge }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Delete challenge
  async delete_challenge(req, res) {
    try {
      const challenge = await Challenge.findByIdAndDelete(req.params.id);
      
      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Challenge deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Submit giải pháp
  async submit_solution(req, res) {
    try {
      const { code } = req.body;
      const challenge = await Challenge.findById(req.params.id);
      
      // Run test cases
      const results = await runTestCases(challenge.test_cases, code);
      
      // Calculate points based on various factors
      let earnedPoints = 0;
      if (results.all_passed) {
        // Base points from challenge
        earnedPoints = challenge.points;
        
        // Bonus points for speed
        if (results.execution_time < challenge.average_completion_time) {
          earnedPoints += 5;
        }
        
        // Bonus points for first few solutions
        const solutionCount = challenge.submissions.length;
        if (solutionCount < 10) {
          earnedPoints += Math.max(0, 10 - solutionCount);
        }
        
        // Update user's rank and points
        await update_user_rank(req.user.user_id, earnedPoints);
      }

      // Create submission
      const submission = {
        user: req.user.user_id,
        code,
        status: results.all_passed ? 'accepted' : 'rejected',
        execution_time: results.execution_time,
        memory_usage: results.memory_usage,
        points_earned: earnedPoints
      };

      challenge.submissions.push(submission);
      await challenge.save();

      // Update user statistics
      if (results.all_passed) {
        await updateUserStats(req.user.user_id, challenge, earnedPoints);
      }

      res.json({
        status: 'success',
        data: {
          results,
          submission,
          points_earned: earnedPoints
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Lấy daily challenge
  async get_daily_challenge(req, res) {
    try {
      const today = new Date();
      const challenge = await Challenge.findOne({
        difficulty: 'medium',
        submissions: { $size: { $lt: 100 } }
      }).sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: { challenge }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Gợi ý challenges
  async get_recommended(req, res) {
    try {
      const user = await User.findById(req.user.user_id)
        .populate('completed_challenges.challenge');

      // Logic để gợi ý dựa trên level và lịch sử của user
      const recommended = await Challenge.find({
        difficulty: user.statistics.success_rate > 0.7 ? 'hard' : 'medium',
        _id: { $nin: user.completed_challenges.map(c => c.challenge._id) }
      }).limit(5);

      res.json({
        status: 'success',
        data: { recommended }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get global leaderboard
  async get_global_leaderboard(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const leaderboard = await Leaderboard.find({ season: get_current_season() })
        .sort({ points: -1, solved_challenges: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username avatar');

      const total = await Leaderboard.countDocuments({ 
        season: get_current_season() 
      });

      res.json({
        status: 'success',
        data: {
          leaderboard,
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

  // Get weekly leaderboard
  async get_weekly_leaderboard(req, res) {
    try {
      const one_week_ago = new Date();
      one_week_ago.setDate(one_week_ago.getDate() - 7);

      const leaderboard = await Leaderboard.find({
        season: get_current_season(),
        last_active: { $gte: one_week_ago }
      })
        .sort({ points: -1 })
        .limit(10)
        .populate('user', 'username avatar');

      res.json({
        status: 'success',
        data: { leaderboard }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // Get user rank
  async get_user_rank(req, res) {
    try {
      const user_id = req.params.userId;
      const user_rank = await Leaderboard.findOne({
        user: user_id,
        season: get_current_season()
      }).populate('user', 'username avatar statistics');

      if (!user_rank) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found in leaderboard'
        });
      }

      // Get nearby ranks
      const nearby_ranks = await Leaderboard.find({
        season: get_current_season(),
        rank: {
          $gte: Math.max(1, user_rank.rank - 2),
          $lte: user_rank.rank + 2
        }
      })
        .sort({ rank: 1 })
        .populate('user', 'username avatar');

      res.json({
        status: 'success',
        data: {
          user_rank,
          nearby_ranks
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = challenge_controller; 