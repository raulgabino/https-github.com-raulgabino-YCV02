export const copy = {
  landing: {
    title: "¿Qué vibra traes?",
    subtitle: "Descubre lugares que conecten con tu mood",
    placeholder: "Ej. bellakeo, cozy, productivo...",
    searchButton: "Buscar",
    cityLabel: "Ciudad",
    suggestedChips: "Sugerencias:",
  },
  stories: {
    exploreMore: "Explora más",
    openMaps: "Abrir en Maps",
    dmInstagram: "DM en IG",
    menu: "Menú",
    favorite: "Favorito",
    comingSoon: "Próximamente",
  },
  favorites: {
    title: "Tus Favoritos",
    empty: "No tienes favoritos aún",
    emptySubtitle: "Explora lugares y guarda los que más te gusten",
  },
  navigation: {
    home: "Inicio",
    favorites: "Favoritos",
  },
}

export const cities = {
  "Ciudad Victoria": "Ciudad Victoria",
  Monterrey: "Monterrey",
  Guadalajara: "Guadalajara",
  CDMX: "Ciudad de México",
  "San Francisco": "San Francisco",
}

export function getTopTokensByCity(city: string): string[] {
  const cityTokens: Record<string, string[]> = {
    "Ciudad Victoria": ["tranquilo", "familiar", "tradicional", "chill", "aire libre"],
    Monterrey: ["industrial", "moderno", "cabrito", "familiar", "tradicional"],
    Guadalajara: ["mariachi", "tradicional", "tequila", "cultura", "fiesta"],
    "Ciudad de México": ["cosmopolita", "arte", "cultura", "diverso", "urbano"],
    "San Francisco": ["tech", "hipster", "chill", "productivo", "gourmet"],
  }

  return cityTokens[city] || ["chill", "moderno", "familiar"]
}
