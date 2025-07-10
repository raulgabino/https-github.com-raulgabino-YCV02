const INCOMPATIBLE_COMBINATIONS = {
  bellakeo: {
    excluded_categories: ["parque", "plaza", "biblioteca", "museo", "universidad", "cafetería"],
    required_categories: ["antro", "bar", "club", "salón", "restaurante"],
    reason: "Bellakeo requiere música fuerte y espacio de baile",
  },
  productivo: {
    excluded_categories: ["antro", "bar", "club", "salón"],
    required_categories: ["café", "cafetería", "biblioteca", "coworking", "universidad"],
    reason: "Productivo requiere silencio y concentración",
  },
  eco: {
    excluded_categories: ["antro", "bar", "club"],
    required_categories: ["parque", "jardín", "naturaleza", "plaza"],
    reason: "Eco requiere espacios naturales o al aire libre",
  },
  romántico: {
    excluded_categories: ["antro", "biblioteca", "universidad"],
    required_categories: ["restaurante", "bar", "café", "cafetería", "mirador"],
    reason: "Romántico requiere ambiente íntimo",
  },
  familiar: {
    excluded_categories: ["antro", "bar", "club"],
    required_categories: ["restaurante", "parque", "museo", "plaza", "zona", "atracción"],
    reason: "Familiar requiere espacios apropiados para niños",
  },
  chill: {
    excluded_categories: [],
    required_categories: ["café", "cafetería", "restaurante", "bar", "parque", "plaza"],
    reason: "Chill permite espacios relajados variados",
  },
  sad: {
    excluded_categories: ["antro", "club"],
    required_categories: ["café", "cafetería", "parque", "bar", "restaurante"],
    reason: "Sad requiere espacios tranquilos para reflexionar",
  },
  cultura: {
    excluded_categories: ["antro", "club"],
    required_categories: ["museo", "teatro", "galería", "zona", "universidad"],
    reason: "Cultura requiere espacios educativos o artísticos",
  },
}

export function validateVibeCategory(vibe: string, place: any): boolean {
  const rules = INCOMPATIBLE_COMBINATIONS[vibe]
  if (!rules) return true

  // Verificar exclusiones ABSOLUTAS
  if (rules.excluded_categories.includes(place.category)) {
    console.log(`❌ Excluded: ${place.name} (${place.category}) incompatible with ${vibe}`)
    return false
  }

  // Verificar categorías requeridas
  if (
    rules.required_categories &&
    rules.required_categories.length > 0 &&
    !rules.required_categories.includes(place.category)
  ) {
    console.log(`❌ Not required: ${place.name} (${place.category}) not valid for ${vibe}`)
    return false
  }

  return true
}

export function getVibeFromTokens(tokens: string[]): string {
  const vibeMap = {
    bellakeo: ["bellakeo", "reggaeton", "perrea", "antro", "fiesta", "dembow", "urbano"],
    productivo: ["productivo", "trabajo", "estudio", "concentración", "grind", "focus", "wifi"],
    eco: ["eco", "naturaleza", "verde", "outdoor", "aire libre", "ejercicio", "parque"],
    romántico: ["romántico", "íntimo", "pareja", "date", "elegante", "cena"],
    familiar: ["familiar", "familia", "niños", "tradicional", "casual"],
    chill: ["chill", "relajado", "tranquilo", "cozy", "lofi"],
    sad: ["sad", "downbad", "melancólico", "nostálgico", "triste", "solo"],
    cultura: ["cultura", "arte", "museo", "teatro", "galería", "historia"],
  }

  for (const [vibe, keywords] of Object.entries(vibeMap)) {
    if (tokens.some((token) => keywords.includes(token.toLowerCase()))) {
      return vibe
    }
  }

  return "chill" // fallback seguro
}

export function getAvailableVibes(): string[] {
  return Object.keys(INCOMPATIBLE_COMBINATIONS)
}

export function getVibeReason(vibe: string): string {
  const rules = INCOMPATIBLE_COMBINATIONS[vibe]
  return rules ? rules.reason : "Vibe general"
}
