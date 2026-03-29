'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react'

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  location: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
    location: 'San Francisco'
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    // Simulate weather API call
    const fetchWeather = async () => {
      setLoading(true)
      // In a real app, you'd call a weather API here
      setTimeout(() => {
        setWeather({
          temp: Math.floor(Math.random() * 30) + 60,
          condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          visibility: Math.floor(Math.random() * 10) + 5,
          location: 'San Francisco'
        })
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        setLoading(false)
      }, 1000)
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Sunny':
        return <Sun className="w-8 h-8 text-yellow-400" />
      case 'Partly Cloudy':
        return <Cloud className="w-8 h-8 text-gray-400" />
      case 'Cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />
      case 'Rainy':
        return <CloudRain className="w-8 h-8 text-blue-400" />
      default:
        return <Cloud className="w-8 h-8 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card h-full flex items-center justify-center"
      >
        <div className="animate-pulse text-gray-400">Loading weather...</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold neon-text">Weather</h3>
        <div className="text-sm text-gray-400">{weather.location}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          {getWeatherIcon(weather.condition)}
        </motion.div>

        <div className="text-4xl font-bold text-white mb-2">
          {weather.temp}°F
        </div>

        <div className="text-gray-400 mb-6">
          {weather.condition}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div className="flex flex-col items-center">
            <Droplets className="w-4 h-4 text-blue-400 mb-1" />
            <div className="text-xs text-gray-400">Humidity</div>
            <div className="text-sm text-white">{weather.humidity}%</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Wind className="w-4 h-4 text-gray-400 mb-1" />
            <div className="text-xs text-gray-400">Wind</div>
            <div className="text-sm text-white">{weather.windSpeed} mph</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Eye className="w-4 h-4 text-indigo-400 mb-1" />
            <div className="text-xs text-gray-400">Visibility</div>
            <div className="text-sm text-white">{weather.visibility} mi</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500">
          Last updated: {lastUpdated || '--:--'}
        </div>
      </div>
    </motion.div>
  )
}
