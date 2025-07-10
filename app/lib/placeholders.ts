function safeBtoa(str: string): string {
  try {
    // Check if btoa is available (browser environment)
    if (typeof btoa !== "undefined") {
      return btoa(str)
    }
    // Fallback for server-side rendering
    return Buffer.from(str).toString("base64")
  } catch (error) {
    console.error("Error encoding SVG:", error)
    return ""
  }
}

const CATEGORY_VISUALS = {
  restaurante: {
    emoji: "🍽️",
    gradient: "from-orange-400 to-red-500",
    bgColor: "#f97316",
    pattern: "food-pattern",
    description: "Restaurante",
  },
  antro: {
    emoji: "🎵",
    gradient: "from-purple-500 to-pink-500",
    bgColor: "#a855f7",
    pattern: "music-pattern",
    description: "Antro",
  },
  café: {
    emoji: "☕",
    gradient: "from-amber-400 to-brown-500",
    bgColor: "#f59e0b",
    pattern: "coffee-pattern",
    description: "Café",
  },
  cafetería: {
    emoji: "☕",
    gradient: "from-amber-400 to-brown-500",
    bgColor: "#f59e0b",
    pattern: "coffee-pattern",
    description: "Cafetería",
  },
  bar: {
    emoji: "🍸",
    gradient: "from-blue-500 to-purple-600",
    bgColor: "#3b82f6",
    pattern: "cocktail-pattern",
    description: "Bar",
  },
  parque: {
    emoji: "🌳",
    gradient: "from-green-400 to-emerald-600",
    bgColor: "#22c55e",
    pattern: "nature-pattern",
    description: "Parque",
  },
  museo: {
    emoji: "🏛️",
    gradient: "from-slate-400 to-gray-600",
    bgColor: "#64748b",
    pattern: "culture-pattern",
    description: "Museo",
  },
  teatro: {
    emoji: "🎭",
    gradient: "from-red-500 to-rose-600",
    bgColor: "#ef4444",
    pattern: "theater-pattern",
    description: "Teatro",
  },
  universidad: {
    emoji: "🎓",
    gradient: "from-indigo-500 to-blue-600",
    bgColor: "#6366f1",
    pattern: "education-pattern",
    description: "Universidad",
  },
  barbería: {
    emoji: "✂️",
    gradient: "from-gray-600 to-slate-700",
    bgColor: "#4b5563",
    pattern: "barber-pattern",
    description: "Barbería",
  },
  plaza: {
    emoji: "🏛️",
    gradient: "from-stone-400 to-gray-500",
    bgColor: "#a8a29e",
    pattern: "plaza-pattern",
    description: "Plaza",
  },
  zona: {
    emoji: "🏙️",
    gradient: "from-cyan-500 to-blue-600",
    bgColor: "#06b6d4",
    pattern: "urban-pattern",
    description: "Zona",
  },
  atracción: {
    emoji: "🎡",
    gradient: "from-pink-500 to-rose-500",
    bgColor: "#ec4899",
    pattern: "attraction-pattern",
    description: "Atracción",
  },
  mercado: {
    emoji: "🛒",
    gradient: "from-yellow-500 to-orange-500",
    bgColor: "#eab308",
    pattern: "market-pattern",
    description: "Mercado",
  },
  cantina: {
    emoji: "🍺",
    gradient: "from-amber-600 to-yellow-600",
    bgColor: "#d97706",
    pattern: "cantina-pattern",
    description: "Cantina",
  },
}

export function getCategoryVisual(category: string) {
  const normalizedCategory = category.toLowerCase()
  return CATEGORY_VISUALS[normalizedCategory] || CATEGORY_VISUALS.restaurante
}

export function generatePlaceholderSVG(placeName: string, category: string, width = 400, height = 300): string {
  const visual = getCategoryVisual(category)
  const placeNameShort = placeName.length > 20 ? placeName.substring(0, 17) + "..." : placeName

  // Escape special characters in place name
  const safePlaceName = placeNameShort.replace(/[<>&"']/g, (char) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    }
    return entities[char] || char
  })

  const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${visual.bgColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${visual.bgColor};stop-opacity:1" />
        </linearGradient>
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.1"/>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#bg-gradient)"/>
      <rect width="100%" height="100%" fill="url(#dots)"/>
      
      <text x="50%" y="35%" text-anchor="middle" font-size="48" dominant-baseline="middle">
        ${visual.emoji}
      </text>
      
      <text x="50%" y="55%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
            font-size="18" font-weight="600" fill="white" dominant-baseline="middle">
        ${safePlaceName}
      </text>
      
      <text x="50%" y="70%" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
            font-size="14" fill="white" opacity="0.9" dominant-baseline="middle">
        ${visual.description}
      </text>
      
      <rect x="10" y="10" width="120" height="24" rx="12" fill="white" opacity="0.2"/>
      <text x="70" y="22" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" 
            font-size="11" font-weight="500" fill="white" dominant-baseline="middle">
        Fotos próximamente
      </text>
    </svg>`

  const encodedSvg = safeBtoa(svgContent)
  return encodedSvg ? `data:image/svg+xml;base64,${encodedSvg}` : "/placeholder.svg"
}

export function generatePlaceholderDataURL(placeName: string, category: string): string {
  return generatePlaceholderSVG(placeName, category, 400, 600)
}

export function getPlaceholderMessage(): string {
  return "Fotos próximamente - Verificamos cada lugar personalmente"
}

// Función para generar placeholder específico para cards pequeñas
export function generateSmallPlaceholderSVG(placeName: string, category: string): string {
  const visual = getCategoryVisual(category)

  const svgContent = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="small-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${visual.bgColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${visual.bgColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#small-gradient)" rx="8"/>
      
      <text x="50%" y="50%" text-anchor="middle" font-size="32" dominant-baseline="middle">
        ${visual.emoji}
      </text>
    </svg>`

  const encodedSvg = safeBtoa(svgContent)
  return encodedSvg ? `data:image/svg+xml;base64,${encodedSvg}` : "/placeholder.svg"
}
