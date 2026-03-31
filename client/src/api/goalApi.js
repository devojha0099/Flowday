import api from './axios'

export const fetchGoals = () => api.get('/goals')
export const fetchGoalProgress = () => api.get('/goals/progress')
export const createGoalApi = (data) => api.post('/goals', data)
export const updateGoalApi = (id, data) => api.put(`/goals/${id}`, data)
export const deleteGoalApi = (id) => api.delete(`/goals/${id}`)