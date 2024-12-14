import { App } from '@slack/bolt'

const officeSchedule: { [day: string]: string[] } = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

// Command to show weekly schedule
app.command('/office', async ({ command, ack, say }) => {
  await ack()

  // Build the weekly schedule message
  let message = ":coffee: Morning! Here's who's in the office this week:\n\n"

  for (const [day, attendees] of Object.entries(officeSchedule)) {
    const formattedAttendees = attendees.map((user) => `  ${user}`).join('\n')
    message += `*${day}*\n:office:\n${formattedAttendees}\n\n`
  }

  await say(message)
})
// Handle button interactions for joining a day
app.command('/office', async ({ command, ack, say }) => {
  await ack()

  const blocks = Object.keys(officeSchedule).map((day) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${day}*`,
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Join',
      },
      action_id: `join_${day.toLowerCase()}`,
    },
  }))

  await say({
    blocks,
    text: "Here's the office schedule for the week!",
  })
})

app.action(/join_.*/, async ({ action, ack, body, say }) => {
  await ack()

  const day =
    (action.action_id.split('_')[1] || '').charAt(0).toUpperCase() +
    (action.action_id.split('_')[1] || '').slice(1)
  const user = `<@${body.user.id}>`

  // Add the user to the selected day's list
  if (!officeSchedule[day]) officeSchedule[day] = []
  if (!officeSchedule[day].includes(user)) {
    officeSchedule[day].push(user)
  }

  await say(`${user} has joined the office schedule for *${day}*!`)
})

const start = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Joshicely app is running!')
}

start()
