import api from './axios'

export const fetchPlanByDate = (date) => api.get(`/plans/${date}`)
export const fetchWeekPlans = (startDate, endDate) =>
  api.get(`/plans/week?startDate=${startDate}&endDate=${endDate}`)
export const addBlockApi = (data) => api.post('/plans/block', data)
export const updateBlockApi = (planId, blockId, data) =>
  api.put(`/plans/${planId}/block/${blockId}`, data)
export const deleteBlockApi = (planId, blockId) =>
  api.delete(`/plans/${planId}/block/${blockId}`)