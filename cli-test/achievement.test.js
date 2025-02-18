const axios = require('axios');
const config = require('./config');

const achievement_test = {
    // Test lấy danh sách achievements
    async test_get_achievements() {
        try {
            const response = await axios.get(
                `${config.API_URL}/achievements`,
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            console.log('✅ Get Achievements Test:', response.data);
        } catch (error) {
            console.error('❌ Get Achievements Test Failed:', error.response?.data || error.message);
        }
    },

    // Test lấy progress của user
    async test_get_progress() {
        try {
            const response = await axios.get(
                `${config.API_URL}/achievements/progress`,
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            console.log('✅ Get Progress Test:', response.data);
        } catch (error) {
            console.error('❌ Get Progress Test Failed:', error.response?.data || error.message);
        }
    }
};

module.exports = achievement_test; 