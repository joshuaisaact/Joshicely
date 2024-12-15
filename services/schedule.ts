import type { WeekSchedule } from '../types/schedule'
import { AttendanceStatus } from '../constants'
// Create a schedule
export const createSchedule = (): WeekSchedule => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const today = new Date()

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

// Update attendance in a schedule
export const updateAttendance = (
  schedule: WeekSchedule,
  day: string,
  userId: string,
  status: AttendanceStatus,
): WeekSchedule => {
  if (!day || !(day in schedule)) return schedule

  const user = `<@${userId}>`
  const updatedSchedule = { ...schedule }

  if (status === AttendanceStatus.Office) {
    if (!updatedSchedule[day].attendees.includes(user)) {
      updatedSchedule[day] = {
        ...updatedSchedule[day],
        attendees: [...updatedSchedule[day].attendees, user],
      }
    }
  } else {
    updatedSchedule[day] = {
      ...updatedSchedule[day],
      attendees: updatedSchedule[day].attendees.filter((a) => a !== user),
    }
  }

  return updatedSchedule
}

// Get attendance for a specific day
export const getDayAttendance = (
  schedule: WeekSchedule,
  day: string,
): string[] => {
  return schedule[day]?.attendees || []
}

// Check if someone is attending on a day
export const isAttending = (
  schedule: WeekSchedule,
  day: string,
  userId: string,
): boolean => {
  const user = `<@${userId}>`
  return schedule[day]?.attendees.includes(user) || false
}
