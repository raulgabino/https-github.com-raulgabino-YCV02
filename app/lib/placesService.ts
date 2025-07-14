import type { Place } from "./types"

// Client-side cache
const clientCache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function getPlaces(city: string, vibe?: string, limit = 50): Promise<Place[]> {
  try {
    // Check client-side cache first
    const cacheKey = `${city}-${vibe || "all"}-${limit}`
    const cached = clientCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const params = new URLSearchParams({
      city,
      limit: limit.toString(),
    })

    if (vibe) {
      params.append("vibe", vibe)
    }

    const response = await fetch(`/api/places?${params.toString()}`)

    if (!response.ok) {
      console.error("Failed to fetch places:", response.status)
      return []
    }

    const places: Place[] = await response.json()

    // Cache the results
    clientCache.set(cacheKey, { data: places, timestamp: Date.now() })

    return places
  } catch (error) {
    console.error("Error fetching places:", error)
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
