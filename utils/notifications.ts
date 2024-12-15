import type { WebClient } from '@slack/web-api'

export const sendStatusReminder = async (
  client: WebClient,
  userId: string,
  tomorrow: Date,
) => {
  await client.chat.postMessage({
    channel: userId,
    text: '👋 Quick reminder!',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Are you planning to be in the office tomorrow (${format(tomorrow, 'EEEE')})?`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: "🏢 Yes, I'll be in",
              emoji: true,
            },
            value: 'tomorrow_office',
            action_id: 'tomorrow_office',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🏠 No, WFH',
              emoji: true,
            },
            value: 'tomorrow_home',
            action_id: 'tomorrow_home',
          },
        ],
      },
    ],
  })
}
