import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchTodayEntries,
  createManualEntry,
  startTimerApi,
  stopTimerApi,
  deleteEntryApi,
} from '../../api/entryApi'

export const loadTodayEntries = createAsyncThunk('entries/loadToday', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchTodayEntries()
    return res.data.entries
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const addManualEntry = createAsyncThunk('entries/addManual', async (data, { rejectWithValue }) => {
  try {
    const res = await createManualEntry(data)
    return res.data.entry
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const startTimer = createAsyncThunk('entries/startTimer', async (data, { rejectWithValue }) => {
  try {
    const res = await startTimerApi(data)
    // Save to localStorage so timer survives refresh
    localStorage.setItem('activeTimer', JSON.stringify({
      id: res.data.entry._id,
      startTime: res.data.entry.actualStart,
      title: res.data.entry.title,
      category: res.data.entry.category,
    }))
    return res.data.entry
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const stopTimer = createAsyncThunk('entries/stopTimer', async (entryId, { rejectWithValue }) => {
  try {
    const res = await stopTimerApi(entryId)
    localStorage.removeItem('activeTimer')
    return res.data.entry
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteEntry = createAsyncThunk('entries/delete', async (entryId, { rejectWithValue }) => {
  try {
    await deleteEntryApi(entryId)
    return entryId
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// Read localStorage on slice init — restore active timer if exists
const savedTimer = localStorage.getItem('activeTimer')
const restoredTimer = savedTimer ? JSON.parse(savedTimer) : null

const entrySlice = createSlice({
  name: 'entries',
  initialState: {
    todayEntries: [],
    activeTimer: restoredTimer,  // { id, startTime, title, category }
    isLoading: false,
    error: null,
  },
  reducers: {
    clearActiveTimer: (state) => {
      state.activeTimer = null
      localStorage.removeItem('activeTimer')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTodayEntries.fulfilled, (state, action) => {
        state.todayEntries = action.payload
        // Sync activeTimer — if the running entry is already stopped in DB, clear it
        if (state.activeTimer) {
          const stillRunning = action.payload.find(
            e => e._id === state.activeTimer.id && !e.actualEnd
          )
          if (!stillRunning) {
            state.activeTimer = null
            localStorage.removeItem('activeTimer')
          }
        }
      })
      .addCase(addManualEntry.fulfilled, (state, action) => {
        state.todayEntries.push(action.payload)
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.todayEntries.push(action.payload)
        state.activeTimer = {
          id: action.payload._id,
          startTime: action.payload.actualStart,
          title: action.payload.title,
          category: action.payload.category,
        }
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        // Replace the running entry with the completed one
        const idx = state.todayEntries.findIndex(e => e._id === action.payload._id)
        if (idx !== -1) state.todayEntries[idx] = action.payload
        state.activeTimer = null
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.todayEntries = state.todayEntries.filter(e => e._id !== action.payload)
      })
      .addMatcher(
        action => action.type.startsWith('entries/') && action.type.endsWith('/pending'),
        (state) => { state.isLoading = true }
      )
      .addMatcher(
        action => action.type.startsWith('entries/') && action.type.endsWith('/fulfilled'),
        (state) => { state.isLoading = false }
      )
      .addMatcher(
        action => action.type.startsWith('entries/') && action.type.endsWith('/rejected'),
        (state, action) => { state.isLoading = false; state.error = action.payload }
      )
  },
})

export const { clearActiveTimer } = entrySlice.actions
export default entrySlice.reducer