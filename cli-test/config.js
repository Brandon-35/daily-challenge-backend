require('dotenv').config({ path: '../.env' });

module.exports = {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
    TOKEN: null, // Will be set after login
    TEST_CHALLENGE_ID: null, // Will be set after creating challenge
    ADMIN_CREDENTIALS: {
        username: 'admin_test',
        email: 'admin_test@example.com',
        password: 'Admin@123',
        confirm_password: 'Admin@123',
        first_name: 'Admin',
        last_name: 'Test',
        role: 'admin'
    },
    
    // Add more environment variables
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET
}; 