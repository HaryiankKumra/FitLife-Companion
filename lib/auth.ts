import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production"

export interface User {
  id: number
  email: string
  name: string
  age?: number
  weight?: number
  height?: number
  fitness_goal: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const users = await sql`
      SELECT id, email, name, age, weight, height, fitness_goal 
      FROM users 
      WHERE id = ${payload.userId}
    `

    return users[0] || null
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hashedPassword = await hashPassword(password)

  const users = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${hashedPassword}, ${name})
    RETURNING id, email, name, age, weight, height, fitness_goal
  `

  return users[0]
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const users = await sql`
    SELECT id, email, name, password_hash, age, weight, height, fitness_goal
    FROM users 
    WHERE email = ${email}
  `

  const user = users[0]
  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    age: user.age,
    weight: user.weight,
    height: user.height,
    fitness_goal: user.fitness_goal,
  }
}
