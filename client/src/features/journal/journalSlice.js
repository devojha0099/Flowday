import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const loadJournal = createAsyncThunk('journal/load', async (date, { rejectWithValue }) => {
  try {
    const res = await api.get(`/journal/${date}`)
    return res.data.journal
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const saveJournal = createAsyncThunk('journal/save', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/journal', data)
    return res.data.journal
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const loadAllJournals = createAsyncThunk('journal/loadAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/journal/all')
    return res.data.journals
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const searchJournals = createAsyncThunk('journal/search', async (q, { rejectWithValue }) => {
  try {
    const res = await api.get(`/journal/search?q=${encodeURIComponent(q)}`)
    return res.data.journals
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const journalSlice = createSlice({
  name: 'journal',
  initialState: {
    current: null,
    all: [],
    searchResults: null,
    isSaving: false,
    isLoading: false,
  },
  reducers: {
    clearSearch: (state) => { state.searchResults = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadJournal.fulfilled, (state, action) => { state.current = action.payload })
      .addCase(saveJournal.pending, (state) => { state.isSaving = true })
      .addCase(saveJournal.fulfilled, (state, action) => {
        state.isSaving = false
        state.current = action.payload
      })
      .addCase(saveJournal.rejected, (state) => { state.isSaving = false })
      .addCase(loadAllJournals.fulfilled, (state, action) => { state.all = action.payload })
      .addCase(searchJournals.fulfilled, (state, action) => { state.searchResults = action.payload })
  },
})

export const { clearSearch } = journalSlice.actions
export default journalSlice.reducer