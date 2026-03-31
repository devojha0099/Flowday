import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const loadStreaks = createAsyncThunk('streaks/load', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/streaks')
    return res.data.streaks
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const streakSlice = createSlice({
  name: 'streaks',
  initialState: { streaks: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadStreaks.pending, (state) => { state.isLoading = true })
      .addCase(loadStreaks.fulfilled, (state, action) => {
        state.isLoading = false
        state.streaks = action.payload
      })
      .addCase(loadStreaks.rejected, (state) => { state.isLoading = false })
  },
})

export default streakSlice.reducer