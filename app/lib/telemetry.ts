interface SwipeAction {
  place: string
  action: "like" | "skip" | "save"
  timeSpent: number
  mood: string
  city: string
  swipeDirection: "up" | "down"
}

interface TelemetryData {
  timestamp: string
  sessionId: string
  userAgent: string
  action: SwipeAction
}

export function trackSwipeAction(action: SwipeAction) {
  try {
    const telemetryData: TelemetryData = {
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
      action,
    }

    // Store locally for now (in production, send to analytics service)
    if (typeof localStorage !== "undefined") {
      const existingData = JSON.parse(localStorage.getItem("telemetry") || "[]")
      existingData.push(telemetryData)

      // Keep only last 100 entries
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100)
      }

      localStorage.setItem("telemetry", JSON.stringify(existingData))
    }

    // Log for development
    console.log("📊 Telemetry:", {
      place: action.place,
      action: action.action,
      timeSpent: `${(action.timeSpent / 1000).toFixed(1)}s`,
      mood: action.mood,
      swipeDirection: action.swipeDirection,
    })

    // In production, send to analytics service
    // sendToAnalytics(telemetryData)
  } catch (error) {
    console.error("Error tracking swipe action:", error)
  }
}

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "server-session"

  let sessionId = sessionStorage.getItem("sessionId")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("sessionId", sessionId)
  }
  return sessionId
}

export function getTelemetryData(): TelemetryData[] {
  try {
    if (typeof localStorage === "undefined") return []
    return JSON.parse(localStorage.getItem("telemetry") || "[]")
  } catch (error) {
    console.error("Error getting telemetry data:", error)
    return []
  }
}

export function clearTelemetryData() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("telemetry")
    console.log("🗑️ Telemetry data cleared")
  }
}

// Analytics functions for production
async function sendToAnalytics(data: TelemetryData) {
  try {
    // In production, send to your analytics service
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
  } catch (error) {
    console.error("Error sending analytics:", error)
  }
}

export function getSwipeStats() {
  const data = getTelemetryData()
  const stats = {
    totalSwipes: data.length,
    likes: data.filter((d) => d.action.action === "like").length,
    skips: data.filter((d) => d.action.action === "skip").length,
    saves: data.filter((d) => d.action.action === "save").length,
    avgTimeSpent: data.length > 0 ? data.reduce((acc, d) => acc + d.action.timeSpent, 0) / data.length / 1000 : 0,
    topMoods: getTopMoods(data),
    topCities: getTopCities(data),
  }

  return stats
}

function getTopMoods(data: TelemetryData[]) {
  const moodCounts: Record<string, number> = {}
  data.forEach((d) => {
    moodCounts[d.action.mood] = (moodCounts[d.action.mood] || 0) + 1
  })
  return Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
}

function getTopCities(data: TelemetryData[]) {
  const cityCounts: Record<string, number> = {}
  data.forEach((d) => {
    cityCounts[d.action.city] = (cityCounts[d.action.city] || 0) + 1
  })
  return Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
}
