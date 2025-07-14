import { type NextRequest, NextResponse } from "next/server"

interface FoursquarePlace {
  fsq_id: string
  name: string
  categories: Array<{
    id: number
    name: string
    short_name: string
    plural_name: string
  }>
  location: {
    formatted_address: string
    locality: string
    region: string
    country: string
  }
  geocodes: {
    main: {
      latitude: number
      longitude: number
    }
  }
  contact?: {
    tel?: string
    website?: string
  }
  rating?: number
  price?: number
  hours?: {
    display?: string
  }
  features?: Record<string, any>
  photos?: Array<{
    prefix: string
    suffix: string
  }>
}

interface Place {
  name: string
  category: string
  city: string
  address: string
  lat: number
  lng: number
  phone: string
  website: string
  google_rating: string
  price_level: string
  opening_hours: string
  tags: string[]
  review_snippets: string[]
  last_checked: string
  media: string[]
}

// Cache for API responses (1 hour)
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

function mapPriceLevel(price?: number): string {
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

function mapFoursquareToPlace(fsPlace: FoursquarePlace): Place {
  const category = fsPlace.categories[0]?.name || "General"
  const tags = [...fsPlace.categories.map((cat) => cat.name.toLowerCase()), ...Object.keys(fsPlace.features || {})]

  return {
    name: fsPlace.name,
    category: category.toLowerCase(),
    city: fsPlace.location.locality || "",
    address: fsPlace.location.formatted_address || "",
    lat: fsPlace.geocodes.main.latitude,
    lng: fsPlace.geocodes.main.longitude,
    phone: fsPlace.contact?.tel || "",
    website: fsPlace.contact?.website || "",
    google_rating: fsPlace.rating?.toString() || "0",
    price_level: mapPriceLevel(fsPlace.price),
    opening_hours: fsPlace.hours?.display || "Hours not available",
    tags,
    review_snippets: [],
    last_checked: new Date().toISOString().split("T")[0],
    media: fsPlace.photos?.map((photo) => `${photo.prefix}300x300${photo.suffix}`) || [],
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const vibe = searchParams.get("vibe")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${city}-${vibe}-${limit}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const apiKey = process.env.FOURSQUARE_API_KEY
    if (!apiKey) {
      console.error("FOURSQUARE_API_KEY not found")
      return NextResponse.json([], { status: 200 })
    }

    // Build search query based on vibe
    let query = ""
    if (vibe) {
      // Map vibe to search terms
      const vibeMap: Record<string, string> = {
        chill: "cafe coffee lounge",
        productivo: "cafe coworking library",
        romántico: "restaurant fine dining",
        fiesta: "bar nightclub music",
        familiar: "restaurant family park",
        eco: "park garden organic",
        cultural: "museum gallery theater",
        trendy: "restaurant bar modern",
        tradicional: "restaurant traditional local",
        nocturno: "bar club nightlife",
      }
      query = vibeMap[vibe] || vibe
    }

    const searchUrl = new URL("https://api.foursquare.com/v3/places/search")
    searchUrl.searchParams.append("near", city)
    searchUrl.searchParams.append("limit", limit.toString())
    if (query) {
      searchUrl.searchParams.append("query", query)
    }
    searchUrl.searchParams.append(
      "fields",
      "fsq_id,name,categories,location,geocodes,contact,rating,price,hours,features,photos",
    )

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error("Foursquare API error:", response.status, response.statusText)
      return NextResponse.json([], { status: 200 })
    }

    const data = await response.json()
    const places: Place[] = data.results?.map(mapFoursquareToPlace) || []

    // Cache the results
    cache.set(cacheKey, { data: places, timestamp: Date.now() })

    return NextResponse.json(places)
  } catch (error) {
    console.error("Error fetching places:", error)
    return NextResponse.json([], { status: 200 })
  }
}
