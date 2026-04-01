import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchTodayEntries, createManualEntry, startTimerApi, stopTimerApi, deleteEntryApi } from '../../api/entryApi'

const getLocalDateStr = () => {
  const d = new Date()
  const offsetMs = d.getTimezoneOffset() * 60000
  const localIso = new Date(d.getTime() - offsetMs).toISOString()
  return localIso.split('T')[0]
}

export const loadTodayEntries = createAsyncThunk('entries/loadToday', async (date, { rejectWithValue }) => {
  try {
    const res = await fetchTodayEntries(date)
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
    localStorage.setItem('activeTimer', JSON.stringify({
      id: res.data.entry._id,
      startTime: res.data.entry.actualStart,
      title: res.data.entry.title,
      category: res.data.entry.category,
      date: res.data.entry.date,
    }))
    return res.data.entry
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const stopTimer = createAsyncThunk('entries/stopTimer', async (entryId, { dispatch, rejectWithValue }) => {
  try {
    const res = await stopTimerApi(entryId)
    localStorage.removeItem('activeTimer')
    if (res?.data?.entry?.date) {
      dispatch(loadTodayEntries(res.data.entry.date))
    }
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

const savedTimer = localStorage.getItem('activeTimer')
const parsedTimer = savedTimer ? JSON.parse(savedTimer) : null
const todayLocal = getLocalDateStr()
let restoredTimer = null
if (parsedTimer && parsedTimer.date === todayLocal) {
  restoredTimer = parsedTimer
} else if (parsedTimer && parsedTimer.date !== todayLocal) {
  localStorage.removeItem('activeTimer')
}

const entrySlice = createSlice({
  name: 'entries',
  initialState: {
    todayEntries: [],
    activeTimer: restoredTimer,
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
      .addCase(loadTodayEntries.pending, (state, action) => {
        const requestedDate = action.meta?.arg || todayLocal
        // Clear stale timer if the pending fetch is for a different day
        if (state.activeTimer && state.activeTimer.date && state.activeTimer.date !== requestedDate) {
          state.activeTimer = null
          localStorage.removeItem('activeTimer')
        }
        state.todayEntries = []
      })
      .addCase(loadTodayEntries.fulfilled, (state, action) => {
        const entries = Array.isArray(action.payload) ? action.payload : []
        state.todayEntries = entries
        const requestedDate = action.meta?.arg || todayLocal
        if (state.activeTimer) {
          if (state.activeTimer.date && state.activeTimer.date !== requestedDate) {
            state.activeTimer = null
            localStorage.removeItem('activeTimer')
            return
          }
          const entry = entries.find(e => e._id === state.activeTimer.id)
          if (!entry) {
            // Keep local active timer even if the fetch missed it (timezone / cache / delay)
            state.todayEntries.push({
              _id: state.activeTimer.id,
              title: state.activeTimer.title,
              category: state.activeTimer.category,
              actualStart: state.activeTimer.startTime,
              actualEnd: null,
              actualMins: 0,
              isUnplanned: true,
              driftMinutes: 0,
            })
          } else if (entry.actualEnd) {
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
          date: action.payload.date,
        }
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        const entry = action.payload
        if (entry) {
          const idx = state.todayEntries.findIndex(e => e._id === entry._id)
          if (idx !== -1) state.todayEntries[idx] = entry
          else state.todayEntries.push(entry)
        }
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
