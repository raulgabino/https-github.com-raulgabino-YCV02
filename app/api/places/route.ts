import { type NextRequest, NextResponse } from "next/server"
import type { Place } from "../../lib/types"

// Cache simple en memoria para reducir llamadas API
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const query = searchParams.get("query")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    // Verificar cache
    const cacheKey = `${city}-${query || "default"}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🚀 Cache hit for: ${cacheKey}`)
      return NextResponse.json(cached.data)
    }

    // Construir URL de Foursquare
    const foursquareUrl = new URL("https://api.foursquare.com/v3/places/search")
    foursquareUrl.searchParams.append("near", city)
    if (query) {
      foursquareUrl.searchParams.append("query", query)
    }
    foursquareUrl.searchParams.append("limit", "50")
    foursquareUrl.searchParams.append("fields", "name,categories,location,geocodes,rating,price,hours,website,tel")

    console.log(`🔍 Foursquare API call: ${foursquareUrl.toString()}`)

    // Llamada a Foursquare API
    const response = await fetch(foursquareUrl.toString(), {
      headers: {
        Authorization: `${process.env.FOURSQUARE_API_KEY}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Foursquare API error: ${response.status}`)
      return NextResponse.json([])
    }

    const foursquareData = await response.json()
    const places = foursquareData.results || []

    // Mapear datos de Foursquare a nuestro tipo Place
    const mappedPlaces: Place[] = places.map((place: any) => ({
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
      opening_hours: place.hours?.display || "",
      tags: generateTags(place),
      review_snippets: [],
      last_checked: new Date().toISOString().split("T")[0],
      media: [],
    }))

    // Guardar en cache
    cache.set(cacheKey, { data: mappedPlaces, timestamp: Date.now() })

    console.log(`✅ Found ${mappedPlaces.length} places for ${city}${query ? ` with query "${query}"` : ""}`)

    return NextResponse.json(mappedPlaces)
  } catch (error) {
    console.error("❌ Error in places API:", error)
    return NextResponse.json([])
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
    if (category.includes("coffee")) tags.push("café", "tranquilo", "productivo")
    if (category.includes("club")) tags.push("fiesta", "baile", "noche")
    if (category.includes("park")) tags.push("aire libre", "relajado")
  }

  // Tags de precio
  if (place.price) {
    if (place.price <= 2) tags.push("económico")
    if (place.price >= 3) tags.push("elegante")
  }

  // Tags de rating
  if (place.rating >= 4.5) tags.push("popular", "recomendado")

  return tags
}
