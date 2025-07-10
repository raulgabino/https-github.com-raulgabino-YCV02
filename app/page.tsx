"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import CitySelect from "./components/CitySelect"
import VibeInput from "./components/VibeInput"
import { copy } from "./lib/i18n"

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("Ciudad Victoria")
  const router = useRouter()

  const handleSearch = async (mood: string) => {
    try {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          city: selectedCity,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store results in sessionStorage for the stories page
        sessionStorage.setItem("searchResults", JSON.stringify(data))
        sessionStorage.setItem("searchMood", mood)
        router.push("/stories")
      } else {
        console.error("Error searching places")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold text-white"
          >
            {copy.landing.title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg text-white/80"
          >
            {copy.landing.subtitle}
          </motion.p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-6 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-lg"
        >
          <CitySelect onCityChange={setSelectedCity} defaultCity="Ciudad Victoria" />

          <VibeInput onSearch={handleSearch} city={selectedCity} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm">Versión 2025-07-10 • MVP</p>
        </motion.div>
      </motion.div>
    </main>
  )
}
