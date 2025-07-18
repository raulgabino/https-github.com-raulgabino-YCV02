import { type NextRequest, NextResponse } from "next/server"

// Forzar dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // This would be called by a cron job weekly (Monday 03:00 UTC)
    // In a real implementation, this would:
    // 1. Use Google Trends API to get trending terms
    // 2. Use GPT-4o-mini to suggest token replacements
    // 3. Save tokens_next.json in /app/data/
    // 4. Create a PR for review (not auto-merge)

    const prompt = `Analyze current trending terms in Mexico for places/activities and suggest 10 new tokens for our mood-based place recommendation system.

Current token families:
- perrea/bellakeo (urban nightlife)
- chill/cozy (relaxed atmosphere)  
- sad/downbad (melancholic moods)
- productivo/grind (work/study)
- eco (nature/sustainability)

Return JSON format:
{
  "suggested_tokens": [
    {"token": "new_term", "peso": 0.85, "familia": "category", "reason": "why this is trending"}
  ]
}`

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
              "You are a trend analyst for Mexican urban culture and place recommendations. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API error")
    }

    const data = await response.json()
    let suggestions
    try {
      const content = data.choices[0]?.message?.content || '{"suggested_tokens": []}'

      // ARREGLADO: Limpiar la respuesta antes de parsear JSON
      const cleanContent = content.trim()

      // Si la respuesta no empieza con {, es texto plano - extraer JSON
      if (!cleanContent.startsWith("{")) {
        // Buscar JSON en la respuesta
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No JSON found in response")
        }
      } else {
        suggestions = JSON.parse(cleanContent)
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      console.error("Raw content:", data.choices[0]?.message?.content)
      suggestions = { suggested_tokens: [] }
    }

    // In production, this would save to /app/data/tokens_next.json
    // and create a GitHub PR for review

    return NextResponse.json({
      success: true,
      suggestions: suggestions.suggested_tokens,
      timestamp: new Date().toISOString(),
      note: "In production, this would create a PR with tokens_next.json",
    })
  } catch (error) {
    console.error("Error in tokens-refresh API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
