"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

export default function FoursquareLogsPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/foursquare-status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        diagnostics: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 10000) // Every 10 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    if (status.includes("✅")) return <CheckCircle className="w-5 h-5 text-green-400" />
    if (status.includes("❌")) return <XCircle className="w-5 h-5 text-red-400" />
    if (status.includes("⚠️")) return <AlertCircle className="w-5 h-5 text-yellow-400" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔍 Foursquare API Status</h1>
          <p className="text-gray-300">Real-time monitoring of Foursquare API integration</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Live Diagnostics</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (10s)
              </label>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-spotify-green text-black rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {status?.timestamp && (
            <p className="text-gray-400 text-sm">Last updated: {new Date(status.timestamp).toLocaleString()}</p>
          )}
        </motion.div>

        {/* Status Summary */}
        {status?.summary && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{status.overallStatus}</p>
                <p className="text-gray-400 text-sm">Overall Status</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{status.summary.successRate}</p>
                <p className="text-gray-400 text-sm">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{status.summary.totalTime}</p>
                <p className="text-gray-400 text-sm">Total Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {status.summary.successfulTests}/{status.summary.totalTests}
                </p>
                <p className="text-gray-400 text-sm">Tests Passed</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Diagnostics */}
        {status?.diagnostics && (
          <div className="space-y-4">
            {status.diagnostics.map((diagnostic: any, index: number) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getStatusIcon(diagnostic.status)}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">{diagnostic.step}</h4>
                    <p className="text-gray-400 text-sm">{diagnostic.timestamp}ms</p>
                  </div>
                  <span className="text-xl">{diagnostic.status}</span>
                </div>

                {diagnostic.details && (
                  <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                    <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {loading && !status && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
              <span className="text-white">Loading diagnostics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
