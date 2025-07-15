import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"
import type { Place } from "../../lib/types"
import { semanticTranslator } from "../../lib/semanticTranslator"

// Cache simple en memoria para reducir llamadas API
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Forzar dynamic rendering para este route
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log("🚀 /api/places GET called")

  try {
    // ARREGLADO: Usar searchParams directamente en lugar de new URL(request.url)
    const city = request.nextUrl.searchParams.get("city")
    const query = request.nextUrl.searchParams.get("query")
    const categories = request.nextUrl.searchParams.get("categories")

    console.log("📝 Places API params:", { city, query, categories })

    if (!city) {
      console.log("❌ Missing city parameter")
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    // Verificar cache
    const cacheKey = `${city}-${query || "default"}-${categories || ""}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🚀 Cache hit for: ${cacheKey}`)
      return NextResponse.json(cached.data)
    }

    console.log(`🔍 Searching places in ${city} with query: "${query || "none"}"`)

    // Semantic translation
    let enhancedQuery = query
    let translationUsed = false

    if (query && semanticTranslator.needsTranslation(query)) {
      const translation = semanticTranslator.translateQuery(query)
      enhancedQuery = translation.translatedQuery
      translationUsed = true

      console.log(`🔄 Semantic translation: "${query}" → "${enhancedQuery}"`)
      console.log(`📊 Translation confidence: ${(translation.confidence * 100).toFixed(1)}%`)
    }

    // Buscar en Foursquare
    const foursquarePlaces = await foursquareService.searchPlaces({
      near: city,
      query: enhancedQuery || undefined,
      categories: categories || undefined,
      limit: 50,
      sort: "POPULARITY",
    })

    console.log(`📍 Foursquare returned ${foursquarePlaces.length} places`)

    // Mapear datos de Foursquare a nuestro tipo Place
    const mappedPlaces: Place[] = foursquarePlaces.map((place) => ({
      name: place.name || "Unknown",
      category: place.categories?.[0]?.name || "general",
      city: place.location?.locality || city,
      address: place.location?.formatted_address || place.location?.address || "",
      lat: place.geocodes?.main?.latitude || 0,
      lng: place.geocodes?.main?.longitude || 0,
      phone: place.tel || "",
      website: place.website || "",
      google_rating: place.rating ? place.rating.toString() : "0",
      price_level: mapPriceLevel(place.price),
      opening_hours: place.hours?.display || "Horarios no disponibles",
      tags: generateTags(place),
      review_snippets: [],
      last_checked: new Date().toISOString().split("T")[0],
      media: [],
    }))

    // Guardar en cache
    cache.set(cacheKey, { data: mappedPlaces, timestamp: Date.now() })

    console.log(
      `✅ Returning ${mappedPlaces.length} places for ${city}${translationUsed ? " (with semantic translation)" : ""}`,
    )

    return NextResponse.json(mappedPlaces)
  } catch (error) {
    console.error("❌ Error in places API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch places",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// Mapear precio de Foursquare (1-4) a nuestro formato
function mapPriceLevel(price?: number): string {
  if (!price) return "$"
  switch (price) {
    case 1:
      return "$"
    case 2:
      return "$$"
    case 3:
      return "$$$"
    case 4:
      return "$$$$"
    default:
      return "$"
  }
}

// Generar tags basados en la categoría y otros datos
function generateTags(place: any): string[] {
  const tags: string[] = []

  // Tags de categoría
  if (place.categories?.[0]?.name) {
    const category = place.categories[0].name.toLowerCase()
    tags.push(category)

    // Tags contextúales por categoría
    if (category.includes("restaurant")) tags.push("comida", "cena")
    if (category.includes("bar")) tags.push("bebidas", "noche")
    if (category.includes("coffee") || category.includes("café")) tags.push("café", "tranquilo", "productivo")
    if (category.includes("club") || category.includes("nightlife")) tags.push("fiesta", "baile", "noche")
    if (category.includes("park")) tags.push("aire libre", "relajado")
    if (category.includes("museum")) tags.push("cultura", "arte")
    if (category.includes("theater")) tags.push("cultura", "entretenimiento")
  }

  // Tags de precio
  if (place.price) {
    if (place.price <= 2) tags.push("económico")
    if (place.price >= 3) tags.push("elegante")
  }

  // Tags de rating
  if (place.rating && place.rating >= 4.5) tags.push("popular", "recomendado")

  // Tags de verificación
  if (place.verified) tags.push("verificado")

  // Tags de horario
  if (place.hours?.open_now) tags.push("abierto")

  return [...new Set(tags)] // Remover duplicados
}
