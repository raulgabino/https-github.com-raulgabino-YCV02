"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import StoryCard from "../components/StoryCard"
import type { Place } from "../lib/types"
import { copy } from "../lib/i18n"

export default function StoriesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mood, setMood] = useState("")
  const router = useRouter()

  useEffect(() => {
    const searchResults = sessionStorage.getItem("searchResults")
    const searchMood = sessionStorage.getItem("searchMood")

    if (!searchResults || !searchMood) {
      router.push("/")
      return
    }

    const data = JSON.parse(searchResults)
    setPlaces(data.places || [])
    setMood(searchMood)

    // Generate explanations for each place
    generateExplanations(data.places || [], searchMood)
  }, [router])

  const generateExplanations = async (placesData: Place[], moodData: string) => {
    const newExplanations: Record<string, string> = {}

    for (const place of placesData) {
      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mood: moodData,
            place: place,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          newExplanations[place.name] = data.explanation
        } else {
          newExplanations[place.name] = `${place.name} es perfecto para tu vibra ${moodData} 🔥`
        }
      } catch (error) {
        console.error("Error generating explanation for", place.name, error)
        newExplanations[place.name] = `${place.name} es perfecto para tu vibra ${moodData} 🔥`
      }
    }

    setExplanations(newExplanations)
    setLoading(false)
  }

  const handleSwipe = () => {
    if (currentIndex < places.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleExploreMore = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 p-6">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No encontramos lugares</h2>
          <p className="mb-6 opacity-80">Intenta con otra vibra o ciudad</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-fuchsia-400/60 text-white font-medium hover:bg-white/30 transition-all duration-200"
          >
            Buscar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentIndex < places.length ? (
          <StoryCard
            key={places[currentIndex].name}
            place={places[currentIndex]}
            explanation={explanations[places[currentIndex].name] || ""}
            onSwipe={handleSwipe}
          />
        ) : (
          <motion.div
            key="explore-more"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 p-6"
          >
            <div className="text-center text-white space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">{copy.stories.exploreMore}</h2>
                <p className="text-lg opacity-80 mb-8">¿Listo para otra aventura?</p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onClick={handleExploreMore}
                className="px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-lg border border-fuchsia-400/60 text-white font-medium hover:bg-white/30 transition-all duration-200"
              >
                Buscar nueva vibra
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
