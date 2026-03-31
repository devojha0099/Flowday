import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import planReducer from '../features/plans/planSlice'
import entryReducer from '../features/entries/entrySlice'
import analyticsReducer from '../features/analytics/analyticsSlice'
import goalReducer from '../features/goals/goalSlice'
import streakReducer from '../features/streaks/streakSlice'
import journalReducer from '../features/journal/journalSlice'
import pomodoroReducer from '../features/pomodoro/pomodoroSlice'
/*import aiReducer from '../features/ai/aiSlice'*/

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: planReducer,
    entries: entryReducer,
    analytics: analyticsReducer,
    goals: goalReducer,
    streaks: streakReducer,
    journal: journalReducer,
    pomodoro: pomodoroReducer,
    /*ai: aiReducer,*/
  },
})