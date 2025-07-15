import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"

export async function POST(request: NextRequest) {
  console.log("🧪 Testing Foursquare connection...")

  try {
    // Test 1: Check API key
    const apiKey = process.env.FOURSQUARE_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "FOURSQUARE_API_KEY not found in environment variables",
        details: {
          availableEnvVars: Object.keys(process.env).filter((key) => key.includes("FOURSQUARE")),
        },
      })
    }

    console.log("✅ API Key found:", `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`)

    // Test 2: Basic connection test
    const connectionTest = await foursquareService.testConnection()

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: "Foursquare API connection failed",
        details: connectionTest,
      })
    }

    // Test 3: Simple search test
    try {
      const testPlaces = await foursquareService.searchPlaces({
        near: "New York",
        query: "restaurant",
        limit: 5,
      })

      return NextResponse.json({
        success: true,
        message: "Foursquare API is working correctly",
        details: {
          apiKeyStatus: "✅ Valid",
          connectionTest: "✅ Successful",
          searchTest: `✅ Found ${testPlaces.length} places`,
          samplePlaces: testPlaces.slice(0, 2).map((p) => ({
            name: p.name,
            category: p.categories?.[0]?.name,
            location: p.location?.formatted_address,
          })),
        },
      })
    } catch (searchError) {
      return NextResponse.json({
        success: false,
        error: "Search test failed",
        details: {
          apiKeyStatus: "✅ Valid",
          connectionTest: "✅ Successful",
          searchTest: `❌ Failed: ${searchError instanceof Error ? searchError.message : "Unknown error"}`,
        },
      })
    }
  } catch (error) {
    console.error("❌ Connection test error:", error)
    return NextResponse.json({
      success: false,
      error: "Unexpected error during connection test",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}
