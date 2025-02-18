const mongoose = require('mongoose');

const achievement_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['challenge', 'streak', 'points', 'social', 'special'],
        required: true
    },
    icon: {
        type: String,  // URL to achievement icon
        required: true
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    criteria: {
        type: {
            type: String,
            enum: ['challenges_completed', 'points_earned', 'streak_days', 'perfect_solutions'],
            required: true
        },
        threshold: {
            type: Number,
            required: true
        }
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    is_active: {
        type: Boolean,
        default: true
    },
    related_badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    unlock_requirements: {
        previous_achievements: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement'
        }],
        level_required: {
            type: Number,
            default: 0
        }
    },
    tier_progress: [{
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond']
        },
        threshold: Number,
        bonus_points: Number
    }]
}, {
    timestamps: true
});

// Index for efficient querying
achievement_schema.index({ category: 1, rarity: 1 });

const Achievement = mongoose.model('Achievement', achievement_schema);
module.exports = Achievement;