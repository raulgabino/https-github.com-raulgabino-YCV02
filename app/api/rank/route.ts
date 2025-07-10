import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput, calculateScore } from "../../lib/vibeProcessor"
import placesData from "../../data/places.json"

export async function POST(request: NextRequest) {
  try {
    const { mood, city } = await request.json()

    console.log("🚀 API /rank called with:", { mood, city })

    if (!mood || !city) {
      console.log("❌ Missing mood or city")
      return NextResponse.json({ error: "Mood and city are required" }, { status: 400 })
    }

    // Procesar vibe input
    const vibeTokens = processVibeInput(mood)
    console.log("🎯 Processed vibe tokens:", vibeTokens)

    // Filtrar por ciudad (más flexible)
    const cityPlaces = placesData.filter(
      (place) =>
        place.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(place.city.toLowerCase()),
    )
    console.log(`🏙️ Found ${cityPlaces.length} places in ${city}`)

    if (cityPlaces.length === 0) {
      console.log("❌ No places found for city:", city)
      return NextResponse.json(
        {
          error: "No places found for this city",
          availableCities: [...new Set(placesData.map((p) => p.city))],
        },
        { status: 404 },
      )
    }

    // Calcular scores
    const scoredPlaces = cityPlaces.map((place) => {
      const score = calculateScore(place.tags, vibeTokens)
      console.log(`📊 ${place.name}: score=${score}, tags=[${place.tags.join(", ")}]`)
      return {
        ...place,
        score,
      }
    })

    // Ordenar por score y tomar top 3
    const topPlaces = scoredPlaces.sort((a, b) => b.score - a.score).slice(0, 3)

    console.log(
      "🏆 Top places with scores:",
      topPlaces.map((p) => ({ name: p.name, score: p.score })),
    )

    // FALLBACK: Si todos tienen score 0, retornar lugares populares (mejor rating)
    if (topPlaces.every((p) => p.score === 0)) {
      console.log("⚠️ All scores are 0, using fallback (best rated places)")
      const fallbackPlaces = cityPlaces
        .sort((a, b) => Number.parseFloat(b.google_rating) - Number.parseFloat(a.google_rating))
        .slice(0, 3)
        .map(({ score, ...place }) => place) // Remove score property

      return NextResponse.json({
        places: fallbackPlaces,
        total: fallbackPlaces.length,
        fallback: true,
        message: `No exact matches found for "${mood}", showing popular places in ${city}`,
      })
    }

    // Remover score del response final
    const finalPlaces = topPlaces.map(({ score, ...place }) => place)

    return NextResponse.json({
      places: finalPlaces,
      total: finalPlaces.length,
      debug: {
        originalMood: mood,
        processedTokens: vibeTokens,
        cityPlacesCount: cityPlaces.length,
        topScores: topPlaces.map((p) => ({ name: p.name, score: p.score })),
      },
    })
  } catch (error) {
    console.error("❌ Error in rank API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
