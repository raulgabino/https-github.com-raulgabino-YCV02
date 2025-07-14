"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, DollarSign } from "lucide-react"
import { getPlaceByName } from "@/app/lib/placesService"
import type { Place } from "@/app/lib/types"

interface Props {
  params: { name: string }
  searchParams: { city?: string }
}

export default function PlaceDetailPage({ params, searchParams }: Props) {
  const router = useRouter()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const placeName = decodeURIComponent(params.name)
  const city = searchParams.city || ""

  useEffect(() => {
    async function fetchPlace() {
      try {
        setLoading(true)
        setError(null)

        if (!city) {
          setError("City parameter is required")
          return
        }

        const foundPlace = await getPlaceByName(placeName, city)

        if (!foundPlace) {
          setError("Place not found")
          return
        }

        setPlace(foundPlace)
      } catch (err) {
        console.error("Error fetching place:", err)
        setError("Failed to load place details")
      } finally {
        setLoading(false)
      }
    }

    fetchPlace()
  }, [placeName, city])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-6 w-1/3"></div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8">
              <div className="h-12 bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded mb-6 w-2/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-spotify-green hover:text-green-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || "Place Not Found"}</h1>
            <p className="text-gray-300 mb-6">
              {error === "Place not found"
                ? `We couldn't find "${placeName}" in ${city}. It might not be available in our current data.`
                : "There was an error loading the place details. Please try again."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-spotify-green text-black px-6 py-3 rounded-full font-semibold hover:bg-green-400 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-spotify-green hover:text-green-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{place.name}</h1>
            <p className="text-xl text-gray-300 capitalize mb-4">{place.category}</p>

            {/* Rating and Price */}
            <div className="flex items-center gap-4 mb-4">
              {place.google_rating !== "0" && (
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-semibold">{place.google_rating}</span>
                </div>
              )}

              <div className="flex items-center gap-1 bg-spotify-green/20 px-3 py-1 rounded-full">
                <DollarSign className="w-4 h-4 text-spotify-green" />
                <span className="text-spotify-green font-semibold">{place.price_level}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {place.tags.slice(0, 6).map((tag, index) => (
                <span key={index} className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm capitalize">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Contact & Location</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-spotify-green mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">{place.address}</p>
                    <p className="text-gray-400 text-sm">{place.city}</p>
                  </div>
                </div>

                {place.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-spotify-green flex-shrink-0" />
                    <a href={`tel:${place.phone}`} className="text-gray-300 hover:text-spotify-green transition-colors">
                      {place.phone}
                    </a>
                  </div>
                )}

                {place.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-spotify-green flex-shrink-0" />
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-spotify-green transition-colors break-all"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-spotify-green mt-1 flex-shrink-0" />
                  <p className="text-gray-300">{place.opening_hours}</p>
                </div>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Location</h2>

              {/* Simple map placeholder - you could integrate with Google Maps or similar */}
              <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                <MapPin className="w-12 h-12 text-spotify-green mx-auto mb-3" />
                <p className="text-gray-300 mb-2">Coordinates</p>
                <p className="text-sm text-gray-400">
                  {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
                </p>
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
                    window.open(url, "_blank")
                  }}
                  className="mt-4 bg-spotify-green text-black px-4 py-2 rounded-full font-semibold hover:bg-green-400 transition-colors"
                >
                  Open in Maps
                </button>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          {place.media && place.media.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {place.media.slice(0, 6).map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`${place.name} photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm">Last updated: {place.last_checked}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
