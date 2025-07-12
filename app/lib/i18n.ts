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
  cities: {
    "Ciudad Victoria": "Ciudad Victoria",
    Monterrey: "Monterrey",
    Guadalajara: "Guadalajara",
    CDMX: "CDMX",
    "San Francisco": "San Francisco",
  },
  navigation: {
    home: "Inicio",
    favorites: "Favoritos",
  },
}

export const getTopTokensByCity = (city: string): string[] => {
  const cityTokens: Record<string, string[]> = {
    "Ciudad Victoria": ["chill", "familiar", "tradicional", "cozy", "productivo"],
    Monterrey: ["bellakeo", "elegante", "chill", "productivo", "familiar"],
    Guadalajara: ["tradicional", "mariachi", "familiar", "chill", "cultura"],
    CDMX: ["hipster", "arte", "cultura", "bellakeo", "gourmet"],
    "San Francisco": ["tech", "hipster", "chill", "productivo", "gourmet"],
  }

  return cityTokens[city] || ["chill", "cozy", "familiar", "tradicional", "productivo"]
}
