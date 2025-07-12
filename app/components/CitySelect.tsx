"use client"

import { useState, useEffect } from "react"
import { copy, cities } from "../lib/i18n"

interface CitySelectProps {
  onCityChange: (city: string) => void
  defaultCity?: string
}

export default function CitySelect({ onCityChange, defaultCity = "Ciudad Victoria" }: CitySelectProps) {
  const [selectedCity, setSelectedCity] = useState(defaultCity)

  useEffect(() => {
    const savedCity = localStorage.getItem("city")
    if (savedCity && Object.keys(cities).includes(savedCity)) {
      setSelectedCity(savedCity)
      onCityChange(savedCity)
    }
  }, [onCityChange])

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    localStorage.setItem("city", city)
    onCityChange(city)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">{copy.landing.cityLabel}</label>
      <select
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
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
