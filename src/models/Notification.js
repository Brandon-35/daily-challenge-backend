const mongoose = require('mongoose');

const notification_schema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [
            'follow',
            'like',
            'comment',
            'mention',
            'share',
            'achievement_share'
        ],
        required: true
    },
    content: {
        title: String,
        body: String,
        image: String
    },
    reference: {
        model: {
            type: String,
            enum: ['Activity', 'User', 'Challenge', 'Achievement']
        },
        id: mongoose.Schema.Types.ObjectId
    },
    is_read: {
        type: Boolean,
        default: false
    },
    read_at: Date
}, {
    timestamps: true
});

notification_schema.index({ recipient: 1, created_at: -1 });
notification_schema.index({ is_read: 1, created_at: -1 });

const Notification = mongoose.model('Notification', notification_schema);
module.exports = Notification; 