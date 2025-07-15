"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, CheckCircle, XCircle, Clock, MapPin, TrendingUp } from "lucide-react"

interface DiagnosticResult {
  test: string
  query: string
  city: string
  success: boolean
  count: number
  error?: string
  places?: any[]
  duration: number
}

interface DiagnosticStats {
  totalTests: number
  successfulTests: number
  totalPlaces: number
  avgDuration: number
  successRate: number
}

export default function TestDiagnosisPage() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [stats, setStats] = useState<DiagnosticStats | null>(null)
  const [currentTest, setCurrentTest] = useState("")

  const diagnosticTests = [
    { type: "Spanish Slang", query: "bellakeo", city: "Monterrey", expected: "Nightlife venues" },
    { type: "Spanish Slang", query: "perreo", city: "Monterrey", expected: "Dance clubs" },
    { type: "Spanish", query: "romántico", city: "Ciudad Victoria", expected: "Romantic restaurants" },
    { type: "Spanish", query: "café tranquilo", city: "Ciudad Victoria", expected: "Quiet cafes" },
    { type: "English", query: "nightclub", city: "Monterrey", expected: "Night clubs" },
    { type: "English", query: "romantic restaurant", city: "Ciudad Victoria", expected: "Romantic dining" },
    { type: "English", query: "coffee shop", city: "Ciudad Victoria", expected: "Coffee shops" },
    { type: "Mixed", query: "bar con música", city: "Monterrey", expected: "Music bars" },
    { type: "Category", query: "restaurant", city: "Ciudad Victoria", expected: "Restaurants" },
    { type: "Activity", query: "dancing", city: "Monterrey", expected: "Dance venues" },
  ]

  const runDiagnostics = async () => {
    setRunning(true)
    setResults([])
    setCurrentTest("")

    const testResults: DiagnosticResult[] = []

    for (const test of diagnosticTests) {
      setCurrentTest(`${test.type}: "${test.query}" in ${test.city}`)

      const startTime = Date.now()

      try {
        const response = await fetch(
          `/api/places?city=${encodeURIComponent(test.city)}&query=${encodeURIComponent(test.query)}`,
        )

        const duration = Date.now() - startTime
        const data = await response.json()

        const result: DiagnosticResult = {
          test: test.type,
          query: test.query,
          city: test.city,
          success: response.ok && Array.isArray(data) && data.length > 0,
          count: Array.isArray(data) ? data.length : 0,
          error: response.ok ? undefined : data.error || "Unknown error",
          places: Array.isArray(data) ? data.slice(0, 3) : [],
          duration,
        }

        testResults.push(result)
        setResults([...testResults])

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        const duration = Date.now() - startTime
        testResults.push({
          test: test.type,
          query: test.query,
          city: test.city,
          success: false,
          count: 0,
          error: error instanceof Error ? error.message : "Network error",
          duration,
        })
        setResults([...testResults])
      }
    }

    // Calculate stats
    const totalTests = testResults.length
    const successfulTests = testResults.filter((r) => r.success).length
    const totalPlaces = testResults.reduce((sum, r) => sum + r.count, 0)
    const avgDuration = testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests
    const successRate = (successfulTests / totalTests) * 100

    setStats({
      totalTests,
      successfulTests,
      totalPlaces,
      avgDuration,
      successRate,
    })

    setRunning(false)
    setCurrentTest("")
  }

  const getConclusion = () => {
    if (!stats) return null

    if (stats.successRate >= 80) {
      return {
        type: "success",
        title: "✅ Excelente integración",
        message: "La API de Foursquare está funcionando correctamente. Buena cobertura semántica.",
      }
    } else if (stats.successRate >= 60) {
      return {
        type: "warning",
        title: "⚠️ Integración parcial",
        message: "Funciona bien pero podría mejorar la comprensión de términos en español.",
      }
    } else {
      return {
        type: "error",
        title: "❌ Problemas detectados",
        message: "La integración necesita ajustes. Revisar configuración de API key y queries.",
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 pb-20">
      <div className="p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Diagnóstico Semántico</h1>
          <p className="text-white/70">
            Prueba la comprensión de términos en español vs inglés en la API de Foursquare
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Suite de Pruebas</h2>
            <button
              onClick={runDiagnostics}
              disabled={running}
              className="flex items-center gap-2 px-6 py-3 bg-fuchsia-500/30 backdrop-blur-lg border border-fuchsia-400/60 text-white rounded-2xl hover:bg-fuchsia-500/40 transition-all duration-200 disabled:opacity-50"
            >
              <Play size={16} />
              {running ? "Ejecutando..." : "Ejecutar Diagnóstico"}
            </button>
          </div>

          {currentTest && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                <span className="text-blue-300 text-sm">Probando: {currentTest}</span>
              </div>
            </div>
          )}

          <div className="text-white/80 text-sm">
            <p>• {diagnosticTests.length} pruebas programadas</p>
            <p>• Incluye términos en español, inglés y slang latino</p>
            <p>• Mide velocidad de respuesta y calidad de resultados</p>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-white/80 text-sm">Éxito</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-blue-400" />
                <span className="text-white/80 text-sm">Lugares</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPlaces}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-yellow-400" />
                <span className="text-white/80 text-sm">Velocidad</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.avgDuration.toFixed(0)}ms</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} className="text-purple-400" />
                <span className="text-white/80 text-sm">Pruebas</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.successfulTests}/{stats.totalTests}
              </p>
            </div>
          </motion.div>
        )}

        {/* Conclusion */}
        {stats && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
          >
            {(() => {
              const conclusion = getConclusion()
              if (!conclusion) return null

              return (
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{conclusion.title}</h3>
                  <p className="text-white/80">{conclusion.message}</p>
                </div>
              )
            })()}
          </motion.div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <div>
                    <span className="text-white font-medium">
                      {result.test}: "{result.query}"
                    </span>
                    <p className="text-white/60 text-sm">{result.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{result.count} lugares</p>
                  <p className="text-white/60 text-sm">{result.duration}ms</p>
                </div>
              </div>

              {result.error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-2 mb-3">
                  <p className="text-red-300 text-sm">{result.error}</p>
                </div>
              )}

              {result.places && result.places.length > 0 && (
                <div className="grid gap-2">
                  {result.places.map((place, placeIndex) => (
                    <div key={placeIndex} className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{place.name}</span>
                        <span className="text-white/60 text-xs">{place.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {results.length === 0 && !running && (
          <div className="text-center py-12">
            <p className="text-white/60">Haz clic en "Ejecutar Diagnóstico" para comenzar las pruebas</p>
          </div>
        )}
      </div>
    </div>
  )
}
