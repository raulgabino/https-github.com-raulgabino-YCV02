import type { Place } from "./types"

export async function getPlaces(city: string, query?: string): Promise<Place[]> {
  try {
    // Construir URL para nuestro endpoint
    const url = new URL("/api/places", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    url.searchParams.append("city", city)
    if (query) {
      url.searchParams.append("query", query)
    }

    console.log(`🔍 Fetching places: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`❌ Places service error: ${response.status}`)
      return []
    }

    const places: Place[] = await response.json()
    console.log(`✅ Places service returned ${places.length} places`)

    return places
  } catch (error) {
    console.error("❌ Error in places service:", error)
    return []
  }
}

// Función helper para construir query inteligente a partir de tokens
export function buildFoursquareQuery(vibeTokens: string[], moodGroup: string | null): string {
  const queryParts: string[] = []

  // Categorías principales que Foursquare entiende bien
  const categoryKeywords = ["restaurant", "bar", "café", "club", "park", "museum", "hotel"]
  const moodKeywords = ["romantic", "casual", "elegant", "cozy", "trendy", "quiet"]
  const activityKeywords = ["dinner", "lunch", "drinks", "coffee", "dancing", "shopping"]

  // Priorizar categorías
  const foundCategories = vibeTokens.filter((token) =>
    categoryKeywords.some((cat) => token.toLowerCase().includes(cat)),
  )

  // Priorizar actividades
  const foundActivities = vibeTokens.filter((token) =>
    activityKeywords.some((act) => token.toLowerCase().includes(act)),
  )

  // Priorizar moods
  const foundMoods = vibeTokens.filter((token) => moodKeywords.some((mood) => token.toLowerCase().includes(mood)))

  // Construir query en orden de importancia
  if (foundActivities.length > 0) queryParts.push(foundActivities[0])
  if (foundMoods.length > 0) queryParts.push(foundMoods[0])
  if (foundCategories.length > 0) queryParts.push(foundCategories[0])

  // Fallback: usar primeros 2-3 tokens más relevantes
  if (queryParts.length === 0) {
    queryParts.push(...vibeTokens.slice(0, 2))
  }

  const query = queryParts.join(" ")
  console.log(`🎯 Built Foursquare query: "${query}" from tokens:`, vibeTokens)

  return query
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
