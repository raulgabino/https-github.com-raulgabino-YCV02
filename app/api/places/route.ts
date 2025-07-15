import { type NextRequest, NextResponse } from "next/server"
import { getPlaces } from "../../lib/placesService"
import { translateVibe } from "../../lib/vibeTranslator"
import type { Place } from "../../lib/types"

// Cache for reducing API calls
const cache = new Map<string, { data: Place[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city")
    const query = request.nextUrl.searchParams.get("query")

    if (!city) {
      return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
    }

    console.log(`🔍 Places API request: city=${city}, query=${query}`)

    // Check cache
    const cacheKey = `${city}-${query || "default"}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`💾 Cache hit for ${cacheKey}`)
      return NextResponse.json(cached.data)
    }

    // Enhanced query with semantic translation
    let enhancedQuery = query
    let translationUsed = false

    if (query) {
      try {
        const translation = await translateVibe(query)

        if (translation.confidence >= 0.7) {
          enhancedQuery = translation.translatedQuery
          translationUsed = true

          console.log(
            `🔄 Vibe translated: "${query}" → "${enhancedQuery}" (${translation.source}, confidence: ${translation.confidence})`,
          )
        }
      } catch (translationError) {
        console.warn("⚠️ Translation failed, using original query:", translationError)
      }
    }

    // Get places using enhanced query
    const places = await getPlaces(city, enhancedQuery || undefined)

    console.log(`📍 Found ${places.length} places in ${city}${translationUsed ? " (with translation)" : ""}`)

    // Cache successful results
    if (places.length > 0) {
      cache.set(cacheKey, { data: places, timestamp: Date.now() })
    }

    return NextResponse.json(places)
  } catch (error) {
    console.error("❌ Error in places API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch places",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
