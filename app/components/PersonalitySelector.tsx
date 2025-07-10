"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { FEATURED_PERSONALITIES } from "../lib/personalityProfiles"

interface PersonalitySelectorProps {
  city: string
}

export default function PersonalitySelector({ city }: PersonalitySelectorProps) {
  const router = useRouter()

  const handlePersonalityClick = (slug: string) => {
    router.push(`/personalidades/${slug}/${encodeURIComponent(city)}`)
  }

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={24} className="text-fuchsia-400" />
        <h2 className="text-xl font-bold text-white">¿Dónde irían las estrellas?</h2>
      </div>

      <p className="text-white/70 mb-6 text-sm">
        Descubre artículos únicos sobre los lugares que visitarían tus artistas favoritos en {city}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_PERSONALITIES.map((personality, index) => (
          <motion.button
            key={personality.slug}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            onClick={() => handlePersonalityClick(personality.slug)}
            className="group p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                {personality.emoji}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{personality.name}</div>
                <div className="text-white/70 text-sm">{personality.category}</div>
              </div>
            </div>

            <div className="text-white/60 text-sm mb-3">Artículo personalizado • 3-5 min lectura</div>

            <div className="flex items-center gap-2 text-fuchsia-300 text-sm font-medium">
              <Sparkles size={14} />
              <span>Generar artículo AI</span>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-medium">Powered by AI</span>
        </div>
        <p className="text-white/60 text-xs">
          Cada artículo es único y generado en tiempo real basado en el estilo y preferencias de cada artista.
        </p>
      </motion.div>
    </motion.section>
  )
}
