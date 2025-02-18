const User = require('../models/User');

const streak_manager = {
    // Update streak when user completes a challenge
    async update_streak(user_id) {
        const user = await User.findById(user_id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last_activity = user.statistics.streak.last_activity_date;
        if (!last_activity) {
            // First activity
            user.statistics.streak.current_streak = 1;
            user.statistics.streak.longest_streak = 1;
        } else {
            const last_date = new Date(last_activity);
            last_date.setHours(0, 0, 0, 0);
            
            const day_difference = Math.floor((today - last_date) / (1000 * 60 * 60 * 24));

            if (day_difference === 1) {
                // Consecutive day
                user.statistics.streak.current_streak += 1;
                if (user.statistics.streak.current_streak > user.statistics.streak.longest_streak) {
                    user.statistics.streak.longest_streak = user.statistics.streak.current_streak;
                }
            } else if (day_difference > 1) {
                // Streak broken
                user.statistics.streak.streak_history.push({
                    start_date: new Date(last_activity).setDate(
                        last_activity.getDate() - user.statistics.streak.current_streak + 1
                    ),
                    end_date: last_activity,
                    duration: user.statistics.streak.current_streak,
                    break_reason: 'missed_day'
                });
                user.statistics.streak.current_streak = 1;
            }
        }

        // Check for streak milestones
        await check_streak_milestones(user);

        user.statistics.streak.last_activity_date = today;
        await user.save();

        return user.statistics.streak;
    },

    // Check and award milestone rewards
    async check_streak_milestones(user) {
        const current_streak = user.statistics.streak.current_streak;
        const milestones = [
            { days: 3, points: 30, badge: 'three_day_streak' },
            { days: 7, points: 100, badge: 'week_warrior' },
            { days: 14, points: 250, badge: 'two_week_master' },
            { days: 30, points: 1000, badge: 'monthly_champion' },
            { days: 100, points: 5000, badge: 'streak_legend' }
        ];

        for (const milestone of milestones) {
            if (current_streak === milestone.days) {
                // Check if milestone already achieved
                const already_achieved = user.statistics.streak.streak_milestones
                    .some(m => m.days === milestone.days);

                if (!already_achieved) {
                    // Award milestone
                    user.statistics.total_points += milestone.points;
                    user.statistics.streak.streak_milestones.push({
                        days: milestone.days,
                        achieved_at: new Date(),
                        reward: {
                            points: milestone.points,
                            badge: await get_or_create_badge(milestone.badge)
                        }
                    });

                    // Notify user
                    await notify_user_milestone(user, milestone);
                }
            }
        }
    },

    // Calculate streak bonus multiplier
    calculate_streak_bonus(current_streak) {
        // Base multiplier
        let multiplier = 1;
        
        // Add 0.1 (10%) for each week of streak
        const weeks = Math.floor(current_streak / 7);
        multiplier += weeks * 0.1;

        // Cap at 2x (100% bonus)
        return Math.min(multiplier, 2);
    }
};

module.exports = streak_manager; 