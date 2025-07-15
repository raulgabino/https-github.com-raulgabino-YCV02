import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput, calculateRelevanceScore } from "../../lib/vibeProcessor"
import { validateVibeCategory, getVibeFromTokens } from "../../lib/categoryValidator"
import { getPlaces } from "../../lib/placesService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood, city, vibe } = body
    const searchTerm = vibe || mood

    if (!searchTerm || !city) {
      return NextResponse.json({ error: "Vibe/mood and city are required" }, { status: 400 })
    }

    // 🎯 Procesar vibe con traducción semántica
    const { tokens: vibeTokens, moodGroup, translation } = await processVibeInput(searchTerm)

    console.log(`🎯 Processed "${searchTerm}": ${vibeTokens.length} tokens, group: ${moodGroup}`)
    if (translation?.source === "dictionary" || translation?.source === "gpt") {
      console.log(`🔄 Translation: "${searchTerm}" → "${translation.translatedQuery}" (${translation.confidence})`)
    }

    // Obtener lugares usando query traducido si está disponible
    const searchQuery = translation?.confidence >= 0.7 ? translation.translatedQuery : searchTerm
    const allPlaces = await getPlaces(city, searchQuery)

    if (allPlaces.length === 0) {
      return NextResponse.json({
        places: [],
        message: `No encontramos lugares en ${city}. Intenta con otra ciudad.`,
        fallback: true,
      })
    }

    // Validación categórica flexible
    const primaryVibe = getVibeFromTokens(vibeTokens)
    const categoryValidPlaces = allPlaces.filter((place) => validateVibeCategory(primaryVibe, place))

    // Si no hay lugares válidos, usar lógica más flexible
    const finalPlaces = categoryValidPlaces.length > 0 ? categoryValidPlaces : allPlaces.slice(0, 10)

    // Calcular relevance scores
    const scoredPlaces = finalPlaces.map((place) => ({
      ...place,
      relevance: calculateRelevanceScore(place, vibeTokens, moodGroup),
    }))

    // Filtrar y ordenar por relevancia
    const relevantPlaces = scoredPlaces
      .filter((place) => place.relevance >= 0.5)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)

    // Limpiar response
    const cleanPlaces = relevantPlaces.map(({ relevance, ...place }) => place)

    return NextResponse.json({
      places: cleanPlaces,
      total: cleanPlaces.length,
      explanation: `Encontramos ${cleanPlaces.length} lugares perfectos para "${searchTerm}" en ${city}`,
      translation:
        translation?.source !== "fallback"
          ? {
              original: searchTerm,
              translated: translation?.translatedQuery,
              source: translation?.source,
              confidence: translation?.confidence,
            }
          : undefined,
    })
  } catch (error) {
    console.error("❌ Error in rank API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Rank API is working",
    timestamp: new Date().toISOString(),
  })
}
