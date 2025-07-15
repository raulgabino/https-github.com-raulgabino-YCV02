import { type NextRequest, NextResponse } from "next/server"
import { processVibeInput, calculateRelevanceScore } from "../../lib/vibeProcessor"
import { validateVibeCategory, getVibeFromTokens } from "../../lib/categoryValidator"
import { getPlaces } from "../../lib/placesService"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood, city, vibe } = body
    const searchTerm = vibe || mood

    if (!searchTerm || !city) {
      return NextResponse.json({ error: "Vibe/mood and city are required" }, { status: 400 })
    }

    console.log(`🎯 Ranking request: "${searchTerm}" in ${city}`)

    // Process vibe with full semantic translation and Foursquare integration
    const {
      tokens: vibeTokens,
      moodGroup,
      translation,
      foursquareQuery,
      categories,
    } = await processVibeInput(searchTerm)

    // Get places using optimized Foursquare query
    const searchQuery = foursquareQuery || (translation?.confidence >= 0.7 ? translation.translatedQuery : searchTerm)
    const allPlaces = await getPlaces(city, searchQuery)

    if (allPlaces.length === 0) {
      return NextResponse.json({
        places: [],
        message: `No encontramos lugares en ${city} para "${searchTerm}". Intenta con otra ciudad o ajusta tu búsqueda.`,
        fallback: true,
        debug: {
          originalVibe: searchTerm,
          processedTokens: vibeTokens,
          translationUsed: translation?.source !== "fallback",
          foursquareQuery,
          categories,
        },
      })
    }

    // Category validation (flexible)
    const primaryVibe = getVibeFromTokens(vibeTokens)
    const categoryValidPlaces = allPlaces.filter((place) => validateVibeCategory(primaryVibe, place))

    // Use category-valid places if available, otherwise use all places
    const finalPlaces = categoryValidPlaces.length > 0 ? categoryValidPlaces : allPlaces.slice(0, 15)

    // Calculate relevance scores
    const scoredPlaces = finalPlaces.map((place) => ({
      ...place,
      relevance: calculateRelevanceScore(place, vibeTokens, moodGroup),
    }))

    // Filter and sort by relevance
    const relevantPlaces = scoredPlaces
      .filter((place) => place.relevance >= 0.3) // Lower threshold for more results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8) // Increased limit for better variety

    // Clean response (remove relevance scores)
    const cleanPlaces = relevantPlaces.map(({ relevance, ...place }) => place)

    // Generate GPT explanation if we have results
    let explanation = `Encontramos ${cleanPlaces.length} lugares perfectos para "${searchTerm}" en ${city}`

    if (cleanPlaces.length > 0) {
      try {
        const gptExplanation = await generateVibeExplanation(searchTerm, cleanPlaces, moodGroup)
        if (gptExplanation) {
          explanation = gptExplanation
        }
      } catch (gptError) {
        console.warn("⚠️ GPT explanation failed:", gptError)
      }
    }

    return NextResponse.json({
      places: cleanPlaces,
      total: cleanPlaces.length,
      explanation,
      debug: {
        originalVibe: searchTerm,
        processedTokens: vibeTokens,
        moodGroup,
        translationSource: translation?.source,
        foursquareQuery,
        categories,
        topScores: relevantPlaces.slice(0, 3).map((p) => ({ name: p.name, score: p.relevance })),
      },
    })
  } catch (error) {
    console.error("❌ Error in rank API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// GPT-powered explanation generation
async function generateVibeExplanation(vibe: string, places: any[], moodGroup: string | null): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  try {
    const topPlaces = places
      .slice(0, 3)
      .map((p) => `${p.name} (${p.category})`)
      .join(", ")

    const prompt = `Explica en 1-2 oraciones por qué estos lugares son perfectos para "${vibe}":

Lugares: ${topPlaces}
Mood: ${moodGroup || "general"}

Responde en español, tono casual y amigable, máximo 60 palabras.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un experto en recomendaciones de lugares. Responde de forma concisa y amigable.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error("❌ GPT explanation error:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Rank API is working with FSQ integration",
    timestamp: new Date().toISOString(),
    features: [
      "Foursquare v3 API integration",
      "Semantic vibe translation",
      "GPT-powered explanations",
      "Advanced relevance scoring",
    ],
  })
}
