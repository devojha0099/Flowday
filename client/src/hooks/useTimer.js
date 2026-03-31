import { useState, useEffect, useRef } from 'react'

export const useTimer = (startTime) => {
  const [elapsed, setElapsed] = useState('00:00:00')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!startTime) { setElapsed('00:00:00'); return }

    const tick = () => {
      const diffMs = Date.now() - new Date(startTime).getTime()
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours   = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      setElapsed(
        `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
      )
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current)
  }, [startTime])

  return elapsed
}