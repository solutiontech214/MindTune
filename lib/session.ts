import { cookies } from "next/headers"
import { findUserBySessionToken, deleteUserSession } from "./auth"
import type { User } from "./database"

const SESSION_COOKIE_NAME = "mindtune_session"
// Map session tokens to users for development mode
const mockSessions = new Map<string, User>()

// Set session cookie
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })
}

// Store mock user for development with session token
export function setMockSessionUser(user: User): void {
  // This function is for backward compatibility but won't be used
  console.log("setMockSessionUser called (deprecated)")
}

// Store user with session token for development
export function storeMockSession(sessionToken: string, user: User): void {
  mockSessions.set(sessionToken, user)
  console.log("Stored mock session for user:", user.email)
}

// Get session cookie
export async function getSessionCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    return sessionCookie?.value || null
  } catch (error) {
    console.error("Error getting session cookie:", error)
    return null
  }
}

// Delete session cookie
export async function deleteSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    console.log("Session cookie deleted successfully")
  } catch (error) {
    console.error("Error deleting session cookie:", error)
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      console.log("No session token found")
      return null
    }

    console.log("Found session token:", sessionToken.substring(0, 10) + "...")

    // Try to get user from database first
    const user = await findUserBySessionToken(sessionToken)

    // If database is not available, check mock sessions
    if (!user) {
      const mockUser = mockSessions.get(sessionToken)
      if (mockUser) {
        console.log("Found user in mock sessions:", mockUser.email)
        return mockUser
      }
      console.log("No user found for session token")
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (sessionToken) {
      await deleteUserSession(sessionToken)
      // Remove from mock sessions as well
      mockSessions.delete(sessionToken)
    }

    await deleteSessionCookie()
    console.log("User logged out successfully")
  } catch (error) {
    console.error("Error during logout:", error)
    // Still delete the cookie even if database operation fails
    await deleteSessionCookie()
  }
}