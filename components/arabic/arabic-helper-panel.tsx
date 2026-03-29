'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, MessageSquare, Sparkles, ChevronRight } from 'lucide-react'

interface ArabicAnalysis {
  text: string
  analysis: string
  corrections: string[]
  suggestions: string[]
}

export function ArabicHelperPanel() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<ArabicAnalysis | null>(null)
  const [inputText, setInputText] = useState('')

  // Simulate Qawaid AI integration
  const analyzeArabicText = async () => {
    if (!inputText.trim()) return

    // Mock analysis - in real app, this would call Qawaid AI API
    setCurrentAnalysis({
      text: inputText,
      analysis: 'The text follows proper Arabic grammar rules. No major issues detected.',
      corrections: [],
      suggestions: ['Consider using more formal language for professional context', 'Add diacritical marks for clarity']
    })
  }

  const sampleTexts = [
    'السلام عليكم ورحمة الله وبركاته',
    'كيف حالك اليوم؟',
    'أنا أتعلم اللغة العربية'
  ]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold neon-text">Qawaid AI Helper</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-400">Arabic Grammar Analysis</span>
        </div>
        <p className="text-xs text-gray-400">
          Powered by Qawaid AI - Get instant grammar analysis and corrections
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Enter Arabic Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب النص العربي هنا..."
          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-indigo-500/50 text-right"
          rows={3}
          dir="rtl"
        />
        <button
          onClick={analyzeArabicText}
          className="mt-2 w-full py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors text-white flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze with AI</span>
        </button>
      </div>

      {/* Sample Texts */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-400 mb-2">Sample Texts:</div>
        <div className="space-y-1">
          {sampleTexts.map((text, index) => (
            <button
              key={index}
              onClick={() => setInputText(text)}
              className="w-full text-left p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-xs text-gray-300 flex items-center justify-between"
            >
              <span dir="rtl" className="truncate flex-1">{text}</span>
              <ChevronRight className="w-3 h-3 text-gray-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {currentAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="space-y-3">
            {/* Original Text */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Original Text:</div>
              <div className="text-sm text-white" dir="rtl">
                {currentAnalysis.text}
              </div>
            </div>

            {/* Analysis */}
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Analysis</span>
              </div>
              <p className="text-xs text-gray-300">{currentAnalysis.analysis}</p>
            </div>

            {/* Corrections */}
            {currentAnalysis.corrections.length > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-xs font-medium text-yellow-400 mb-2">Corrections:</div>
                <ul className="space-y-1">
                  {currentAnalysis.corrections.map((correction, index) => (
                    <li key={index} className="text-xs text-gray-300">
                      • {correction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {currentAnalysis.suggestions.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-xs font-medium text-blue-400 mb-2">Suggestions:</div>
                <ul className="space-y-1">
                  {currentAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-xs text-gray-300">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-gray-400 text-center">
          Integration ready for Qawaid AI API
        </div>
      </div>
    </motion.div>
  )
}
