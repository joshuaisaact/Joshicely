import type { AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt'
import type { WeekSchedule } from '../types/schedule'
import { generateBlocks } from '../blocks/home'

export const officeCommandHandler = async (
  { ack, say }: AllMiddlewareArgs & SlackCommandMiddlewareArgs,
  schedule: WeekSchedule,
) => {
  await ack()
  await say({
    blocks: generateBlocks(schedule, false),
    text: "Here's who's in the office this week",
  })
}
