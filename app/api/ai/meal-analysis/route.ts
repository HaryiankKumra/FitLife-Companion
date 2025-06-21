import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { analyzeMealPlan } from "@/lib/ai-engine"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { menuText, fitnessGoal } = await request.json()

    if (!menuText) {
      return NextResponse.json({ error: "Menu text is required" }, { status: 400 })
    }

    const analysis = await analyzeMealPlan(menuText, fitnessGoal || user.fitness_goal, user.id)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Meal analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
