import { type NextRequest, NextResponse } from "next/server"
import { getPersonalityProfile } from "../../lib/personalityProfiles"
import placesData from "../../data/places.json"

export async function POST(request: NextRequest) {
  try {
    const { personality, city } = await request.json()

    console.log(`🎭 Generating article: ${personality} in ${city}`)

    if (!personality || !city) {
      return NextResponse.json({ error: "Personality and city are required" }, { status: 400 })
    }

    const profile = getPersonalityProfile(personality)
    if (!profile) {
      return NextResponse.json({ error: "Personality not found" }, { status: 404 })
    }

    // Filtrar lugares compatibles con personalidad
    const places = getCompatiblePlaces(city, profile)

    if (places.length < 2) {
      return NextResponse.json(
        {
          error: `Not enough compatible places for ${profile.name} in ${city}. Found ${places.length} places.`,
          suggestion: "Try a different city or personality combination.",
        },
        { status: 400 },
      )
    }

    console.log(`🏙️ Found ${places.length} compatible places for ${profile.name} in ${city}`)

    // Generar artículo con OpenAI
    const article = await generatePersonalityArticle(profile, city, places)

    const wordCount = article.split(" ").length
    const readingTime = Math.ceil(wordCount / 200)

    return NextResponse.json({
      article,
      metadata: {
        personality: profile.name,
        city,
        places_count: places.length,
        reading_time: `${readingTime} min`,
        word_count: wordCount,
        generated_at: new Date().toISOString(),
        places_featured: places.map((p) => ({ name: p.name, category: p.category })),
      },
    })
  } catch (error) {
    console.error("❌ Article generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getCompatiblePlaces(city: string, profile: any) {
  console.log(`🔍 Filtering places for ${profile.name} in ${city}`)

  const cityPlaces = placesData.filter(
    (place) =>
      place.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(place.city.toLowerCase()),
  )

  console.log(`🏙️ Found ${cityPlaces.length} places in ${city}`)

  const compatiblePlaces = cityPlaces
    .filter((place) => {
      // Must be in preferred categories
      const isPreferred = profile.venue_preferences.includes(place.category)
      // Must not be in avoided categories
      const isNotAvoided = !profile.avoid_categories.includes(place.category)

      return isPreferred && isNotAvoided
    })
    .filter((place) => {
      // Additional filtering by tags and lifestyle compatibility
      const placeTags = place.tags.map((tag) => tag.toLowerCase())
      const lifestyleMatch = profile.lifestyle.some((lifestyle) =>
        placeTags.some((tag) => tag.includes(lifestyle.toLowerCase())),
      )

      // High rating preference
      const hasGoodRating = Number.parseFloat(place.google_rating) >= 4.0

      return lifestyleMatch || hasGoodRating
    })
    .sort((a, b) => Number.parseFloat(b.google_rating) - Number.parseFloat(a.google_rating))
    .slice(0, 4) // Máximo 4 lugares por artículo

  console.log(
    `✅ Found ${compatiblePlaces.length} compatible places:`,
    compatiblePlaces.map((p) => `${p.name} (${p.category})`),
  )

  return compatiblePlaces
}

async function generatePersonalityArticle(profile: any, city: string, places: any[]) {
  const placesInfo = places
    .map((p) => `- ${p.name} (${p.category}): ${p.address} - Rating: ${p.google_rating} - Tags: ${p.tags.join(", ")}`)
    .join("\n")

  const prompt = `Eres un escritor experto en cultura urbana mexicana y música latina. Escribe un artículo de 800-1000 palabras sobre dónde visitaría ${profile.name} en ${city}.

INFORMACIÓN DEL ARTISTA:
- Nombre real: ${profile.real_name}
- Categoría: ${profile.category}
- Bio: ${profile.bio_snippet}
- Estilo de vida: ${profile.lifestyle.join(", ")}
- Personalidad: ${profile.personality_traits.join(", ")}

LUGARES A INCLUIR:
${placesInfo}

ESTRUCTURA REQUERIDA:
1. Título atractivo estilo revista (60-80 caracteres)
2. Introducción: Conexión del artista con la ciudad (150 palabras)
3. Sección por cada lugar explicando POR QUÉ lo visitaría (200 palabras c/u)
4. Conclusión aspiracional (100 palabras)

TONO: Informativo pero entretenido, como Rolling Stone en español
INCLUIR: Referencias específicas a su música, colaboraciones, estilo
EVITAR: Información falsa, claims de visitas reales
DISCLAIMER: Aclarar que es interpretación creativa

Responde SOLO con el artículo en formato markdown, sin texto adicional.`

  try {
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
            content:
              "Eres un escritor experto en cultura urbana y música latina. Escribes artículos estilo revista con tono informativo pero entretenido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const article = data.choices[0]?.message?.content || "Error generating article"

    console.log(`📝 Generated article: ${article.split(" ").length} words`)

    return article
  } catch (error) {
    console.error("❌ OpenAI API error:", error)

    // Fallback article
    return `# ${profile.name} en ${city}: Una Ruta Musical

## Introducción

${profile.name}, ${profile.bio_snippet}, tendría una experiencia única en ${city}. Basándonos en su estilo ${profile.lifestyle.join(", ")}, hemos seleccionado los lugares perfectos que resonarían con su personalidad ${profile.personality_traits.join(", ")}.

${places
  .map(
    (place) => `
## ${place.name}

Este ${place.category} sería perfecto para ${profile.name} por su ambiente ${place.tags.join(", ")}. Con una calificación de ${place.google_rating} estrellas, ${place.name} ofrece exactamente el tipo de experiencia que buscaría alguien con su estilo.

**Ubicación:** ${place.address}
**Por qué encaja:** Su ambiente combina perfectamente con el estilo ${profile.category} de ${profile.name}.
`,
  )
  .join("")}

## Conclusión

Esta ruta por ${city} reflejaría perfectamente el estilo único de ${profile.name}, combinando su amor por ${profile.lifestyle.join(" y ")} con los mejores lugares que la ciudad tiene para ofrecer.

---
*Disclaimer: Este artículo es una interpretación creativa basada en el estilo público de ${profile.name}. No implica endorsement real ni lugares visitados confirmados.*`
  }
}
