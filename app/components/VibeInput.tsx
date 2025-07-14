"use client"

import type React from "react"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"

interface VibeInputProps {
  onVibeSubmit: (vibe: string) => void
  loading?: boolean
  disabled?: boolean
}

export default function VibeInput({ onVibeSubmit, loading = false, disabled = false }: VibeInputProps) {
  const [vibe, setVibe] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (vibe.trim() && !loading && !disabled) {
      onVibeSubmit(vibe.trim())
    }
  }

  const vibeExamples = [
    "Cozy coffee shop to work from",
    "Romantic dinner spot",
    "Fun place to party with friends",
    "Quiet place to read and relax",
    "Trendy brunch spot",
    "Local authentic food experience",
    "Outdoor space to exercise",
    "Cultural experience",
    "Late night hangout",
    "Family-friendly restaurant",
  ]

  const handleExampleClick = (example: string) => {
    if (!loading && !disabled) {
      setVibe(example)
      onVibeSubmit(example)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-spotify-green" />
        <label className="text-white font-semibold">What's your vibe?</label>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <textarea
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="Describe what you're looking for... (e.g., 'cozy coffee shop to work from' or 'romantic dinner spot')"
            className="w-full p-4 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent transition-all"
            rows={3}
            disabled={loading || disabled}
          />
          <button
            type="submit"
            disabled={!vibe.trim() || loading || disabled}
            className="absolute bottom-3 right-3 p-2 bg-spotify-green text-black rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Quick Examples */}
      <div className="space-y-3">
        <p className="text-gray-400 text-sm">Or try one of these:</p>
        <div className="flex flex-wrap gap-2">
          {vibeExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={loading || disabled}
              className="px-3 py-2 bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/50 rounded-full text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
