import { scheduleJob } from 'node-schedule'

scheduleJob('0 17 * * 1-5', async () => {
  // 5 PM Mon-Fri
  // Get all users and send reminders
  // You'd need to maintain a list of users somewhere
  for (const userId of userIds) {
    await sendStatusReminder(app.client, userId, addDays(new Date(), 1))
  }
})
