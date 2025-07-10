"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import type { Place } from "../lib/types"
import SwipeCard from "./SwipeCard"
import FloatingButtons from "./FloatingButtons"
import { trackSwipeAction } from "../lib/telemetry"

interface SwipeableStackProps {
  places: Place[]
  mood: string
  onComplete: () => void
}

export default function SwipeableStack({ places, mood, onComplete }: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardStartTime, setCardStartTime] = useState(Date.now())
  const [direction, setDirection] = useState<"up" | "down" | null>(null)

  const currentPlace = places[currentIndex]
  const nextPlace = places[currentIndex + 1]

  useEffect(() => {
    setCardStartTime(Date.now())
  }, [currentIndex])

  const handleSwipe = useCallback(
    (swipeDirection: "up" | "down", action: "like" | "skip" | "save") => {
      if (!currentPlace) return

      // Track telemetry
      const timeSpent = Date.now() - cardStartTime
      trackSwipeAction({
        place: currentPlace.name,
        action,
        timeSpent,
        mood,
        city: currentPlace.city,
        swipeDirection,
      })

      // Handle favorites
      if (action === "like" || action === "save") {
        const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
        if (!favorites.includes(currentPlace.name)) {
          const newFavorites = [...favorites, currentPlace.name]
          localStorage.setItem("favoriteIds", JSON.stringify(newFavorites))

          const favoritePlaces = JSON.parse(localStorage.getItem("favoritePlaces") || "[]")
          const updatedPlaces = [...favoritePlaces.filter((p: Place) => p.name !== currentPlace.name), currentPlace]
          localStorage.setItem("favoritePlaces", JSON.stringify(updatedPlaces))
        }
      }

      setDirection(swipeDirection)

      // Move to next card
      setTimeout(() => {
        if (currentIndex >= places.length - 1) {
          onComplete()
        } else {
          setCurrentIndex(currentIndex + 1)
          setDirection(null)
        }
      }, 300)
    },
    [currentIndex, places.length, currentPlace, cardStartTime, mood, onComplete],
  )

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.y

    if (info.offset.y < -threshold || velocity < -500) {
      // Swipe up - Like
      handleSwipe("up", "like")
    } else if (info.offset.y > threshold || velocity > 500) {
      // Swipe down - Skip
      handleSwipe("down", "skip")
    }
  }

  if (!currentPlace) {
    return null
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-teal-500/20 to-fuchsia-600/20 relative overflow-hidden">
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
              <SwipeCard place={nextPlace} isBackground />
            </motion.div>
          )}

          {/* Current Card (Foreground) */}
          <motion.div
            key={`current-${currentIndex}`}
            className="absolute inset-4 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing"
            drag="y"
            dragConstraints={{ top: -50, bottom: 50 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ scale: 1, opacity: 1, y: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              y: direction === "up" ? -1000 : direction === "down" ? 1000 : 0,
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
            <SwipeCard place={currentPlace} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Buttons */}
      <FloatingButtons
        onLike={() => handleSwipe("up", "like")}
        onSkip={() => handleSwipe("down", "skip")}
        onSave={() => handleSwipe("up", "save")}
        place={currentPlace}
      />

      {/* Progress Indicator */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="flex gap-1">
          {places.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index <= currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipe Hints */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-black/50 backdrop-blur-lg px-4 py-2 rounded-full"
        >
          <p className="text-white text-sm text-center">⬆️ Desliza arriba para ❤️ • ⬇️ Desliza abajo para ✖️</p>
        </motion.div>
      </div>
    </div>
  )
}
