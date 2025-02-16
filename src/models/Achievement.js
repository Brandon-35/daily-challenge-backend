const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
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
        enum: [
            'Consistency', 
            'Challenge Completion', 
            'Skill Mastery', 
            'Milestone', 
            'Personal Growth',
            'Streak'
        ],
        required: true
    },
    points: {
        type: Number,
        default: 10,
        min: 0
    },
    icon: {
        type: String,
        default: 'default-achievement.png'
    },
    criteria: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedChallenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Predefined achievement types
const ACHIEVEMENT_TYPES = {
    FIRST_CHALLENGE: {
        title: 'First Step',
        description: 'Created your first challenge',
        category: 'Milestone',
        points: 50
    },
    DAILY_STREAK: {
        title: 'Streak Master',
        description: 'Completed challenges for 7 consecutive days',
        category: 'Streak',
        points: 100
    },
    // Add more predefined achievements
};

// Static method to create achievements
AchievementSchema.statics.createAchievement = function(achievementType, user, relatedChallenge = null) {
    const achievementData = ACHIEVEMENT_TYPES[achievementType];
    
    if (!achievementData) {
        throw new Error('Invalid achievement type');
    }

    return this.create({
        ...achievementData,
        user: user._id,
        relatedChallenge: relatedChallenge ? relatedChallenge._id : null
    });
};

// Method to check and potentially unlock achievements
AchievementSchema.statics.checkAndUnlock = async function(user) {
    const achievementsToUnlock = [];

    // Example achievement unlock logic
    const challengeCount = await mongoose.models.Challenge.countDocuments({ user: user._id });
    
    if (challengeCount === 1) {
        achievementsToUnlock.push(
            await this.createAchievement('FIRST_CHALLENGE', user)
        );
    }

    // TODO: Implement more complex achievement unlock logic
    // Examples:
    // - Check daily/weekly streaks
    // - Check challenge completion rates
    // - Check total points earned

    return achievementsToUnlock;
};

module.exports = mongoose.model('Achievement', AchievementSchema);