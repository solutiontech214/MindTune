import bcrypt from "bcryptjs"
import { sql } from "./database"
import type { User, CreateUserData } from "./database"

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}



// Create new user
export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return null
    }

    const hashedPassword = await hashPassword(userData.password)

    const result = await sql`
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        password_hash, 
        age_range, 
        subscribe_newsletter
      )
      VALUES (
        ${userData.firstName},
        ${userData.lastName},
        ${userData.email.toLowerCase()},
        ${hashedPassword},
        ${userData.ageRange || null},
        ${userData.subscribeNewsletter || false}
      )
      RETURNING *
    `
    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return null
    }

    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email.toLowerCase()} 
      AND is_active = true
      LIMIT 1
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error finding user by email:", error)
    return null
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await findUserByEmail(email)

    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36)
}

// Create user session
export async function createUserSession(userId: number): Promise<string | null> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return null
    }

    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await sql`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `

    return sessionToken
  } catch (error) {
    console.error("Error creating user session:", error)
    return null
  }
}

// Find user by session token
export async function findUserBySessionToken(sessionToken: string): Promise<User | null> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return null
    }

    const result = await sql`
      SELECT u.* FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
      AND s.expires_at > NOW()
      AND u.is_active = true
      LIMIT 1
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error finding user by session token:", error)
    return null
  }
}

// Delete user session
export async function deleteUserSession(sessionToken: string): Promise<boolean> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return false
    }

    await sql`
      DELETE FROM user_sessions 
      WHERE session_token = ${sessionToken}
    `
    return true
  } catch (error) {
    console.error("Error deleting user session:", error)
    return false
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    if (!sql) {
      console.error("Database connection not available")
      return
    }

    await sql`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW()
    `
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}
