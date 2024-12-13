import { App } from '@slack/bolt'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

// Command to show weekly schedule
app.command('/office', async ({ command, ack, say }) => {
  await ack()
  await say('Weekly schedule coming soon!')
})

// Handle button interactions
app.action('join_day', async ({ action, ack, say }) => {
  await ack()
  await say('Joining day...')
})

const start = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Joshicely app is running!')
}

start()
