import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { completed } = await request.json()
    const todoId = Number.parseInt(params.id)

    const todos = await sql`
      UPDATE todos 
      SET completed = ${completed}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${todoId} AND user_id = ${user.id}
      RETURNING id, text, completed, priority, created_at, updated_at
    `

    if (todos.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(todos[0])
  } catch (error) {
    console.error("Update todo error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const todoId = Number.parseInt(params.id)

    await sql`
      DELETE FROM todos 
      WHERE id = ${todoId} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete todo error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
