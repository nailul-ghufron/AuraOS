'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react'

export function FocusModeWidget() {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work')

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      // Session completed
      setIsRunning(false)
      // Switch session type
      if (sessionType === 'work') {
        setSessionType('break')
        setTime(5 * 60) // 5 minute break
      } else {
        setSessionType('work')
        setTime(25 * 60) // 25 minute work session
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time, sessionType])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setTime(sessionType === 'work' ? 25 * 60 : 5 * 60)
  }

  const toggleSessionType = () => {
    setIsRunning(false)
    setSessionType(sessionType === 'work' ? 'break' : 'work')
    setTime(sessionType === 'work' ? 5 * 60 : 25 * 60)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card h-full flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold neon-text">Focus Mode</h3>
        <Coffee className="w-5 h-5 text-indigo-400" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="text-7xl lg:text-8xl font-extrabold tracking-tighter neon-text mb-8 drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]"
        >
          {formatTime(time)}
        </motion.div>

        <div className="flex items-center space-x-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sessionType === 'work' 
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}>
            {sessionType === 'work' ? 'Work Session' : 'Break Time'}
          </span>
        </div>

        <div className="flex space-x-3">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors"
            >
              <Play className="w-5 h-5 text-indigo-400" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              <Pause className="w-5 h-5 text-orange-400" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-3 bg-gray-500/20 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={toggleSessionType}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Switch to {sessionType === 'work' ? 'Break' : 'Work'}
        </button>
      </div>
    </motion.div>
  )
}
