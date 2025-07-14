"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Place } from "@/app/lib/types"

interface PlaceDetailProps {
  place: Place
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `Check out ${place.name} in ${place.city}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-spotify-green/20">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-spotify-green transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <button onClick={handleShare} className="p-2 text-white hover:text-spotify-green transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero Image */}
        {place.media.length > 0 && !imageError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 md:h-96 rounded-2xl overflow-hidden"
          >
            <img
              src={place.media[0] || "/placeholder.svg"}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        )}

        {/* Place Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 border border-spotify-green/20"
        >
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{place.name}</h1>
              <p className="text-spotify-green text-lg">{place.category}</p>
            </div>

            {/* Rating and Price */}
            <div className="flex items-center gap-4">
              {place.google_rating !== "0" && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span className="text-white">{place.google_rating}</span>
                </div>
              )}
              <span className="text-spotify-green font-semibold">{place.price_level}</span>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              {place.address && (
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin size={16} className="mt-1 text-spotify-green" />
                  <span>{place.address}</span>
                </div>
              )}

              {place.phone && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone size={16} className="text-spotify-green" />
                  <a href={`tel:${place.phone}`} className="hover:text-white transition-colors">
                    {place.phone}
                  </a>
                </div>
              )}

              {place.website && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Globe size={16} className="text-spotify-green" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3 text-gray-300">
                <Clock size={16} className="text-spotify-green" />
                <span>{place.opening_hours}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        {place.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 border border-spotify-green/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-spotify-green/20 text-spotify-green rounded-full text-sm border border-spotify-green/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Images */}
        {place.media.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/30 backdrop-blur-lg rounded-3xl p-6 border border-spotify-green/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {place.media.slice(1).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${place.name} photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
