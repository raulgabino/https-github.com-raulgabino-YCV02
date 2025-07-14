import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput, calculateRelevanceScore } from "../../lib/vibeProcessor"
import { validateVibeCategory, getVibeFromTokens } from "../../lib/categoryValidator"
import { getPlaces, buildFoursquareQuery } from "../../lib/placesService"

export async function POST(request: NextRequest) {
  try {
    const { mood, city } = await request.json()

    console.log("🚀 API /rank called with:", { mood, city })

    if (!mood || !city) {
      console.log("❌ Missing mood or city")
      return NextResponse.json({ error: "Mood and city are required" }, { status: 400 })
    }

    // Procesar vibe input
    const { tokens: vibeTokens, moodGroup } = processVibeInput(mood)
    console.log("🎯 Processed vibe tokens:", vibeTokens)
    console.log("🎭 Mood group:", moodGroup)

    // Construir query inteligente para Foursquare
    const foursquareQuery = buildFoursquareQuery(vibeTokens, moodGroup)
    console.log("🔍 Foursquare query:", foursquareQuery)

    // Obtener lugares desde Foursquare
    const allPlaces = await getPlaces(city, foursquareQuery)
    console.log(`🏙️ Found ${allPlaces.length} places from Foursquare`)

    if (allPlaces.length === 0) {
      console.log("❌ No places found from Foursquare")
      return NextResponse.json({
        places: [],
        message: `No encontramos lugares en ${city}. Intenta con otra ciudad.`,
        fallback: true,
        debug: {
          originalMood: mood,
          processedTokens: vibeTokens,
          foursquareQuery,
          cityPlacesCount: 0,
          categoryValidCount: 0,
        },
      })
    }

    // VALIDACIÓN CATEGÓRICA (más flexible para datos de Foursquare)
    const primaryVibe = getVibeFromTokens(vibeTokens)
    console.log("🔍 Primary vibe detected:", primaryVibe)

    const categoryValidPlaces = allPlaces.filter((place) => {
      const isValid = validateVibeCategory(primaryVibe, place)
      console.log(`${place.name} (${place.category}): ${isValid ? "✅ Valid" : "❌ Invalid"} for ${primaryVibe}`)
      return isValid
    })

    console.log(`🎯 Places after category validation: ${categoryValidPlaces.length}`)

    // Si no hay lugares válidos, usar lógica más flexible
    let finalPlaces = categoryValidPlaces
    if (categoryValidPlaces.length === 0) {
      console.log("⚠️ No category-valid places, using flexible matching")
      finalPlaces = allPlaces.slice(0, 10) // Tomar los primeros 10 de Foursquare
    }

    // Calcular relevance scores
    const scoredPlaces = finalPlaces.map((place) => {
      const relevance = calculateRelevanceScore(place, vibeTokens, moodGroup)
      console.log(`📊 ${place.name}: relevance=${relevance.toFixed(2)}, tags=[${place.tags.join(", ")}]`)
      return {
        ...place,
        relevance,
      }
    })

    // Filtrar por relevancia mínima (más flexible)
    const relevantPlaces = scoredPlaces.filter((place) => place.relevance >= 0.5)
    console.log(`🎯 Found ${relevantPlaces.length} relevant places (relevance >= 0.5)`)

    // Ordenar por relevancia
    const sortedPlaces = relevantPlaces.sort((a, b) => b.relevance - a.relevance)

    // Tomar top 3
    const topPlaces = sortedPlaces.slice(0, 3)
    console.log(
      "🏆 Final places:",
      topPlaces.map((p) => ({ name: p.name, relevance: p.relevance?.toFixed(2) || "N/A" })),
    )

    // Remover relevance del response final
    const cleanPlaces = topPlaces.map(({ relevance, ...place }) => place)

    return NextResponse.json({
      places: cleanPlaces,
      total: cleanPlaces.length,
      debug: {
        originalMood: mood,
        processedTokens: vibeTokens,
        moodGroup,
        foursquareQuery,
        cityPlacesCount: allPlaces.length,
        relevantPlacesCount: relevantPlaces.length,
        topScores: topPlaces.map((p) => ({
          name: p.name,
          relevance: p.relevance?.toFixed(2) || "N/A",
        })),
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
