const axios = require('axios');
const config = require('./config');

const social_test = {
    // Test follow user
    async test_follow_user() {
        try {
            const response = await axios.post(
                `${config.API_URL}/social/follow/user123`,
                {},
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            console.log('✅ Follow User Test:', response.data);
        } catch (error) {
            console.error('❌ Follow User Test Failed:', error.response?.data || error.message);
        }
    },

    // Test get activity feed
    async test_get_activity_feed() {
        try {
            const response = await axios.get(
                `${config.API_URL}/social/feed`,
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            console.log('✅ Get Activity Feed Test:', response.data);
        } catch (error) {
            console.error('❌ Get Activity Feed Test Failed:', error.response?.data || error.message);
        }
    }
};

module.exports = social_test; 