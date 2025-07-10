"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { MapPin, Trash2 } from "lucide-react"
import type { Place } from "../lib/types"
import { copy } from "../lib/i18n"
import { getImageFallback, generateMapsUrl } from "../lib/utils"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const favoritePlaces = JSON.parse(localStorage.getItem("favoritePlaces") || "[]")
    setFavorites(favoritePlaces)
    setLoading(false)
  }, [])

  const removeFavorite = (placeName: string) => {
    const updatedFavorites = favorites.filter((place) => place.name !== placeName)
    setFavorites(updatedFavorites)

    // Update localStorage
    localStorage.setItem("favoritePlaces", JSON.stringify(updatedFavorites))
    const favoriteIds = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
    const updatedIds = favoriteIds.filter((id: string) => id !== placeName)
    localStorage.setItem("favoriteIds", JSON.stringify(updatedIds))
  }

  const handleMapsClick = (place: Place) => {
    window.open(generateMapsUrl(place.lat, place.lng, place.name), "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 pb-20">
      <div className="p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">{copy.favorites.title}</h1>
          <p className="text-white/70">{favorites.length} lugares guardados</p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-xl font-semibold text-white mb-2">{copy.favorites.empty}</h2>
            <p className="text-white/70">{copy.favorites.emptySubtitle}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {favorites.map((place, index) => (
              <motion.div
                key={place.name}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-lg"
              >
                <div className="flex">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={place.media?.[0] || getImageFallback(place.city, place.tags[0] || "restaurant")}
                      alt={place.name}
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{place.name}</h3>
                        <p className="text-white/70 text-sm">
                          {place.category} • {place.city}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFavorite(place.name)}
                        className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 transition-colors duration-200"
                      >
                        <Trash2 size={16} className="text-white/70 hover:text-red-400" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/80">
                        <span>⭐ {place.google_rating}</span>
                        <span>{place.price_level}</span>
                      </div>

                      <button
                        onClick={() => handleMapsClick(place)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                      >
                        <MapPin size={14} />
                        <span className="text-sm text-white">Ver</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
