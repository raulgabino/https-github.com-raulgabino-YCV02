// Create a simple fallback system
export function createSimplePlaceholder(category: string): string {
  const categoryEmojis: Record<string, string> = {
    restaurante: "🍽️",
    antro: "🎵",
    café: "☕",
    cafetería: "☕",
    bar: "🍸",
    parque: "🌳",
    museo: "🏛️",
    teatro: "🎭",
    universidad: "🎓",
    barbería: "✂️",
    plaza: "🏛️",
    zona: "🏙️",
    atracción: "🎡",
    mercado: "🛒",
    cantina: "🍺",
  }

  const emoji = categoryEmojis[category.toLowerCase()] || "📍"

  // Simple SVG without complex encoding
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23666'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' font-size='48'%3E${emoji}%3C/text%3E%3C/svg%3E`
}
