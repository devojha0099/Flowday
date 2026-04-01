import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

// LOAD SINGLE
export const loadJournal = createAsyncThunk(
  'journal/load',
  async (date, { rejectWithValue }) => {
    try {
      const res = await api.get(`/journal/${date}`)
      return res.data.journal
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// SAVE
export const saveJournal = createAsyncThunk(
  'journal/save',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/journal', data)
      return res.data.journal
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// LOAD ALL
export const loadAllJournals = createAsyncThunk(
  'journal/loadAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/journal/all')
      return res.data.journals
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// SEARCH
export const searchJournals = createAsyncThunk(
  'journal/search',
  async (q, { rejectWithValue }) => {
    try {
      const res = await api.get(`/journal/search?q=${encodeURIComponent(q)}`)
      return res.data.journals
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// DELETE (FIXED)
export const deleteJournal = createAsyncThunk(
  'journal/delete',
  async (date, { rejectWithValue }) => {
    try {
      await api.delete(`/journal/${encodeURIComponent(date)}`)
      return date
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete journal'
      )
    }
  }
)

const journalSlice = createSlice({
  name: 'journal',
  initialState: {
    current: null,
    all: [],
    searchResults: null,
    isSaving: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = null
    },
  },
  extraReducers: (builder) => {
    builder
      // LOAD SINGLE
      .addCase(loadJournal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadJournal.fulfilled, (state, action) => {
        state.isLoading = false
        state.current = action.payload
      })
      .addCase(loadJournal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // SAVE
      .addCase(saveJournal.pending, (state) => {
        state.isSaving = true
      })
      .addCase(saveJournal.fulfilled, (state, action) => {
        state.isSaving = false
        state.current = action.payload
      })
      .addCase(saveJournal.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })

      // LOAD ALL
      .addCase(loadAllJournals.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadAllJournals.fulfilled, (state, action) => {
        state.isLoading = false
        state.all = action.payload
      })
      .addCase(loadAllJournals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // SEARCH
      .addCase(searchJournals.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })

      // DELETE (FIXED)
      .addCase(deleteJournal.fulfilled, (state, action) => {
        const date = action.payload

        state.all = state.all.filter(j => j.date !== date)

        if (state.searchResults) {
          state.searchResults = state.searchResults.filter(
            j => j.date !== date
          )
        }

        if (state.current?.date === date) {
          state.current = null
        }
      })

      .addCase(deleteJournal.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearSearch } = journalSlice.actions
export default journalSlice.reducer