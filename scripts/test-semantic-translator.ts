#!/usr/bin/env node
import { semanticTranslator } from "../app/lib/semanticTranslator"

const testQueries = [
  "bellakeo en monterrey",
  "lugar para perreo",
  "antro con buena música",
  "restaurante romántico",
  "lugar para botanear",
  "café tranquilo para trabajar",
  "lugar productivo",
  "marisquería tradicional",
  "nightclub", // Should not be translated
  "romantic restaurant", // Should not be translated
]

console.log("=== SEMANTIC TRANSLATOR TEST ===\n")

testQueries.forEach((query) => {
  console.log(`🧪 Testing: "${query}"`)

  const needsTranslation = semanticTranslator.needsTranslation(query)
  console.log(`   Needs translation: ${needsTranslation}`)

  if (needsTranslation) {
    const result = semanticTranslator.translateQuery(query)
    console.log(`   Original: "${result.originalQuery}"`)
    console.log(`   Translated: "${result.translatedQuery}"`)
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`)
    console.log(`   Mappings used: ${result.mappingsUsed.length}`)

    const categories = semanticTranslator.getCategorySuggestions(query)
    if (categories.length > 0) {
      console.log(`   Suggested categories: ${categories.join(", ")}`)
    }
  }

  console.log()
})

console.log("=== AVAILABLE SPANISH TERMS ===")
const spanishTerms = semanticTranslator.getSpanishTerms()
console.log(spanishTerms.join(", "))
