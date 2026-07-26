// FitSync Data Export Service
// Aggregates user profile, fitness, challenges, friends, and alerts details and triggers client-side JSON/CSV downloads

import { ProfileService } from './profile';
import { FitnessService } from './fitness';
import { FriendService } from './friend';
import { ChallengeService } from './challenge';
import { NotificationService } from './notification';

export const ExportService = {
  /**
   * Aggregate all user data and trigger download
   */
  async exportUserData(userId: string, format: 'json' | 'csv'): Promise<void> {
    // 1. Fetch all user data
    const profile = await ProfileService.getProfile(userId);
    const fitnessLogs = await FitnessService.getFitnessLogs(userId);
    const friends = await FriendService.getFriends(userId);
    const challenges = await ChallengeService.getChallenges();
    const notifications = await NotificationService.getNotifications(userId);

    const dataObj = {
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        location: profile.location,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        phone: profile.phone,
        fitsync_id: profile.fitsync_id
      },
      fitness: fitnessLogs.map(l => ({
        date: l.date,
        steps: l.steps,
        calories: l.calories,
        water: l.water,
        workout_minutes: l.workout_minutes,
        weight: l.weight,
        bmi: l.bmi
      })),
      friends: friends.map(f => ({
        friend_id: f.friend_id,
        username: f.friend_profile?.username,
        full_name: f.friend_profile?.full_name
      })),
      challenges: challenges.map(c => ({
        title: c.title,
        difficulty: c.difficulty,
        goal: c.goal_value,
        category: c.category
      })),
      notifications: notifications.map(n => ({
        title: n.title,
        message: n.message,
        category: n.category,
        created_at: n.created_at
      }))
    };

    // 2. Trigger browser download
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
      this.triggerDownload(blob, `fitsync_data_export_${userId}.json`);
    } else {
      // CSV Format: Generate consolidated profiles and summaries csv string
      let csvContent = 'data:text/csv;charset=utf-8,\n';
      csvContent += 'Section,Key/Date,Value/Steps,Secondary/Calories,Tertiary/Water\n';
      
      // Profile Rows
      csvContent += `Profile,Name,${profile.full_name},,\n`;
      csvContent += `Profile,Username,${profile.username},,\n`;
      csvContent += `Profile,FitSync ID,${profile.fitsync_id},,\n`;

      // Fitness Rows
      fitnessLogs.forEach(l => {
        csvContent += `Fitness,${l.date},${l.steps},${l.calories},${l.water}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `fitsync_data_export_${userId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
export default ExportService;
