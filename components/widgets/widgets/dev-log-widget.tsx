'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code, Plus, GitBranch, CheckCircle, Clock } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface DevLogEntry {
  id: string
  content: string
  timestamp: string
  tags: string[]
  completed: boolean
}

export function DevLogWidget() {
  const [entries, setEntries] = useState<DevLogEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchDevLogs()
  }, [])

  const fetchDevLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('dev_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching dev logs:', error)
    }
  }

  const addDevLog = async () => {
    if (!newEntry.trim()) return

    try {
      const { error } = await supabase
        .from('dev_logs')
        .insert({
          content: newEntry,
          timestamp: new Date().toISOString(),
          tags: extractTags(newEntry),
          completed: false,
        })

      if (error) throw error

      setNewEntry('')
      setIsAdding(false)
      fetchDevLogs()
    } catch (error) {
      console.error('Error adding dev log:', error)
    }
  }

  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g
    const matches = content.match(tagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  const toggleComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dev_logs')
        .update({ completed: !entries.find(e => e.id === id)?.completed })
        .eq('id', id)

      if (error) throw error
      fetchDevLogs()
    } catch (error) {
      console.error('Error toggling dev log:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold neon-text">Daily Dev Log</h3>
        <Code className="w-5 h-5 text-indigo-400" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {entries.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No dev logs yet</p>
            <p className="text-xs">Start tracking your coding progress</p>
          </div>
        ) : (
          entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${
                entry.completed 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-white/5 border-white/10'
              } transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={`text-sm ${entry.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleComplete(entry.id)}
                  className="ml-2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  {entry.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-400 rounded-full" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(entry.timestamp)}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What did you work on? #feature #bug #learning"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-indigo-500/50"
            rows={3}
          />
          <div className="flex space-x-2">
            <button
              onClick={addDevLog}
              className="flex-1 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors text-white"
            >
              Add Log
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewEntry('')
              }}
              className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="w-full py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors flex items-center justify-center space-x-2 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dev Log</span>
        </motion.button>
      )}
    </motion.div>
  )
}
