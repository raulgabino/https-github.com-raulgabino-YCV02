"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Heart, MapPin, MessageCircle, Menu } from "lucide-react"
import type { Place } from "@/lib/types"
import { copy } from "../lib/i18n"
import { getImageFallback, generateMapsUrl, generateInstagramDMUrl } from "../lib/utils"

interface StoryCardProps {
  place: Place
  explanation: string
  onSwipe?: () => void
}

export default function StoryCard({ place, explanation, onSwipe }: StoryCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    // Check if place is in favorites
    const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
    setIsFavorite(favorites.includes(place.name))

    // Set image URL
    if (place.media && place.media.length > 0) {
      setImageUrl(place.media[0])
    } else {
      setImageUrl(getImageFallback(place.city, place.tags[0] || "restaurant"))
    }
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

  const handleMapsClick = () => {
    window.open(generateMapsUrl(place.lat, place.lng, place.name), "_blank")
  }

  const handleInstagramClick = () => {
    window.open(generateInstagramDMUrl(place.name), "_blank")
  }

  const handleMenuClick = () => {
    if (place.website) {
      window.open(place.website, "_blank")
    }
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
          onError={() => {
            setImageUrl(getImageFallback(place.city, place.tags[0] || "restaurant"))
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        {/* Place Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
            <p className="text-lg opacity-90 leading-relaxed">{explanation}</p>
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
              onClick={(e) => {
                e.stopPropagation()
                handleMapsClick()
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <MapPin size={18} />
              <span className="text-sm font-medium">{copy.stories.openMaps}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleInstagramClick()
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{copy.stories.dmInstagram}</span>
            </button>

            {place.website ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleMenuClick()
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 hover:bg-white/30 transition-all duration-200"
              >
                <Menu size={18} />
                <span className="text-sm font-medium">{copy.stories.menu}</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 opacity-50 cursor-not-allowed"
                title={copy.stories.comingSoon}
              >
                <Menu size={18} />
                <span className="text-sm font-medium">{copy.stories.menu}</span>
              </button>
            )}

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
