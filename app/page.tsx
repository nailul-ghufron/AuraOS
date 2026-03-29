'use client'

import { motion } from 'framer-motion'
import { CommandCenter } from '@/components/command-center/command-center'
import { WidgetGrid } from '@/components/widgets/widget-grid'
import { TaskGarbageCollector } from '@/components/tasks/task-garbage-collector'
import { ArabicHelperPanel } from '@/components/arabic/arabic-helper-panel'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-black pointer-events-none" />
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-6"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg animate-float" />
              <h1 className="text-2xl font-bold neon-text">AuraOS</h1>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </motion.header>

        {/* Main grid layout */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Widget Grid - takes most space */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-8"
          >
            <WidgetGrid />
          </motion.div>

          {/* Side panels */}
          <div className="col-span-4 space-y-6">
            {/* Arabic Helper Panel */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="h-1/2"
            >
              <ArabicHelperPanel />
            </motion.div>

            {/* Task Garbage Collector Status */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="h-1/2"
            >
              <TaskGarbageCollector />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Command Center - floating overlay */}
      <CommandCenter />
    </div>
  )
}
