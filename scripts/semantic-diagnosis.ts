#!/usr/bin/env node

interface DiagnosticTest {
  type: "latino" | "english" | "direct"
  query: string
  expected: string
}

const BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

const DIAGNOSTIC_TESTS: DiagnosticTest[] = [
  { type: "latino", query: "bellaqueo", expected: "Debería encontrar clubes/antros" },
  { type: "latino", query: "perreo", expected: "Debería encontrar lugares de reggaeton" },
  { type: "latino", query: "romántico", expected: "Restaurantes románticos" },
  { type: "latino", query: "chill", expected: "Cafés tranquilos" },
  { type: "english", query: "nightclub", expected: "Clubes nocturnos" },
  { type: "english", query: "restaurant", expected: "Restaurantes" },
  { type: "english", query: "bar", expected: "Bares" },
  { type: "english", query: "coffee", expected: "Cafeterías" },
  { type: "direct", query: "dance club", expected: "Lugares de baile" },
  { type: "direct", query: "romantic restaurant", expected: "Restaurantes románticos" },
]

type Stats = { total: number; withResults: number; totalPlaces: number }

const results: Record<"latino" | "english" | "direct", Stats> = {
  latino: { total: 0, withResults: 0, totalPlaces: 0 },
  english: { total: 0, withResults: 0, totalPlaces: 0 },
  direct: { total: 0, withResults: 0, totalPlaces: 0 },
}

async function runSemanticDiagnosis(): Promise<void> {
  console.log("=== DIAGNÓSTICO SEMÁNTICO - YourCityVibes ===\n")
  console.log(`Fecha: ${new Date().toISOString()}`)
  console.log("Ciudad de prueba: Monterrey\n")

  for (const test of DIAGNOSTIC_TESTS) {
    console.log(`🧪 TEST [${test.type.toUpperCase()}]: "${test.query}"`)

    try {
      const url = `${BASE}/api/places?city=Monterrey&query=${encodeURIComponent(test.query)}`
      console.log(`   🔗 URL: ${url}`)

      const response = await fetch(url)
      const places: unknown = await response.json()
      const list = Array.isArray(places) ? places : []

      console.log(`   📊 Status: ${response.status}`)
      console.log(`   📍 Resultados: ${list.length} lugares`)

      if (list.length > 0) {
        const first: any = list[0]
        console.log(`   ✅ Primer resultado: "${first.name}" (${first.category})`)
        console.log(`   📝 Tags: [${(first.tags ?? []).slice(0, 3).join(", ") || "sin tags"}]`)
        results[test.type].withResults += 1
        results[test.type].totalPlaces += list.length
      } else {
        console.log(`   ❌ SIN RESULTADOS - ${test.expected}`)
      }

      results[test.type].total += 1
    } catch (error: unknown) {
      console.log(`   💥 ERROR: ${error instanceof Error ? error.message : String(error)}`)
      results[test.type].total += 1
    }

    console.log()
  }

  console.log("=== ANÁLISIS DE RESULTADOS ===\n")

  for (const [type, s] of Object.entries(results)) {
    const successRate = s.total ? ((s.withResults / s.total) * 100).toFixed(1) : "0"
    const avgPlaces = s.withResults ? (s.totalPlaces / s.withResults).toFixed(1) : "0"

    console.log(`📊 ${type.toUpperCase()}:`)
    console.log(`   Tests: ${s.withResults}/${s.total} exitosos (${successRate} %)`)
    console.log(`   Promedio lugares: ${avgPlaces} por query exitosa\n`)
  }

  console.log("=== CONCLUSIÓN ===")

  const latinoRate = results.latino.total ? (results.latino.withResults / results.latino.total) * 100 : 0
  const englishRate = results.english.total ? (results.english.withResults / results.english.total) * 100 : 0

  if (englishRate > latinoRate + 20) {
    console.log("🎯 HIPÓTESIS CONFIRMADA:")
    console.log("   - Términos en español/latino devuelven pocos resultados.")
    console.log("   - Se recomienda implementar traductor semántico (OpenAI + diccionario).")
  } else if (latinoRate < 30) {
    console.log("⚠️ PROBLEMA GENERAL:")
    console.log("   - Pocas respuestas en todos los idiomas. Revisar configuración Foursquare.")
  } else {
    console.log("✅ FUNCIONAMIENTO NORMAL:")
    console.log("   - No se detecta problema semántico significativo.")
  }

  console.log("\nTérminos latinos analizados:")
  DIAGNOSTIC_TESTS.filter((t) => t.type === "latino").forEach((t) => console.log(`   - ${t.query}`))
}

runSemanticDiagnosis().catch((err) => {
  console.error("💥 Error fatal en diagnóstico:", err)
  process.exit(1)
})
