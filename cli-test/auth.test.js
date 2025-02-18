const axios = require('axios');
const config = require('./config');

const auth_test = {
    // Test đăng ký user mới
    async test_register() {
        try {
            const response = await axios.post(`${config.API_URL}/users/register`, {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123!',
                first_name: 'Test',
                last_name: 'User'
            });
            console.log('✅ Register Test:', response.data);
        } catch (error) {
            console.error('❌ Register Test Failed:', error.response?.data || error.message);
        }
    },

    // Test đăng nhập
    async test_login() {
        try {
            const response = await axios.post(`${config.API_URL}/users/login`, {
                email: 'test@example.com',
                password: 'Test123!'
            });
            config.TOKEN = response.data.token; // Lưu token để dùng cho các test khác
            console.log('✅ Login Test:', response.data);
        } catch (error) {
            console.error('❌ Login Test Failed:', error.response?.data || error.message);
        }
    }
};

module.exports = auth_test; 