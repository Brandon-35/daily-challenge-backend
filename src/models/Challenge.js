const mongoose = require('mongoose');

const challenge_schema = new mongoose.Schema({
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
            'programming',
            'algorithms', 
            'data_structures',
            'web_development',
            'databases',
            'machine_learning'
        ]
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'abandoned'],
        default: 'active'
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
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
    average_completion_time: {
        type: Number,
        default: 0
    },
    difficulty_multiplier: {
        type: Number,
        default: 1,
        enum: [1, 1.5, 2] // easy, medium, hard
    },
    first_solve_bonus: {
        type: Number,
        default: 10
    },
    speed_bonus_threshold: {
        type: Number,
        default: 1000 // milliseconds
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    },
    submissions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        code: String,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        feedback: String,
        submitted_at: {
            type: Date,
            default: Date.now
        },
        execution_time: Number,
        memory_usage: Number
    }],
    test_cases: [{
        input: String,
        expected_output: String,
        is_hidden: {
            type: Boolean,
            default: false
        }
    }],
    tags: [{
        type: String,
        enum: ['Arrays', 'Strings', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Sorting', 'Searching']
    }],
    skill_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }],
    challenge_type: {
        type: String,
        enum: ['regular', 'daily', 'weekly'],
        default: 'regular'
    },
    schedule: {
        start_date: Date,
        end_date: Date,
        repeat_pattern: {
            type: String,
            enum: ['daily', 'weekly', 'none'],
            default: 'none'
        }
    },
    participation_limit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    bonus_rewards: {
        points: Number,
        streak_multiplier: {
            type: Number,
            default: 1
        },
        special_badge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Badge'
        }
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['registered', 'in_progress', 'completed', 'failed'],
            default: 'registered'
        },
        started_at: Date,
        completed_at: Date
    }]
}, {
    timestamps: true
});

// Validate end_date is after start_date
challenge_schema.pre('validate', function(next) {
    if (this.end_date && this.start_date && this.end_date < this.start_date) {
        next(new Error('End date must be after start date'));
    } else {
        next();
    }
});

// Method to update progress
challenge_schema.methods.updateProgress = function(newProgress) {
    this.progress = Math.min(Math.max(newProgress, 0), 100);
    
    // Auto-update status based on progress
    if (this.progress === 100) {
        this.status = 'completed';
    } else if (this.progress > 0 && this.status === 'abandoned') {
        this.status = 'active';
    }

    return this;
};

const Challenge = mongoose.model('Challenge', challenge_schema);
module.exports = Challenge;