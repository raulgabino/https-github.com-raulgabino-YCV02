"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, Heart, Bookmark, Clock, TrendingUp } from "lucide-react"
import { getSwipeStats, getTelemetryData, clearTelemetryData } from "../lib/telemetry"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [rawData, setRawData] = useState<any[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const swipeStats = getSwipeStats()
    const telemetryData = getTelemetryData()
    setStats(swipeStats)
    setRawData(telemetryData)
  }

  const handleClearData = () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos de telemetría?")) {
      clearTelemetryData()
      loadStats()
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 flex items-center justify-center">
        <div className="text-white">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 pb-20">
      <div className="p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={32} className="text-white" />
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          <p className="text-white/70">Estadísticas de uso de YourCityVibes</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-400" />
              <span className="text-white/80 text-sm">Total Swipes</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalSwipes}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart size={20} className="text-pink-400" />
              <span className="text-white/80 text-sm">Likes</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.likes}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bookmark size={20} className="text-blue-400" />
              <span className="text-white/80 text-sm">Guardados</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.saves}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-green-400" />
              <span className="text-white/80 text-sm">Tiempo Promedio</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgTimeSpent?.toFixed(1) || 0}s</p>
          </motion.div>
        </div>

        {/* Top Moods */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Top Moods</h3>
          <div className="space-y-3">
            {stats.topMoods.map(([mood, count]: [string, number], index: number) => (
              <div key={mood} className="flex items-center justify-between">
                <span className="text-white capitalize">{mood}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-fuchsia-400 rounded-full"
                      style={{ width: `${(count / stats.totalSwipes) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Cities */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Top Ciudades</h3>
          <div className="space-y-3">
            {stats.topCities.map(([city, count]: [string, number], index: number) => (
              <div key={city} className="flex items-center justify-between">
                <span className="text-white">{city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-400 rounded-full"
                      style={{ width: `${(count / stats.totalSwipes) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex gap-4"
        >
          <button
            onClick={loadStats}
            className="px-6 py-3 rounded-2xl bg-blue-500/30 backdrop-blur-lg border border-blue-400/60 text-white hover:bg-blue-500/40 transition-all duration-200"
          >
            Actualizar
          </button>
          <button
            onClick={handleClearData}
            className="px-6 py-3 rounded-2xl bg-red-500/30 backdrop-blur-lg border border-red-400/60 text-white hover:bg-red-500/40 transition-all duration-200"
          >
            Limpiar Datos
          </button>
        </motion.div>
      </div>
    </div>
  )
}
