import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt'
import type { HomeView } from '../types/slack'
import { generateBlocks } from '../blocks/home'
import type { WeekSchedule } from '../types/schedule'

export const appHomeOpenedHandler = async (
  {
    event,
    client,
  }: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_home_opened'>,
  schedule: WeekSchedule,
) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: generateBlocks(schedule, true),
      } as HomeView,
    })
  } catch (error) {
    console.error(error)
  }
}
