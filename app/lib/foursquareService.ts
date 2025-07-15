interface FoursquarePlace {
  fsq_id: string
  name: string
  categories: Array<{
    id: number
    name: string
    short_name: string
    plural_name: string
    icon: {
      prefix: string
      suffix: string
    }
  }>
  location: {
    address?: string
    locality?: string
    region?: string
    postcode?: string
    country?: string
    formatted_address?: string
    cross_street?: string
  }
  geocodes: {
    main: {
      latitude: number
      longitude: number
    }
    roof?: {
      latitude: number
      longitude: number
    }
  }
  rating?: number
  price?: number
  hours?: {
    display?: string
    is_local_holiday?: boolean
    open_now?: boolean
    regular?: Array<{
      close: string
      day: number
      open: string
    }>
  }
  website?: string
  tel?: string
  email?: string
  social_media?: {
    facebook_id?: string
    instagram?: string
    twitter?: string
  }
  verified?: boolean
  closed_bucket?: string
  distance?: number
}

interface FoursquareResponse {
  results: FoursquarePlace[]
  context?: {
    geo_bounds?: {
      circle: {
        center: {
          latitude: number
          longitude: number
        }
        radius: number
      }
    }
  }
}

export class FoursquareService {
  private apiKey: string
  private baseUrl = "https://api.foursquare.com/v3"

  constructor() {
    this.apiKey = process.env.FOURSQUARE_API_KEY || ""
    if (!this.apiKey) {
      console.error("❌ FOURSQUARE_API_KEY not found in environment variables")
    }
  }

  private getHeaders() {
    return {
      Authorization: this.apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  }

  async searchPlaces(params: {
    near: string
    query?: string
    categories?: string
    limit?: number
    radius?: number
    sort?: "DISTANCE" | "POPULARITY" | "RATING"
  }): Promise<FoursquarePlace[]> {
    try {
      const url = new URL(`${this.baseUrl}/places/search`)

      // Parámetros básicos
      url.searchParams.append("near", params.near)
      url.searchParams.append("limit", (params.limit || 50).toString())

      // Parámetros opcionales
      if (params.query) {
        url.searchParams.append("query", params.query)
      }

      if (params.categories) {
        url.searchParams.append("categories", params.categories)
      }

      if (params.radius) {
        url.searchParams.append("radius", params.radius.toString())
      }

      if (params.sort) {
        url.searchParams.append("sort", params.sort)
      }

      // Campos que queremos obtener
      const fields = [
        "fsq_id",
        "name",
        "categories",
        "location",
        "geocodes",
        "rating",
        "price",
        "hours",
        "website",
        "tel",
        "email",
        "social_media",
        "verified",
        "closed_bucket",
        "distance",
      ].join(",")

      url.searchParams.append("fields", fields)

      console.log("🔍 Foursquare API Request:", {
        url: url.toString(),
        headers: this.getHeaders(),
      })

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Foursquare API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`)
      }

      const data: FoursquareResponse = await response.json()
      console.log("✅ Foursquare API Response:", {
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0]?.name || "None",
      })

      return data.results || []
    } catch (error) {
      console.error("❌ Error in Foursquare search:", error)
      return []
    }
  }

  async getPlaceDetails(fsqId: string): Promise<FoursquarePlace | null> {
    try {
      const url = `${this.baseUrl}/places/${fsqId}`
      const fields = [
        "fsq_id",
        "name",
        "categories",
        "location",
        "geocodes",
        "rating",
        "price",
        "hours",
        "website",
        "tel",
        "email",
        "social_media",
        "verified",
        "closed_bucket",
        "photos",
      ].join(",")

      const response = await fetch(`${url}?fields=${fields}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Foursquare API error: ${response.status}`)
      }

      const data: FoursquarePlace = await response.json()
      return data
    } catch (error) {
      console.error("❌ Error getting place details:", error)
      return null
    }
  }

  // Categorías populares de Foursquare
  static getPopularCategories() {
    return {
      restaurants: "13065", // Restaurant
      bars: "13003", // Bar
      cafes: "13032", // Café
      nightlife: "13002", // Nightlife Spot
      shopping: "17000", // Retail
      arts: "10000", // Arts & Entertainment
      outdoors: "16000", // Outdoors & Recreation
      hotels: "19014", // Hotel
      services: "18000", // Professional & Other Places
      food: "13000", // Food
    }
  }

  // Construir query inteligente basado en tokens de vibe
  static buildSearchQuery(
    vibeTokens: string[],
    moodGroup: string | null,
  ): {
    query?: string
    categories?: string
  } {
    const categories = FoursquareService.getPopularCategories()

    // Mapeo de vibes a categorías de Foursquare
    const vibeToCategory: Record<string, string> = {
      bellakeo: categories.nightlife,
      perrea: categories.nightlife,
      antro: categories.nightlife,
      bar: categories.bars,
      restaurante: categories.restaurants,
      café: categories.cafes,
      coffee: categories.cafes,
      comida: categories.food,
      shopping: categories.shopping,
      arte: categories.arts,
      cultura: categories.arts,
      parque: categories.outdoors,
      hotel: categories.hotels,
    }

    const selectedCategories: string[] = []
    const queryTerms: string[] = []

    // Buscar categorías específicas
    vibeTokens.forEach((token) => {
      const category = vibeToCategory[token.toLowerCase()]
      if (category && !selectedCategories.includes(category)) {
        selectedCategories.push(category)
      } else {
        queryTerms.push(token)
      }
    })

    // Si no hay categorías específicas, usar términos de búsqueda
    const result: { query?: string; categories?: string } = {}

    if (selectedCategories.length > 0) {
      result.categories = selectedCategories.join(",")
    }

    if (queryTerms.length > 0) {
      result.query = queryTerms.join(" ")
    }

    return result
  }
}

export const foursquareService = new FoursquareService()
