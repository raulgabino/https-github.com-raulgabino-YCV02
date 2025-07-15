import { type NextRequest, NextResponse } from "next/server"
import { foursquareService, type FoursquarePlace } from "../../lib/foursquareService"
import type { Place } from "../../lib/types"

// Importar el traductor semántico al inicio del archivo
import { semanticTranslator } from "../../lib/semanticTranslator"

// Cache simple en memoria para reducir llamadas API
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const query = searchParams.get("query")
    const categories = searchParams.get("categories")

    if (!city) {
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

    // Después de obtener los parámetros, antes de la llamada a Foursquare:
    let enhancedQuery = query
    let translationUsed = false

    if (query && semanticTranslator.needsTranslation(query)) {
      const translation = semanticTranslator.translateQuery(query)
      enhancedQuery = translation.translatedQuery
      translationUsed = true

      console.log(`🔄 Semantic translation: "${query}" → "${enhancedQuery}"`)
      console.log(`📊 Translation confidence: ${(translation.confidence * 100).toFixed(1)}%`)
    }

    // Usar enhancedQuery en lugar de query para la búsqueda de Foursquare:
    const foursquarePlaces = await foursquareService.searchPlaces({
      near: city,
      query: enhancedQuery || undefined,
      categories: categories || undefined,
      limit: 50,
      sort: "POPULARITY",
    })

    // Mapear datos de Foursquare a nuestro tipo Place
    const mappedPlaces: Place[] = foursquarePlaces.map((place: FoursquarePlace) => ({
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

    // Al final, antes del return, agregar información de debug:
    console.log(
      `✅ Found ${mappedPlaces.length} places for ${city}${translationUsed ? " (with semantic translation)" : ""}`,
    )

    return NextResponse.json(mappedPlaces)
  } catch (error) {
    console.error("❌ Error in places API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch places",
        details: error instanceof Error ? error.message : "Unknown error",
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
function generateTags(place: FoursquarePlace): string[] {
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
