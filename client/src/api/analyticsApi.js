import api from './axios'

export const fetchWeeklySummary = (startDate, endDate) =>
  api.get(`/analytics/week?startDate=${startDate}&endDate=${endDate}`)

export const fetchHeatmap = (year) =>
  api.get(`/analytics/heatmap?year=${year}`)

export const fetchMonthlySummary = (month, year) =>
  api.get(`/analytics/month?month=${month}&year=${year}`)