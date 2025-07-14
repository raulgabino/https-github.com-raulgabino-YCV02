"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { copy, cities } from "../lib/i18n"

interface CitySelectProps {
  onCityChange: (city: string) => void
  defaultCity?: string
}

export default function CitySelect({ onCityChange, defaultCity = "Ciudad Victoria" }: CitySelectProps) {
  const [selectedCity, setSelectedCity] = useState(defaultCity)
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoize the city change handler to prevent unnecessary re-renders
  const handleCityChange = useCallback(
    (city: string) => {
      setSelectedCity(city)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("city", city)
      }
      onCityChange(city)
    },
    [onCityChange],
  )

  // Only run once on mount to load saved city
  useEffect(() => {
    if (typeof localStorage !== "undefined" && !isInitialized) {
      const savedCity = localStorage.getItem("city")
      if (savedCity && Object.keys(cities).includes(savedCity)) {
        setSelectedCity(savedCity)
        onCityChange(savedCity)
      } else {
        // If no saved city, use default and notify parent
        onCityChange(defaultCity)
      }
      setIsInitialized(true)
    }
  }, []) // Empty dependency array - only run once

  // Handle select change
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleCityChange(e.target.value)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">{copy.landing.cityLabel}</label>
      <select
        value={selectedCity}
        onChange={handleSelectChange}
        className="w-full px-4 py-3 rounded-2xl bg-gray-700/50 backdrop-blur-lg border border-spotify-green/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
      >
        {Object.entries(cities).map(([key, value]) => (
          <option key={key} value={key} className="bg-gray-800 text-white">
            {value}
          </option>
        ))}
      </select>
    </div>
  )
}
