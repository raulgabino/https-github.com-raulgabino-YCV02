"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import type { Place } from "../lib/types"
import { trackSwipeAction } from "../lib/telemetry"
import { Heart, X, MapPin } from "lucide-react"

interface SwipeableStackProps {
  places: Place[]
  city: string
  vibe: string
}

export default function SwipeableStack({ places, city, vibe }: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardStartTime, setCardStartTime] = useState(Date.now())
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const currentPlace = places[currentIndex]
  const nextPlace = places[currentIndex + 1]

  useEffect(() => {
    setCardStartTime(Date.now())
  }, [currentIndex])

  const handleSwipe = useCallback(
    (swipeDirection: "left" | "right", action: "like" | "skip" | "save") => {
      if (!currentPlace) return

      // Track telemetry
      const timeSpent = Date.now() - cardStartTime
      trackSwipeAction({
        place: currentPlace.name,
        action,
        timeSpent,
        mood: vibe,
        city: city,
        swipeDirection: swipeDirection === "left" ? "down" : "up",
      })

      // Handle favorites
      if (action === "like" || action === "save") {
        const newFavorites = new Set(favorites)
        newFavorites.add(currentPlace.name)
        setFavorites(newFavorites)

        const favoritePlaces = JSON.parse(localStorage.getItem("favoritePlaces") || "[]")
        const favoriteIds = JSON.parse(localStorage.getItem("favoriteIds") || "[]")

        if (!favoriteIds.includes(currentPlace.name)) {
          favoriteIds.push(currentPlace.name)
          favoritePlaces.push(currentPlace)
          localStorage.setItem("favoritePlaces", JSON.stringify(favoritePlaces))
          localStorage.setItem("favoriteIds", JSON.stringify(favoriteIds))
        }
      }

      setDirection(swipeDirection)

      // Move to next card
      setTimeout(() => {
        if (currentIndex >= places.length - 1) {
          window.location.reload()
        } else {
          setCurrentIndex(currentIndex + 1)
          setDirection(null)
        }
      }, 300)
    },
    [currentIndex, places.length, currentPlace, cardStartTime, vibe, city, favorites],
  )

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.x

    if (info.offset.x < -threshold || velocity < -500) {
      // Swipe left - Skip
      handleSwipe("left", "skip")
    } else if (info.offset.x > threshold || velocity > 500) {
      // Swipe right - Like
      handleSwipe("right", "like")
    }
  }

  const handleMapsClick = () => {
    if (currentPlace) {
      const url = `https://www.google.com/maps/search/?api=1&query=${currentPlace.lat},${currentPlace.lng}`
      window.open(url, "_blank")
    }
  }

  if (!currentPlace) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-4">All done!</h2>
        <p className="text-gray-300 mb-6">
          You've seen all the places we found for "{vibe}" in {city}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-spotify-green text-black px-6 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors"
        >
          Search Again
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-teal-500/20 to-fuchsia-600/20 relative overflow-hidden max-w-sm mx-auto">
      {/* Cards Stack */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {/* Next Card (Background) */}
          {nextPlace && (
            <motion.div
              key={`next-${currentIndex}`}
              className="absolute inset-4 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl"
              initial={{ scale: 0.95, opacity: 0.7 }}
              animate={{ scale: 0.95, opacity: 0.7 }}
              style={{ zIndex: 1 }}
            >
              <PlaceCard place={nextPlace} isBackground />
            </motion.div>
          )}

          {/* Current Card (Foreground) */}
          <motion.div
            key={`current-${currentIndex}`}
            className="absolute inset-4 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: -50, right: 50 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ scale: 1, opacity: 1, x: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: 0,
            }}
            exit={{
              x: direction === "left" ? -1000 : direction === "right" ? 1000 : 0,
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.3 },
            }}
            whileDrag={{
              scale: 1.02,
              rotateZ: 0,
            }}
            style={{ zIndex: 2 }}
          >
            <PlaceCard place={currentPlace} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} of {places.length}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-6 z-10">
        <motion.button
          onClick={() => handleSwipe("left", "skip")}
          className="w-16 h-16 bg-red-500/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-red-500/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} className="text-red-400" />
        </motion.button>

        <motion.button
          onClick={handleMapsClick}
          className="w-16 h-16 bg-blue-500/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-blue-500/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MapPin size={24} className="text-blue-400" />
        </motion.button>

        <motion.button
          onClick={() => handleSwipe("right", "like")}
          className="w-16 h-16 bg-green-500/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-green-500/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={24} className="text-green-400" />
        </motion.button>
      </div>
    </div>
  )
}

// Simple place card component
function PlaceCard({ place, isBackground = false }: { place: Place; isBackground?: boolean }) {
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      restaurant: "🍽️",
      cafe: "☕",
      bar: "🍸",
      park: "🌳",
      museum: "🏛️",
      theater: "🎭",
      shop: "🛍️",
      hotel: "🏨",
    }
    return emojiMap[category.toLowerCase()] || "📍"
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-3xl">
      {/* Header Image Area */}
      <div className="h-64 bg-gradient-to-br from-spotify-green/20 to-gray-700 flex items-center justify-center">
        <div className="text-6xl">{getCategoryEmoji(place.category)}</div>
      </div>

      {/* Content */}
      <div className="p-6 text-gray-800">
        <h3 className="text-xl font-bold mb-2">{place.name}</h3>
        <p className="text-gray-600 capitalize mb-2">{place.category}</p>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{place.address}</p>

        {/* Rating and Price */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-yellow-600">⭐ {place.google_rating}</span>
          <span className="text-green-600 font-semibold">{place.price_level}</span>
        </div>

        {/* Tags */}
        {!isBackground && (
          <div className="flex flex-wrap gap-2 mb-6">
            {place.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Hours */}
        <p className="text-gray-500 text-sm">{place.opening_hours}</p>
      </div>
    </div>
  )
}
