const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Updated capabilities with 'can_' prefix
const CAPABILITIES = {
  CREATE: 'can_create',
  READ: 'can_read',
  UPDATE: 'can_update',
  DELETE: 'can_delete',
  MANAGE_USERS: 'can_manage_users',
  ADMIN_PANEL: 'can_access_admin'
};

// Updated role capabilities mapping
const ROLE_CAPABILITIES = {
  user: [CAPABILITIES.READ],
  editor: [CAPABILITIES.CREATE, CAPABILITIES.READ, CAPABILITIES.UPDATE],
  moderator: [CAPABILITIES.CREATE, CAPABILITIES.READ, CAPABILITIES.UPDATE, CAPABILITIES.DELETE],
  admin: Object.values(CAPABILITIES)
};

const user_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator', 'editor'],
        default: 'user'
    },
    capabilities: [{
        type: String,
        enum: Object.values(CAPABILITIES)
    }],
    avatar: {
        type: String,
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    },
    completed_challenges: [{
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        completed_at: Date,
        score: Number
    }],
    achievements: [{
        title: String,
        description: String,
        earned_at: Date,
        badge: String // URL to badge image
    }],
    statistics: {
        total_points: { type: Number, default: 0 },
        challenges_completed: { type: Number, default: 0 },
        success_rate: { type: Number, default: 0 },
        streak: {
            current_streak: { type: Number, default: 0 },
            longest_streak: { type: Number, default: 0 },
            last_activity_date: { type: Date },
            streak_history: [{
                start_date: Date,
                end_date: Date,
                duration: Number,
                break_reason: String
            }],
            streak_milestones: [{
                days: Number,
                achieved_at: Date,
                reward: {
                    points: Number,
                    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }
                }
            }]
        }
    },
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    badge_progress: [{
        badge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Badge'
        },
        progress: Number,
        unlocked_at: Date
    }],
    social_settings: {
        profile_visibility: {
            type: String,
            enum: ['public', 'followers', 'private'],
            default: 'public'
        },
        activity_visibility: {
            type: String,
            enum: ['public', 'followers', 'private'],
            default: 'public'
        },
        allow_follows: {
            type: Boolean,
            default: true
        },
        auto_share: {
            achievements: Boolean,
            challenges: Boolean,
            badges: Boolean
        },
        notification_preferences: {
            follows: Boolean,
            likes: Boolean,
            comments: Boolean,
            mentions: Boolean,
            shares: Boolean,
            achievements: Boolean
        }
    },
    social_stats: {
        followers_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        total_likes: { type: Number, default: 0 },
        total_shares: { type: Number, default: 0 },
        reputation_score: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Tự động cập nhật capabilities dựa trên role
user_schema.pre('save', function(next) {
    if (this.isModified('role')) {
        this.capabilities = ROLE_CAPABILITIES[this.role];
    }
    next();
});

// Add password hashing middleware
user_schema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add password comparison method
user_schema.methods.compare_password = async function(candidate_password) {
    return await bcryptjs.compare(candidate_password, this.password);
};

// Method kiểm tra có capability không
user_schema.methods.has_capability = function(capability) {
    return this.capabilities.includes(capability);
};

// Static method để tìm user bằng username hoặc email
user_schema.statics.find_by_credentials = async function(login) {
    return this.findOne({
        $or: [
            { email: login.toLowerCase() },
            { username: login }
        ]
    });
};

const User = mongoose.model('User', user_schema);

// Export constants để sử dụng ở nơi khác
User.CAPABILITIES = CAPABILITIES;
User.ROLE_CAPABILITIES = ROLE_CAPABILITIES;

module.exports = User;