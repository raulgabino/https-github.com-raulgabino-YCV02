import { translateVibe } from "./vibeTranslator"
import { foursquareService } from "./foursquareService"

// Mood groups for categorization
const MOOD_GROUPS = {
  nightlife: ["bellakeo", "perreo", "antro", "fiesta", "baile", "reventón"],
  romantic: ["romántico", "íntimo", "cena", "pareja", "date"],
  chill: ["chill", "tranquilo", "relajado", "cozy", "café"],
  productive: ["productivo", "trabajo", "estudio", "wifi", "focus"],
  food: ["comida", "botanear", "mariscos", "gourmet", "tradicional"],
  culture: ["cultura", "arte", "museo", "teatro"],
  outdoor: ["aire libre", "parque", "naturaleza", "ejercicio"],
}

export async function processVibeInput(input: string): Promise<{
  tokens: string[]
  moodGroup: string | null
  translation?: any
  foursquareQuery?: string
  categories?: string
}> {
  const lowerInput = input.toLowerCase().trim()

  // 1. Identify mood group
  let moodGroup: string | null = null
  for (const [group, moods] of Object.entries(MOOD_GROUPS)) {
    if (moods.some((mood) => lowerInput.includes(mood))) {
      moodGroup = group
      break
    }
  }

  // 2. Get semantic translation
  const translation = await translateVibe(input)

  // 3. Generate tokens combining original + translated
  const originalTokens = lowerInput.split(/\s+/).filter((word) => word.length > 2)
  const translatedTokens = translation.translatedQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)

  const allTokens = [...new Set([...originalTokens, ...translatedTokens])]

  // 4. Build Foursquare-specific query
  const { query: foursquareQuery, categories } = foursquareService.buildSearchQuery(allTokens, moodGroup)

  console.log(`🎭 Processed vibe "${input}":`, {
    tokens: allTokens.length,
    moodGroup,
    translationSource: translation.source,
    foursquareQuery,
    categories,
  })

  return {
    tokens: allTokens,
    moodGroup,
    translation,
    foursquareQuery,
    categories,
  }
}

// Enhanced relevance scoring with Foursquare data
export function calculateRelevanceScore(place: any, vibeTokens: string[], moodGroup: string | null): number {
  let score = 0

  // Base scoring by tag matches
  vibeTokens.forEach((vibeToken) => {
    place.tags.forEach((placeTag: string) => {
      const vibeTokenLower = vibeToken.toLowerCase()
      const placeTagLower = placeTag.toLowerCase()

      if (placeTagLower === vibeTokenLower) {
        score += 2.0
      } else if (placeTagLower.includes(vibeTokenLower) || vibeTokenLower.includes(placeTagLower)) {
        score += 1.0
      }
    })

    // Scoring by name and category
    if (place.name.toLowerCase().includes(vibeToken.toLowerCase())) score += 0.5
    if (place.category.toLowerCase().includes(vibeToken.toLowerCase())) score += 0.5
  })

  // Mood group bonus
  if (moodGroup) {
    const moodBonus = {
      nightlife:
        place.category.toLowerCase().includes("bar") || place.category.toLowerCase().includes("club") ? 1.0 : 0,
      romantic: place.category.toLowerCase().includes("restaurant") ? 0.8 : 0,
      chill: place.category.toLowerCase().includes("cafe") || place.category.toLowerCase().includes("coffee") ? 0.8 : 0,
      productive:
        place.category.toLowerCase().includes("cafe") || place.category.toLowerCase().includes("coffee") ? 1.0 : 0,
      food:
        place.category.toLowerCase().includes("restaurant") || place.category.toLowerCase().includes("food") ? 0.8 : 0,
      culture:
        place.category.toLowerCase().includes("museum") || place.category.toLowerCase().includes("theater") ? 1.0 : 0,
      outdoor: place.category.toLowerCase().includes("park") ? 1.0 : 0,
    }
    score += moodBonus[moodGroup as keyof typeof moodBonus] || 0
  }

  // Quality bonuses
  const rating = Number.parseFloat(place.google_rating)
  if (rating >= 4.5) score += 0.5
  else if (rating >= 4.0) score += 0.3
  else if (rating >= 3.5) score += 0.1

  // Verification bonus
  if (place.tags.includes("verificado")) score += 0.2

  return score
}
