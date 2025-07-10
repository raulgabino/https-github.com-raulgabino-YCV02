// Grupos semánticos de moods
const MOOD_GROUPS = {
  mood_down: ["bajoneado", "deprimido", "triste", "melancólico", "sad", "downbad", "solo", "nostálgico"],
  mood_party: ["bellakeo", "fiesta", "perrea", "reggaeton", "dembow", "antro", "baile", "noche"],
  mood_chill: ["chill", "relajado", "tranquilo", "cozy", "café", "productivo", "trabajo"],
  mood_romantic: ["romántico", "pareja", "cena", "elegante", "íntimo", "especial"],
  mood_social: ["amigos", "casual", "familiar", "grupo", "compartir"],
  mood_adventure: ["nuevo", "explorar", "diferente", "único", "experiencia"],
  mood_cultural: ["arte", "cultura", "museo", "tradicional", "historia"],
  mood_food: ["hambre", "comer", "gourmet", "sabor", "delicioso"],
}

const ENHANCED_VIBE_MAPPINGS = {
  // Mood Down - lugares para cuando andas bajoneado
  bajoneado: ["melancólico", "introspectivo", "tranquilo", "café", "solo", "pensativo"],
  deprimido: ["melancólico", "introspectivo", "tranquilo", "café", "contemplativo"],
  triste: ["melancólico", "nostálgico", "tranquilo", "introspectivo"],
  sad: ["melancólico", "nostálgico", "introspectivo", "contemplativo"],
  downbad: ["melancólico", "solo", "introspectivo", "café"],
  solo: ["tranquilo", "café", "introspectivo", "contemplativo"],
  melancólico: ["nostálgico", "introspectivo", "tranquilo", "pensativo"],
  nostálgico: ["melancólico", "tradicional", "vintage", "retro"],

  // Mood Party - lugares para bellakeo y fiesta
  bellakeo: ["reggaeton", "fiesta", "perrea", "antro", "dembow", "urbano", "noche"],
  perrea: ["reggaeton", "bellakeo", "fiesta", "antro", "dembow", "baile"],
  reggaeton: ["bellakeo", "perrea", "fiesta", "antro", "urbano"],
  fiesta: ["música", "baile", "noche", "diversión", "bellakeo", "antro"],
  antro: ["fiesta", "noche", "bellakeo", "joven", "música"],
  baile: ["música", "fiesta", "noche", "diversión"],

  // Mood Chill - lugares relajados
  chill: ["relajado", "café", "tranquilo", "cozy", "lofi", "productivo"],
  relajado: ["chill", "tranquilo", "cozy", "café", "descanso"],
  tranquilo: ["chill", "relajado", "cozy", "silencio", "paz"],
  cozy: ["chill", "relajado", "acogedor", "café", "íntimo"],
  productivo: ["trabajo", "estudio", "wifi", "silencio", "focus", "café"],
  trabajo: ["productivo", "wifi", "silencio", "café", "oficina"],
  estudio: ["productivo", "silencio", "wifi", "biblioteca", "focus"],

  // Mood Romantic
  romántico: ["íntimo", "pareja", "elegante", "cena", "especial", "terraza"],
  pareja: ["romántico", "íntimo", "especial", "cena", "privado"],
  íntimo: ["romántico", "pareja", "acogedor", "privado", "especial"],
  cena: ["romántico", "elegante", "noche", "especial", "gourmet"],

  // Categorías de lugares
  café: ["chill", "productivo", "tranquilo", "trabajo", "cozy"],
  bar: ["noche", "cóctel", "amigos", "relajado", "social"],
  restaurante: ["comida", "cena", "familiar", "gourmet", "sabor"],
  museo: ["cultura", "arte", "educativo", "tranquilo", "inspirador"],
  parque: ["aire libre", "ejercicio", "familiar", "naturaleza", "relajado"],

  // Características específicas
  elegante: ["sofisticado", "exclusivo", "gourmet", "romántico", "especial"],
  casual: ["familiar", "relajado", "sencillo", "económico", "cómodo"],
  tradicional: ["auténtico", "familiar", "cultura", "historia", "típico"],
  moderno: ["contemporáneo", "trendy", "nuevo", "innovador", "actual"],
  familiar: ["niños", "grupo", "casual", "acogedor", "tradicional"],
}

export function processVibeInput(input: string): { tokens: string[]; moodGroup: string | null } {
  const tokens: string[] = []
  const lowerInput = input.toLowerCase().trim()
  let moodGroup: string | null = null

  console.log("🔍 Processing vibe input:", input)

  // Identificar grupo de mood principal
  for (const [group, moods] of Object.entries(MOOD_GROUPS)) {
    if (moods.some((mood) => lowerInput.includes(mood))) {
      moodGroup = group
      console.log(`🎭 Detected mood group: ${group}`)
      break
    }
  }

  // Buscar coincidencias exactas en mappings
  Object.entries(ENHANCED_VIBE_MAPPINGS).forEach(([key, values]) => {
    if (lowerInput.includes(key)) {
      tokens.push(key, ...values)
      console.log(`✅ Found mapping for "${key}":`, values)
    }
  })

  // Buscar coincidencias parciales en los valores
  Object.entries(ENHANCED_VIBE_MAPPINGS).forEach(([key, values]) => {
    values.forEach((value) => {
      if (lowerInput.includes(value) && !tokens.includes(value)) {
        tokens.push(value, key)
        console.log(`✅ Found reverse mapping for "${value}" -> "${key}"`)
      }
    })
  })

  // Si no hay coincidencias, usar palabras clave del input
  if (tokens.length === 0) {
    const words = lowerInput.split(/\s+/).filter((word) => word.length > 2)
    tokens.push(...words)
    console.log("⚠️ No mappings found, using raw words:", words)
  }

  // Remover duplicados
  const uniqueTokens = [...new Set(tokens)]
  console.log("🎯 Final processed tokens:", uniqueTokens)
  console.log("🎭 Mood group:", moodGroup)

  return { tokens: uniqueTokens, moodGroup }
}

export function calculateRelevanceScore(place: any, vibeTokens: string[], moodGroup: string | null): number {
  let score = 0

  // Scoring por coincidencias en tags
  vibeTokens.forEach((vibeToken) => {
    place.tags.forEach((placeTag: string) => {
      const vibeTokenLower = vibeToken.toLowerCase()
      const placeTagLower = placeTag.toLowerCase()

      // Coincidencia exacta
      if (placeTagLower === vibeTokenLower) {
        score += 2.0
      }
      // Coincidencia parcial
      else if (placeTagLower.includes(vibeTokenLower) || vibeTokenLower.includes(placeTagLower)) {
        score += 1.0
      }
    })

    // Scoring por nombre del lugar
    const placeName = place.name.toLowerCase()
    if (placeName.includes(vibeToken.toLowerCase())) {
      score += 0.5
    }

    // Scoring por categoría
    const placeCategory = place.category.toLowerCase()
    if (placeCategory.includes(vibeToken.toLowerCase())) {
      score += 0.5
    }
  })

  // Bonus por grupo de mood
  if (moodGroup) {
    const groupBonus = getMoodGroupBonus(place, moodGroup)
    score += groupBonus
    console.log(`🎭 Mood group bonus for ${place.name}: +${groupBonus}`)
  }

  // Bonus por rating alto
  const rating = Number.parseFloat(place.google_rating)
  if (rating >= 4.5) score += 0.3
  else if (rating >= 4.0) score += 0.1

  return score
}

function getMoodGroupBonus(place: any, moodGroup: string): number {
  const placeTags = place.tags.map((tag: string) => tag.toLowerCase())
  const placeCategory = place.category.toLowerCase()

  switch (moodGroup) {
    case "mood_down":
      if (placeTags.some((tag) => ["café", "tranquilo", "cozy", "introspectivo"].includes(tag))) return 1.0
      if (placeCategory === "café") return 0.8
      break
    case "mood_party":
      if (placeTags.some((tag) => ["antro", "fiesta", "reggaeton", "baile"].includes(tag))) return 1.0
      if (placeCategory === "antro") return 0.8
      break
    case "mood_chill":
      if (placeTags.some((tag) => ["chill", "relajado", "café", "productivo"].includes(tag))) return 1.0
      if (["café", "biblioteca"].includes(placeCategory)) return 0.8
      break
    case "mood_romantic":
      if (placeTags.some((tag) => ["romántico", "elegante", "íntimo"].includes(tag))) return 1.0
      if (placeCategory === "restaurante") return 0.5
      break
  }
  return 0
}
