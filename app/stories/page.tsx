"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import SwipeableStack from "../components/SwipeableStack"
import type { Place } from "../lib/types"

export default function StoriesPage() {
  const [places, setPlaces] = useState<Place[]>([])
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
    setLoading(false)
  }, [router])

  const handleComplete = () => {
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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold mb-4">No encontramos lugares</h2>
            <p className="mb-6 opacity-80">Intenta con otra vibra o ciudad</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-fuchsia-400/60 text-white font-medium hover:bg-white/30 transition-all duration-200"
            >
              Buscar de nuevo
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return <SwipeableStack places={places} mood={mood} onComplete={handleComplete} />
}
