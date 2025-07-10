import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput, calculateRelevanceScore } from "../../lib/vibeProcessor"
import placesData from "../../data/places.json"
import { validateVibeCategory, getVibeFromTokens, getAvailableVibes } from "../../lib/categoryValidator"

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

    // VALIDACIÓN CATEGÓRICA ESTRICTA
    const primaryVibe = getVibeFromTokens(vibeTokens)
    console.log("🔍 Primary vibe detected:", primaryVibe)

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

    // FILTRAR por validación categórica PRIMERO
    const categoryValidPlaces = cityPlaces.filter((place) => {
      const isValid = validateVibeCategory(primaryVibe, place)
      console.log(`${place.name} (${place.category}): ${isValid ? "✅ Valid" : "❌ Invalid"} for ${primaryVibe}`)
      return isValid
    })

    console.log(`🎯 Places after category validation: ${categoryValidPlaces.length}`)

    if (categoryValidPlaces.length === 0) {
      console.log("❌ No category-valid places found, returning empty")
      return NextResponse.json({
        places: [],
        message: `No hay lugares de ${primaryVibe} disponibles en ${city}. Intenta con otra ciudad o cambia tu vibe.`,
        suggestion: `Vibes disponibles: ${getAvailableVibes().join(", ")}`,
        fallback: true,
        debug: {
          originalMood: mood,
          detectedVibe: primaryVibe,
          cityPlacesCount: cityPlaces.length,
          categoryValidCount: categoryValidPlaces.length,
        },
      })
    }

    // Calcular relevance scores SOLO en lugares válidos
    const scoredPlaces = categoryValidPlaces.map((place) => {
      const relevance = calculateRelevanceScore(place, vibeTokens, moodGroup)
      console.log(`📊 ${place.name}: relevance=${relevance.toFixed(2)}, tags=[${place.tags.join(", ")}]`)
      return {
        ...place,
        relevance,
      }
    })

    // SUBIR umbral mínimo para mayor calidad
    const relevantPlaces = scoredPlaces.filter((place) => place.relevance >= 1.5)
    console.log(`🎯 Found ${relevantPlaces.length} relevant places (relevance >= 1.5)`)

    // Ordenar por relevancia
    const sortedPlaces = relevantPlaces.sort((a, b) => b.relevance - a.relevance)

    let finalPlaces = sortedPlaces.slice(0, 3)

    // FALLBACK MEJORADO: Solo si no hay suficientes con alta relevancia
    if (finalPlaces.length < 3) {
      console.log(`⚠️ Only ${finalPlaces.length} high-relevance places found, adding popular places`)

      // Agregar lugares populares (mejor rating) que no estén ya incluidos
      const usedNames = new Set(finalPlaces.map((p) => p.name))
      const popularPlaces = categoryValidPlaces
        .filter((place) => !usedNames.has(place.name))
        .sort((a, b) => Number.parseFloat(b.google_rating) - Number.parseFloat(a.google_rating))
        .slice(0, 3 - finalPlaces.length)
        .map((place) => ({ ...place, relevance: 1.0 })) // Score mínimo para fallback

      finalPlaces = [...finalPlaces, ...popularPlaces]
    }

    console.log(
      "🏆 Final 3 places:",
      finalPlaces.map((p) => ({ name: p.name, relevance: p.relevance?.toFixed(2) || "N/A" })),
    )

    // Remover relevance del response final
    const cleanPlaces = finalPlaces.map(({ relevance, ...place }) => place)

    return NextResponse.json({
      places: cleanPlaces,
      total: cleanPlaces.length,
      debug: {
        originalMood: mood,
        processedTokens: vibeTokens,
        moodGroup,
        cityPlacesCount: cityPlaces.length,
        relevantPlacesCount: relevantPlaces.length,
        topScores: finalPlaces.map((p) => ({
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
