import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchGoals, fetchGoalProgress, createGoalApi, deleteGoalApi } from '../../api/goalApi'

export const loadGoals = createAsyncThunk('goals/load', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchGoals()
    return res.data.goals
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const loadGoalProgress = createAsyncThunk('goals/progress', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchGoalProgress()
    return res.data.progress
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    const res = await createGoalApi(data)
    return res.data.goal
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteGoalApi(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const goalSlice = createSlice({
  name: 'goals',
  initialState: { goals: [], progress: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGoals.fulfilled,        (state, action) => { state.goals = action.payload })
      .addCase(loadGoalProgress.fulfilled, (state, action) => { state.progress = action.payload })
      .addCase(createGoal.fulfilled,       (state, action) => { state.goals.push(action.payload) })
      .addCase(deleteGoal.fulfilled,       (state, action) => {
        state.goals    = state.goals.filter(g => g._id !== action.payload)
        state.progress = state.progress.filter(g => g._id !== action.payload)
      })
      .addMatcher(
        action => action.type.startsWith('goals/') && action.type.endsWith('/pending'),
        state => { state.isLoading = true }
      )
      .addMatcher(
        action => action.type.startsWith('goals/') && !action.type.endsWith('/pending'),
        state => { state.isLoading = false }
      )
  },
})

export default goalSlice.reducer