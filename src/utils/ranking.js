const get_current_season = () => {
    const now = new Date();
    return now.getFullYear() * 100 + Math.floor(now.getMonth() / 3) + 1;
};

const calculate_points = (challenge, execution_time, submission_count) => {
    let points = challenge.points;

    // Bonus for speed
    if (execution_time < challenge.average_completion_time) {
        points += 5;
    }

    // Bonus for being among first solvers
    if (submission_count < 10) {
        points += Math.max(0, 10 - submission_count);
    }

    return points;
};

const check_for_achievements = async (user, challenge, points) => {
    const achievements = [];

    // Check for streak achievement
    if (user.statistics.current_streak >= 7) {
        achievements.push({
            title: 'Week Warrior',
            description: 'Solved challenges for 7 days in a row',
            badge: 'week_warrior.png'
        });
    }

    // Check for points milestone
    if (user.statistics.total_points + points >= 1000) {
        achievements.push({
            title: 'Point Master',
            description: 'Accumulated 1000 points',
            badge: 'point_master.png'
        });
    }

    return achievements;
};

module.exports = {
    get_current_season,
    calculate_points,
    check_for_achievements
}; 