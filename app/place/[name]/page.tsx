"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, MapPin, Phone, Clock, Star, Heart, ExternalLink, Share2 } from "lucide-react"
import type { Place } from "../../lib/types"
import placesData from "../../data/places.json"
import { generateMapsUrl, formatPhoneForWhatsApp } from "../../lib/utils"
import { generatePlaceholderDataURL, getPlaceholderMessage } from "../../lib/placeholders"

interface PlaceDetailPageProps {
  params: { name: string }
}

export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const [place, setPlace] = useState<Place | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    const decodedName = decodeURIComponent(params.name)
    const foundPlace = placesData.find((p) => p.name === decodedName)

    if (foundPlace) {
      setPlace(foundPlace)

      // Check if place is in favorites
      const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
      setIsFavorite(favorites.includes(foundPlace.name))

      // Always use placeholder for MVP
      setImageUrl(generatePlaceholderDataURL(foundPlace.name, foundPlace.category))
    }
  }, [params.name])

  const toggleFavorite = () => {
    if (!place) return

    const favorites = JSON.parse(localStorage.getItem("favoriteIds") || "[]")
    let newFavorites

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== place.name)
    } else {
      newFavorites = [...favorites, place.name]
      const favoritePlaces = JSON.parse(localStorage.getItem("favoritePlaces") || "[]")
      const updatedPlaces = [...favoritePlaces.filter((p: Place) => p.name !== place.name), place]
      localStorage.setItem("favoritePlaces", JSON.stringify(updatedPlaces))
    }

    localStorage.setItem("favoriteIds", JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleCall = () => {
    if (place?.phone) {
      const whatsappUrl = `https://wa.me/${formatPhoneForWhatsApp(place.phone)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  const handleShare = async () => {
    if (!place) return

    const shareData = {
      title: place.name,
      text: `Descubre ${place.name} en YourCityVibes`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Enlace copiado al portapapeles")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Lugar no encontrado</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30 transition-all duration-200"
          >
            Regresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30">
      {/* Header Image */}
      <div className="relative h-80 w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={place.name}
          fill
          className="object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
        >
          <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Title and Rating */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-white mb-2">{place.name}</h1>
          <div className="flex items-center gap-4 text-white/80 mb-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" />
              <span>{place.google_rating}</span>
            </div>
            <span>{place.price_level}</span>
            <span className="capitalize">{place.category}</span>
          </div>
          <p className="text-sm text-white/60 italic">{getPlaceholderMessage()}</p>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap gap-2"
        >
          {place.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-lg text-white text-sm border border-white/30"
            >
              #{tag}
            </span>
          ))}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Address */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-white mt-1" />
              <div>
                <h3 className="text-white font-medium mb-1">Dirección</h3>
                <p className="text-white/80 text-sm">{place.address}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          {place.phone && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-white" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Teléfono</h3>
                    <p className="text-white/80 text-sm">{place.phone}</p>
                  </div>
                </div>
                <button
                  onClick={handleCall}
                  className="px-4 py-2 rounded-xl bg-green-500/30 border border-green-400/60 text-white text-sm hover:bg-green-500/40 transition-all duration-200"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* Hours */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-white mt-1" />
              <div>
                <h3 className="text-white font-medium mb-1">Horarios</h3>
                <p className="text-white/80 text-sm">{place.opening_hours}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {place.review_snippets.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-medium mb-3">Reseñas</h3>
              <div className="space-y-2">
                {place.review_snippets.map((review, index) => (
                  <p key={index} className="text-white/80 text-sm italic">
                    "{review}"
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 gap-4 pb-20"
        >
          <button
            onClick={() => window.open(generateMapsUrl(place.lat, place.lng, place.name), "_blank")}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-500/30 backdrop-blur-lg border border-blue-400/60 text-white hover:bg-blue-500/40 transition-all duration-200"
          >
            <MapPin size={18} />
            <span className="font-medium">Ver en Maps</span>
          </button>

          {place.website ? (
            <button
              onClick={() => window.open(place.website, "_blank")}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-500/30 backdrop-blur-lg border border-purple-400/60 text-white hover:bg-purple-500/40 transition-all duration-200"
            >
              <ExternalLink size={18} />
              <span className="font-medium">Sitio Web</span>
            </button>
          ) : (
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-500/30 backdrop-blur-lg border border-purple-400/60 text-white hover:bg-purple-500/40 transition-all duration-200"
            >
              <Share2 size={18} />
              <span className="font-medium">Compartir</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
