import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchWeeklySummary, fetchHeatmap, fetchMonthlySummary } from '../../api/analyticsApi'

export const loadWeeklyAnalytics = createAsyncThunk(
  'analytics/loadWeekly',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await fetchWeeklySummary(startDate, endDate)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const loadHeatmap = createAsyncThunk('analytics/loadHeatmap', async (year, { rejectWithValue }) => {
  try {
    const res = await fetchHeatmap(year)
    return res.data.heatmap
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const loadMonthlyAnalytics = createAsyncThunk(
  'analytics/loadMonthly',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await fetchMonthlySummary(month, year)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { weekly: null, monthly: null, heatmap: {}, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWeeklyAnalytics.pending,   (state) => { state.isLoading = true })
      .addCase(loadWeeklyAnalytics.fulfilled, (state, action) => { state.isLoading = false; state.weekly = action.payload })
      .addCase(loadWeeklyAnalytics.rejected,  (state, action) => { state.isLoading = false; state.error = action.payload })
      .addCase(loadHeatmap.fulfilled,         (state, action) => { state.heatmap = action.payload })
      .addCase(loadMonthlyAnalytics.fulfilled,(state, action) => { state.monthly = action.payload })
  },
})

export default analyticsSlice.reducer