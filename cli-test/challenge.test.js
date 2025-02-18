const axios = require('axios');
const config = require('./config');

async function test_get_challenges() {
    try {
        const response = await axios.get(`${config.API_URL}/challenges`);
        console.log('✅ Get Challenges Test Passed');
        return response.data;
    } catch (error) {
        console.log('❌ Get Challenges Test Failed:', error.response?.data || error.message);
        throw error;
    }
}

async function test_create_challenge() {
    try {
        if (!config.TOKEN) {
            throw new Error('No auth token available. Please login first.');
        }

        console.log('Using token:', config.TOKEN);

        // Create dates for the challenge
        const start_date = new Date();
        const end_date = new Date(start_date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

        const challenge_data = {
            title: "Test Challenge",
            description: "This is a test challenge",
            difficulty: "beginner",
            points: 100,
            category: "programming",
            start_date: start_date.toISOString(),
            end_date: end_date.toISOString()
        };

        console.log('Creating challenge with data:', challenge_data); // Debug log

        const response = await axios.post(
            `${config.API_URL}/challenges`,
            challenge_data,
            {
                headers: { 
                    'Authorization': `Bearer ${config.TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        config.TEST_CHALLENGE_ID = response.data.data.challenge._id;
        console.log('✅ Create Challenge Test Passed');
        return response.data;
    } catch (error) {
        console.log('❌ Create Challenge Test Failed:', error.response?.data || error.message);
        console.log('Request config:', {
            url: `${config.API_URL}/challenges`,
            headers: { Authorization: `Bearer ${config.TOKEN}` }
        });
        throw error;
    }
}

async function test_submit_solution() {
    try {
        if (!config.TOKEN || !config.TEST_CHALLENGE_ID) {
            throw new Error('Missing token or challenge ID. Please create challenge first.');
        }

        const solution_data = {
            code: "function solution() { return true; }"
        };

        const response = await axios.post(
            `${config.API_URL}/challenges/${config.TEST_CHALLENGE_ID}/submit`,
            solution_data,
            {
                headers: { Authorization: `Bearer ${config.TOKEN}` }
            }
        );

        console.log('✅ Submit Solution Test Passed');
        return response.data;
    } catch (error) {
        console.log('❌ Submit Solution Test Failed:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    test_get_challenges,
    test_create_challenge,
    test_submit_solution
}; 