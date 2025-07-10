"use client"

import { motion } from "framer-motion"
import { Heart, X, Bookmark, MapPin, Share2, ExternalLink } from "lucide-react"
import type { Place } from "../lib/types"
import { generateMapsUrl, generateInstagramDMUrl } from "../lib/utils"

interface FloatingButtonsProps {
  onLike: () => void
  onSkip: () => void
  onSave: () => void
  place: Place
}

export default function FloatingButtons({ onLike, onSkip, onSave, place }: FloatingButtonsProps) {
  const handleMapsClick = () => {
    window.open(generateMapsUrl(place.lat, place.lng, place.name), "_blank")
  }

  const handleShareClick = () => {
    window.open(generateInstagramDMUrl(place.name), "_blank")
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
        <motion.button
          onClick={onSkip}
          className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-red-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} className="text-red-500" />
        </motion.button>

        <motion.button
          onClick={onSave}
          className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-blue-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark size={24} className="text-blue-500" />
        </motion.button>

        <motion.button
          onClick={onLike}
          className="w-16 h-16 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg border border-pink-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={24} className="text-pink-500" />
        </motion.button>
      </div>

      {/* Secondary Action Buttons */}
      <div className="absolute bottom-16 right-6 flex flex-col gap-3 z-10">
        <motion.button
          onClick={handleMapsClick}
          className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MapPin size={20} className="text-blue-600" />
        </motion.button>

        <motion.button
          onClick={handleShareClick}
          className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 size={20} className="text-purple-600" />
        </motion.button>

        {place.website && (
          <motion.button
            onClick={handleWebsiteClick}
            className="w-12 h-12 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink size={20} className="text-green-600" />
          </motion.button>
        )}
      </div>
    </>
  )
}
