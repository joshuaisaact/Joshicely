export const getDateSuffix = (date: number): string => {
  if (date >= 11 && date <= 13) return 'th'
  const suffix = ['st', 'nd', 'rd'][(date % 10) - 1]
  return suffix || 'th'
}
