import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput } from "../../lib/vibeProcessor"
import { buildFoursquareQuery } from "../../lib/placesService"
import { semanticTranslator } from "../../lib/semanticTranslator"

export async function POST(request: NextRequest) {
  const diagnostics: any[] = []

  try {
    const { vibe, city } = await request.json()

    // 1. Check API Key availability (without throwing)
    const apiKey = process.env.FSQ_API_KEY
    diagnostics.push({
      step: "🔍 1. API Key Check",
      status: apiKey ? "✅" : "❌",
      data: {
        hasKey: !!apiKey,
        keyFormat: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}` : "MISSING",
        keyLength: apiKey?.length || 0,
        isV3Format: apiKey?.startsWith("fsq3") || false,
      },
    })

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "FSQ_API_KEY not found",
        diagnostics,
        recommendation: "Add FSQ_API_KEY to environment variables",
      })
    }

    // 2. Test Vibe Processing
    const { tokens, moodGroup } = await processVibeInput(vibe)
    const foursquareQuery = buildFoursquareQuery(tokens, moodGroup)

    diagnostics.push({
      step: "🎭 2. Vibe Processing",
      status: "✅",
      data: {
        originalVibe: vibe,
        processedTokens: tokens,
        moodGroup,
        foursquareQuery,
        queryLength: foursquareQuery.length,
      },
    })

    // 3. Test Semantic Translation
    const needsTranslation = semanticTranslator.needsTranslation(vibe)
    let translatedQuery = vibe

    if (needsTranslation) {
      const translation = semanticTranslator.translateQuery(vibe)
      translatedQuery = translation.translatedQuery

      diagnostics.push({
        step: "🔄 3. Semantic Translation",
        status: "✅",
        data: {
          needsTranslation,
          original: vibe,
          translated: translatedQuery,
          confidence: translation.confidence,
          mappingsUsed: translation.mappingsUsed.length,
        },
      })
    } else {
      diagnostics.push({
        step: "🔄 3. Semantic Translation",
        status: "⏭️",
        data: { needsTranslation: false, message: "No translation needed" },
      })
    }

    // 4. Test Foursquare Service (with error handling)
    try {
      // Dynamically import to avoid build-time initialization
      const { foursquareService } = await import("../../lib/foursquareService")

      if (!foursquareService.isAvailable()) {
        diagnostics.push({
          step: "🌐 4. Foursquare Service",
          status: "❌",
          data: { error: "Service not available - API key missing" },
        })
      } else {
        const connectionTest = await foursquareService.testConnection()
        diagnostics.push({
          step: "🌐 4. Foursquare Service",
          status: connectionTest.success ? "✅" : "❌",
          data: connectionTest,
        })

        // 5. Test actual search if connection works
        if (connectionTest.success) {
          const searchResults = await foursquareService.searchPlaces({
            near: city,
            query: foursquareQuery || translatedQuery,
            limit: 5,
          })

          diagnostics.push({
            step: "🎯 5. Search Test",
            status: searchResults.length > 0 ? "✅" : "⚠️",
            data: {
              queryUsed: foursquareQuery || translatedQuery,
              placesFound: searchResults.length,
              samplePlaces: searchResults.slice(0, 2).map((p) => ({
                name: p.name,
                category: p.categories?.[0]?.name,
              })),
            },
          })
        }
      }
    } catch (serviceError) {
      diagnostics.push({
        step: "🌐 4. Foursquare Service",
        status: "❌",
        data: {
          error: serviceError instanceof Error ? serviceError.message : "Service initialization failed",
        },
      })
    }

    // 6. Final Analysis
    const hasApiKey = !!apiKey
    const vibeProcessingWorks = tokens.length > 0
    const translationWorks = needsTranslation ? translatedQuery !== vibe : true

    let recommendation = ""
    if (!hasApiKey) {
      recommendation = "🔑 Add FSQ_API_KEY environment variable"
    } else if (!vibeProcessingWorks) {
      recommendation = "🎭 Check vibe processing logic"
    } else {
      recommendation = "✅ System appears to be working correctly"
    }

    diagnostics.push({
      step: "📊 6. Final Analysis",
      status: "📋",
      data: {
        hasApiKey,
        vibeProcessingWorks,
        translationWorks,
        recommendation,
      },
    })

    return NextResponse.json({
      success: hasApiKey && vibeProcessingWorks,
      diagnostics,
      summary: {
        totalSteps: diagnostics.length,
        hasApiKey,
        vibeProcessingWorks,
        recommendation,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      diagnostics,
    })
  }
}
