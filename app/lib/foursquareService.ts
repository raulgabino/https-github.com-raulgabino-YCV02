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
      console.error(
        "📋 Available env vars:",
        Object.keys(process.env).filter((key) => key.includes("FOURSQUARE")),
      )
    } else {
      console.log("✅ Foursquare API Key loaded:", `${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`)
      console.log("🔑 API Key length:", this.apiKey.length)

      // ACTUALIZADO: Verificar formato de API key
      if (this.apiKey.startsWith("fsq3")) {
        console.log("✅ API Key format: Valid v3 format")
      } else if (this.apiKey.length === 48) {
        console.warn("⚠️ API Key appears to be v2 format - this might not work with v3 endpoints")
        console.warn("🔄 Consider upgrading to v3 API key from developer.foursquare.com")
      } else {
        console.warn("⚠️ API Key format unknown - length:", this.apiKey.length)
      }
    }
  }

  private getHeaders() {
    return {
      Authorization: this.apiKey,
      Accept: "application/json",
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
        method: "GET",
        headers: {
          ...this.getHeaders(),
          Authorization: `${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`,
        },
      })

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log("📡 Foursquare API Response Status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Foursquare API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          url: url.toString(),
        })

        // Diagnóstico específico por código de error
        if (response.status === 401) {
          console.error("🔐 401 Unauthorized - Posibles causas:")
          console.error("   • API Key inválida o expirada")
          console.error("   • API Key v2 usada en endpoint v3")
          console.error("   • Formato de header Authorization incorrecto")
          console.error("   • API Key no tiene permisos para Places API")
        } else if (response.status === 403) {
          console.error("🚫 403 Forbidden - Posibles causas:")
          console.error("   • API Key sin permisos para este endpoint")
          console.error("   • Restricciones de dominio o IP")
          console.error("   • Plan de API insuficiente")
        } else if (response.status === 429) {
          console.error("⏰ 429 Rate Limited - Posibles causas:")
          console.error("   • Demasiadas requests por minuto/hora")
          console.error("   • Límites del plan de API alcanzados")
        }

        throw new Error(`Foursquare API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: FoursquareResponse = await response.json()
      console.log("✅ Foursquare API Success:", {
        resultsCount: data.results?.length || 0,
        firstResult: data.results?.[0]?.name || "None",
        sampleCategories: data.results?.slice(0, 3).map((r) => r.categories?.[0]?.name) || [],
      })

      return data.results || []
    } catch (error) {
      console.error("❌ Error in Foursquare search:", error)

      // Diagnóstico adicional para errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("🌐 Network Error - Posibles causas:")
        console.error("   • Problemas de conectividad")
        console.error("   • CORS issues en v0.dev")
        console.error("   • URL base incorrecta")
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
    try {
      console.log("🧪 Testing Foursquare API connection...")

      const testUrl = `${this.baseUrl}/places/search?near=New York&limit=1`
      const response = await fetch(testUrl, {
        method: "GET",
        headers: this.getHeaders(),
      })

      const responseText = await response.text()

      return {
        success: response.ok,
        error: response.ok ? undefined : `${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText.substring(0, 500), // Primeros 500 caracteres
          apiKeyFormat: this.apiKey.startsWith("fsq3") ? "v3" : "v2 or unknown",
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error },
      }
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
export type { FoursquarePlace }
