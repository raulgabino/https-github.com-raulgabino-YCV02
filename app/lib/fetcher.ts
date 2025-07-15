// Foursquare v3 API Fetcher with build-time safety
const FSQ_BASE_URL = "https://places-api.foursquare.com"

// Foursquare Place type based on v3 API response
export interface FsqPlace {
  fsq_id: string
  name: string
  location: {
    address?: string
    locality?: string
    region?: string
    postcode?: string
    country?: string
    formatted_address?: string
    cross_street?: string
  }
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

// Foursquare v3 API fetcher with runtime API key check
export async function fsqFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  // Check for API key at runtime, not build time
  const apiKey = process.env.FSQ_API_KEY
  if (!apiKey) {
    throw new Error("❌ FSQ_API_KEY environment variable is required")
  }

  // Strict validation of API key format
  if (!apiKey.startsWith("fsq3")) {
    throw new Error(`❌ Invalid FSQ_API_KEY format. Expected fsq3..., got: ${apiKey.substring(0, 8)}...`)
  }

  if (apiKey.length < 32) {
    throw new Error(`❌ FSQ_API_KEY too short. Expected ≥32 chars, got: ${apiKey.length}`)
  }

  // Debug: Log the authorization format being used
  console.log("🔍 API Key validation passed:")
  console.log(`   Length: ${apiKey.length} chars`)
  console.log(`   Format: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`)
  console.log(`   Is v3: ${apiKey.startsWith("fsq3")}`)

  // Build URL with parameters
  const url = new URL(`${FSQ_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString())
  })

  // Debug: Log the authorization format being used
  console.log("🔍 Authorization header format:", `Bearer ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`)

  // Try Bearer format first (most common for modern APIs)
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
    "X-Places-Api-Version": "2025-06-17",
  }

  try {
    console.log("🌐 Making request to:", url.toString())
    console.log("📋 Headers:", {
      ...headers,
      Authorization: `Bearer ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`, // Masked for logging
    })

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    })

    console.log("📡 Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Error Response:", errorText)

      // If Bearer format fails with 401, try without Bearer
      if (response.status === 401) {
        console.log("🔄 Retrying without Bearer prefix...")

        const fallbackHeaders = {
          Authorization: apiKey,
          Accept: "application/json",
          "X-Places-Api-Version": "2025-06-17",
        }

        const fallbackResponse = await fetch(url.toString(), {
          method: "GET",
          headers: fallbackHeaders,
        })

        console.log("📡 Fallback response status:", fallbackResponse.status, fallbackResponse.statusText)

        if (!fallbackResponse.ok) {
          const fallbackErrorText = await fallbackResponse.text()
          throw new Error(
            `Foursquare API error (both formats tried): ${fallbackResponse.status} ${fallbackResponse.statusText} - ${fallbackErrorText}`,
          )
        }

        return await fallbackResponse.json()
      }

      throw new Error(`Foursquare API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ API Response received:", {
      resultsCount: data.results?.length || 0,
      hasResults: !!data.results,
    })

    return data
  } catch (error) {
    console.error("💥 Fetch error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Network error: ${String(error)}`)
  }
}
