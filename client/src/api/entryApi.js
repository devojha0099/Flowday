import api from './axios'

export const fetchTodayEntries = () => api.get('/entries/today')
export const fetchEntriesByDate = (date) => api.get(`/entries/${date}`)
export const createManualEntry = (data) => api.post('/entries', data)
export const startTimerApi = (data) => api.post('/entries/timer/start', data)
export const stopTimerApi = (id) => api.patch(`/entries/timer/${id}/stop`)
export const deleteEntryApi = (id) => api.delete(`/entries/${id}`)