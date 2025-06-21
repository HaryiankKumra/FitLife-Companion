import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const todos = await sql`
      SELECT id, text, completed, priority, created_at, updated_at
      FROM todos
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Get todos error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, priority = "medium" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const todos = await sql`
      INSERT INTO todos (user_id, text, priority)
      VALUES (${user.id}, ${text}, ${priority})
      RETURNING id, text, completed, priority, created_at, updated_at
    `

    return NextResponse.json(todos[0])
  } catch (error) {
    console.error("Create todo error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
