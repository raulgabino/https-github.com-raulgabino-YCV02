import { type NextRequest, NextResponse } from "next/server"
import { foursquareService } from "../../lib/foursquareService"
import { processVibeInput } from "../../lib/vibeProcessor"
import { buildFoursquareQuery } from "../../lib/placesService"
import { semanticTranslator } from "../../lib/semanticTranslator"

export async function POST(request: NextRequest) {
  const diagnostics: any[] = []

  try {
    const { vibe, city } = await request.json()

    // 1. Test RAW Foursquare (sin procesamiento)
    diagnostics.push({ step: "🔍 1. RAW Foursquare Test", status: "testing..." })

    const rawPlaces = await foursquareService.searchPlaces({
      near: city,
      query: "restaurant", // Query simple y directo
      limit: 5,
    })

    diagnostics[0] = {
      step: "🔍 1. RAW Foursquare Test",
      status: rawPlaces.length > 0 ? "✅" : "❌",
      data: {
        placesFound: rawPlaces.length,
        samplePlaces: rawPlaces.slice(0, 2).map((p) => ({
          name: p.name,
          category: p.categories?.[0]?.name,
          address: p.location?.formatted_address,
        })),
        rawResponse: rawPlaces.length > 0 ? "SUCCESS" : "NO_RESULTS",
      },
    }

    // 2. Test Vibe Processing
    const { tokens, moodGroup } = processVibeInput(vibe)
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

    // 4. Test Processed Query
    const processedPlaces = await foursquareService.searchPlaces({
      near: city,
      query: foursquareQuery || translatedQuery,
      limit: 5,
    })

    diagnostics.push({
      step: "🎯 4. Processed Query Test",
      status: processedPlaces.length > 0 ? "✅" : "❌",
      data: {
        queryUsed: foursquareQuery || translatedQuery,
        placesFound: processedPlaces.length,
        samplePlaces: processedPlaces.slice(0, 2).map((p) => ({
          name: p.name,
          category: p.categories?.[0]?.name,
        })),
      },
    })

    // 5. Test Different Queries
    const testQueries = ["restaurant", "romantic restaurant", "dinner", "fine dining", translatedQuery]

    const queryResults = []
    for (const testQuery of testQueries) {
      const testPlaces = await foursquareService.searchPlaces({
        near: city,
        query: testQuery,
        limit: 3,
      })

      queryResults.push({
        query: testQuery,
        results: testPlaces.length,
        sample: testPlaces[0]?.name || "None",
      })
    }

    diagnostics.push({
      step: "🧪 5. Query Variations Test",
      status: queryResults.some((r) => r.results > 0) ? "✅" : "❌",
      data: { queryResults },
    })

    // 6. Test Places API Route (internal)
    diagnostics.push({
      step: "🔗 6. Places API Route",
      status: "testing...",
      data: {},
    })

    // Simular llamada interna a /api/places
    try {
      // En lugar de fetch, llamar directamente al servicio
      const { getPlaces } = await import("../../lib/placesService")
      const apiPlaces = await getPlaces(city, foursquareQuery)

      diagnostics[diagnostics.length - 1] = {
        step: "🔗 6. Places API Route",
        status: apiPlaces.length > 0 ? "✅" : "❌",
        data: {
          placesFromAPI: apiPlaces.length,
          samplePlaces: apiPlaces.slice(0, 2).map((p) => ({
            name: p.name,
            category: p.category,
            tags: p.tags,
          })),
        },
      }
    } catch (error) {
      diagnostics[diagnostics.length - 1] = {
        step: "🔗 6. Places API Route",
        status: "❌",
        data: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }
    }

    // 7. Check for GPT Calls
    diagnostics.push({
      step: "🤖 7. GPT Calls Check",
      status: "ℹ️",
      data: {
        openaiKeyExists: !!process.env.OPENAI_API_KEY,
        gptUsedInFlow: "Only in /api/explain and /api/generate-article",
        mainSearchUsesGPT: false,
        note: "GPT is NOT used in main search flow",
      },
    })

    // 8. Final Analysis
    const analysis = {
      rawFoursquareWorks: rawPlaces.length > 0,
      processedQueryWorks: processedPlaces.length > 0,
      semanticTranslationNeeded: needsTranslation,
      bestWorkingQuery: queryResults.find((r) => r.results > 0)?.query || "None",
      recommendation: "",
    }

    if (rawPlaces.length > 0 && processedPlaces.length === 0) {
      analysis.recommendation = "🎯 PROBLEM: Vibe processing is creating queries that don't work. Use simpler queries."
    } else if (rawPlaces.length === 0) {
      analysis.recommendation = "🌍 PROBLEM: Foursquare has no data for this city. Try different city."
    } else {
      analysis.recommendation = "✅ Everything looks good. Check cache or mapping issues."
    }

    diagnostics.push({
      step: "📊 8. Final Analysis",
      status: "📋",
      data: analysis,
    })

    return NextResponse.json({
      success: true,
      diagnostics,
      summary: {
        totalSteps: diagnostics.length,
        rawFoursquareWorks: rawPlaces.length > 0,
        processedQueryWorks: processedPlaces.length > 0,
        recommendation: analysis.recommendation,
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
