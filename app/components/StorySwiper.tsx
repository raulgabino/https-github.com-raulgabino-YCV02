"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGesture } from "@use-gesture/react"
import { Heart, MapPin, Share2 } from "lucide-react"

interface MockPlace {
  name: string
  image: string
  tags: string[]
  rating: number
  description: string
}

const mockPlaces: MockPlace[] = [
  {
    name: "Antro Babel",
    image: "https://source.unsplash.com/400x600/?nightclub,guadalajara",
    tags: ["#bellakeo", "#reggaeton", "#guadalajara"],
    rating: 4.1,
    description: "El spot perfecto para el bellakeo. Reggaetón que te hace vibrar.",
  },
  {
    name: "La Docena Oyster Bar",
    image: "https://source.unsplash.com/400x600/?oyster,bar,restaurant",
    tags: ["#mariscos", "#trendy", "#guadalajara"],
    rating: 4.6,
    description: "Ostiones fresquísimos y ambiente animado. El lugar de moda para mariscos.",
  },
  {
    name: "Hueso Restaurant",
    image: "https://source.unsplash.com/400x600/?restaurant,design,bones",
    tags: ["#diseño", "#vanguardista", "#exclusivo"],
    rating: 4.5,
    description: "Interior único lleno de huesos. Una experiencia gastronómica inolvidable.",
  },
]

export default function StorySwiper() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [windowHeight, setWindowHeight] = useState(0)

  const bind = useGesture({
    onDrag: ({ offset: [, y], direction: [, dy], velocity: [, vy] }) => {
      // Only handle vertical swipes
      if (Math.abs(vy) > 0.5 || Math.abs(y) > 50) {
        if (dy > 0 && currentIndex > 0) {
          // Swipe down - previous
          setCurrentIndex((prev) => prev - 1)
          setTranslateY((prev) => prev + 100)
        } else if (dy < 0 && currentIndex < mockPlaces.length - 1) {
          // Swipe up - next
          setCurrentIndex((prev) => prev + 1)
          setTranslateY((prev) => prev - 100)
        }
      }
    },
  })

  useEffect(() => {
    setWindowHeight(window.innerHeight)

    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(index)) {
        newFavorites.delete(index)
      } else {
        newFavorites.add(index)
      }
      return newFavorites
    })
  }

  const handleMapsClick = () => {
    // Mock maps functionality
    console.log(`Opening maps for ${mockPlaces[currentIndex].name}`)
  }

  const handleShareClick = () => {
    // Mock share functionality
    console.log(`Sharing ${mockPlaces[currentIndex].name}`)
  }

  if (windowHeight === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-black">
      {/* Story Cards Stack */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait">
          {mockPlaces.map((place, index) => {
            const offset = index - currentIndex
            const isVisible = Math.abs(offset) <= 1

            if (!isVisible) return null

            return (
              <motion.div
                key={index}
                className="absolute inset-0 h-screen w-full"
                initial={{ y: offset * windowHeight }}
                animate={{ y: offset * windowHeight }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                {...bind()}
                style={{ touchAction: "pan-y" }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={place.image || "/placeholder.svg"}
                    alt={place.name}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="max-w-sm">
                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-2">{place.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-lg font-medium">{place.rating}</span>
                    </div>

                    {/* Description */}
                    <p className="text-lg text-white/90 leading-tight mb-4">{place.description}</p>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap">
                      {place.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm border border-white/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Floating Controls */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6">
        {/* Heart Button */}
        <button
          onClick={() => toggleFavorite(currentIndex)}
          className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <Heart size={24} className={`${favorites.has(currentIndex) ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        {/* Maps Button */}
        <button
          onClick={handleMapsClick}
          className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <MapPin size={24} className="text-white" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <Share2 size={24} className="text-white" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {mockPlaces.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all duration-200 ${
              index === currentIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Swipe Hint */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <div className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full border border-white/30">
          <p className="text-white text-sm">Desliza para explorar</p>
        </div>
      </div>
    </div>
  )
}
