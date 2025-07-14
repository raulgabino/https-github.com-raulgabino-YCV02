#!/usr/bin/env node
import { processVibeInput } from "../app/lib/vibeProcessor"
import { buildFoursquareQuery } from "../app/lib/placesService"

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

const tests = [
  { mood: "bellaqueo", city: "Monterrey", expected: "Debería encontrar clubes/antros" },
  { mood: "perreo", city: "Monterrey", expected: "Debería encontrar lugares de reggaeton" },
  { mood: "lugar para romantico", city: "Monterrey", expected: "Restaurantes románticos" },
  { mood: "nightclub", city: "Monterrey", expected: "Clubes nocturnos" },
  { mood: "romantic restaurant", city: "Monterrey", expected: "Restaurantes románticos" },
  { mood: "bar", city: "Monterrey", expected: "Bares" },
  { mood: "dance club", city: "Monterrey", expected: "Lugares de baile" },
  { mood: "fine dining", city: "Monterrey", expected: "Restaurantes elegantes" },
]

const englishFallback: Record<string, string> = {
  bellaqueo: "nightclub dance reggaeton",
  perreo: "nightclub dancing",
  "lugar para romantico": "romantic restaurant",
}

async function run() {
  console.log("=== DIAGNÓSTICO SEMÁNTICO ===\n")

  for (const t of tests) {
    console.log(`🧪 "${t.mood}" → ${t.city}`)
    const { tokens, moodGroup } = processVibeInput(t.mood)
    const q = buildFoursquareQuery(tokens, moodGroup)
    console.log(`   📝 Tokens: [${tokens.join(", ")}]`)
    console.log(`   🎯 Query: "${q}"`)

    const res = await fetch(`${BASE}/api/places?city=${t.city}&query=${encodeURIComponent(q)}`)
    const places: any[] = await res.json()
    console.log(`   📊 Resultados: ${places.length}`)

    if (places.length === 0 && englishFallback[t.mood]) {
      const ctrl = englishFallback[t.mood]
      const resCtrl = await fetch(`${BASE}/api/places?city=${t.city}&query=${encodeURIComponent(ctrl)}`)
      const placesCtrl: any[] = await resCtrl.json()
      console.log(`   🔄 Fallback inglés "${ctrl}": ${placesCtrl.length}`)
    }

    console.log()
  }

  console.log("🔬 TESTS DIRECTOS FOURSQUARE")
  for (const direct of ["nightclub", "restaurant", "bellaqueo", "perreo"]) {
    const res = await fetch(`${BASE}/api/places?city=Monterrey&query=${direct}`)
    const p: any[] = await res.json()
    console.log(`   "${direct}": ${p.length}`)
  }

  console.log("\n=== CONCLUSIÓN ===")
  console.log("Compare counts above to see if Spanish terms fail while English succeed.")
}

run().catch(console.error)
