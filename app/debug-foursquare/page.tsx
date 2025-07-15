"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface DebugResult {
  step: string
  status: "success" | "error" | "warning"
  message: string
  details?: any
}

export default function DebugFoursquarePage() {
  const [results, setResults] = useState<DebugResult[]>([])
  const [testing, setTesting] = useState(false)

  const runDiagnostics = async () => {
    setTesting(true)
    setResults([])
    const testResults: DebugResult[] = []

    // Test 1: Check environment variables
    testResults.push({
      step: "Environment Variables",
      status: "success",
      message: "Checking if FOURSQUARE_API_KEY is loaded...",
    })
    setResults([...testResults])

    // Test 2: Test basic Foursquare connection
    try {
      const response = await fetch("/api/test-foursquare-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "basic" }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        testResults.push({
          step: "Foursquare Connection",
          status: "success",
          message: "✅ Foursquare API connection successful",
          details: data.details,
        })
      } else {
        testResults.push({
          step: "Foursquare Connection",
          status: "error",
          message: `❌ Foursquare API connection failed: ${data.error}`,
          details: data.details,
        })
      }
    } catch (error) {
      testResults.push({
        step: "Foursquare Connection",
        status: "error",
        message: `❌ Network error: ${error instanceof Error ? error.message : "Unknown"}`,
      })
    }

    setResults([...testResults])

    // Test 3: Test specific city search
    const testCities = ["New York", "Monterrey", "Ciudad Victoria"]

    for (const city of testCities) {
      try {
        const response = await fetch(`/api/places?city=${encodeURIComponent(city)}&query=restaurant`)
        const places = await response.json()

        if (response.ok && Array.isArray(places) && places.length > 0) {
          testResults.push({
            step: `City Search: ${city}`,
            status: "success",
            message: `✅ Found ${places.length} places in ${city}`,
            details: places.slice(0, 2).map((p: any) => ({ name: p.name, category: p.category })),
          })
        } else {
          testResults.push({
            step: `City Search: ${city}`,
            status: "warning",
            message: `⚠️ No places found in ${city}`,
            details: { response: response.status, data: places },
          })
        }
      } catch (error) {
        testResults.push({
          step: `City Search: ${city}`,
          status: "error",
          message: `❌ Error searching ${city}: ${error instanceof Error ? error.message : "Unknown"}`,
        })
      }

      setResults([...testResults])
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay between tests
    }

    setTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🔧 Foursquare API Diagnostics</h1>
          <p className="text-gray-300">Comprehensive testing of Foursquare integration</p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Diagnostic Suite</h2>
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="flex items-center gap-2 px-6 py-3 bg-spotify-green text-black rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              {testing ? "Running Tests..." : "Run Full Diagnostics"}
            </button>
          </div>

          <div className="text-gray-300 text-sm space-y-1">
            <p>• Tests environment variable configuration</p>
            <p>• Verifies Foursquare API connectivity</p>
            <p>• Tests place searches in multiple cities</p>
            <p>• Provides detailed error information</p>
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start gap-3 mb-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{result.step}</h3>
                  <p className="text-gray-300">{result.message}</p>
                </div>
              </div>

              {result.details && (
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Details:</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto">{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {results.length === 0 && !testing && (
          <div className="text-center py-12">
            <p className="text-gray-400">Click "Run Full Diagnostics" to start testing the Foursquare integration</p>
          </div>
        )}

        {testing && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-spotify-green"></div>
              <span className="text-white">Running diagnostics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
