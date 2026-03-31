import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const startPomodoroSession = createAsyncThunk('pomodoro/start', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/pomodoro/start', data)
    return res.data.session
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const completeCycle = createAsyncThunk('pomodoro/complete', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/pomodoro/${id}/complete`)
    return res.data.session
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const loadTodayPomodoros = createAsyncThunk('pomodoro/today', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/pomodoro/today')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState: {
    activeSession: null,
    todayStats: { sessions: [], totalCycles: 0, totalMins: 0 },
    isLoading: false,
  },
  reducers: {
    clearSession: (state) => { state.activeSession = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPomodoroSession.fulfilled, (state, action) => {
        state.activeSession = action.payload
      })
      .addCase(completeCycle.fulfilled, (state, action) => {
        state.activeSession = action.payload
      })
      .addCase(loadTodayPomodoros.fulfilled, (state, action) => {
        state.todayStats = action.payload
      })
  },
})

export const { clearSession } = pomodoroSlice.actions
export default pomodoroSlice.reducer