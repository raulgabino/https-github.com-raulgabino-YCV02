// Traductor semántico completo: Diccionario + GPT + Cache
interface Translation {
  originalVibe: string
  translatedQuery: string
  categories?: string[]
  confidence: number
  source: "dictionary" | "gpt" | "fallback"
  cached?: boolean
}

// Cache en memoria con TTL
const translationCache = new Map<string, { translation: Translation; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Diccionario semántico optimizado (30 vibes principales)
const VIBE_DICTIONARY: Record<
  string,
  {
    query: string
    categories?: string[]
    confidence: number
  }
> = {
  // 🎵 Nightlife & Party
  bellakeo: { query: "nightclub dance reggaeton", categories: ["13002"], confidence: 0.95 },
  perreo: { query: "dance club reggaeton", categories: ["13002"], confidence: 0.95 },
  antro: { query: "nightclub bar", categories: ["13002", "13003"], confidence: 0.9 },
  reventón: { query: "party venue nightclub", categories: ["13002"], confidence: 0.85 },
  fiesta: { query: "party nightlife", categories: ["13002"], confidence: 0.8 },
  baile: { query: "dance club", categories: ["13002"], confidence: 0.8 },

  // 💕 Romance & Dating
  romántico: { query: "romantic restaurant intimate", categories: ["13065"], confidence: 0.9 },
  íntimo: { query: "intimate restaurant cozy", categories: ["13065"], confidence: 0.85 },
  cena: { query: "dinner restaurant", categories: ["13065"], confidence: 0.8 },
  date: { query: "romantic restaurant", categories: ["13065"], confidence: 0.8 },
  pareja: { query: "romantic dining", categories: ["13065"], confidence: 0.8 },

  // 😌 Chill & Relaxed
  chill: { query: "coffee shop relaxed", categories: ["13032"], confidence: 0.85 },
  tranquilo: { query: "quiet cafe peaceful", categories: ["13032"], confidence: 0.85 },
  relajado: { query: "relaxed atmosphere", categories: ["13032", "13003"], confidence: 0.8 },
  cozy: { query: "cozy cafe comfortable", categories: ["13032"], confidence: 0.85 },

  // 💼 Productive & Work
  productivo: { query: "coffee shop wifi work", categories: ["13032"], confidence: 0.9 },
  trabajo: { query: "coworking cafe wifi", categories: ["13032"], confidence: 0.85 },
  estudio: { query: "study space quiet", categories: ["13032"], confidence: 0.85 },
  wifi: { query: "coffee shop internet", categories: ["13032"], confidence: 0.8 },
  focus: { query: "quiet workspace", categories: ["13032"], confidence: 0.8 },

  // 🍽️ Food & Dining
  botanear: { query: "bar appetizers tapas", categories: ["13003"], confidence: 0.9 },
  mariscos: { query: "seafood restaurant", categories: ["13065"], confidence: 0.95 },
  gourmet: { query: "fine dining restaurant", categories: ["13065"], confidence: 0.9 },
  tradicional: { query: "traditional restaurant local", categories: ["13065"], confidence: 0.85 },
  comida: { query: "restaurant food", categories: ["13065"], confidence: 0.7 },

  // 🎨 Culture & Arts
  cultura: { query: "museum cultural center", categories: ["10000"], confidence: 0.85 },
  arte: { query: "art gallery museum", categories: ["10000"], confidence: 0.85 },
  museo: { query: "museum", categories: ["10000"], confidence: 0.95 },
  teatro: { query: "theater", categories: ["10000"], confidence: 0.95 },

  // 🌿 Nature & Outdoor
  "aire libre": { query: "outdoor park", categories: ["16000"], confidence: 0.8 },
  parque: { query: "park outdoor", categories: ["16000"], confidence: 0.9 },
  naturaleza: { query: "nature outdoor", categories: ["16000"], confidence: 0.8 },
}

export async function translateVibe(vibe: string): Promise<Translation> {
  const cacheKey = vibe.toLowerCase().trim()

  // 1. Verificar cache
  const cached = translationCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.translation, cached: true }
  }

  // 2. Buscar en diccionario
  const dictionaryResult = searchDictionary(vibe)
  if (dictionaryResult.confidence >= 0.7) {
    const translation: Translation = {
      originalVibe: vibe,
      translatedQuery: dictionaryResult.query,
      categories: dictionaryResult.categories,
      confidence: dictionaryResult.confidence,
      source: "dictionary",
    }

    // Cache successful dictionary translations
    translationCache.set(cacheKey, { translation, timestamp: Date.now() })
    return translation
  }

  // 3. Fallback a GPT
  try {
    const gptTranslation = await translateWithGPT(vibe)
    if (gptTranslation.confidence >= 0.7) {
      // Cache successful GPT translations
      translationCache.set(cacheKey, { translation: gptTranslation, timestamp: Date.now() })
      return gptTranslation
    }
  } catch (error) {
    console.log("GPT translation failed, using fallback")
  }

  // 4. Fallback básico
  return {
    originalVibe: vibe,
    translatedQuery: vibe, // Usar query original
    confidence: 0.3,
    source: "fallback",
  }
}

function searchDictionary(vibe: string): { query: string; categories?: string[]; confidence: number } {
  const lowerVibe = vibe.toLowerCase().trim()

  // Búsqueda exacta
  if (VIBE_DICTIONARY[lowerVibe]) {
    return VIBE_DICTIONARY[lowerVibe]
  }

  // Búsqueda por palabras clave
  const words = lowerVibe.split(/\s+/)
  let bestMatch = { query: "", confidence: 0, categories: undefined as string[] | undefined }

  for (const [key, value] of Object.entries(VIBE_DICTIONARY)) {
    // Coincidencia exacta de palabra
    if (words.includes(key)) {
      if (value.confidence > bestMatch.confidence) {
        bestMatch = { query: value.query, confidence: value.confidence * 0.9, categories: value.categories }
      }
    }

    // Coincidencia parcial
    if (lowerVibe.includes(key) || key.includes(lowerVibe)) {
      const partialConfidence = value.confidence * 0.7
      if (partialConfidence > bestMatch.confidence) {
        bestMatch = { query: value.query, confidence: partialConfidence, categories: value.categories }
      }
    }
  }

  return bestMatch.confidence > 0 ? bestMatch : { query: vibe, confidence: 0.3 }
}

async function translateWithGPT(vibe: string): Promise<Translation> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not available")
  }

  const prompt = `Translate this Spanish/Latino vibe to English search terms for Foursquare Places API.

Vibe: "${vibe}"

Respond with JSON only:
{
  "query": "english search terms",
  "categories": ["foursquare_category_id"],
  "confidence": 0.8
}

Common categories:
- 13065: Restaurant
- 13003: Bar  
- 13032: Café
- 13002: Nightlife
- 10000: Arts & Entertainment
- 16000: Outdoors & Recreation

Focus on accuracy over creativity.`

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
            content: "You are a semantic translator for place search. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()

    if (!content) {
      throw new Error("Empty response from GPT")
    }

    // Parse JSON response
    const parsed = JSON.parse(content)

    return {
      originalVibe: vibe,
      translatedQuery: parsed.query || vibe,
      categories: parsed.categories,
      confidence: Math.min(parsed.confidence || 0.6, 0.9), // Cap at 0.9
      source: "gpt",
    }
  } catch (error) {
    console.error("GPT translation error:", error)
    throw error
  }
}

// Función para obtener estadísticas del cache
export function getCacheStats() {
  return {
    size: translationCache.size,
    entries: Array.from(translationCache.keys()),
    hitRate: "Not tracked", // Could implement if needed
  }
}

// Función para limpiar cache expirado
export function cleanExpiredCache() {
  const now = Date.now()
  for (const [key, value] of translationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      translationCache.delete(key)
    }
  }
}
