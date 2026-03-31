import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser, getMe } from '../../api/authApi'
import api from '../../api/axios'

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await registerUser(userData)
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const res = await loginUser(userData)
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutUser()
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await getMe()
    return res.data.user
  } catch (err) {
    return rejectWithValue(null)
  }
})

export const updateSettings = createAsyncThunk('auth/updateSettings', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/settings', data)
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const initialState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(register.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload })
      .addCase(register.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload })
      .addCase(logout.fulfilled, (state) => { state.user = null })
      .addCase(fetchMe.pending, (state) => { state.isInitialized = false })
      .addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; state.isInitialized = true })
      .addCase(fetchMe.rejected, (state) => { state.user = null; state.isInitialized = true })
      .addCase(updateSettings.fulfilled, (state, action) => { state.user = action.payload })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer