import api from './axios'

export const fetchTodayEntries = (date) => api.get('/entries/today', { params: date ? { date } : {} })
export const fetchEntriesByDate = (date) => api.get(`/entries/${date}`)
export const createManualEntry = (data) => api.post('/entries', data)
export const startTimerApi = (data) => api.post('/entries/timer/start', data)
export const stopTimerApi = (id) => api.patch(`/entries/timer/${id}/stop`)
export const deleteEntryApi = (id) => api.delete(`/entries/${id}`)
