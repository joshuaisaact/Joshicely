import { App, type BlockAction, type ButtonAction } from '@slack/bolt'
import type { Block, KnownBlock } from '@slack/types'

interface DaySchedule {
  attendees: string[]
  date: number
}

interface WeekSchedule {
  [key: string]: DaySchedule
}

const getCurrentWeekDates = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(monday.getDate() - monday.getDay() + 1)

  return days.reduce((acc, day, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    acc[day] = {
      attendees: [],
      date: date.getDate(),
    }
    return acc
  }, {} as WeekSchedule)
}

const officeSchedule = getCurrentWeekDates()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
})

app.command('/office', async ({ command, ack, say }) => {
  await ack()

  const blocks: (KnownBlock | Block)[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ":coffee: *Here's who's in the office this week*",
      },
    },
  ]

  Object.entries(officeSchedule).forEach(([day, { attendees }]) => {
    const dayText = `*${day}*\n${attendees.length ? attendees.join(' ') : 'No one yet!'}`

    blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: dayText,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏢 Office',
            emoji: true,
          },
          style: 'primary',
          action_id: `office_${day.toLowerCase()}`,
          value: day.toLowerCase(),
        },
      } as KnownBlock,
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' ',
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🏠 Home',
            emoji: true,
          },
          action_id: `home_${day.toLowerCase()}`,
          value: day.toLowerCase(),
        },
      } as KnownBlock,
      {
        type: 'divider',
      },
    )
  })

  await say({
    blocks,
    text: "Here's who's in the office this week",
  })
})

app.action<BlockAction>(/office_.*/, async ({ action, ack, body, say }) => {
  await ack()

  const day = action.action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action.action_id.split('_')[1]?.slice(1) ?? '')

  if (!day || !(day in officeSchedule)) return

  const user = `<@${body.user.id}>`

  if (!officeSchedule[day].attendees.includes(user)) {
    officeSchedule[day].attendees.push(user)
    await say(`${user} will be in the office on *${day}*! 🏢`)
  }
})

app.action<BlockAction>(/home_.*/, async ({ action, ack, body, say }) => {
  await ack()

  const day = action.action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action.action_id.split('_')[1]?.slice(1) ?? '')

  if (!day || !(day in officeSchedule)) return

  const user = `<@${body.user.id}>`

  officeSchedule[day].attendees = officeSchedule[day].attendees.filter(
    (a) => a !== user,
  )
  await say(`${user} will be working from home on *${day}* 🏠`)
})

const start = async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Joshicely app is running!')
}

start()
