const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Personal Development', 
            'Health', 
            'Learning', 
            'Career', 
            'Finance', 
            'Creativity', 
            'Fitness', 
            'Mindfulness',
            'Other'
        ]
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'abandoned'],
        default: 'active'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    recurrence: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'one-time'],
        default: 'one-time'
    },
    targetFrequency: {
        count: {
            type: Number,
            default: 1
        },
        period: {
            type: String,
            enum: ['day', 'week', 'month'],
            default: 'day'
        }
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    logs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log'
    }],
    aiAnalysis: {
        insights: String,
        recommendedActions: [String],
        complexity: Number
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Validation to ensure endDate is after startDate
challengeSchema.pre('validate', function(next) {
    if (this.endDate < this.startDate) {
        next(new Error('End date must be after start date'));
    } else {
        next();
    }
});

// Method to update progress
challengeSchema.methods.updateProgress = function(newProgress) {
    this.progress = Math.min(Math.max(newProgress, 0), 100);
    
    // Auto-update status based on progress
    if (this.progress === 100) {
        this.status = 'completed';
    } else if (this.progress > 0 && this.status === 'abandoned') {
        this.status = 'active';
    }

    return this;
};

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;