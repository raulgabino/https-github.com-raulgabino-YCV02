"use client"

import { useState, useEffect } from "react"
import { copy } from "../lib/i18n"

interface CitySelectProps {
  onCityChange: (city: string) => void
  defaultCity?: string
}

export default function CitySelect({ onCityChange, defaultCity = "Ciudad Victoria" }: CitySelectProps) {
  const [selectedCity, setSelectedCity] = useState(defaultCity)

  useEffect(() => {
    const savedCity = localStorage.getItem("city")
    if (savedCity && Object.keys(copy.cities).includes(savedCity)) {
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
      <label className="block text-sm font-medium text-white/80 mb-2">{copy.landing.cityLabel}</label>
      <select
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 focus:border-transparent"
      >
        {Object.entries(copy.cities).map(([key, value]) => (
          <option key={key} value={key} className="bg-gray-900 text-white">
            {value}
          </option>
        ))}
      </select>
    </div>
  )
}
