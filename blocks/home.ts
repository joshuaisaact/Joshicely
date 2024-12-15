import type { Block, KnownBlock } from '@slack/types'
import type { WeekSchedule } from '../types/schedule'
import { getDateSuffix } from '../utils/dates'

export const generateBlocks = (
  schedule: WeekSchedule,
  isHomeView: boolean,
): (KnownBlock | Block)[] => {
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

  Object.entries(schedule).forEach(([day, { attendees, date }]) => {
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
