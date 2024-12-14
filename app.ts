import { App, type BlockAction, type ButtonAction } from '@slack/bolt'
import type { Block, KnownBlock } from '@slack/types'
import type { HomeView } from '@slack/bolt'
import { getDateSuffix } from './utils/dates'

interface DaySchedule {
  attendees: string[]
  date: number
}

interface WeekSchedule {
  [key: string]: DaySchedule
}

enum AttendanceStatus {
  Office = 'office',
  Home = 'home',
}

const getCurrentWeekDates = (): WeekSchedule => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const today = new Date()

  // If it's weekend, show next week
  const isWeekend = today.getDay() === 0 || today.getDay() === 6
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + (isWeekend ? 8 : 1))

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

const generateBlocks = (isHomeView: boolean): (KnownBlock | Block)[] => {
  const blocks: (KnownBlock | Block)[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: isHomeView
          ? '📅 Office Schedule'
          : ":coffee: *Here's who's in the office this week*",
        emoji: true,
      },
    },
    isHomeView && {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "*Here's who's in the office this week:*",
      },
    },
    isHomeView && {
      type: 'divider',
    },
  ].filter(Boolean) as (KnownBlock | Block)[]

  Object.entries(officeSchedule).forEach(([day, { attendees, date }]) => {
    const shortDay = isHomeView ? day.slice(0, 3) : day
    const dayText = `*${shortDay}${isHomeView ? ` ${date}${getDateSuffix(date)}` : ''}*\n${
      attendees.length ? attendees.join(' ') : 'No one yet!'
    }`

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

  if (isHomeView) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '🔄 Schedule updates automatically each week',
        },
      ],
    })
  }

  return blocks
}

const handleAttendanceChange = async (
  day: string,
  userId: string,
  status: AttendanceStatus,
  client: any,
): Promise<void> => {
  if (!day || !(day in officeSchedule)) return

  const user = `<@${userId}>`

  if (status === AttendanceStatus.Office) {
    if (!officeSchedule[day].attendees.includes(user)) {
      officeSchedule[day].attendees.push(user)
    }
  } else {
    officeSchedule[day].attendees = officeSchedule[day].attendees.filter(
      (a) => a !== user,
    )
  }

  const emoji = status === AttendanceStatus.Office ? '🏢' : '🏠'
  const message =
    status === AttendanceStatus.Office
      ? `${user} will be in the office on *${day}*!`
      : `${user} will be working from home on *${day}*`

  await client.chat.postMessage({
    channel: userId,
    text: `${message} ${emoji}`,
  })

  try {
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: generateBlocks(true),
      } as HomeView,
    })
  } catch (error) {
    console.error('Error updating home view:', error)
  }
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
  await say({
    blocks: generateBlocks(false),
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

  await handleAttendanceChange(
    day,
    body.user.id,
    AttendanceStatus.Office,
    client,
  )
})

app.action<BlockAction>(/home_.*/, async ({ action, ack, body, client }) => {
  await ack()
  const day = action.action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action.action_id.split('_')[1]?.slice(1) ?? '')

  await handleAttendanceChange(day, body.user.id, AttendanceStatus.Home, client)
})

app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: generateBlocks(true),
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
