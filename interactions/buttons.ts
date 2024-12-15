// src/interactions/buttons.ts
import type { AllMiddlewareArgs, BlockActionMiddlewareArgs } from '@slack/bolt'
import type { HomeView } from '../types/slack'
import type { WeekSchedule } from '../types/schedule'
import { AttendanceStatus } from '../constants'
import { generateBlocks } from '../blocks/home'
import { updateAttendance } from '../services/schedule'

// Helper function to parse day from action_id
const parseDayFromAction = (action_id: string): string | null => {
  const day = action_id
    .split('_')[1]
    ?.charAt(0)
    .toUpperCase()
    .concat(action_id.split('_')[1]?.slice(1) ?? '')
  return day || null
}

export const officeButtonHandler = async (
  { action, ack, body, client }: AllMiddlewareArgs & BlockActionMiddlewareArgs,
  schedule: WeekSchedule,
): Promise<WeekSchedule | undefined> => {
  await ack()
  const day = parseDayFromAction(action.action_id)

  if (!day || !(day in schedule)) return

  const updatedSchedule = updateAttendance(
    schedule,
    day,
    body.user.id,
    AttendanceStatus.Office,
  )

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: 'home',
      blocks: generateBlocks(updatedSchedule, true),
    } as HomeView,
  })

  return updatedSchedule
}

export const homeButtonHandler = async (
  { action, ack, body, client }: AllMiddlewareArgs & BlockActionMiddlewareArgs,
  schedule: WeekSchedule,
): Promise<WeekSchedule | undefined> => {
  await ack()
  const day = parseDayFromAction(action.action_id)

  if (!day || !(day in schedule)) return

  const updatedSchedule = updateAttendance(
    schedule,
    day,
    body.user.id,
    AttendanceStatus.Home,
  )

  await client.views.publish({
    user_id: body.user.id,
    view: {
      type: 'home',
      blocks: generateBlocks(updatedSchedule, true),
    } as HomeView,
  })

  return updatedSchedule
}
