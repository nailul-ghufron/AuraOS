'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { motion } from 'framer-motion'
import { FocusModeWidget } from './widgets/focus-mode-widget'
import { WeatherWidget } from './widgets/weather-widget'
import { DevLogWidget } from './widgets/dev-log-widget'

interface WidgetPosition {
  id: string
  x: number
  y: number
}

export function WidgetGrid() {
  const [widgets, setWidgets] = useState<WidgetPosition[]>([
    { id: 'focus-mode', x: 0, y: 0 },
    { id: 'weather', x: 1, y: 0 },
    { id: 'dev-log', x: 0, y: 1 },
  ])

  const moveWidget = (id: string, newX: number, newY: number) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, x: newX, y: newY }
          : widget
      )
    )
  }

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'focus-mode':
        return <FocusModeWidget />
      case 'weather':
        return <WeatherWidget />
      case 'dev-log':
        return <DevLogWidget />
      default:
        return null
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-2 gap-6 h-full">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="widget-container"
          >
            {renderWidget(widget.id)}
          </motion.div>
        ))}
      </div>
    </DndProvider>
  )
}
