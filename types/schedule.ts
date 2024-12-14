export interface DaySchedule {
  attendees: string[]
  date: number
}

export interface WeekSchedule {
  [key: string]: DaySchedule
}

export enum AttendanceStatus {
  Office = 'office',
  Home = 'home',
}
