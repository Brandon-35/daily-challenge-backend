const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    duration: {
        type: Number,
        default: 0,
        min: 0
    },
    progressIncrement: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    mood: {
        type: String,
        enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
        default: 'neutral'
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        type: String  // URLs or file paths
    }],
    aiInsights: {
        emotionalTrend: String,
        performanceAnalysis: String,
        suggestions: [String]
    }
}, {
    timestamps: true
});

// Validation to ensure description is not empty
LogSchema.pre('validate', function(next) {
    if (!this.description || this.description.trim().length === 0) {
        next(new Error('Log description cannot be empty'));
    } else {
        next();
    }
});

// Method to generate AI insights (placeholder)
LogSchema.methods.generateAIInsights = async function() {
    // TODO: Implement AI analysis logic
    // This would typically involve calling an external AI service
    this.aiInsights = {
        emotionalTrend: 'Consistent',
        performanceAnalysis: 'Steady progress',
        suggestions: ['Keep maintaining your current momentum']
    };
    return this;
};

module.exports = mongoose.model('Log', LogSchema);