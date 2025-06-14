import { neon } from "@neondatabase/serverless"

// Make database connection optional for development
let sql: any = null

try {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL)
  } else {
    console.warn("DATABASE_URL environment variable is not set. Using mock data for development.")
  }
} catch (error) {
  console.warn("Failed to initialize database connection:", error)
}

export { sql }

// User types
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  password_hash: string
  age_range?: string
  created_at: Date
  updated_at: Date
  is_active: boolean
  email_verified: boolean
  subscribe_newsletter: boolean
}

export interface CreateUserData {
  firstName: string
  lastName: string
  email: string
  password: string
  ageRange?: string
  subscribeNewsletter?: boolean
}

export interface UserSession {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
  created_at: Date
  updated_at: Date
}
