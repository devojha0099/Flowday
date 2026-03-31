import { format } from 'date-fns'

export const useToday = () => format(new Date(), 'yyyy-MM-dd')

export const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm')
}

export const formatDisplayDate = (dateStr) => {
  return format(new Date(dateStr + 'T00:00:00'), 'EEEE, MMMM d')
}

export const timeToMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

export const getTodayStr = () => new Date().toISOString().split('T')[0]

export const fmtMins = (mins) => {
  if (!mins) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}