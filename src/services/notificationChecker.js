import { sendNotification } from "./notificationService";
export const checkTaskNotifications = (tasks) => {
  const now = new Date();
  tasks.forEach((task) => {
    if (task.status === "completed") return;
    const deadline = new Date(task.deadline);
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    const remaining = task.estimatedTime - (task.actualTime || 0);
    // Overdue
    if (hoursLeft < 0) {
      sendNotification(
        `❌ OVERDUE: ${task.title}`,
        `This task is overdue! Complete it now.`
      );
      return;
    }
    // Less than 2 hours left
    if (hoursLeft < 2) {
      sendNotification(
        `🔴 URGENT: ${task.title}`,
        `Only ${hoursLeft.toFixed(1)} hrs left before deadline!`
      );
      return;
    }
    // Not enough time
    if (hoursLeft < remaining) {
      sendNotification(
        `⚠️ RISK: ${task.title}`,
        `You don't have enough time to finish this task!`
      );
      return;
    }
    // Due today
    if (hoursLeft < 24) {
      sendNotification(
        `📅 Due Today: ${task.title}`,
        `This task is due today. Don't forget!`
      );
    }
  });
};
