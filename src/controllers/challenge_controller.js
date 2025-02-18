const Challenge = require('../models/Challenge');

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
  }
};

module.exports = challenge_controller; 