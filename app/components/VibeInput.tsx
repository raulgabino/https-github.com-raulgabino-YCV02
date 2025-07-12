"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { copy, getTopTokensByCity } from "../lib/i18n"

interface VibeInputProps {
  onSearch: (mood: string) => void
  city: string
}

export default function VibeInput({ onSearch, city }: VibeInputProps) {
  const [mood, setMood] = useState("")
  const [suggestedChips, setSuggestedChips] = useState<string[]>([])

  useEffect(() => {
    const lastMood = localStorage.getItem("lastMood")
    if (lastMood) {
      setMood(lastMood)
    }
    setSuggestedChips(getTopTokensByCity(city))
  }, [city])

  const handleSearch = () => {
    if (mood.trim()) {
      localStorage.setItem("lastMood", mood)
      onSearch(mood)
    }
  }

  const handleChipClick = (chip: string) => {
    setMood(chip)
    localStorage.setItem("lastMood", chip)
    onSearch(chip)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={copy.landing.placeholder}
          className="w-full px-4 py-4 rounded-2xl bg-gray-700/50 backdrop-blur-lg border border-spotify-green/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent text-lg"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-400">{copy.landing.suggestedChips}</p>
        <div className="flex flex-wrap gap-2">
          {suggestedChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-full bg-gray-700/50 backdrop-blur-lg border border-spotify-green/40 text-gray-300 text-sm hover:bg-spotify-green/20 hover:text-spotify-green transition-all duration-200"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={!mood.trim()}
        className="w-full py-4 rounded-2xl bg-spotify-green hover:bg-spotify-green-dark text-black font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
      >
        {copy.landing.searchButton}
      </button>
    </div>
  )
}
