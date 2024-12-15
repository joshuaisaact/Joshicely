import { App, type BlockAction } from '@slack/bolt'
import { createSchedule } from './services/schedule'
import { appHomeOpenedHandler } from './events/app-home'
import { officeCommandHandler } from './commands/office'
import { homeButtonHandler, officeButtonHandler } from './interactions/buttons'

let officeSchedule = createSchedule()

// App initialization
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

// Commands
app.command('/office', async (args) => {
  await officeCommandHandler(args, officeSchedule)
})

// Interactive components (buttons, etc)
app.action<BlockAction>(/office_.*/, async (args) => {
  const updatedSchedule = await officeButtonHandler(args, officeSchedule)
  if (updatedSchedule) officeSchedule = updatedSchedule
})

app.action<BlockAction>(/home_.*/, async (args) => {
  const updatedSchedule = await homeButtonHandler(args, officeSchedule)
  if (updatedSchedule) officeSchedule = updatedSchedule
})

// Events
app.event('app_home_opened', async (args) => {
  await appHomeOpenedHandler(args, officeSchedule)
})

const start = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Joshicely app is running!')
}

start()
