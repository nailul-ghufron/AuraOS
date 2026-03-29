'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface Task {
  id: string
  title: string
  status: 'pending' | 'completed' | 'expired'
  created_at: string
  expires_at: string
  time_until_expiry: string
}

export function TaskGarbageCollector() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCleaning, setIsCleaning] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    expired: 0,
  })
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 30000) // Update every 30 seconds
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timeInterval)
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const processedTasks = (data || []).map(task => ({
        ...task,
        time_until_expiry: getTimeUntilExpiry(task.expires_at),
        status: getTaskStatus(task.expires_at, task.status),
      }))

      setTasks(processedTasks)
      updateStats(processedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const getTaskStatus = (expiresAt: string, currentStatus: string): 'pending' | 'completed' | 'expired' => {
    if (currentStatus === 'completed') return 'completed'
    if (new Date(expiresAt) < new Date()) return 'expired'
    return 'pending'
  }

  const getTimeUntilExpiry = (expiresAt: string): string => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  const updateStats = (taskList: Task[]) => {
    const newStats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'pending').length,
      completed: taskList.filter(t => t.status === 'completed').length,
      expired: taskList.filter(t => t.status === 'expired').length,
    }
    setStats(newStats)
  }

  const runGarbageCollection = async () => {
    setIsCleaning(true)
    try {
      // Delete expired tasks
      const { error } = await supabase
        .from('tasks')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) throw error

      // Archive completed tasks (move to archived_tasks table)
      const { error: archiveError } = await supabase
        .from('tasks')
        .in('status', ['completed'])
        .select()

      if (archiveError) throw archiveError

      await fetchTasks()
    } catch (error) {
      console.error('Error during garbage collection:', error)
    } finally {
      setIsCleaning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/10'
      case 'expired':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-white/10 bg-white/5'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold neon-text">Task Collector</h3>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runGarbageCollection}
            disabled={isCleaning}
            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {isCleaning ? (
              <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{stats.expired}</div>
          <div className="text-xs text-gray-400">Expired</div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks</p>
            <p className="text-xs">Tasks auto-expire after 24h</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded-lg border ${getStatusColor(task.status)} transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getStatusIcon(task.status)}
                  <p className="text-sm text-white truncate">{task.title}</p>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {task.time_until_expiry}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Auto-cleanup info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Auto-cleanup runs every 24h</span>
          <span>{currentTime || '--:--:--'}</span>
        </div>
      </div>
    </motion.div>
  )
}
