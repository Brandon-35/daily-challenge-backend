const auth_test = require('./auth.test');
const challenge_test = require('./challenge.test');
const config = require('./config');

async function run_tests() {
    try {
        console.log('\n🚀 Starting API Tests...');
        console.log(`Environment: ${config.NODE_ENV}`);
        console.log(`API URL: ${config.API_URL}\n`);

        // Auth Flow
        console.log('📝 Running Auth Tests...');
        await auth_test.test_register_admin();
        await auth_test.test_admin_login();

        // Challenge Flow
        console.log('\n📝 Running Challenge Tests...');
        await challenge_test.test_get_challenges();
        await challenge_test.test_create_challenge();
        await challenge_test.test_submit_solution();

        console.log('\n✨ All tests completed!\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        process.exit(1);
    }
}

run_tests(); 