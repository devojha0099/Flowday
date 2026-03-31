import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { startPomodoroSession, completeCycle, loadTodayPomodoros, clearSession } from '../features/pomodoro/pomodoroSlice'
import Layout from '../components/layout/Layout'

const MODES = { WORK: 'work', BREAK: 'break' }

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const Pomodoro = () => {
  const dispatch = useDispatch()
  const { activeSession, todayStats } = useSelector(state => state.pomodoro)

  const [workMins, setWorkMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const [mode, setMode] = useState(MODES.WORK)
  const [secondsLeft, setSecondsLeft] = useState(workMins * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [cyclesLocal, setCyclesLocal] = useState(0)
  const [label, setLabel] = useState('Focus session')
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    dispatch(loadTodayPomodoros())
  }, [dispatch])

  // Reset timer when workMins changes (and not running)
  useEffect(() => {
    if (!isRunning) setSecondsLeft(workMins * 60)
  }, [workMins, isRunning])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            handleTimerEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode])

  const handleTimerEnd = () => {
    // Play a soft beep using Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.8)
    } catch (_) {}

    if (mode === MODES.WORK) {
      // Work session done — complete a cycle
      const newCycles = cyclesLocal + 1
      setCyclesLocal(newCycles)
      if (activeSession) {
        dispatch(completeCycle(activeSession._id)).then(() => {
          dispatch(loadTodayPomodoros())
        })
      }
      setMode(MODES.BREAK)
      setSecondsLeft(breakMins * 60)
      setIsRunning(true)
    } else {
      // Break done — back to work
      setMode(MODES.WORK)
      setSecondsLeft(workMins * 60)
      setIsRunning(false)
    }
  }

  const handleStart = () => {
    if (!activeSession) {
      dispatch(startPomodoroSession({ workMins, breakMins, targetCycles: 4 }))
    }
    setIsRunning(true)
  }

  const handlePause = () => setIsRunning(false)

  const handleReset = () => {
    setIsRunning(false)
    setMode(MODES.WORK)
    setSecondsLeft(workMins * 60)
    setCyclesLocal(0)
    dispatch(clearSession())
  }

  const progress = mode === MODES.WORK
    ? ((workMins * 60 - secondsLeft) / (workMins * 60)) * 100
    : ((breakMins * 60 - secondsLeft) / (breakMins * 60)) * 100

  const circumference = 2 * Math.PI * 90
  const strokeOffset = circumference * (1 - progress / 100)

  const isWork = mode === MODES.WORK
  const accentColor = isWork ? '#6366f1' : '#14b8a6'

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pomodoro</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Focus in intervals, rest between them
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Timer */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center">
          {/* Mode badge */}
          <div className={`mb-6 px-4 py-1 rounded-full text-sm font-semibold ${
            isWork
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-teal-50 text-teal-600'
          }`}>
            {isWork ? 'Focus time' : 'Break time'}
          </div>

          {/* Circular progress ring */}
          <div className="relative mb-6">
            <svg width="210" height="210" viewBox="0 0 210 210">
              {/* Track */}
              <circle
                cx="105" cy="105" r="90"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              {/* Progress */}
              <circle
                cx="105" cy="105" r="90"
                fill="none"
                stroke={accentColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 105 105)"
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono text-slate-800 tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs text-slate-400 mt-1 font-medium">
                {isWork ? `Cycle ${cyclesLocal + 1}` : 'Rest'}
              </span>
            </div>
          </div>

          {/* Label input */}
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="What are you focusing on?"
            disabled={isRunning}
            className="w-full max-w-xs text-center text-sm border border-slate-200 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
          />

          {/* Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                {cyclesLocal > 0 ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-8 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Cycles completed */}
          {cyclesLocal > 0 && (
            <div className="mt-6 flex gap-2">
              {Array.from({ length: cyclesLocal }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              ))}
              {Array.from({ length: Math.max(0, 4 - cyclesLocal) }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-slate-200" />
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Timer settings</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-slate-500">Focus duration</label>
                  <span className="text-xs font-semibold text-slate-700">{workMins} min</span>
                </div>
                <input
                  type="range"
                  min="5" max="60" step="5"
                  value={workMins}
                  onChange={e => setWorkMins(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-slate-500">Break duration</label>
                  <span className="text-xs font-semibold text-slate-700">{breakMins} min</span>
                </div>
                <input
                  type="range"
                  min="1" max="30" step="1"
                  value={breakMins}
                  onChange={e => setBreakMins(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Today's stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Today</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cycles done', value: todayStats.totalCycles + cyclesLocal },
                { label: 'Focus time', value: `${todayStats.totalMins + cyclesLocal * workMins}m` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-slate-800">{value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Tips</h2>
            <ul className="space-y-1.5 text-xs text-indigo-600">
              <li>Work for {workMins} min without distractions</li>
              <li>Take a real {breakMins} min break — step away</li>
              <li>After 4 cycles, take a longer 15–30 min break</li>
              <li>Link your session to a planned block for drift tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Pomodoro