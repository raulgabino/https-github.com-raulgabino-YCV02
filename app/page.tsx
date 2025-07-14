"use client"

import { useState, useCallback } from "react"
import { Sparkles, MapPin, Heart } from "lucide-react"
import CitySelect from "./components/CitySelect"
import VibeInput from "./components/VibeInput"
import PersonalitySelector from "./components/PersonalitySelector"
import SwipeableStack from "./components/SwipeableStack"
import FloatingButtons from "./components/FloatingButtons"
import type { Place } from "./lib/types"
import type { PersonalityProfile } from "./lib/personalityProfiles"

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("")
  const [currentVibe, setCurrentVibe] = useState("")
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityProfile | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState("")
  const [error, setError] = useState("")

  const handleVibeSubmit = async (vibe: string) => {
    if (!selectedCity.trim()) {
      setError("Please select a city first")
      return
    }

    if (!vibe.trim()) {
      setError("Please describe your vibe")
      return
    }

    setLoading(true)
    setError("")
    setCurrentVibe(vibe)

    try {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vibe,
          city: selectedCity,
          personality: selectedPersonality,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setPlaces([])
        setExplanation("")
      } else {
        setPlaces(data.places || [])
        setExplanation(data.explanation || "")

        if (data.places?.length === 0) {
          setError(
            `No places found in ${selectedCity} matching your vibe. Try a different city or adjust your vibe description.`,
          )
        }
      }
    } catch (err) {
      console.error("Error getting recommendations:", err)
      setError("Something went wrong. Please check your internet connection and try again.")
      setPlaces([])
      setExplanation("")
    } finally {
      setLoading(false)
    }
  }

  // Memoize the city change handler to prevent re-renders
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city)
    setPlaces([])
    setExplanation("")
    setError("")
    setCurrentVibe("")
  }, [])

  // Memoize the personality change handler
  const handlePersonalityChange = useCallback((personality: PersonalityProfile | null) => {
    setSelectedPersonality(personality)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-spotify-green" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">YourCityVibes</h1>
              <Sparkles className="w-8 h-8 text-spotify-green" />
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover places that match your exact vibe using AI-powered recommendations
            </p>
          </div>

          {/* City Selection */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-spotify-green" />
              <label className="text-white font-semibold">Choose your city</label>
            </div>
            <CitySelect onCityChange={handleCityChange} />
          </div>

          {/* Personality Selection */}
          {selectedCity && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-spotify-green" />
                <label className="text-white font-semibold">What's your personality? (Optional)</label>
              </div>
              <PersonalitySelector
                city={selectedCity}
                onPersonalityChange={handlePersonalityChange}
                selectedPersonality={selectedPersonality}
              />
            </div>
          )}

          {/* Vibe Input */}
          {selectedCity && (
            <div className="max-w-2xl mx-auto">
              <VibeInput onVibeSubmit={handleVibeSubmit} loading={loading} disabled={!selectedCity} />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-2xl mx-auto bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
              <span className="text-white">Finding your perfect vibes in {selectedCity}...</span>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {explanation && !loading && (
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Why these places?</h3>
            <p className="text-gray-300">{explanation}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {places.length > 0 && !loading && (
        <div className="container mx-auto px-4 pb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Perfect matches for "{currentVibe}" in {selectedCity}
            </h2>
            <p className="text-gray-300">Swipe right to save favorites, left to pass</p>
          </div>

          <SwipeableStack places={places} city={selectedCity} vibe={currentVibe} />
        </div>
      )}

      {/* Floating Action Buttons - Only show when not in swipe mode */}
      {places.length === 0 && <FloatingButtons />}
    </div>
  )
}
