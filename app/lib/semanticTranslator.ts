// Traductor semántico para mejorar la comprensión de términos latinos
export interface SemanticMapping {
  spanish: string
  english: string[]
  category?: string
  context: string
}

export const SEMANTIC_MAPPINGS: SemanticMapping[] = [
  // Nightlife & Party
  {
    spanish: "bellakeo",
    english: ["nightclub", "dance club", "reggaeton club"],
    category: "nightlife",
    context: "Urban latino nightlife scene",
  },
  {
    spanish: "perreo",
    english: ["dance club", "reggaeton venue", "nightclub"],
    category: "nightlife",
    context: "Reggaeton dancing venues",
  },
  {
    spanish: "antro",
    english: ["nightclub", "club", "bar"],
    category: "nightlife",
    context: "Mexican slang for nightclub",
  },
  {
    spanish: "reventón",
    english: ["party venue", "nightclub", "event space"],
    category: "nightlife",
    context: "Big party or celebration venue",
  },

  // Food & Dining
  {
    spanish: "romántico",
    english: ["romantic restaurant", "intimate dining", "date spot"],
    category: "restaurant",
    context: "Romantic dining experience",
  },
  {
    spanish: "botanear",
    english: ["bar", "tapas", "appetizers", "casual dining"],
    category: "bar",
    context: "Mexican tradition of drinking with snacks",
  },
  {
    spanish: "marisquería",
    english: ["seafood restaurant", "oyster bar", "fish restaurant"],
    category: "restaurant",
    context: "Seafood specialty restaurant",
  },

  // Chill & Relaxed
  {
    spanish: "chill",
    english: ["coffee shop", "quiet bar", "relaxed atmosphere"],
    category: "cafe",
    context: "Relaxed, laid-back atmosphere",
  },
  {
    spanish: "tranquilo",
    english: ["quiet cafe", "peaceful restaurant", "calm environment"],
    category: "cafe",
    context: "Peaceful, quiet places",
  },

  // Work & Productivity
  {
    spanish: "productivo",
    english: ["coffee shop", "coworking", "wifi cafe", "study space"],
    category: "cafe",
    context: "Places good for working or studying",
  },

  // Cultural
  {
    spanish: "cultural",
    english: ["museum", "art gallery", "theater", "cultural center"],
    category: "arts",
    context: "Cultural and artistic venues",
  },
  {
    spanish: "tradicional",
    english: ["traditional restaurant", "local cuisine", "authentic food"],
    category: "restaurant",
    context: "Traditional or authentic local places",
  },
]

export class SemanticTranslator {
  private mappings: Map<string, SemanticMapping>

  constructor() {
    this.mappings = new Map()
    SEMANTIC_MAPPINGS.forEach((mapping) => {
      this.mappings.set(mapping.spanish.toLowerCase(), mapping)
    })
  }

  // Translate Spanish/Latino terms to English equivalents
  translateQuery(query: string): {
    originalQuery: string
    translatedQuery: string
    mappingsUsed: SemanticMapping[]
    confidence: number
  } {
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(/\s+/)
    const mappingsUsed: SemanticMapping[] = []
    const translatedParts: string[] = []

    words.forEach((word) => {
      const mapping = this.mappings.get(word)
      if (mapping) {
        mappingsUsed.push(mapping)
        // Use the first (most relevant) English translation
        translatedParts.push(mapping.english[0])
      } else {
        translatedParts.push(word)
      }
    })

    const translatedQuery = translatedParts.join(" ")
    const confidence = mappingsUsed.length / words.length

    return {
      originalQuery: query,
      translatedQuery,
      mappingsUsed,
      confidence,
    }
  }

  // Get category suggestions based on semantic analysis
  getCategorySuggestions(query: string): string[] {
    const translation = this.translateQuery(query)
    const categories = translation.mappingsUsed.map((m) => m.category).filter((cat): cat is string => cat !== undefined)

    return [...new Set(categories)]
  }

  // Check if query needs semantic enhancement
  needsTranslation(query: string): boolean {
    const lowerQuery = query.toLowerCase()
    const words = lowerQuery.split(/\s+/)
    return words.some((word) => this.mappings.has(word))
  }

  // Get all available Spanish terms
  getSpanishTerms(): string[] {
    return Array.from(this.mappings.keys())
  }

  // Get mapping for a specific term
  getMapping(term: string): SemanticMapping | undefined {
    return this.mappings.get(term.toLowerCase())
  }
}

export const semanticTranslator = new SemanticTranslator()
