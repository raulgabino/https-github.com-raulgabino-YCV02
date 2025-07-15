// Procesador de vibes simplificado - ahora usa el traductor semántico
import { translateVibe } from "./vibeTranslator"

// Grupos semánticos simplificados
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
}> {
  const lowerInput = input.toLowerCase().trim()

  // 1. Identificar grupo de mood
  let moodGroup: string | null = null
  for (const [group, moods] of Object.entries(MOOD_GROUPS)) {
    if (moods.some((mood) => lowerInput.includes(mood))) {
      moodGroup = group
      break
    }
  }

  // 2. Obtener traducción semántica
  const translation = await translateVibe(input)

  // 3. Generar tokens combinando original + traducido
  const originalTokens = lowerInput.split(/\s+/).filter((word) => word.length > 2)
  const translatedTokens = translation.translatedQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)

  const allTokens = [...new Set([...originalTokens, ...translatedTokens])]

  return {
    tokens: allTokens,
    moodGroup,
    translation,
  }
}

// Función simplificada para calcular relevancia
export function calculateRelevanceScore(place: any, vibeTokens: string[], moodGroup: string | null): number {
  let score = 0

  // Scoring por coincidencias en tags
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

    // Scoring por nombre y categoría
    if (place.name.toLowerCase().includes(vibeToken.toLowerCase())) score += 0.5
    if (place.category.toLowerCase().includes(vibeToken.toLowerCase())) score += 0.5
  })

  // Bonus por rating alto
  const rating = Number.parseFloat(place.google_rating)
  if (rating >= 4.5) score += 0.3
  else if (rating >= 4.0) score += 0.1

  return score
}
