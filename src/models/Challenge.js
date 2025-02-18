const mongoose = require('mongoose');

const challenge_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
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
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
        required: true
    }
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