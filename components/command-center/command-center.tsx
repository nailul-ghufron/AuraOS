'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command } from 'cmdk'
import { Search, Plus, Calendar, Coffee, Cloud, BookOpen, Trash2 } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface CommandItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

export function CommandCenter() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { supabase } = useSupabase()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const createTask = useCallback(async (taskText: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskText,
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })

      if (error) throw error
      setOpen(false)
      setSearch('')
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }, [supabase])

  const parseNaturalLanguage = useCallback((input: string) => {
    const lowerInput = input.toLowerCase()
    
    // Task creation patterns
    if (lowerInput.includes('task') || lowerInput.includes('todo') || lowerInput.includes('create')) {
      const taskMatch = input.match(/(?:task|todo|create)\s+(.+)/i)
      if (taskMatch) {
        createTask(taskMatch[1])
        return
      }
    }

    // Summary request
    if (lowerInput.includes('summary') || lowerInput.includes('day') || lowerInput.includes('overview')) {
      // TODO: Implement day summary logic
      console.log('Generate day summary')
      return
    }

    // Focus mode
    if (lowerInput.includes('focus') || lowerInput.includes('pomodoro')) {
      // TODO: Start focus mode
      console.log('Start focus mode')
      return
    }

    // Default: create as task
    createTask(input)
  }, [createTask])

  const commandItems: CommandItem[] = [
    {
      id: 'create-task',
      title: 'Create Task',
      description: 'Add a new task to your list',
      icon: <Plus className="w-4 h-4" />,
      action: () => createTask('New Task'),
    },
    {
      id: 'schedule-event',
      title: 'Schedule Event',
      description: 'Add an event to your calendar',
      icon: <Calendar className="w-4 h-4" />,
      action: () => console.log('Schedule event'),
    },
    {
      id: 'start-focus',
      title: 'Start Focus Mode',
      description: 'Begin a Pomodoro session',
      icon: <Coffee className="w-4 h-4" />,
      action: () => console.log('Start focus mode'),
    },
    {
      id: 'weather',
      title: 'Check Weather',
      description: 'View current weather',
      icon: <Cloud className="w-4 h-4" />,
      action: () => console.log('Check weather'),
    },
    {
      id: 'arabic-helper',
      title: 'Arabic Grammar Helper',
      description: 'Open Qawaid AI analysis',
      icon: <BookOpen className="w-4 h-4" />,
      action: () => console.log('Open Arabic helper'),
    },
    {
      id: 'cleanup',
      title: 'Cleanup Tasks',
      description: 'Manually trigger task cleanup',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => console.log('Cleanup tasks'),
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card">
              <Command className="rounded-lg">
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <Command.Input
                    placeholder="Type a command or ask anything... (vibe-check mode)"
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && search.trim()) {
                        parseNaturalLanguage(search)
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                  />
                </div>
                
                <Command.List className="max-h-96 overflow-y-auto p-4">
                  <Command.Empty className="text-gray-400 text-center py-8">
                    <div className="space-y-2">
                      <p>No results found.</p>
                      <p className="text-sm">Press Enter to create: "{search}"</p>
                    </div>
                  </Command.Empty>
                  
                  {commandItems.map((item) => (
                    <Command.Item
                      key={item.id}
                      onSelect={item.action}
                      className="flex items-center px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 flex items-center justify-center text-indigo-400 mr-3">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.title}</div>
                        <div className="text-gray-400 text-sm">{item.description}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.List>
              </Command>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
