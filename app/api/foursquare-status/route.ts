import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"

export async function GET(request: NextRequest) {
  const diagnostics: any[] = []
  const startTime = Date.now()

  try {
    // 1. Check Environment Variables
    const apiKey = process.env.FOURSQUARE_API_KEY
    diagnostics.push({
      step: "Environment Check",
      status: apiKey ? "✅" : "❌",
      details: {
        hasApiKey: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyFormat: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}` : "MISSING",
        isV3Format: apiKey?.startsWith("fsq3") || false,
        allEnvVars: Object.keys(process.env).filter((key) => key.includes("FOURSQUARE")),
      },
      timestamp: Date.now() - startTime,
    })

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "FOURSQUARE_API_KEY not found",
        diagnostics,
      })
    }

    // 2. Test Basic Connection
    diagnostics.push({
      step: "Connection Test",
      status: "testing...",
      timestamp: Date.now() - startTime,
    })

    const connectionTest = await foursquareService.testConnection()
    diagnostics[diagnostics.length - 1] = {
      step: "Connection Test",
      status: connectionTest.success ? "✅" : "❌",
      details: connectionTest,
      timestamp: Date.now() - startTime,
    }

    // 3. Test Simple Search
    if (connectionTest.success) {
      diagnostics.push({
        step: "Simple Search Test",
        status: "testing...",
        timestamp: Date.now() - startTime,
      })

      try {
        const testPlaces = await foursquareService.searchPlaces({
          near: "New York",
          query: "restaurant",
          limit: 3,
        })

        diagnostics[diagnostics.length - 1] = {
          step: "Simple Search Test",
          status: testPlaces.length > 0 ? "✅" : "⚠️",
          details: {
            placesFound: testPlaces.length,
            samplePlaces: testPlaces.slice(0, 2).map((p) => ({
              name: p.name,
              category: p.categories?.[0]?.name,
              location: p.location?.formatted_address,
            })),
          },
          timestamp: Date.now() - startTime,
        }
      } catch (searchError) {
        diagnostics[diagnostics.length - 1] = {
          step: "Simple Search Test",
          status: "❌",
          details: {
            error: searchError instanceof Error ? searchError.message : "Unknown error",
            stack: searchError instanceof Error ? searchError.stack : undefined,
          },
          timestamp: Date.now() - startTime,
        }
      }
    }

    // 4. Test Different Cities
    const testCities = ["CDMX", "Monterrey", "Ciudad Victoria"]
    for (const city of testCities) {
      diagnostics.push({
        step: `City Test: ${city}`,
        status: "testing...",
        timestamp: Date.now() - startTime,
      })

      try {
        const cityPlaces = await foursquareService.searchPlaces({
          near: city,
          query: "restaurant",
          limit: 2,
        })

        diagnostics[diagnostics.length - 1] = {
          step: `City Test: ${city}`,
          status: cityPlaces.length > 0 ? "✅" : "⚠️",
          details: {
            placesFound: cityPlaces.length,
            firstPlace: cityPlaces[0]?.name || "None",
          },
          timestamp: Date.now() - startTime,
        }
      } catch (error) {
        diagnostics[diagnostics.length - 1] = {
          step: `City Test: ${city}`,
          status: "❌",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          timestamp: Date.now() - startTime,
        }
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // 5. Summary
    const successfulTests = diagnostics.filter((d) => d.status === "✅").length
    const totalTests = diagnostics.length
    const overallStatus =
      successfulTests === totalTests ? "✅ All Good" : successfulTests > 0 ? "⚠️ Partial" : "❌ Failed"

    return NextResponse.json({
      success: successfulTests > 0,
      overallStatus,
      summary: {
        totalTests,
        successfulTests,
        successRate: `${Math.round((successfulTests / totalTests) * 100)}%`,
        totalTime: `${Date.now() - startTime}ms`,
      },
      diagnostics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      diagnostics,
      timestamp: new Date().toISOString(),
    })
  }
}
