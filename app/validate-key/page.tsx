"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Key } from "lucide-react"

interface ValidationResult {
  valid: boolean
  validation: {
    exists: boolean
    length: number
    format: string
    isV3Format: boolean
    fullKeyPreview: string
    allFsqEnvVars: string[]
  }
  errors: string[]
  recommendation: string
  timestamp: string
}

export default function ValidateKeyPage() {
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const validateKey = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/validate-fsq-key")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        valid: false,
        validation: {
          exists: false,
          length: 0,
          format: "ERROR",
          isV3Format: false,
          fullKeyPreview: "ERROR",
          allFsqEnvVars: [],
        },
        errors: [error instanceof Error ? error.message : "Network error"],
        recommendation: "Check your connection and try again",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    validateKey()
  }, [])

  const getStatusIcon = (valid: boolean) => {
    if (valid) return <CheckCircle className="w-8 h-8 text-green-400" />
    return <XCircle className="w-8 h-8 text-red-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Key size={32} className="text-spotify-green" />
            <h1 className="text-3xl font-bold text-white">FSQ API Key Validator</h1>
          </div>
          <p className="text-gray-300">Strict validation of Foursquare v3 API key format and integrity</p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">API Key Analysis</h2>
            <button
              onClick={validateKey}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-spotify-green text-black rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Validating..." : "Validate Key"}
            </button>
          </div>

          {result?.timestamp && (
            <p className="text-gray-400 text-sm">Last checked: {new Date(result.timestamp).toLocaleString()}</p>
          )}
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6">
            {/* Status Summary */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-4 mb-4">
                {getStatusIcon(result.valid)}
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {result.valid ? "✅ Valid API Key" : "❌ Invalid API Key"}
                  </h3>
                  <p className="text-gray-300">{result.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">📋 Detailed Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exists:</span>
                    <span className={result.validation.exists ? "text-green-400" : "text-red-400"}>
                      {result.validation.exists ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-white">{result.validation.length} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white font-mono text-sm">{result.validation.format}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">V3 Format:</span>
                    <span className={result.validation.isV3Format ? "text-green-400" : "text-red-400"}>
                      {result.validation.isV3Format ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Preview:</span>
                    <span className="text-white font-mono text-sm">{result.validation.fullKeyPreview}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            {result.validation.allFsqEnvVars.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">🔍 Found FSQ Environment Variables</h3>
                <div className="space-y-2">
                  {result.validation.allFsqEnvVars.map((envVar, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-spotify-green">•</span>
                      <span className="text-white font-mono">{envVar}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-red-400 mb-4">❌ Validation Errors</h3>
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-red-300">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {loading && !result && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
              <span className="text-white">Validating API key...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
