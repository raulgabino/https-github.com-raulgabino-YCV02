"use client"

import { motion } from "framer-motion"
import { Heart, Home, Users, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FloatingButtonsProps {
  onLike?: () => void
  onSkip?: () => void
  onSave?: () => void
  place?: any
}

export default function FloatingButtons({ onLike, onSkip, onSave, place }: FloatingButtonsProps) {
  const router = useRouter()

  // If no specific actions provided, show general navigation buttons
  if (!onLike && !onSkip && !onSave) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <motion.button
          onClick={() => router.push("/favorites")}
          className="w-12 h-12 bg-spotify-green hover:bg-green-400 text-black rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={20} />
        </motion.button>

        <motion.button
          onClick={() => router.push("/personalidades")}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Users size={20} />
        </motion.button>

        <motion.button
          onClick={() => router.push("/analytics")}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <BarChart3 size={20} />
        </motion.button>

        <motion.button
          onClick={() => router.push("/")}
          className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Home size={20} />
        </motion.button>
      </div>
    )
  }

  // If specific actions are provided but no place, return null
  if (!place) {
    return null
  }

  const handleMapsClick = () => {
    if (place.lat && place.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`, "_blank")
    }
  }

  const handleShareClick = () => {
    const text = `Check out ${place.name} in ${place.city || "the city"}!`
    if (navigator.share) {
      navigator
        .share({
          title: place.name,
          text,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`).catch(console.error)
    }
  }

  const handleWebsiteClick = () => {
    if (place.website) {
      window.open(place.website, "_blank")
    }
  }

  return (
    <>
      {/* Main Action Buttons */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-6 z-10">
        {onSkip && (
          <motion.button
            onClick={onSkip}
            className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-red-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-red-500 text-2xl">✖️</span>
          </motion.button>
        )}

        {onSave && (
          <motion.button
            onClick={onSave}
            className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-blue-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-blue-500 text-2xl">💾</span>
          </motion.button>
        )}

        {onLike && (
          <motion.button
            onClick={onLike}
            className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-pink-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={24} className="text-pink-500" />
          </motion.button>
        )}
      </div>

      {/* Secondary Action Buttons */}
      <div className="absolute bottom-16 right-6 flex flex-col gap-3 z-10">
        <motion.button
          onClick={handleMapsClick}
          className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-blue-600 text-lg">🗺️</span>
        </motion.button>

        <motion.button
          onClick={handleShareClick}
          className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-purple-600 text-lg">📤</span>
        </motion.button>

        {place.website && (
          <motion.button
            onClick={handleWebsiteClick}
            className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-green-600 text-lg">🌐</span>
          </motion.button>
        )}
      </div>
    </>
  )
}
