import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function Timer({ taskId, taskTitle, onTimerStop }) {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [activeSession, setActiveSession] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const intervalRef = useRef(null)
  const activityIntervalRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const idleThreshold = 5 * 60 * 1000 // 5 minutes in milliseconds

  useEffect(() => {
    loadActiveTimer()
    
    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      if (isIdle) {
        setIsIdle(false)
      }
      if (activeSession && !isPaused) {
        api.timer.updateActivity(activeSession.id, token).catch(console.error)
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
    }
  }, [token])

  useEffect(() => {
    // Check for idle state
    if (activeSession && !isPaused) {
      activityIntervalRef.current = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivityRef.current
        if (timeSinceActivity > idleThreshold && !isIdle) {
          setIsIdle(true)
        }
      }, 1000)
    } else {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
    }

    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current)
      }
    }
  }, [activeSession, isPaused, isIdle])

  useEffect(() => {
    if (activeSession && !isPaused && !isIdle) {
      // Calculate elapsed time
      const calculateElapsed = () => {
        if (!activeSession) return 0
        
        const startedAt = new Date(activeSession.resumedAt || activeSession.startedAt).getTime()
        const now = Date.now()
        const sessionElapsed = Math.floor((now - startedAt) / 1000)
        return activeSession.totalSeconds + sessionElapsed
      }

      setElapsedSeconds(calculateElapsed())
      
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed())
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeSession, isPaused, isIdle])

  const loadActiveTimer = async () => {
    try {
      const session = await api.timer.getActive(token)
      if (session && session.task?.id === taskId) {
        setActiveSession(session)
        setIsPaused(session.isPaused)
        setElapsedSeconds(session.totalSeconds || 0)
        setDescription(session.description || '')
        setIsBillable(session.isBillable !== false)
      } else {
        setActiveSession(null)
      }
    } catch (err) {
      // No active timer
      setActiveSession(null)
    }
  }

  const handleStart = async () => {
    try {
      const session = await api.timer.start(token, {
        taskId,
        description,
        isBillable
      })
      setActiveSession(session)
      setIsPaused(false)
      setElapsedSeconds(0)
      lastActivityRef.current = Date.now()
      showSuccess('Timer started!')
    } catch (err) {
      showError(err.message || 'Failed to start timer')
    }
  }

  const handlePause = async () => {
    if (!activeSession) return
    try {
      const updated = await api.timer.pause(activeSession.id, token)
      setActiveSession(updated)
      setIsPaused(true)
      showSuccess('Timer paused')
    } catch (err) {
      showError(err.message || 'Failed to pause timer')
    }
  }

  const handleResume = async () => {
    if (!activeSession) return
    try {
      const updated = await api.timer.resume(activeSession.id, token)
      setActiveSession(updated)
      setIsPaused(false)
      lastActivityRef.current = Date.now()
      showSuccess('Timer resumed')
    } catch (err) {
      showError(err.message || 'Failed to resume timer')
    }
  }

  const handleStop = async () => {
    if (!activeSession) return
    try {
      await api.timer.stop(activeSession.id, token)
      setActiveSession(null)
      setElapsedSeconds(0)
      setIsPaused(false)
      setIsIdle(false)
      showSuccess('Timer stopped and time logged!')
      if (onTimerStop) {
        onTimerStop()
      }
    } catch (err) {
      showError(err.message || 'Failed to stop timer')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!activeSession) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Time Tracker</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded"
            />
            <label htmlFor="billable" className="text-sm text-white/80">Billable time</label>
          </div>
          <button onClick={handleStart} className="btn btn-primary w-full">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Timer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Time Tracker</h3>
          <p className="text-sm text-white/60">{taskTitle || 'Task'}</p>
        </div>
        {isIdle && (
          <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-semibold border border-orange-500/30">
            Idle
          </span>
        )}
      </div>

      <div className="text-center mb-6">
        <div className={`text-5xl font-mono font-bold mb-2 ${
          isIdle ? 'text-orange-400' : isPaused ? 'text-white/60' : 'text-violet-400'
        }`}>
          {formatTime(elapsedSeconds)}
        </div>
        <p className="text-sm text-white/50">
          {isIdle ? 'No activity detected' : isPaused ? 'Paused' : 'Running'}
        </p>
      </div>

      {activeSession.description && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/80">{activeSession.description}</p>
        </div>
      )}

      <div className="flex gap-2">
        {isPaused ? (
          <button onClick={handleResume} className="btn btn-success flex-1">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume
          </button>
        ) : (
          <button onClick={handlePause} className="btn btn-secondary flex-1">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pause
          </button>
        )}
        <button onClick={handleStop} className="btn btn-danger flex-1">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v6H9z" />
          </svg>
          Stop
        </button>
      </div>
    </div>
  )
}

