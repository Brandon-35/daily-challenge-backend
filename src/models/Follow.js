const mongoose = require('mongoose');

const follow_schema = new mongoose.Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'accepted'
    }
}, {
    timestamps: true
});

// Ensure unique follower-following pairs
follow_schema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model('Follow', follow_schema);
module.exports = Follow; 