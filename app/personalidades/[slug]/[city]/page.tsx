"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, MapPin, Share2, Sparkles } from "lucide-react"
import { getPersonalityProfile } from "../../../lib/personalityProfiles"
import ReactMarkdown from "react-markdown"

interface ArticleMetadata {
  personality: string
  city: string
  places_count: number
  reading_time: string
  word_count: number
  generated_at: string
  places_featured: Array<{ name: string; category: string }>
}

export default function PersonalityArticlePage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [metadata, setMetadata] = useState<ArticleMetadata | null>(null)

  const personality = params.slug as string
  const city = params.city as string
  const profile = getPersonalityProfile(personality)

  useEffect(() => {
    if (personality && city) {
      generateArticle()
    }
  }, [personality, city])

  const generateArticle = async () => {
    setLoading(true)
    setError("")

    try {
      console.log(`🎭 Requesting article for ${personality} in ${city}`)

      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality, city }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate article")
      }

      setArticle(data.article)
      setMetadata(data.metadata)
      console.log("✅ Article generated successfully")
    } catch (error) {
      console.error("❌ Error generating article:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.name} en ${city} - YourCityVibes`,
      text: `Descubre dónde visitaría ${profile?.name} en ${city}`,
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

  const handleExploreSwipe = () => {
    router.push(`/?city=${encodeURIComponent(city)}&mode=swipe`)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/20 to-fuchsia-600/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Personalidad no encontrada</h2>
          <button onClick={() => router.back()} className="px-6 py-3 bg-purple-600 text-white rounded-lg">
            Regresar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/20 to-fuchsia-600/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, ${profile.color_scheme.primary}, ${profile.color_scheme.secondary})`,
              }}
            >
              {profile.emoji}
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Cargando artículo personalizado...</h2>
          <p className="text-gray-600 mb-4">
            Creando la ruta perfecta de {profile.name} en {city}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles size={16} />
            <span>Esto puede tomar 30-60 segundos</span>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/20 to-fuchsia-600/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold mb-4">Error al generar artículo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={generateArticle}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Regresar</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Header */}
        <div className="px-4 py-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${profile.color_scheme.primary}, ${profile.color_scheme.secondary})`,
                }}
              >
                {profile.emoji}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Ruta de {profile.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{metadata?.reading_time} de lectura</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={16} />
                    <span>{metadata?.places_count} lugares</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Places Preview */}
            {metadata?.places_featured && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Lugares destacados:</h3>
                <div className="flex flex-wrap gap-2">
                  {metadata.places_featured.map((place, index) => (
                    <span key={index} className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                      {place.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="prose prose-lg max-w-none mb-12"
          >
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mb-4 mt-8 text-gray-900">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mb-3 mt-6 text-gray-900">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              }}
            >
              {article}
            </ReactMarkdown>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div
              className="p-8 rounded-2xl text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${profile.color_scheme.primary}, ${profile.color_scheme.secondary})`,
              }}
            >
              <h3 className="text-2xl font-bold mb-4">¿Listo para explorar estos lugares?</h3>
              <p className="mb-6 opacity-90">Descubre más lugares en {city} con nuestro modo swipe interactivo</p>
              <button
                onClick={handleExploreSwipe}
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <span>Explorar en Modo Swipe</span>
                {profile.emoji}
              </button>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gray-100 rounded-lg p-6 text-sm text-gray-600"
          >
            <p>
              <strong>Disclaimer:</strong> Este artículo es una interpretación editorial basada en el estilo público y
              preferencias conocidas de {profile.name}. No implica endorsement real ni lugares visitados confirmados. El
              contenido es creado para fines de entretenimiento e inspiración.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
