"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Users } from "lucide-react"
import { getAllPersonalities } from "../lib/personalityProfiles"

export default function PersonalitiesPage() {
  const router = useRouter()
  const personalities = getAllPersonalities()

  const handlePersonalityClick = (slug: string) => {
    // Redirect to city selection or default city
    router.push(`/personalidades/${slug}/Ciudad Victoria`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 pb-20">
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Regresar</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Users size={32} className="text-white" />
            <h1 className="text-3xl font-bold text-white">Personalidades</h1>
          </div>
          <p className="text-white/70 text-lg">
            Descubre dónde visitarían tus artistas favoritos en diferentes ciudades
          </p>
        </motion.div>

        {/* Personalities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personalities.map((personality, index) => (
            <motion.button
              key={personality.name}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onClick={() =>
                handlePersonalityClick(
                  Object.keys(require("../lib/personalityProfiles").PERSONALITY_PROFILES).find(
                    (key) => require("../lib/personalityProfiles").PERSONALITY_PROFILES[key] === personality,
                  ) || "",
                )
              }
              className="group p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${personality.color_scheme.primary}, ${personality.color_scheme.secondary})`,
                  }}
                >
                  {personality.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{personality.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{personality.real_name}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                      {personality.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">{personality.bio_snippet}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {personality.lifestyle.slice(0, 3).map((trait) => (
                    <span key={trait} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                      #{trait}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-fuchsia-300 text-sm font-medium">
                  <Sparkles size={14} />
                  <span>Generar artículo</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={24} className="text-fuchsia-400" />
            <h2 className="text-xl font-bold text-white">¿Cómo funciona?</h2>
          </div>

          <div className="space-y-3 text-white/80">
            <p>• Selecciona tu artista favorito</p>
            <p>• Elige una ciudad para explorar</p>
            <p>• Recibe un artículo único generado por IA</p>
            <p>• Descubre lugares que encajan con su estilo</p>
            <p>• Explora los lugares en modo swipe</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
