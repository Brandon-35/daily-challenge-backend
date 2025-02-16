const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        name: {
            type: String,
            trim: true
        },
        avatar: {
            type: String,
            default: 'default-avatar.png'
        },
        bio: {
            type: String,
            maxlength: 500
        }
    },
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        totalChallenges: {
            type: Number,
            default: 0
        },
        completedChallenges: {
            type: Number,
            default: 0
        },
        totalPoints: {
            type: Number,
            default: 0
        }
    },
    challenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }],
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log'
    }],
    achievements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement'
    }]
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);