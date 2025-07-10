export interface PersonalityProfile {
  name: string
  real_name: string
  category: string
  demographics: string
  lifestyle: string[]
  venue_preferences: string[]
  avoid_categories: string[]
  personality_traits: string[]
  bio_snippet: string
  emoji: string
  color_scheme: {
    primary: string
    secondary: string
  }
}

export const PERSONALITY_PROFILES: Record<string, PersonalityProfile> = {
  "peso-pluma": {
    name: "Peso Pluma",
    real_name: "Hassan Emilio Kabande Laija",
    category: "música-regional",
    demographics: "18-25",
    lifestyle: ["corridos", "norteño", "regional", "auténtico", "tradicional"],
    venue_preferences: ["antro", "bar", "restaurante", "cantina", "salón"],
    avoid_categories: ["biblioteca", "museo", "café", "universidad"],
    personality_traits: ["auténtico", "tradicional", "fiesta", "música", "regional", "mexicano"],
    bio_snippet: "Rey de los corridos tumbados que revolucionó la música regional mexicana",
    emoji: "🎵",
    color_scheme: {
      primary: "#8B5A2B",
      secondary: "#D2691E",
    },
  },
  "bad-bunny": {
    name: "Bad Bunny",
    real_name: "Benito Antonio Martínez",
    category: "reggaeton-urbano",
    demographics: "18-30",
    lifestyle: ["reggaeton", "urbano", "bellakeo", "trendy", "moderno"],
    venue_preferences: ["antro", "bar", "restaurante", "club"],
    avoid_categories: ["biblioteca", "museo", "plaza"],
    personality_traits: ["moderno", "urbano", "internacional", "fiesta", "innovador"],
    bio_snippet: "Estrella global del reggaeton que redefinió la música urbana latina",
    emoji: "🐰",
    color_scheme: {
      primary: "#FF1493",
      secondary: "#9400D3",
    },
  },
  "taylor-swift": {
    name: "Taylor Swift",
    real_name: "Taylor Alison Swift",
    category: "pop-internacional",
    demographics: "16-35",
    lifestyle: ["aesthetic", "vintage", "romántico", "cultural", "artístico"],
    venue_preferences: ["café", "cafetería", "restaurante", "museo", "teatro", "galería"],
    avoid_categories: ["antro", "cantina"],
    personality_traits: ["estético", "cultural", "romántico", "introspectivo", "artístico"],
    bio_snippet: "Icono pop global conocida por sus narrativas emotivas y estética vintage",
    emoji: "🦋",
    color_scheme: {
      primary: "#FFB6C1",
      secondary: "#DDA0DD",
    },
  },
  "karol-g": {
    name: "Karol G",
    real_name: "Carolina Giraldo Navarro",
    category: "reggaeton-femenino",
    demographics: "18-30",
    lifestyle: ["reggaeton", "empoderado", "colorido", "fiesta", "urbano"],
    venue_preferences: ["antro", "bar", "restaurante", "salón"],
    avoid_categories: ["biblioteca", "museo"],
    personality_traits: ["empoderada", "colorida", "fiesta", "urbana", "latina"],
    bio_snippet: "Reina del reggaeton que empoderó a toda una generación de mujeres latinas",
    emoji: "👑",
    color_scheme: {
      primary: "#FF69B4",
      secondary: "#00CED1",
    },
  },
  "natanael-cano": {
    name: "Natanael Cano",
    real_name: "Nathanahel Rubén Cano Monge",
    category: "corridos-tumbados",
    demographics: "16-25",
    lifestyle: ["corridos", "tumbados", "trap", "regional", "joven"],
    venue_preferences: ["antro", "bar", "restaurante", "cantina"],
    avoid_categories: ["museo", "teatro", "biblioteca"],
    personality_traits: ["rebelde", "joven", "innovador", "regional", "auténtico"],
    bio_snippet: "Pionero de los corridos tumbados que fusionó el regional con el trap",
    emoji: "🎸",
    color_scheme: {
      primary: "#228B22",
      secondary: "#32CD32",
    },
  },
}

export function getPersonalityProfile(slug: string): PersonalityProfile | null {
  return PERSONALITY_PROFILES[slug] || null
}

export function getAllPersonalities(): PersonalityProfile[] {
  return Object.values(PERSONALITY_PROFILES)
}

export function getPersonalityByCategory(category: string): PersonalityProfile[] {
  return Object.values(PERSONALITY_PROFILES).filter((p) => p.category === category)
}

export const FEATURED_PERSONALITIES = [
  { slug: "peso-pluma", name: "Peso Pluma", emoji: "🎵", category: "Corridos" },
  { slug: "bad-bunny", name: "Bad Bunny", emoji: "🐰", category: "Reggaeton" },
  { slug: "taylor-swift", name: "Taylor Swift", emoji: "🦋", category: "Pop" },
  { slug: "karol-g", name: "Karol G", emoji: "👑", category: "Reggaeton" },
  { slug: "natanael-cano", name: "Natanael Cano", emoji: "🎸", category: "Corridos" },
]
