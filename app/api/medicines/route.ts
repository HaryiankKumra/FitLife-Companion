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

    const medicines = await sql`
      SELECT id, name, dosage, time, frequency, notes, last_taken, created_at
      FROM medicines
      WHERE user_id = ${user.id}
      ORDER BY time ASC
    `

    return NextResponse.json(medicines)
  } catch (error) {
    console.error("Get medicines error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, dosage, time, frequency, notes } = await request.json()

    if (!name || !dosage || !time) {
      return NextResponse.json({ error: "Name, dosage, and time are required" }, { status: 400 })
    }

    const medicines = await sql`
      INSERT INTO medicines (user_id, name, dosage, time, frequency, notes)
      VALUES (${user.id}, ${name}, ${dosage}, ${time}, ${frequency || "daily"}, ${notes || ""})
      RETURNING id, name, dosage, time, frequency, notes, last_taken, created_at
    `

    return NextResponse.json(medicines[0])
  } catch (error) {
    console.error("Create medicine error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
