"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, MapPin, Star, DollarSign } from "lucide-react"

interface TestResult {
  city: string
  query: string
  results: any[]
  timestamp: string
  error?: string
}

export default function TestFoursquarePage() {
  const [city, setCity] = useState("Ciudad Victoria")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const testQueries = [
    "restaurant",
    "bar",
    "café",
    "bellakeo",
    "antro",
    "romantic restaurant",
    "nightclub",
    "coffee shop",
  ]

  const handleTest = async (testQuery?: string) => {
    const searchQuery = testQuery || query
    if (!city || !searchQuery) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/places?city=${encodeURIComponent(city)}&query=${encodeURIComponent(searchQuery)}`,
      )
      const data = await response.json()

      const result: TestResult = {
        city,
        query: searchQuery,
        results: Array.isArray(data) ? data : [],
        timestamp: new Date().toISOString(),
        error: response.ok ? undefined : data.error || "Unknown error",
      }

      setResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 results
    } catch (error) {
      const result: TestResult = {
        city,
        query: searchQuery,
        results: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Network error",
      }
      setResults((prev) => [result, ...prev.slice(0, 9)])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-green p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Foursquare API Test</h1>
          <p className="text-gray-300">Test the Foursquare integration with different queries</p>
        </motion.div>

        {/* Test Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white font-medium mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-spotify-green focus:outline-none"
                placeholder="Enter city name"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Query</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-spotify-green focus:outline-none"
                placeholder="Enter search query"
                onKeyPress={(e) => e.key === "Enter" && handleTest()}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleTest()}
              disabled={loading || !city || !query}
              className="flex items-center gap-2 px-6 py-2 bg-spotify-green text-black rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={16} />
              {loading ? "Testing..." : "Test Query"}
            </button>
          </div>

          {/* Quick Test Buttons */}
          <div className="flex flex-wrap gap-2">
            {testQueries.map((testQuery) => (
              <button
                key={testQuery}
                onClick={() => handleTest(testQuery)}
                disabled={loading || !city}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {testQuery}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-6">
          {results.map((result, index) => (
            <motion.div
              key={`${result.timestamp}-${index}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    "{result.query}" in {result.city}
                  </h3>
                  <p className="text-gray-400 text-sm">{new Date(result.timestamp).toLocaleString()}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.error
                      ? "bg-red-500/20 text-red-400"
                      : result.results.length > 0
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {result.error ? "Error" : `${result.results.length} results`}
                </div>
              </div>

              {result.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{result.error}</p>
                </div>
              )}

              {result.results.length > 0 && (
                <div className="grid gap-3">
                  {result.results.slice(0, 5).map((place, placeIndex) => (
                    <div key={placeIndex} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{place.name}</h4>
                          <p className="text-gray-400 text-sm capitalize">{place.category}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {place.google_rating !== "0" && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star size={12} />
                              <span>{place.google_rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-green-400">
                            <DollarSign size={12} />
                            <span>{place.price_level}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <MapPin size={12} />
                        <span>{place.address}</span>
                      </div>

                      {place.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {place.tags.slice(0, 4).map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-spotify-green/20 text-spotify-green rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {result.results.length > 5 && (
                    <p className="text-gray-400 text-sm text-center">
                      ... and {result.results.length - 5} more results
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No tests run yet. Try searching for places above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
