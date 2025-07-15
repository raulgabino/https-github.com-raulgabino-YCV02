import { fsqFetch, type FsqPlace } from "./fetcher"

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
  photos?: any
}

interface SearchParams {
  near: string
  query?: string
  categories?: string
  limit?: number
  radius?: number
  sort?: "DISTANCE" | "POPULARITY" | "RATING"
}

export class FoursquareService {
  private apiKey: string | null = null
  private initialized = false
  private baseUrl = "https://places-api.foursquare.com"

  constructor() {
    // Don't initialize during build time - defer until first use
    if (typeof window === "undefined" && !process.env.NODE_ENV) {
      console.log("🔧 FoursquareService: Deferring initialization until runtime")
      return
    }

    this.initialize()
  }

  private initialize() {
    if (this.initialized) return

    this.apiKey = process.env.FSQ_API_KEY || null

    if (!this.apiKey) {
      console.warn("⚠️ FSQ_API_KEY not found - service will be limited")
      this.initialized = true
      return
    }

    console.log("🔧 FoursquareService initialized:")
    console.log(`   API Key format: ${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`)
    console.log(`   Is v3 format: ${this.apiKey.startsWith("fsq3")}`)

    this.initialized = true
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initialize()
    }

    if (!this.apiKey) {
      throw new Error("FSQ_API_KEY environment variable is required")
    }
  }

  private getHeaders() {
    this.ensureInitialized()
    return {
      Authorization: this.apiKey!,
      Accept: "application/json",
      "User-Agent": "YourCityVibes/1.0",
    }
  }

  async searchPlaces(params: SearchParams): Promise<FsqPlace[]> {
    const requestId = Math.random().toString(36).substr(2, 9)

    try {
      this.ensureInitialized()

      console.log(`🔍 [${requestId}] Foursquare search:`, {
        near: params.near,
        query: params.query,
        categories: params.categories,
        limit: params.limit,
      })

      // Build search parameters
      const searchParams: Record<string, string | number> = {
        near: params.near,
        limit: params.limit || 50,
      }

      if (params.query) {
        searchParams.query = params.query
      }

      if (params.categories) {
        searchParams.categories = params.categories
      }

      if (params.radius) {
        searchParams.radius = params.radius
      }

      if (params.sort) {
        searchParams.sort = params.sort
      }

      // Add fields we want from the API
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

      searchParams.fields = fields

      const startTime = Date.now()
      const response = await fsqFetch("/places/search", searchParams)
      const responseTime = Date.now() - startTime

      const places: FsqPlace[] = response.results || []

      console.log(`✅ [${requestId}] Success: ${places.length} places found in ${responseTime}ms`)

      if (places.length > 0) {
        console.log(`   First result: ${places[0].name} (${places[0].categories?.[0]?.name})`)
      }

      return places
    } catch (error) {
      console.error(`❌ [${requestId}] Search error:`, error)
      return []
    }
  }

  async getPlaceDetails(fsqId: string): Promise<FsqPlace | null> {
    try {
      this.ensureInitialized()
      console.log("🔍 Getting place details for:", fsqId)

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

      const place = await fsqFetch(`/places/${fsqId}`, { fields })

      console.log("✅ Place details retrieved:", place.name)
      return place
    } catch (error) {
      console.error("❌ Error getting place details:", error)
      return null
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    const testId = Math.random().toString(36).substr(2, 9)

    try {
      this.ensureInitialized()
      console.log(`🧪 [${testId}] Testing Foursquare API connection...`)

      const response = await fsqFetch("/places/search", {
        near: "New York",
        limit: 1,
        fields: "fsq_id,name,categories",
      })

      const success = response && response.results && response.results.length >= 0

      console.log(`🧪 [${testId}] Connection test result:`, {
        success,
        resultsCount: response.results?.length || 0,
      })

      return {
        success,
        details: {
          resultsCount: response.results?.length || 0,
          firstResult: response.results?.[0]?.name || "None",
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

  // Check if service is available (has API key)
  isAvailable(): boolean {
    if (!this.initialized) {
      this.initialize()
    }
    return !!this.apiKey
  }

  // Helper method to get category mappings
  static getCategoryMappings() {
    return {
      // Food & Dining
      restaurant: "13065",
      "fast food": "13145",
      cafe: "13032",
      bakery: "13018",
      "ice cream": "13068",

      // Nightlife & Bars
      bar: "13003",
      nightclub: "13002",
      lounge: "13004",
      "cocktail bar": "13003",

      // Entertainment
      "movie theater": "10006",
      "bowling alley": "10003",
      casino: "10004",
      "music venue": "10005",

      // Shopping
      "clothing store": "17016",
      bookstore: "17007",
      "electronics store": "17021",

      // Outdoors & Recreation
      park: "16032",
      gym: "16014",
      "sports club": "16046",

      // Arts & Culture
      museum: "10019",
      "art gallery": "10002",
      theater: "10007",

      // Services
      hotel: "19014",
      hospital: "15014",
      bank: "18005",
    }
  }

  // Build search query with category mapping
  static buildSearchQuery(
    vibeTokens: string[],
    moodGroup: string | null,
  ): {
    query?: string
    categories?: string
  } {
    const categoryMappings = FoursquareService.getCategoryMappings()
    const selectedCategories: string[] = []
    const queryTerms: string[] = []

    // Map vibe tokens to categories or query terms
    vibeTokens.forEach((token) => {
      const lowerToken = token.toLowerCase()

      // Check for direct category matches
      const category = categoryMappings[lowerToken as keyof typeof categoryMappings]
      if (category && !selectedCategories.includes(category)) {
        selectedCategories.push(category)
      } else {
        // Add to query terms if not a category
        queryTerms.push(token)
      }
    })

    // Add mood group categories
    if (moodGroup) {
      const moodCategories = {
        nightlife: [categoryMappings.bar, categoryMappings.nightclub],
        romantic: [categoryMappings.restaurant],
        chill: [categoryMappings.cafe, categoryMappings.bar],
        productive: [categoryMappings.cafe],
        food: [categoryMappings.restaurant, categoryMappings.cafe],
        culture: [categoryMappings.museum, categoryMappings.theater],
        outdoor: [categoryMappings.park],
      }

      const moodCats = moodCategories[moodGroup as keyof typeof moodCategories] || []
      moodCats.forEach((cat) => {
        if (cat && !selectedCategories.includes(cat)) {
          selectedCategories.push(cat)
        }
      })
    }

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

// Create singleton instance with lazy initialization
let foursquareServiceInstance: FoursquareService | null = null

export const foursquareService = new Proxy({} as FoursquareService, {
  get(target, prop) {
    if (!foursquareServiceInstance) {
      foursquareServiceInstance = new FoursquareService()
    }
    return foursquareServiceInstance[prop as keyof FoursquareService]
  },
})

export type { FsqPlace }
