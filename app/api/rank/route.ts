import { type NextRequest, NextResponse } from "next/server"
import { levenshteinDistance } from "../../lib/utils"
import placesData from "../../data/places.json"
import tokensData from "../../data/tokens.json"

export async function POST(request: NextRequest) {
  try {
    const { mood, city } = await request.json()

    if (!mood || !city) {
      return NextResponse.json({ error: "Mood and city are required" }, { status: 400 })
    }

    // Normalize mood input
    const moodTokens = Array.isArray(mood) ? mood.map((m) => m.toLowerCase().trim()) : [mood.toLowerCase().trim()]

    // Filter places by city
    const cityPlaces = placesData.filter((place) => place.city === city)

    if (cityPlaces.length === 0) {
      return NextResponse.json({ error: "No places found for this city" }, { status: 404 })
    }

    // Calculate scores for each place
    const scoredPlaces = cityPlaces.map((place) => {
      let totalScore = 0

      moodTokens.forEach((moodToken) => {
        // Find matching or similar tokens
        const matchingTokens = tokensData.filter((token) => {
          return token.token === moodToken || levenshteinDistance(token.token, moodToken) <= 2
        })

        // Calculate score based on tag presence and token weight
        matchingTokens.forEach((token) => {
          const tagPresence = place.tags.filter(
            (tag) => tag.toLowerCase().includes(token.token) || token.token.includes(tag.toLowerCase()),
          ).length

          if (tagPresence > 0) {
            totalScore += token.peso * tagPresence
          }
        })
      })

      // Boost score for high-rated places
      const rating = Number.parseFloat(place.google_rating)
      if (rating >= 4.6) {
        totalScore *= 1.1
      }

      return {
        ...place,
        score: totalScore,
      }
    })

    // Sort by score and return top 3
    const topPlaces = scoredPlaces
      .filter((place) => place.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...place }) => place)

    return NextResponse.json({
      places: topPlaces,
      total: topPlaces.length,
    })
  } catch (error) {
    console.error("Error in rank API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
