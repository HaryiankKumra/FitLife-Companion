import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateWorkoutRecommendation } from "@/lib/ai-engine"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recommendation = await generateWorkoutRecommendation(user.id)
    return NextResponse.json(recommendation)
  } catch (error) {
    console.error("Workout suggestion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
