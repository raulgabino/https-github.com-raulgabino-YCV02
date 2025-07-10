import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { feedback, place, mood } = await request.json()

    if (!feedback || !place || !mood) {
      return NextResponse.json({ error: "Feedback, place, and mood are required" }, { status: 400 })
    }

    // Convert feedback emoji to numeric value
    const feedbackValue = feedback === "🔥" ? 1 : 0

    // In a real implementation, you would:
    // 1. Store feedback in KV storage
    // 2. Update token weights using: peso = peso * 0.97 + (0.03 * feedback)
    // 3. Track place-mood combinations for better recommendations

    // For now, we'll just log the feedback
    console.log("Feedback received:", {
      place: place.name,
      mood,
      feedback,
      feedbackValue,
      timestamp: new Date().toISOString(),
    })

    // Simulate storing in KV (would be actual implementation with Vercel KV)
    // await kv.set(`feedback:${place.name}:${mood}:${Date.now()}`, {
    //   feedback: feedbackValue,
    //   place: place.name,
    //   mood,
    //   timestamp: new Date().toISOString()
    // });

    return NextResponse.json({
      success: true,
      message: "Feedback recorded successfully",
    })
  } catch (error) {
    console.error("Error in improve API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
