"use client"

import { generatePlaceholderSVG, getCategoryVisual } from "../lib/placeholders"

const DEMO_PLACES = [
  { name: "Hueso Restaurant", category: "restaurante" },
  { name: "Antro Babel", category: "antro" },
  { name: "Blend Station", category: "café" },
  { name: "Barbería Royal", category: "barbería" },
  { name: "Parque Fundidora", category: "parque" },
  { name: "Teatro Degollado", category: "teatro" },
]

export default function PlaceholderDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/40 to-fuchsia-600/30 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Placeholders Elegantes por Categoría</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PLACES.map((place) => {
            const visual = getCategoryVisual(place.category)
            return (
              <div key={place.name} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="aspect-[4/3] mb-4 rounded-xl overflow-hidden">
                  <img
                    src={generatePlaceholderSVG(place.name, place.category) || "/placeholder.svg"}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">{place.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{visual.emoji}</span>
                  <span className="text-white/80 capitalize">{place.category}</span>
                </div>

                <div className="text-xs text-white/60 italic">
                  Fotos próximamente - Verificamos cada lugar personalmente
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">¿Por qué placeholders?</h2>
          <ul className="text-white/80 space-y-2">
            <li>
              • <strong>Credibilidad:</strong> Mejor que imágenes incorrectas
            </li>
            <li>
              • <strong>Consistencia:</strong> Diseño uniforme por categoría
            </li>
            <li>
              • <strong>Transparencia:</strong> Comunicamos que las fotos vienen pronto
            </li>
            <li>
              • <strong>Profesional:</strong> Placeholders elegantes vs. imágenes genéricas
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
