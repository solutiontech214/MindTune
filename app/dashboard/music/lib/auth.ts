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

// Mock users for development when database is not available
const mockUsers: User[] = [
  {
    id: 1,
    first_name: "Demo",
    last_name: "User",
    email: "demo@mindtune.com",
    password_hash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.G", // password: "demo123"
    age_range: "25-35",
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true,
    email_verified: true,
    subscribe_newsletter: true,
  },
]

// Create new user
export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password)

    // If database is available, use it
    if (sql) {
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
    } else {
      // Fallback to mock data for development
      console.log("Using mock user creation for development")

      // Check if user already exists in mock data
      const existingUser = mockUsers.find((u) => u.email.toLowerCase() === userData.email.toLowerCase())
      if (existingUser) {
        return null // User already exists
      }

      const newUser: User = {
        id: mockUsers.length + 1,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email.toLowerCase(),
        password_hash: hashedPassword,
        age_range: userData.ageRange || null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        email_verified: true,
        subscribe_newsletter: userData.subscribeNewsletter || false,
      }

      mockUsers.push(newUser)
      return newUser
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    if (sql) {
      const result = await sql`
        SELECT * FROM users 
        WHERE email = ${email.toLowerCase()} 
        AND is_active = true
        LIMIT 1
      `
      return (result[0] as User) || null
    } else {
      // Fallback to mock data for development
      console.log("Using mock user lookup for development")
      return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active) || null
    }
  } catch (error) {
    console.error("Error finding user by email:", error)
    // Fallback to mock data
    return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active) || null
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

// Mock sessions for development
const mockSessions: { [key: string]: { userId: number; expiresAt: Date } } = {}

// Create user session
export async function createUserSession(userId: number): Promise<string | null> {
  try {
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    if (sql) {
      await sql`
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (${userId}, ${sessionToken}, ${expiresAt})
      `
    } else {
      // Fallback to mock sessions for development
      console.log("Using mock session creation for development")
      mockSessions[sessionToken] = { userId, expiresAt }
    }

    return sessionToken
  } catch (error) {
    console.error("Error creating user session:", error)
    // Try mock session as fallback
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    mockSessions[sessionToken] = { userId, expiresAt }
    return sessionToken
  }
}

// Find user by session token
export async function findUserBySessionToken(sessionToken: string): Promise<User | null> {
  try {
    if (sql) {
      const result = await sql`
        SELECT u.* FROM users u
        JOIN user_sessions s ON u.id = s.user_id
        WHERE s.session_token = ${sessionToken}
        AND s.expires_at > NOW()
        AND u.is_active = true
        LIMIT 1
      `
      return (result[0] as User) || null
    } else {
      // Fallback to mock sessions for development
      console.log("Using mock session lookup for development")
      const session = mockSessions[sessionToken]
      if (!session || session.expiresAt < new Date()) {
        return null
      }
      return mockUsers.find((u) => u.id === session.userId && u.is_active) || null
    }
  } catch (error) {
    console.error("Error finding user by session token:", error)
    // Fallback to mock sessions
    const session = mockSessions[sessionToken]
    if (!session || session.expiresAt < new Date()) {
      return null
    }
    return mockUsers.find((u) => u.id === session.userId && u.is_active) || null
  }
}

// Delete user session
export async function deleteUserSession(sessionToken: string): Promise<boolean> {
  try {
    if (sql) {
      await sql`
        DELETE FROM user_sessions 
        WHERE session_token = ${sessionToken}
      `
    } else {
      // Fallback to mock sessions for development
      console.log("Using mock session deletion for development")
      delete mockSessions[sessionToken]
    }
    return true
  } catch (error) {
    console.error("Error deleting user session:", error)
    // Try mock session deletion as fallback
    delete mockSessions[sessionToken]
    return true
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    if (sql) {
      await sql`
        DELETE FROM user_sessions 
        WHERE expires_at < NOW()
      `
    } else {
      // Clean up mock sessions
      const now = new Date()
      Object.keys(mockSessions).forEach((token) => {
        if (mockSessions[token].expiresAt < now) {
          delete mockSessions[token]
        }
      })
    }
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}
