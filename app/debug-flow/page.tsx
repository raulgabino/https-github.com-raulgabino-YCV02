"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react"

interface DiagnosticStep {
  step: string
  status: string
  data: any
  timestamp: number
}

export default function DebugFlowPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    totalTime: number
    diagnostics: DiagnosticStep[]
    summary?: any
    error?: string
  } | null>(null)

  const runFullDiagnosis = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch("/api/debug-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibe: "romantic dinner spot",
          city: "CDMX",
        }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        totalTime: 0,
        diagnostics: [
          {
            step: "Network Error",
            status: "❌",
            data: { error: error instanceof Error ? error.message : "Unknown error" },
            timestamp: 0,
          },
        ],
        error: "Failed to run diagnosis",
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status.includes("✅")) return <CheckCircle className="w-5 h-5 text-green-400" />
    if (status.includes("❌")) return <XCircle className="w-5 h-5 text-red-400" />
    if (status.includes("⚠️")) return <AlertTriangle className="w-5 h-5 text-yellow-400" />
    return <Clock className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔬 Flow Diagnosis</h1>
          <p className="text-gray-300">Complete diagnostic of the vibe → places pipeline</p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Full Pipeline Test</h2>
            <button
              onClick={runFullDiagnosis}
              disabled={testing}
              className="flex items-center gap-2 px-6 py-3 bg-spotify-green text-black rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              {testing ? "Running..." : "Run Diagnosis"}
            </button>
          </div>

          <div className="text-gray-300 text-sm space-y-1">
            <p>• Tests: "romantic dinner spot" in "CDMX"</p>
            <p>• Checks: API key → Connection → Vibe processing → Search → Results</p>
            <p>• Shows: Exact failure point and detailed logs</p>
          </div>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            {/* Summary */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{results.totalTime}ms</p>
                  <p className="text-gray-400 text-sm">Total Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{results.diagnostics.length}</p>
                  <p className="text-gray-400 text-sm">Steps</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{results.summary?.placesFound || 0}</p>
                  <p className="text-gray-400 text-sm">Places Found</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{results.summary?.overallStatus || "❌"}</p>
                  <p className="text-gray-400 text-sm">Status</p>
                </div>
              </div>
            </div>

            {/* Detailed Steps */}
            {results.diagnostics.map((diagnostic, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-start gap-3 mb-3">
                  {getStatusIcon(diagnostic.status)}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">{diagnostic.step}</h4>
                    <p className="text-gray-400 text-sm">{diagnostic.timestamp}ms from start</p>
                  </div>
                  <span className="text-2xl">{diagnostic.status}</span>
                </div>

                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(diagnostic.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {testing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
              <span className="text-white">Running complete diagnosis...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
