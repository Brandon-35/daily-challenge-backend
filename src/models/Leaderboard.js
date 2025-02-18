const mongoose = require('mongoose');

const leaderboard_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number
    },
    solved_challenges: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    last_active: {
        type: Date,
        default: Date.now
    },
    badges: [{
        type: String,
        enum: ['speed_demon', 'problem_solver', 'streak_master', 'code_ninja']
    }],
    season: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index để tối ưu truy vấn xếp hạng
leaderboard_schema.index({ points: -1, solved_challenges: -1 });

const Leaderboard = mongoose.model('Leaderboard', leaderboard_schema);
module.exports = Leaderboard; 