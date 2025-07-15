import type { Place } from "./types"
import { foursquareService, type FsqPlace } from "./foursquareService"

// Convert Foursquare place to our internal Place type
function mapFsqPlaceToPlace(fsqPlace: FsqPlace, city: string): Place {
  return {
    name: fsqPlace.name || "Unknown",
    category: fsqPlace.categories?.[0]?.name || "general",
    city: fsqPlace.location?.locality || city,
    address: fsqPlace.location?.formatted_address || fsqPlace.location?.address || "",
    lat: fsqPlace.geocodes?.main?.latitude || 0,
    lng: fsqPlace.geocodes?.main?.longitude || 0,
    phone: fsqPlace.tel || "",
    website: fsqPlace.website || "",
    google_rating: fsqPlace.rating ? fsqPlace.rating.toString() : "0",
    price_level: mapPriceLevel(fsqPlace.price),
    opening_hours: fsqPlace.hours?.display || "Horarios no disponibles",
    tags: generateTags(fsqPlace),
    review_snippets: [],
    last_checked: new Date().toISOString().split("T")[0],
    media: [],
  }
}

// Map Foursquare price (1-4) to our format
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

// Generate tags from Foursquare place data
function generateTags(fsqPlace: FsqPlace): string[] {
  const tags: string[] = []

  // Category-based tags
  if (fsqPlace.categories?.[0]?.name) {
    const category = fsqPlace.categories[0].name.toLowerCase()
    tags.push(category)

    // Contextual tags based on category
    if (category.includes("restaurant")) tags.push("comida", "cena")
    if (category.includes("bar")) tags.push("bebidas", "noche")
    if (category.includes("coffee") || category.includes("café")) tags.push("café", "tranquilo", "productivo")
    if (category.includes("club") || category.includes("nightlife")) tags.push("fiesta", "baile", "noche")
    if (category.includes("park")) tags.push("aire libre", "relajado")
    if (category.includes("museum")) tags.push("cultura", "arte")
  }

  // Price-based tags
  if (fsqPlace.price) {
    if (fsqPlace.price <= 2) tags.push("económico")
    if (fsqPlace.price >= 3) tags.push("elegante")
  }

  // Rating-based tags
  if (fsqPlace.rating && fsqPlace.rating >= 4.5) tags.push("popular", "recomendado")

  // Verification tag
  if (fsqPlace.verified) tags.push("verificado")

  return [...new Set(tags)] // Remove duplicates
}

export async function getPlaces(city: string, query?: string): Promise<Place[]> {
  try {
    console.log(`🔍 Getting places for city: ${city}, query: ${query}`)

    // Check if Foursquare service is available
    if (!foursquareService.isAvailable()) {
      console.warn("⚠️ Foursquare service not available - returning empty results")
      return []
    }

    // Search places using Foursquare service
    const fsqPlaces = await foursquareService.searchPlaces({
      near: city,
      query: query || undefined,
      limit: 50,
      sort: "POPULARITY",
    })

    // Convert to our internal Place format
    const places = fsqPlaces.map((fsqPlace) => mapFsqPlaceToPlace(fsqPlace, city))

    console.log(`✅ Converted ${places.length} places for ${city}`)
    return places
  } catch (error) {
    console.error("❌ Error in getPlaces:", error)
    return []
  }
}

export async function getPlacesByCity(city: string): Promise<Place[]> {
  return getPlaces(city)
}

export async function getPlaceByName(name: string, city: string): Promise<Place | null> {
  try {
    const places = await getPlaces(city)
    const decodedName = decodeURIComponent(name)
    return (
      places.find(
        (place) =>
          place.name.toLowerCase() === decodedName.toLowerCase() ||
          place.name.toLowerCase().includes(decodedName.toLowerCase()),
      ) || null
    )
  } catch (error) {
    console.error("Error fetching place by name:", error)
    return null
  }
}

export async function getAllPlaces(): Promise<Place[]> {
  return getPlaces("Ciudad Victoria") // Default fallback
}

// Build optimized Foursquare query from vibe tokens
export function buildFoursquareQuery(vibeTokens: string[], moodGroup: string | null): string {
  const { query, categories } = foursquareService.buildSearchQuery(vibeTokens, moodGroup)

  // Combine query and categories for logging
  const parts: string[] = []
  if (query) parts.push(query)
  if (categories) parts.push(`categories:${categories}`)

  const finalQuery = parts.join(" ")
  console.log(`🎯 Built Foursquare query: "${finalQuery}" from tokens:`, vibeTokens)

  return query || "" // Return just the query part for actual search
}
