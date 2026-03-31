import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchPlanByDate, addBlockApi, deleteBlockApi, fetchWeekPlans } from '../../api/planApi'

// Fetch today's or any date's plan
export const loadPlan = createAsyncThunk('plans/loadPlan', async (date, { rejectWithValue }) => {
  try {
    const res = await fetchPlanByDate(date)
    return res.data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// Add a block to today's plan
export const addBlock = createAsyncThunk('plans/addBlock', async (blockData, { rejectWithValue }) => {
  try {
    const res = await addBlockApi(blockData)
    return res.data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// Delete a block
export const deleteBlock = createAsyncThunk('plans/deleteBlock', async ({ planId, blockId }, { rejectWithValue }) => {
  try {
    const res = await deleteBlockApi(planId, blockId)
    return res.data.plan
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// Load the whole week (used later in analytics)
export const loadWeekPlans = createAsyncThunk('plans/loadWeekPlans', async ({ startDate, endDate }, { rejectWithValue }) => {
  try {
    const res = await fetchWeekPlans(startDate, endDate)
    return res.data.plans
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const planSlice = createSlice({
  name: 'plans',
  initialState: {
    todayPlan: null,      // the current day's full plan object
    weekPlans: [],        // array of plans for the week
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPlan.pending, (state) => { state.isLoading = true })
      .addCase(loadPlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.todayPlan = action.payload
      })
      .addCase(loadPlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(addBlock.fulfilled, (state, action) => {
        state.todayPlan = action.payload   // server returns the updated plan
      })
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.todayPlan = action.payload
      })
      .addCase(loadWeekPlans.fulfilled, (state, action) => {
        state.weekPlans = action.payload
      })
  },
})

export default planSlice.reducer