import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"
import type { Place } from "../../lib/types"
import { translateVibe } from "../../lib/vibeTranslator"

// Cache simple en memoria para reducir llamadas API
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Forzar dynamic rendering para este route
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city")
    const query = request.nextUrl.searchParams.get("query")
    const categories = request.nextUrl.searchParams.get("categories")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    // Verificar cache
    const cacheKey = `${city}-${query || "default"}-${categories || ""}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // 🎯 TRADUCCIÓN SEMÁNTICA
    let enhancedQuery = query
    let searchCategories = categories
    let translationUsed = false

    if (query) {
      const translation = await translateVibe(query)

      if (translation.confidence >= 0.7) {
        enhancedQuery = translation.translatedQuery
        searchCategories = translation.categories?.join(",") || categories
        translationUsed = true

        console.log(
          `🔄 Vibe translated: "${query}" → "${enhancedQuery}" (${translation.source}, ${translation.confidence})`,
        )
      }
    }

    // Buscar en Foursquare
    const foursquarePlaces = await foursquareService.searchPlaces({
      near: city,
      query: enhancedQuery || undefined,
      categories: searchCategories || undefined,
      limit: 50,
      sort: "POPULARITY",
    })

    console.log(`📍 Found ${foursquarePlaces.length} places in ${city}${translationUsed ? " (translated)" : ""}`)

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
      tags: generateTags(place, enhancedQuery),
      review_snippets: [],
      last_checked: new Date().toISOString().split("T")[0],
      media: [],
    }))

    // Guardar en cache
    cache.set(cacheKey, { data: mappedPlaces, timestamp: Date.now() })

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

// Generar tags mejorados basados en la categoría y query traducido
function generateTags(place: any, enhancedQuery?: string): string[] {
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
  }

  // Tags del query traducido
  if (enhancedQuery) {
    const queryWords = enhancedQuery.toLowerCase().split(/\s+/)
    queryWords.forEach((word) => {
      if (word.length > 3 && !tags.includes(word)) {
        tags.push(word)
      }
    })
  }

  // Tags de precio
  if (place.price) {
    if (place.price <= 2) tags.push("económico")
    if (place.price >= 3) tags.push("elegante")
  }

  // Tags de rating
  if (place.rating && place.rating >= 4.5) tags.push("popular", "recomendado")

  return [...new Set(tags)] // Remover duplicados
}
