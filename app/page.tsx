'use client'

import { motion } from 'framer-motion'
import { CommandCenter } from '@/components/command-center/command-center'
import { WidgetGrid } from '@/components/widgets/widget-grid'
import { TaskGarbageCollector } from '@/components/tasks/task-garbage-collector'
import { ArabicHelperPanel } from '@/components/arabic/arabic-helper-panel'

export default function Home() {
  return (
    <div 
      className="min-h-screen text-white overflow-hidden relative"
      style={{ background: 'radial-gradient(circle at 50% 0%, #020617 0%, #000000 100%)' }}
    >
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none mix-blend-screen opacity-60">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full" />
      </div>
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 p-8 md:p-12 max-w-screen-2xl mx-auto"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-xl animate-float shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
              <h1 className="text-3xl font-extrabold tracking-tight neon-text">AuraOS</h1>
            </div>
            <div className="text-sm font-medium tracking-wide text-gray-400 uppercase">
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
        <div className="grid grid-cols-12 gap-10 h-[calc(100vh-240px)]">
          {/* Widget Grid - takes most space */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 lg:col-span-8"
          >
            <WidgetGrid />
          </motion.div>

          {/* Side panels */}
          <div className="col-span-12 lg:col-span-4 flex flex-col space-y-10">
            {/* Arabic Helper Panel */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-1 min-h-0"
            >
              <ArabicHelperPanel />
            </motion.div>

            {/* Task Garbage Collector Status */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex-1 min-h-0"
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
