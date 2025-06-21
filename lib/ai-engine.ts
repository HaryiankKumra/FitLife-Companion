import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface WorkoutData {
  muscle_group: string
  workout_date: string
  exercises: Array<{
    name: string
    sets: number
    reps: number
    weight: number
  }>
}

export async function generateWorkoutRecommendation(userId: number) {
  // Get user's recent workouts
  const recentWorkouts = await sql`
    SELECT w.muscle_group, w.workout_date, w.notes,
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
    WHERE w.user_id = ${userId}
      AND w.workout_date >= NOW() - INTERVAL '14 days'
    GROUP BY w.id, w.muscle_group, w.workout_date, w.notes
    ORDER BY w.workout_date DESC
    LIMIT 10
  `

  // Get user's fitness goal
  const userInfo = await sql`
    SELECT fitness_goal, weight, height, age
    FROM users
    WHERE id = ${userId}
  `

  const user = userInfo[0]
  if (!user) throw new Error("User not found")

  // Analyze workout patterns
  const muscleGroupCounts = recentWorkouts.reduce((acc: Record<string, number>, workout: any) => {
    acc[workout.muscle_group] = (acc[workout.muscle_group] || 0) + 1
    return acc
  }, {})

  const allMuscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"]
  const leastWorkedGroup = allMuscleGroups.reduce((min, group) => {
    const count = muscleGroupCounts[group] || 0
    const minCount = muscleGroupCounts[min] || 0
    return count < minCount ? group : min
  })

  // Generate AI recommendation
  const prompt = `
    You are a professional fitness trainer AI. Analyze this user's workout history and provide a personalized workout recommendation.

    User Profile:
    - Fitness Goal: ${user.fitness_goal}
    - Weight: ${user.weight}kg
    - Height: ${user.height}cm
    - Age: ${user.age}

    Recent Workouts (last 14 days):
    ${recentWorkouts
      .map(
        (w: any) => `
      - ${w.muscle_group} on ${new Date(w.workout_date).toLocaleDateString()}
        Exercises: ${w.exercises.map((e: any) => `${e.name} (${e.sets}x${e.reps} @ ${e.weight}lbs)`).join(", ")}
    `,
      )
      .join("")}

    Muscle Group Frequency:
    ${Object.entries(muscleGroupCounts)
      .map(([group, count]) => `${group}: ${count} times`)
      .join(", ")}

    Least worked muscle group: ${leastWorkedGroup}

    Please provide:
    1. Recommended muscle group for today
    2. 4-5 specific exercises with sets, reps, and suggested weights
    3. Brief reasoning for this recommendation
    4. Any form tips or safety notes

    Format your response as JSON:
    {
      "muscleGroup": "...",
      "reasoning": "...",
      "exercises": [
        {"name": "...", "sets": 4, "reps": 8, "weight": 135},
        ...
      ],
      "tips": "..."
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
    })

    const recommendation = JSON.parse(text)

    // Store the suggestion in database
    await sql`
      INSERT INTO workout_suggestions (user_id, suggested_muscle_group, reasoning, exercises)
      VALUES (${userId}, ${recommendation.muscleGroup}, ${recommendation.reasoning}, ${JSON.stringify(recommendation.exercises)})
    `

    return recommendation
  } catch (error) {
    console.error("AI recommendation error:", error)

    // Fallback recommendation
    const fallbackExercises = {
      Chest: [
        { name: "Push-ups", sets: 3, reps: 12, weight: 0 },
        { name: "Bench Press", sets: 4, reps: 8, weight: 135 },
        { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 60 },
        { name: "Chest Flyes", sets: 3, reps: 12, weight: 30 },
      ],
      Back: [
        { name: "Pull-ups", sets: 4, reps: 6, weight: 0 },
        { name: "Bent-over Rows", sets: 4, reps: 8, weight: 95 },
        { name: "Lat Pulldowns", sets: 3, reps: 10, weight: 80 },
        { name: "Face Pulls", sets: 3, reps: 15, weight: 40 },
      ],
      Legs: [
        { name: "Squats", sets: 4, reps: 8, weight: 185 },
        { name: "Romanian Deadlifts", sets: 3, reps: 10, weight: 135 },
        { name: "Leg Press", sets: 3, reps: 12, weight: 270 },
        { name: "Calf Raises", sets: 4, reps: 15, weight: 45 },
      ],
    }

    return {
      muscleGroup: leastWorkedGroup,
      reasoning: `You haven't worked ${leastWorkedGroup.toLowerCase()} recently. Time to balance your routine!`,
      exercises: fallbackExercises[leastWorkedGroup as keyof typeof fallbackExercises] || fallbackExercises["Chest"],
      tips: "Focus on proper form and progressive overload.",
    }
  }
}

export async function analyzeMealPlan(menuText: string, fitnessGoal: string, userId: number) {
  const prompt = `
    You are a nutrition expert AI. Analyze this meal menu for someone with a ${fitnessGoal} fitness goal.

    Menu:
    ${menuText}

    Fitness Goal: ${fitnessGoal}

    Please analyze this menu and provide:
    1. Overall score (0-100) for alignment with the fitness goal
    2. Specific highlights (what's good)
    3. Recommendations for improvement
    4. Macro balance assessment
    5. Calorie density evaluation

    Consider:
    - For bulking: Need calorie surplus, high protein, complex carbs
    - For cutting: Need calorie deficit, very high protein, low processed foods
    - For maintenance: Balanced macros, moderate calories

    Format as JSON:
    {
      "score": 85,
      "highlights": ["Good protein sources", "Complex carbs present"],
      "recommendations": ["Add more vegetables", "Reduce fried foods"],
      "macroBalance": "Good protein, moderate carbs, high fats",
      "calorieAssessment": "Moderate calorie density, suitable for maintenance",
      "goalAlignment": "Excellent"
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    const analysis = JSON.parse(text)

    // Store analysis in database
    await sql`
      INSERT INTO meal_analyses (user_id, menu_text, analysis_result, fitness_goal)
      VALUES (${userId}, ${menuText}, ${JSON.stringify(analysis)}, ${fitnessGoal})
    `

    return analysis
  } catch (error) {
    console.error("Meal analysis error:", error)

    // Fallback analysis
    return {
      score: 70,
      highlights: ["Menu uploaded successfully"],
      recommendations: ["Consider adding more protein sources", "Include more vegetables"],
      macroBalance: "Analysis pending - please try again",
      calorieAssessment: "Manual review recommended",
      goalAlignment: "Good",
    }
  }
}
