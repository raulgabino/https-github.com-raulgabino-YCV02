import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting FSQ_API_KEY validation...")

    // Check if environment variable exists
    const apiKey = process.env.FSQ_API_KEY

    const validation = {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      format: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.slice(-4)}` : "MISSING",
      isV3Format: apiKey?.startsWith("fsq3") || false,
      fullKeyPreview: apiKey ? `${apiKey.substring(0, 12)}...${apiKey.slice(-8)}` : "MISSING",
      allFsqEnvVars: Object.keys(process.env).filter(
        (key) => key.toLowerCase().includes("fsq") || key.toLowerCase().includes("foursquare"),
      ),
    }

    console.log("📋 Environment Variable Analysis:", validation)

    // Strict validation
    const errors: string[] = []

    if (!apiKey) {
      errors.push("❌ FSQ_API_KEY environment variable not found")
    } else {
      if (!apiKey.startsWith("fsq3")) {
        errors.push(`❌ Invalid format: Expected fsq3..., got ${apiKey.substring(0, 8)}...`)
      }

      if (apiKey.length < 32) {
        errors.push(`❌ Key too short: Expected ≥32 chars, got ${apiKey.length}`)
      }

      if (apiKey.length > 200) {
        errors.push(`❌ Key too long: Expected ≤200 chars, got ${apiKey.length}`)
      }

      // Check for common corruption patterns
      if (apiKey.includes(" ")) {
        errors.push("❌ Key contains spaces (possible truncation)")
      }

      if (apiKey.includes("\n") || apiKey.includes("\r")) {
        errors.push("❌ Key contains line breaks (possible corruption)")
      }
    }

    const isValid = errors.length === 0

    return NextResponse.json({
      valid: isValid,
      validation,
      errors,
      recommendation: isValid
        ? "✅ API key appears valid - ready for Foursquare API calls"
        : "🔧 Fix the API key issues above before proceeding",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Validation error:", error)

    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown validation error",
        validation: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
