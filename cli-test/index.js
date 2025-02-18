const auth_test = require('./auth.test');
const challenge_test = require('./challenge.test');
const achievement_test = require('./achievement.test');
const social_test = require('./social.test');
const config = require('./config');

async function run_tests() {
    console.log('\n🚀 Starting API Tests...');
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`API URL: ${config.API_URL}\n`);

    // Auth tests
    console.log('📝 Running Auth Tests...');
    await auth_test.test_register();
    await auth_test.test_login();

    // Challenge tests
    console.log('\n📝 Running Challenge Tests...');
    await challenge_test.test_get_challenges();
    await challenge_test.test_create_challenge();
    await challenge_test.test_submit_solution();

    // Achievement tests
    console.log('\n📝 Running Achievement Tests...');
    await achievement_test.test_get_achievements();
    await achievement_test.test_get_progress();

    // Social tests
    console.log('\n📝 Running Social Tests...');
    await social_test.test_follow_user();
    await social_test.test_get_activity_feed();

    console.log('\n✨ All tests completed!\n');
}

run_tests().catch(console.error); 