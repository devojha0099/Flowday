import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchWeeklySummary,
  fetchHeatmap,
  fetchMonthlySummary,
} from "../../api/analyticsApi";

export const loadWeeklyAnalytics = createAsyncThunk(
  "analytics/loadWeekly",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await fetchWeeklySummary(startDate, endDate);
      // Backend returns: { success: true, days: [...], categories: [...] }
      return {
        days: res.data.days || [],
        categories: res.data.categories || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const loadHeatmap = createAsyncThunk(
  "analytics/loadHeatmap",
  async (year, { rejectWithValue }) => {
    try {
      const res = await fetchHeatmap(year);
      return res.data.heatmap;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const loadMonthlyAnalytics = createAsyncThunk(
  "analytics/loadMonthly",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await fetchMonthlySummary(month, year);
      // Backend returns: { success: true, scores: [...], categories: [...], avgScore, totalDays, bestDay }
      return {
        scores: res.data.scores || [],
        categories: res.data.categories || [],
        avgScore: res.data.avgScore || 0,
        totalDays: res.data.totalDays || 0,
        totalActualMins: res.data.totalActualMins || 0,
        totalPlannedMins: res.data.totalPlannedMins || 0,
        bestDay: res.data.bestDay || null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    weekly: { days: [], categories: [] }, // Provide defaults
    monthly: { scores: [], categories: [] }, // Provide defaults
    heatmap: {},
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWeeklyAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadWeeklyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend now returns { days: [...], categories: [...] }
        state.weekly = {
          days: action.payload.days || [],
          categories: action.payload.categories || [],
        };
      })
      .addCase(loadWeeklyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loadHeatmap.fulfilled, (state, action) => {
        state.heatmap = action.payload || {};
      })
      .addCase(loadMonthlyAnalytics.fulfilled, (state, action) => {
        state.monthly = {
          scores: action.payload.scores || [],
          categories: action.payload.categories || [],
          avgScore: action.payload.avgScore || 0,
          totalDays: action.payload.totalDays || 0,
          totalActualMins: action.payload.totalActualMins || 0,
          totalPlannedMins: action.payload.totalPlannedMins || 0,
          bestDay: action.payload.bestDay || null,
        };
      });
  },
});

export default analyticsSlice.reducer;
