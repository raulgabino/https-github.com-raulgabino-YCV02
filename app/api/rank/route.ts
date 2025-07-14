import { type NextRequest, NextResponse } from "next/server"
import { getPlaces } from "@/app/lib/placesService"
import { processVibe } from "@/app/lib/vibeProcessor"
import { validateCategory } from "@/app/lib/categoryValidator"

export async function POST(request: NextRequest) {
  try {
    const { vibe, city, personality } = await request.json()

    if (!vibe || !city) {
      return NextResponse.json({ error: "Vibe and city are required" }, { status: 400 })
    }

    console.log("🎯 Ranking request:", { vibe, city })

    // Process the vibe to extract keywords and sentiment
    const processedVibe = processVibe(vibe)

    // Create a more descriptive query for Foursquare by joining keywords
    const foursquareQuery = processedVibe.keywords.join(" ")
    console.log("🔍 Foursquare query:", foursquareQuery)

    // Get places from Foursquare API using the descriptive query
    const allPlaces = await getPlaces(city, foursquareQuery)

    if (allPlaces.length === 0) {
      return NextResponse.json({
        places: [],
        explanation: `No places found in ${city}. Try a different city or check your internet connection.`,
        vibe_analysis: processedVibe,
      })
    }

    console.log(`🏙️ Found ${allPlaces.length} places in ${city}`)

    // Filter places based on vibe keywords and validate categories
    const relevantPlaces = allPlaces.filter((place) => {
      const isValidCategory = validateCategory(place.category, processedVibe.keywords)
      const hasRelevantTags = place.tags.some((tag) =>
        processedVibe.keywords.some(
          (keyword) =>
            tag.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(tag.toLowerCase()),
        ),
      )

      return isValidCategory || hasRelevantTags
    })

    // If no relevant places found, use all places but with lower confidence
    const placesToRank = relevantPlaces.length > 0 ? relevantPlaces : allPlaces.slice(0, 20)

    console.log(`🎯 Using ${placesToRank.length} places for ranking`)

    // Simple scoring algorithm
    const scoredPlaces = placesToRank.map((place) => {
      let score = 0

      // Score based on keyword matches in tags
      processedVibe.keywords.forEach((keyword) => {
        place.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2
          }
        })

        // Score based on category match
        if (place.category.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1
        }

        // Score based on name match
        if (place.name.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.5
        }
      })

      // Bonus for high rating
      const rating = Number.parseFloat(place.google_rating)
      if (rating >= 4.5) score += 1
      else if (rating >= 4.0) score += 0.5

      return { place, score }
    })

    // Sort by score and take top 10
    const topPlaces = scoredPlaces
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.place)

    const explanation = `Found ${topPlaces.length} great matches for "${vibe}" in ${city}! These places align well with your vibe based on their categories, tags, and ratings.`

    return NextResponse.json({
      places: topPlaces,
      explanation,
      vibe_analysis: processedVibe,
    })
  } catch (error) {
    console.error("Error in rank API:", error)
    return NextResponse.json(
      {
        places: [],
        explanation: "Sorry, there was an error processing your request. Please try again.",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
