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

    // Enhanced logging for debugging
    console.log("🔧 FoursquareService initialization:")
    console.log(`   API Key exists: ${!!this.apiKey}`)

    if (this.apiKey) {
      console.log(`   API Key format: ${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`)
      console.log(`   API Key length: ${this.apiKey.length}`)
      console.log(`   Is v3 format: ${this.apiKey.startsWith("fsq3")}`)
    } else {
      console.error("❌ FOURSQUARE_API_KEY missing!")
      console.log(
        "   Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("FOURSQUARE")),
      )
    }
  }

  private getHeaders() {
    return {
      Authorization: this.apiKey,
      Accept: "application/json",
      "User-Agent": "YourCityVibes/1.0",
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
    const requestId = Math.random().toString(36).substr(2, 9)

    try {
      console.log(`🔍 [${requestId}] Foursquare search starting:`, {
        near: params.near,
        query: params.query,
        categories: params.categories,
        limit: params.limit,
      })

      const url = new URL(`${this.baseUrl}/places/search`)

      // Build parameters
      url.searchParams.append("near", params.near)
      url.searchParams.append("limit", (params.limit || 50).toString())

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

      // Fields we want
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

      console.log(`🌐 [${requestId}] Request URL:`, url.toString())
      console.log(`🔑 [${requestId}] Headers:`, {
        ...this.getHeaders(),
        Authorization: `${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`,
      })

      const startTime = Date.now()
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      const responseTime = Date.now() - startTime
      console.log(`⏱️ [${requestId}] Response time: ${responseTime}ms`)
      console.log(`📡 [${requestId}] Response status: ${response.status} ${response.statusText}`)

      // Log response headers for debugging
      console.log(`📋 [${requestId}] Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [${requestId}] Foursquare API Error:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url.toString(),
        })

        // Specific error diagnostics
        if (response.status === 401) {
          console.error(`🔐 [${requestId}] 401 Unauthorized - Possible causes:`)
          console.error("   • Invalid or expired API key")
          console.error("   • Wrong API version (v2 key on v3 endpoint)")
          console.error("   • Incorrect Authorization header format")
        } else if (response.status === 403) {
          console.error(`🚫 [${requestId}] 403 Forbidden - Possible causes:`)
          console.error("   • API key lacks permissions for this endpoint")
          console.error("   • Rate limits exceeded")
          console.error("   • Domain/IP restrictions")
        } else if (response.status === 429) {
          console.error(`⏰ [${requestId}] 429 Rate Limited`)
        }

        throw new Error(`Foursquare API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: FoursquareResponse = await response.json()
      const resultsCount = data.results?.length || 0

      console.log(`✅ [${requestId}] Success:`, {
        resultsCount,
        firstResult: data.results?.[0]?.name || "None",
        sampleCategories: data.results?.slice(0, 3).map((r) => r.categories?.[0]?.name) || [],
      })

      return data.results || []
    } catch (error) {
      console.error(`❌ [${requestId}] Search error:`, error)

      // Network error diagnostics
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(`🌐 [${requestId}] Network Error - Possible causes:`)
        console.error("   • Connectivity issues")
        console.error("   • CORS problems")
        console.error("   • Invalid base URL")
      }

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

      console.log("🔍 Getting place details:", `${url}?fields=${fields}`)

      const response = await fetch(`${url}?fields=${fields}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Place details error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`Foursquare API error: ${response.status}`)
      }

      const data: FoursquarePlace = await response.json()
      console.log("✅ Place details retrieved:", data.name)
      return data
    } catch (error) {
      console.error("❌ Error getting place details:", error)
      return null
    }
  }

  // Test de conectividad básica
  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    const testId = Math.random().toString(36).substr(2, 9)

    try {
      console.log(`🧪 [${testId}] Testing Foursquare API connection...`)

      const testUrl = `${this.baseUrl}/places/search?near=New York&limit=1`
      const response = await fetch(testUrl, {
        method: "GET",
        headers: this.getHeaders(),
      })

      const responseText = await response.text()

      console.log(`🧪 [${testId}] Connection test result:`, {
        status: response.status,
        statusText: response.statusText,
        bodyLength: responseText.length,
      })

      return {
        success: response.ok,
        error: response.ok ? undefined : `${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 500),
          apiKeyFormat: this.apiKey.startsWith("fsq3") ? "v3" : "v2 or unknown",
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error(`❌ [${testId}] Connection test failed:`, error)

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: {
          error: error instanceof Error ? error.stack : error,
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  // Categorías populares de Foursquare
  static getPopularCategories() {
    return {
      restaurants: "13065",
      bars: "13003",
      cafes: "13032",
      nightlife: "13002",
      shopping: "17000",
      arts: "10000",
      outdoors: "16000",
      hotels: "19014",
      services: "18000",
      food: "13000",
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

    vibeTokens.forEach((token) => {
      const category = vibeToCategory[token.toLowerCase()]
      if (category && !selectedCategories.includes(category)) {
        selectedCategories.push(category)
      } else {
        queryTerms.push(token)
      }
    })

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
export type { FoursquarePlace }
