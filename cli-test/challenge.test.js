const axios = require('axios');
const config = require('./config');

const challenge_test = {
    // Test lấy danh sách challenges
    async test_get_challenges() {
        try {
            const response = await axios.get(`${config.API_URL}/challenges`, {
                headers: { Authorization: `Bearer ${config.TOKEN}` }
            });
            console.log('✅ Get Challenges Test:', response.data);
        } catch (error) {
            console.error('❌ Get Challenges Test Failed:', error.response?.data || error.message);
        }
    },

    // Test tạo challenge mới
    async test_create_challenge() {
        try {
            const response = await axios.post(
                `${config.API_URL}/challenges`,
                {
                    title: 'Test Challenge',
                    description: 'This is a test challenge',
                    category: 'algorithms',
                    difficulty: 'medium',
                    points: 100
                },
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            config.TEST_CHALLENGE_ID = response.data.data.challenge._id;
            console.log('✅ Create Challenge Test:', response.data);
        } catch (error) {
            console.error('❌ Create Challenge Test Failed:', error.response?.data || error.message);
        }
    },

    // Test submit solution
    async test_submit_solution() {
        try {
            const response = await axios.post(
                `${config.API_URL}/challenges/${config.TEST_CHALLENGE_ID}/submit`,
                {
                    solution: 'Test solution code here',
                    language: 'javascript'
                },
                {
                    headers: { Authorization: `Bearer ${config.TOKEN}` }
                }
            );
            console.log('✅ Submit Solution Test:', response.data);
        } catch (error) {
            console.error('❌ Submit Solution Test Failed:', error.response?.data || error.message);
        }
    }
};

module.exports = challenge_test; 