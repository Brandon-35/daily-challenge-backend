const axios = require('axios');
const config = require('./config');
const jwt = require('jsonwebtoken');

const auth_test = {
    // Test registering a new user
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

    // Test logging in
    async test_login() {
        try {
            const response = await axios.post(`${config.API_URL}/users/login`, {
                email: 'test@example.com',
                password: 'Test123!'
            });
            config.TOKEN = response.data.token; // Save token for use in other tests
            console.log('✅ Login Test:', response.data);
        } catch (error) {
            console.error('❌ Login Test Failed:', error.response?.data || error.message);
        }
    },

    async test_register_admin() {
        try {
            // First check if admin already exists
            try {
                const login_response = await axios.post(`${config.API_URL}/users/login`, {
                    email: config.ADMIN_CREDENTIALS.email,
                    password: config.ADMIN_CREDENTIALS.password
                });
                console.log('Login Response:', login_response.data);
                if (login_response.data.token) {
                    console.log('ℹ️ Admin user already exists, using existing account');
                    config.TOKEN = login_response.data.token;
                    return login_response.data;
                }
            } catch (login_error) {
                console.log('Login Error:', login_error);
                // If login fails, proceed with registration
                console.log('ℹ️ Admin login failed, proceeding with registration');
            }

            // Proceed with registration with explicit role
            const register_response = await axios.post(`${config.API_URL}/users/register`, {
                ...config.ADMIN_CREDENTIALS,
                confirm_password: config.ADMIN_CREDENTIALS.password,
                role: 'admin' // Explicitly set role to admin
            });

            if (register_response.data.token) {
                config.TOKEN = register_response.data.token;
            }

            console.log('✅ Admin Registration Test Passed');
            console.log('Created user role:', register_response.data.data.user.role);
            return register_response.data;
        } catch (error) {
            console.log('❌ Admin Registration Test Failed:', 
                error.response?.data?.message || error.message);
            console.log('Request data:', config.ADMIN_CREDENTIALS);
            throw error;
        }
    },

    async test_admin_login() {
        try {
            const response = await axios.post(`${config.API_URL}/users/login`, {
                email: config.ADMIN_CREDENTIALS.email,
                password: config.ADMIN_CREDENTIALS.password
            });

            // Log response for debugging
            console.log('Login Response:', response.data);
            console.log('User Role:', response.data.data.user.role);

            if (response.data.token) {
                config.TOKEN = response.data.token;
            } else if (response.data.data && response.data.data.token) {
                config.TOKEN = response.data.data.token;
            } else {
                throw new Error('Token not found in response');
            }

            // Verify token contains admin role
            const decoded = jwt.decode(config.TOKEN);
            console.log('Decoded Token:', decoded);

            if (decoded.role !== 'admin') {
                throw new Error('Token does not contain admin role');
            }

            console.log('✅ Admin Login Test Passed');
            return response.data;
        } catch (error) {
            console.log('❌ Admin Login Test Failed:', 
                error.response?.data?.message || error.message);
            throw error;
        }
    }
};

module.exports = auth_test; 