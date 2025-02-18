const mongoose = require('mongoose');

const badge_schema = new mongoose.Schema({
    name: {
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
    icon: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['skill', 'achievement', 'special', 'event', 'community'],
        required: true
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        required: true
    },
    requirements: {
        achievement_ids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement'
        }],
        points_required: {
            type: Number,
            default: 0
        },
        challenges_required: {
            type: Number,
            default: 0
        }
    },
    bonus_points: {
        type: Number,
        default: 0
    },
    is_limited: {
        type: Boolean,
        default: false
    },
    valid_until: {
        type: Date
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

badge_schema.index({ category: 1, tier: 1 });

const Badge = mongoose.model('Badge', badge_schema);
module.exports = Badge; 