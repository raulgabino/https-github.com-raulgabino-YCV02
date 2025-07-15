import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"
import { processVibeInput } from "../../lib/vibeProcessor"
import { buildFoursquareQuery } from "../../lib/placesService"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const diagnostics: any[] = []

  try {
    const { vibe, city } = await request.json()

    diagnostics.push({
      step: "1. Input Received",
      status: "✅",
      data: { vibe, city },
      timestamp: Date.now() - startTime,
    })

    // Step 2: Check API Key
    const apiKey = process.env.FSQ_API_KEY
    diagnostics.push({
      step: "2. API Key Check",
      status: apiKey ? "✅" : "❌",
      data: {
        hasKey: !!apiKey,
        keyFormat: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}` : "MISSING",
        keyLength: apiKey?.length || 0,
        isV3Format: apiKey?.startsWith("fsq3") || false,
      },
      timestamp: Date.now() - startTime,
    })

    if (!apiKey) {
      return NextResponse.json({
        diagnostics,
        error: "FSQ_API_KEY not found in environment variables",
        details: {
          availableEnvVars: Object.keys(process.env).filter((key) => key.includes("FSQ")),
        },
      })
    }

    // Step 3: Process Vibe
    const { tokens, moodGroup } = processVibeInput(vibe)
    const query = buildFoursquareQuery(tokens, moodGroup)

    diagnostics.push({
      step: "3. Vibe Processing",
      status: "✅",
      data: {
        originalVibe: vibe,
        tokens,
        moodGroup,
        foursquareQuery: query,
      },
      timestamp: Date.now() - startTime,
    })

    // Step 4: Test Foursquare Connection
    const connectionTest = await foursquareService.testConnection()
    diagnostics.push({
      step: "4. Foursquare Connection Test",
      status: connectionTest.success ? "✅" : "❌",
      data: connectionTest,
      timestamp: Date.now() - startTime,
    })

    if (!connectionTest.success) {
      return NextResponse.json({
        diagnostics,
        error: "Foursquare connection failed",
        details: connectionTest,
      })
    }

    // Step 5: Direct Foursquare Search
    const places = await foursquareService.searchPlaces({
      near: city,
      query: query || "restaurant",
      limit: 10,
    })

    diagnostics.push({
      step: "5. Foursquare Search",
      status: places.length > 0 ? "✅" : "⚠️",
      data: {
        placesFound: places.length,
        samplePlaces: places.slice(0, 3).map((p) => ({
          name: p.name,
          category: p.categories?.[0]?.name,
          location: p.location?.formatted_address,
        })),
      },
      timestamp: Date.now() - startTime,
    })

    // Step 6: Test Places API Route
    const placesApiUrl = `/api/places?city=${encodeURIComponent(city)}&query=${encodeURIComponent(query || "restaurant")}`

    try {
      const placesResponse = await fetch(
        `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}${placesApiUrl}`,
      )
      const placesData = await placesResponse.json()

      diagnostics.push({
        step: "6. Places API Route Test",
        status: placesResponse.ok ? "✅" : "❌",
        data: {
          status: placesResponse.status,
          placesCount: Array.isArray(placesData) ? placesData.length : 0,
          error: placesData.error || null,
        },
        timestamp: Date.now() - startTime,
      })
    } catch (error) {
      diagnostics.push({
        step: "6. Places API Route Test",
        status: "❌",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: Date.now() - startTime,
      })
    }

    return NextResponse.json({
      success: true,
      totalTime: Date.now() - startTime,
      diagnostics,
      summary: {
        apiKeyValid: !!apiKey,
        connectionWorking: connectionTest.success,
        placesFound: places.length,
        overallStatus: places.length > 0 ? "✅ Working" : "❌ No Results",
      },
    })
  } catch (error) {
    diagnostics.push({
      step: "ERROR",
      status: "❌",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: Date.now() - startTime,
    })

    return NextResponse.json({
      success: false,
      totalTime: Date.now() - startTime,
      diagnostics,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
