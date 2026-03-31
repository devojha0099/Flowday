import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const loadDailyQuote = createAsyncThunk('ai/quote', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/ai/quote')
    return res.data.quote
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const loadCoachSuggestions = createAsyncThunk('ai/coach', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/ai/coach')
    return res.data.suggestions
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    quote: '',
    suggestions: [],
    quoteLoading: false,
    coachLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDailyQuote.pending, (state) => { state.quoteLoading = true })
      .addCase(loadDailyQuote.fulfilled, (state, action) => {
        state.quoteLoading = false
        state.quote = action.payload
      })
      .addCase(loadDailyQuote.rejected, (state) => { state.quoteLoading = false })
      .addCase(loadCoachSuggestions.pending, (state) => { state.coachLoading = true })
      .addCase(loadCoachSuggestions.fulfilled, (state, action) => {
        state.coachLoading = false
        state.suggestions = action.payload
      })
      .addCase(loadCoachSuggestions.rejected, (state) => { state.coachLoading = false })
  },
})

export default aiSlice.reducer