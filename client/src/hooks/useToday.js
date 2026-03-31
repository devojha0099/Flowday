import { format } from 'date-fns'

// Returns today's date as "2024-03-24"
export const useToday = () => {
  return format(new Date(), 'yyyy-MM-dd')
}

// Format "08:30" from a Date object
export const formatTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'HH:mm')
}

// Format a date string for display: "Monday, March 24"
export const formatDisplayDate = (dateStr) => {
  return format(new Date(dateStr + 'T00:00:00'), 'EEEE, MMMM d')
}

// Convert "08:30" to minutes since midnight
export const timeToMins = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}


// Get the Monday of the current week as "YYYY-MM-DD"
export const getWeekStart = () => {
  const now = new Date()
  const day = now.getDay()                    // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day      // adjust to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

// Get today as "YYYY-MM-DD"  (already have useToday, this is a plain function version)
export const getTodayStr = () => new Date().toISOString().split('T')[0]

// Format minutes as "4h 30m" or "45m"
export const fmtMins = (mins) => {
  if (!mins) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}