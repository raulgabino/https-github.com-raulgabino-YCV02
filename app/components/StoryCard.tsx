"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, MapPin, MessageCircle, Menu, ExternalLink } from "lucide-react"
import type { Place } from "@/lib/types"
import { copy } from "../lib/i18n"
import { generateMapsUrl, generateInstagramDMUrl } from "../lib/utils"
import { generatePlaceholderDataURL, getPlaceholderMessage } from "../lib/placeholders"

interface StoryCardProps {
  place: Place
  explanation: string
  onSwipe?: () => void
}

export default function StoryCard({ place, explanation, onSwipe }: StoryCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if place is in favorites
    const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
    setIsFavorite(favorites.includes(place.name))

    // Always use placeholder for MVP
    setImageUrl(generatePlaceholderDataURL(place.name, place.category))
  }, [place])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
    let newFavorites

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== place.name)
    } else {
      newFavorites = [...favorites, place.name]
      // Also save the full place data
      const favoritePlaces = JSON.parse(localStorage.getItem("favoritePlaces") || "[]")
      const updatedPlaces = [...favoritePlaces.filter((p: Place) => p.name !== place.name), place]
      localStorage.setItem("favoritePlaces", JSON.stringify(updatedPlaces))
    }

    localStorage.setItem("favoriteIds", JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleMapsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const mapsUrl = generateMapsUrl(place.lat, place.lng, place.name)
    window.open(mapsUrl, "_blank")
    console.log("🗺️ Opening maps for:", place.name)
  }

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const instagramUrl = generateInstagramDMUrl(place.name)
    window.open(instagramUrl, "_blank")
    console.log("📱 Opening Instagram DM for:", place.name)
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (place.website) {
      window.open(place.website, "_blank")
      console.log("🌐 Opening website for:", place.name)
    } else {
      // Navigate to place details page
      router.push(`/place/${encodeURIComponent(place.name)}`)
      console.log("📄 Navigating to place details for:", place.name)
    }
  }

  const handlePlaceDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Navigate to detailed place view
    router.push(`/place/${encodeURIComponent(place.name)}`)
    console.log("🔍 Viewing place details for:", place.name)
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30"
      onClick={onSwipe}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={place.name}
          fill
          className="object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        {/* Place Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
            <p className="text-lg opacity-90 leading-relaxed mb-2">{explanation}</p>
            <p className="text-sm opacity-70 italic">{getPlaceholderMessage()}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {place.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-lg text-sm">
                #{tag}
              </span>
            ))}
          </div>

          {/* Rating and Price */}
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">⭐ {place.google_rating}</span>
            <span>{place.price_level}</span>
            <span className="opacity-70">{place.category}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleMapsClick}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <MapPin size={18} />
              <span className="text-sm font-medium">{copy.stories.openMaps}</span>
            </button>

            <button
              onClick={handleInstagramClick}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{copy.stories.dmInstagram}</span>
            </button>

            <button
              onClick={handleMenuClick}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              {place.website ? <ExternalLink size={18} /> : <Menu size={18} />}
              <span className="text-sm font-medium">{place.website ? "Sitio Web" : copy.stories.menu}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite()
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <Heart size={18} className={isFavorite ? "fill-amber-300 text-amber-300" : ""} />
              <span className="text-sm font-medium">{copy.stories.favorite}</span>
            </button>
          </div>

          {/* View Details Button */}
          <button
            onClick={handlePlaceDetails}
            className="w-full py-3 rounded-2xl bg-fuchsia-500/30 backdrop-blur-lg border border-fuchsia-400/60 hover:bg-fuchsia-500/40 transition-all duration-200 mt-3"
          >
            <span className="text-sm font-medium">Ver Detalles Completos</span>
          </button>
        </div>
      </div>

      {/* Swipe Indicator */}
      <div className="absolute top-6 right-6">
        <div className="w-1 h-12 bg-white/30 rounded-full">
          <div className="w-1 h-4 bg-white rounded-full" />
        </div>
      </div>
    </motion.div>
  )
}
