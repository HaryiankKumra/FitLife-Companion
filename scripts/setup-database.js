const { neon } = require("@neondatabase/serverless")

async function setupDatabase() {
  const sql = neon(process.env.DATABASE_URL)

  console.log("🚀 Setting up database...")

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          age INTEGER,
          weight DECIMAL(5,2),
          height DECIMAL(5,2),
          fitness_goal VARCHAR(50) DEFAULT 'maintenance',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create todos table
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          priority VARCHAR(10) DEFAULT 'medium',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create workouts table
    await sql`
      CREATE TABLE IF NOT EXISTS workouts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          muscle_group VARCHAR(50) NOT NULL,
          duration INTEGER DEFAULT 0,
          notes TEXT,
          workout_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create exercises table
    await sql`
      CREATE TABLE IF NOT EXISTS exercises (
          id SERIAL PRIMARY KEY,
          workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          sets INTEGER NOT NULL,
          reps INTEGER NOT NULL,
          weight DECIMAL(6,2) DEFAULT 0
      );
    `

    // Create medicines table
    await sql`
      CREATE TABLE IF NOT EXISTS medicines (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          dosage VARCHAR(255) NOT NULL,
          time TIME NOT NULL,
          frequency VARCHAR(20) DEFAULT 'daily',
          notes TEXT,
          last_taken TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create meal_analyses table
    await sql`
      CREATE TABLE IF NOT EXISTS meal_analyses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          menu_text TEXT NOT NULL,
          analysis_result JSONB,
          fitness_goal VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create workout_suggestions table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_suggestions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          suggested_muscle_group VARCHAR(50),
          reasoning TEXT,
          exercises JSONB,
          accepted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_meal_analyses_user_id ON meal_analyses(user_id);`
    await sql`CREATE INDEX IF NOT EXISTS idx_workout_suggestions_user_id ON workout_suggestions(user_id);`

    console.log("✅ Database setup completed successfully!")

    // Insert demo user if not exists
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash("demo123", 12)

    await sql`
      INSERT INTO users (email, name, password_hash, age, weight, height, fitness_goal) 
      VALUES (
          'demo@fitlife.com', 
          'Demo User', 
          ${hashedPassword},
          25, 
          70.5, 
          175.0, 
          'bulking'
      ) ON CONFLICT (email) DO NOTHING;
    `

    console.log("✅ Demo user created (email: demo@fitlife.com, password: demo123)")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
