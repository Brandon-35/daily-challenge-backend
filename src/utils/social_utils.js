const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Follow = require('../models/Follow');

const social_utils = {
    async create_notification(data) {
        const notification = new Notification({
            recipient: data.recipient,
            sender: data.sender,
            type: data.type,
            content: data.content,
            reference: data.reference
        });
        await notification.save();
        return notification;
    },

    async create_activity(data) {
        const activity = new Activity({
            user: data.user,
            type: data.type,
            content: data.content,
            reference: data.reference,
            privacy: data.privacy
        });
        await activity.save();
        return activity;
    },

    check_visibility(viewer, owner, privacy_setting) {
        if (privacy_setting === 'public') return true;
        if (privacy_setting === 'private') return viewer.toString() === owner.toString();
        if (privacy_setting === 'followers') {
            return Follow.exists({
                follower: viewer,
                following: owner,
                status: 'accepted'
            });
        }
        return false;
    }
};

module.exports = social_utils; 