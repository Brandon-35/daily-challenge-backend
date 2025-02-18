const mongoose = require('mongoose');

const activity_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'challenge_complete',
            'achievement_earned',
            'badge_earned',
            'streak_milestone',
            'follow',
            'share',
            'comment'
        ],
        required: true
    },
    content: {
        title: String,
        description: String,
        image: String
    },
    reference: {
        model: {
            type: String,
            enum: ['Challenge', 'Achievement', 'Badge', 'User']
        },
        id: mongoose.Schema.Types.ObjectId
    },
    privacy: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
    },
    interactions: {
        likes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            created_at: Date
        }],
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: String,
            created_at: Date,
            edited_at: Date
        }],
        shares: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            created_at: Date
        }]
    },
    is_hidden: {
        type: Boolean,
        default: false
    },
    moderation: {
        reports: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            reason: String,
            status: {
                type: String,
                enum: ['pending', 'reviewed', 'resolved'],
                default: 'pending'
            },
            created_at: Date
        }],
        status: {
            type: String,
            enum: ['active', 'under_review', 'removed'],
            default: 'active'
        }
    }
}, {
    timestamps: true
});

activity_schema.index({ user: 1, created_at: -1 });
activity_schema.index({ type: 1, created_at: -1 });

const Activity = mongoose.model('Activity', activity_schema);
module.exports = Activity; 