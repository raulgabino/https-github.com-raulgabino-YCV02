import { type NextRequest, NextResponse } from "next/server"

const TONE_MAP: Record<string, string> = {
  perrea: "urbano relajado 🔥💃",
  bellakeo: "urbano relajado 🔥💃",
  dembow: "urbano relajado 🔥💃",
  chill: "tranquilo ☕🎧",
  cozy: "tranquilo ☕🎧",
  lofi: "tranquilo ☕🎧",
  sad: "empático 💙🌧️",
  downbad: "empático 💙🌧️",
  productivo: "motivador 🚀📈",
  grind: "motivador 🚀📈",
  eco: "consciente 🌱♻️",
  default: "amistoso",
}

function getToneForMood(mood: string): string {
  const lowerMood = mood.toLowerCase()

  for (const [key, tone] of Object.entries(TONE_MAP)) {
    if (lowerMood.includes(key)) {
      return tone
    }
  }

  return TONE_MAP.default
}

export async function POST(request: NextRequest) {
  try {
    const { mood, place } = await request.json()

    if (!mood || !place) {
      return NextResponse.json({ error: "Mood and place are required" }, { status: 400 })
    }

    const tone = getToneForMood(mood)

    const prompt = `You are VibeTranslator 3000.

Usa el tono ${tone} para explicar en ≤60 palabras por qué ${place.name} es ideal para la vibra "${mood}".

Contexto del lugar:
- Nombre: ${place.name}
- Categoría: ${place.category}
- Ciudad: ${place.city}
- Tags: ${place.tags.join(", ")}
- Rating: ${place.google_rating}
- Precio: ${place.price_level}

Incluye **un** emoji coherente al final, nada más. Responde solo en español con modismos suaves.`

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
              "Eres VibeTranslator 3000, un asistente que explica lugares según el mood del usuario con el tono apropiado.",
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
      throw new Error("OpenAI API error")
    }

    const data = await response.json()
    const explanation =
      data.choices[0]?.message?.content?.trim() || `${place.name} es perfecto para tu vibra ${mood} 🔥`

    return NextResponse.json({
      explanation,
    })
  } catch (error) {
    console.error("Error in explain API:", error)

    // Fallback explanation
    const { mood, place } = await request.json()
    return NextResponse.json({
      explanation: `${place.name} es perfecto para tu vibra ${mood} 🔥`,
    })
  }
}
