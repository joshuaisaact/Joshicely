import { App, type BlockAction } from '@slack/bolt'
import type { HomeView } from './types/slack'
import { AttendanceStatus } from './constants'
import { generateBlocks } from './blocks/home'
import { createSchedule, updateAttendance } from './services/schedule'

let officeSchedule = createSchedule()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

app.command('/office', async ({ command, ack, say }) => {
  await ack()
  await say({
    blocks: generateBlocks(officeSchedule, false),
    text: "Here's who's in the office this week",
  })
})

app.action<BlockAction>(/office_.*/, async ({ action, ack, body, client }) => {
  await ack()
  const day = action.action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action.action_id.split('_')[1]?.slice(1) ?? '')

  if (!day || !(day in officeSchedule)) return

  officeSchedule = updateAttendance(
    officeSchedule,
    day,
    body.user.id,
    AttendanceStatus.Office,
  )

  const emoji = '🏢'
  const message = `<@${body.user.id}> will be in the office on *${day}*!`

  await client.chat.postMessage({
    channel: body.user.id,
    text: `${message} ${emoji}`,
  })

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: 'home',
      blocks: generateBlocks(officeSchedule, true),
    } as HomeView,
  })
})

app.action<BlockAction>(/home_.*/, async ({ action, ack, body, client }) => {
  await ack()
  const day = action.action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action.action_id.split('_')[1]?.slice(1) ?? '')

  if (!day || !(day in officeSchedule)) return

  officeSchedule = updateAttendance(
    officeSchedule,
    day,
    body.user.id,
    AttendanceStatus.Home,
  )

  const emoji = '🏠'
  const message = `<@${body.user.id}> will be working from home on *${day}*`

  await client.chat.postMessage({
    channel: body.user.id,
    text: `${message} ${emoji}`,
  })

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: 'home',
      blocks: generateBlocks(officeSchedule, true),
    } as HomeView,
  })
})

app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: generateBlocks(officeSchedule, true),
      } as HomeView,
    })
  } catch (error) {
    console.error(error)
  }
})

const start = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Joshicely app is running!')
}

start()
