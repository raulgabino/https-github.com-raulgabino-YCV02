// Foursquare v3 API Fetcher with build-time safety
const FSQ_BASE_URL = "https://api.foursquare.com/v3"

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
  const apiKey = process.env.FOURSQUARE_API_KEY
  if (!apiKey) {
    throw new Error("FOURSQUARE_API_KEY environment variable is required")
  }

  // Build URL with parameters
  const url = new URL(`${FSQ_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString())
  })

  // Fixed headers for Foursquare v3
  const headers = {
    Authorization: apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Network error: ${String(error)}`)
  }
}
