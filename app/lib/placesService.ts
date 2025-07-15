import type { Place } from "./types"
import { FoursquareService } from "./foursquareService"

export async function getPlaces(city: string, query?: string): Promise<Place[]> {
  try {
    // Construir URL robusta (funciona en browser, v0.dev, localhost)
    const searchParams = new URLSearchParams({ city })
    if (query) searchParams.append("query", query)

    const baseUrl =
      typeof window !== "undefined"
        ? "" // path relativo en navegador
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"

    const requestUrl = `${baseUrl}/api/places?${searchParams.toString()}`
    console.log(`🔍 Fetching places: ${requestUrl}`)

    const response = await fetch(requestUrl, {
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

// Función helper mejorada para construir query inteligente
export function buildFoursquareQuery(vibeTokens: string[], moodGroup: string | null): string {
  const { query, categories } = FoursquareService.buildSearchQuery(vibeTokens, moodGroup)

  // Combinar query y categorías en un string para la URL
  const parts: string[] = []
  if (query) parts.push(query)
  if (categories) parts.push(`categories:${categories}`)

  const finalQuery = parts.join(" ")
  console.log(`🎯 Built Foursquare query: "${finalQuery}" from tokens:`, vibeTokens)

  return finalQuery
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
