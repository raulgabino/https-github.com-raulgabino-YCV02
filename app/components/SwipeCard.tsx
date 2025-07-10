"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Star, Clock, Phone } from "lucide-react"
import type { Place } from "../lib/types"
import { generatePlaceholderDataURL, getPlaceholderMessage } from "../lib/placeholders"
import { createSimplePlaceholder } from "../lib/fallbackImage"

interface SwipeCardProps {
  place: Place
  isBackground?: boolean
}

export default function SwipeCard({ place, isBackground = false }: SwipeCardProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [explanation, setExplanation] = useState("")

  useEffect(() => {
    try {
      setImageUrl(generatePlaceholderDataURL(place.name, place.category))
    } catch (error) {
      console.error("Error generating placeholder:", error)
      setImageUrl(createSimplePlaceholder(place.category))
    }

    // Generate explanation for current card only
    if (!isBackground) {
      generateExplanation()
    }
  }, [place, isBackground])

  const generateExplanation = async () => {
    try {
      const mood = sessionStorage.getItem("searchMood") || "chill"
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, place }),
      })

      if (response.ok) {
        const data = await response.json()
        setExplanation(data.explanation)
      }
    } catch (error) {
      console.error("Error generating explanation:", error)
      setExplanation(`${place.name} es perfecto para tu vibra 🔥`)
    }
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-3xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={place.name}
          fill
          className="object-cover"
          crossOrigin="anonymous"
          onError={() => setImageUrl("/placeholder.svg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
        {/* Top Info */}
        <div className="flex justify-between items-start">
          <div className="bg-black/30 backdrop-blur-lg px-3 py-1 rounded-full">
            <span className="text-sm font-medium capitalize">{place.category}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-lg px-3 py-1 rounded-full">
            <Star size={14} className="text-yellow-400" />
            <span className="text-sm font-medium">{place.google_rating}</span>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="space-y-4">
          {/* Main Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
            {!isBackground && explanation && <p className="text-lg opacity-90 leading-relaxed mb-2">{explanation}</p>}
            <div className="flex items-center gap-2 text-sm opacity-80">
              <MapPin size={16} />
              <span>{place.city}</span>
              <span>•</span>
              <span>{place.price_level}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-lg text-sm border border-white/30"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 backdrop-blur-lg p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-sm font-medium">Horario</span>
              </div>
              <p className="text-xs opacity-80 truncate">{place.opening_hours}</p>
            </div>

            {place.phone && (
              <div className="bg-black/30 backdrop-blur-lg p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Phone size={16} />
                  <span className="text-sm font-medium">Contacto</span>
                </div>
                <p className="text-xs opacity-80">Disponible</p>
              </div>
            )}
          </div>

          {/* Photo Status */}
          <div className="text-center">
            <p className="text-xs opacity-60 italic">{getPlaceholderMessage()}</p>
          </div>
        </div>
      </div>

      {/* Swipe Indicators */}
      {!isBackground && (
        <>
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.8 }}
            whileDrag={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">❤️ ME GUSTA</div>
          </motion.div>

          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0, scale: 0.8 }}
            whileDrag={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">✖️ PASAR</div>
          </motion.div>
        </>
      )}
    </div>
  )
}
