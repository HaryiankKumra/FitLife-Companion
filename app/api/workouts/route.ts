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

    const workouts = await sql`
      SELECT w.id, w.muscle_group, w.duration, w.notes, w.workout_date,
             json_agg(
               json_build_object(
                 'name', e.name,
                 'sets', e.sets,
                 'reps', e.reps,
                 'weight', e.weight
               )
             ) as exercises
      FROM workouts w
      LEFT JOIN exercises e ON w.id = e.workout_id
      WHERE w.user_id = ${user.id}
      GROUP BY w.id, w.muscle_group, w.duration, w.notes, w.workout_date
      ORDER BY w.workout_date DESC
    `

    return NextResponse.json(workouts)
  } catch (error) {
    console.error("Get workouts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { muscle_group, duration, notes, exercises } = await request.json()

    if (!muscle_group || !exercises || exercises.length === 0) {
      return NextResponse.json({ error: "Muscle group and exercises are required" }, { status: 400 })
    }

    // Insert workout
    const workouts = await sql`
      INSERT INTO workouts (user_id, muscle_group, duration, notes)
      VALUES (${user.id}, ${muscle_group}, ${duration || 0}, ${notes || ""})
      RETURNING id, muscle_group, duration, notes, workout_date
    `

    const workout = workouts[0]

    // Insert exercises
    for (const exercise of exercises) {
      await sql`
        INSERT INTO exercises (workout_id, name, sets, reps, weight)
        VALUES (${workout.id}, ${exercise.name}, ${exercise.sets}, ${exercise.reps}, ${exercise.weight})
      `
    }

    // Get complete workout with exercises
    const completeWorkout = await sql`
      SELECT w.id, w.muscle_group, w.duration, w.notes, w.workout_date,
             json_agg(
               json_build_object(
                 'name', e.name,
                 'sets', e.sets,
                 'reps', e.reps,
                 'weight', e.weight
               )
             ) as exercises
      FROM workouts w
      LEFT JOIN exercises e ON w.id = e.workout_id
      WHERE w.id = ${workout.id}
      GROUP BY w.id, w.muscle_group, w.duration, w.notes, w.workout_date
    `

    return NextResponse.json(completeWorkout[0])
  } catch (error) {
    console.error("Create workout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
