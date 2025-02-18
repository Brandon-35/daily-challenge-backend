const mongoose = require('mongoose');

const log_schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    action: {
        type: String,
        enum: ['start', 'submit', 'complete', 'abandon', 'resume'],
        required: true
    },
    details: {
        time_spent: Number, // in minutes
        progress: Number,
        notes: String,
        mood: {
            type: String,
            enum: ['great', 'good', 'neutral', 'difficult', 'struggling']
        }
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'in_progress'],
        default: 'in_progress'
    },
    metrics: {
        execution_time: Number,
        memory_usage: Number,
        code_quality_score: Number
    }
}, {
    timestamps: true
});

// Index for efficient querying
log_schema.index({ user: 1, challenge: 1, createdAt: -1 });

const Log = mongoose.model('Log', log_schema);
module.exports = Log;