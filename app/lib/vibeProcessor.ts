const VIBE_MAPPINGS = {
  // Sentimientos negativos
  bajoneado: ["triste", "melancólico", "solo", "sad", "downbad"],
  deprimido: ["triste", "melancólico", "introspectivo", "sad"],
  estresado: ["relajante", "tranquilo", "escapar", "chill", "cozy"],
  sad: ["melancólico", "nostálgico", "llorar", "soledad"],
  downbad: ["triste", "melancólico", "solo"],

  // Sentimientos positivos
  feliz: ["alegre", "festivo", "celebrar", "fiesta"],
  emocionado: ["energético", "aventura", "nuevo", "fiesta"],
  romántico: ["íntimo", "pareja", "amor", "elegante", "romántico"],

  // Actividades/vibes
  bellakeo: ["reggaeton", "fiesta", "perrea", "antro", "dembow", "urbano"],
  perrea: ["reggaeton", "fiesta", "bellakeo", "antro", "dembow"],
  reggaeton: ["bellakeo", "perrea", "fiesta", "antro", "urbano"],
  dembow: ["reggaeton", "bellakeo", "perrea", "urbano"],
  chill: ["relajado", "café", "tranquilo", "cozy", "lofi"],
  cozy: ["chill", "relajado", "tranquilo", "café", "acogedor"],
  fiesta: ["música", "baile", "noche", "diversión", "bellakeo"],
  productivo: ["trabajo", "estudio", "wifi", "silencio", "focus", "grind"],
  grind: ["productivo", "trabajo", "estudio", "focus"],
  eco: ["naturaleza", "verde", "aire libre", "ejercicio", "parque"],
  tradicional: ["auténtico", "familiar", "mariachi", "cultura"],
  elegante: ["romántico", "sofisticado", "exclusivo", "gourmet"],
  familiar: ["tradicional", "acogedor", "casual", "niños"],
  gourmet: ["elegante", "exclusivo", "autor", "refinado"],
  casual: ["familiar", "relajado", "sencillo", "económico"],
  trendy: ["moderno", "hipster", "de moda", "joven"],
  hipster: ["trendy", "alternativo", "bohemio", "arte"],
  arte: ["cultura", "bohemio", "galería", "creativo"],
  cultura: ["arte", "tradicional", "historia", "museo"],
  música: ["concierto", "festival", "mariachi", "banda"],
  mariachi: ["tradicional", "música", "mexicano", "cultura"],
  tequila: ["tradicional", "mexicano", "bar", "cantina"],
  mezcal: ["tradicional", "mexicano", "artesanal", "bar"],
  cerveza: ["casual", "bar", "relajado", "amigos"],
  cóctel: ["bar", "elegante", "noche", "sofisticado"],
  café: ["chill", "productivo", "tranquilo", "trabajo"],
  desayuno: ["mañana", "casual", "familiar", "café"],
  brunch: ["desayuno", "casual", "fin de semana", "relajado"],
  cena: ["noche", "romántico", "elegante", "especial"],
  comida: ["familiar", "tradicional", "casual", "mediodía"],
  bar: ["noche", "cóctel", "amigos", "relajado"],
  antro: ["fiesta", "noche", "bellakeo", "joven"],
  rooftop: ["vista", "elegante", "cóctel", "especial"],
  terraza: ["aire libre", "relajado", "vista", "agradable"],
  jardín: ["aire libre", "familiar", "tranquilo", "verde"],
  vista: ["especial", "romántico", "terraza", "panorámica"],
  japonés: ["tranquilo", "elegante", "diferente", "sushi"],
  italiano: ["romántico", "elegante", "pasta", "vino"],
  mexicano: ["tradicional", "auténtico", "familiar", "cultura"],
  mariscos: ["fresco", "costa", "especialidad", "delicioso"],
  cortes: ["carne", "elegante", "parrilla", "premium"],
  birria: ["tradicional", "mexicano", "auténtico", "jalisco"],
  cabrito: ["tradicional", "norteño", "auténtico", "monterrey"],
}

export function processVibeInput(input: string): string[] {
  const tokens: string[] = []
  const lowerInput = input.toLowerCase().trim()

  console.log("🔍 Processing vibe input:", input)

  // Buscar coincidencias exactas en mappings
  Object.entries(VIBE_MAPPINGS).forEach(([key, values]) => {
    if (lowerInput.includes(key)) {
      tokens.push(key, ...values)
      console.log(`✅ Found mapping for "${key}":`, values)
    }
  })

  // Buscar coincidencias parciales en los valores
  Object.entries(VIBE_MAPPINGS).forEach(([key, values]) => {
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

  return uniqueTokens
}

export function calculateScore(placeTags: string[], vibeTokens: string[]): number {
  let score = 0

  vibeTokens.forEach((vibeToken) => {
    placeTags.forEach((placeTag) => {
      const vibeTokenLower = vibeToken.toLowerCase()
      const placeTagLower = placeTag.toLowerCase()

      // Coincidencia exacta
      if (placeTagLower === vibeTokenLower) {
        score += 20
      }
      // Coincidencia parcial
      else if (placeTagLower.includes(vibeTokenLower) || vibeTokenLower.includes(placeTagLower)) {
        score += 10
      }
    })
  })

  return score
}
