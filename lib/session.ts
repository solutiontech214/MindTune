import { cookies } from "next/headers"
import { findUserBySessionToken, deleteUserSession } from "./auth"
import type { User } from "./database"

const SESSION_COOKIE_NAME = "mindtune_session"
let mockSessionUser: User | null = null

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

// Store mock user for development
export function setMockSessionUser(user: User): void {
  mockSessionUser = user
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
      return null
    }

    // Try to get user from database first
    const user = await findUserBySessionToken(sessionToken)

    // If database is not available, return mock user
    if (!user && mockSessionUser) {
      console.log("Using mock session user for development")
      return mockSessionUser
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    // Fallback to mock user in development
    return mockSessionUser
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const sessionToken = await getSessionCookie()

    if (sessionToken) {
      await deleteUserSession(sessionToken)
    }

    await deleteSessionCookie()
    console.log("User logged out successfully")
  } catch (error) {
    console.error("Error during logout:", error)
    // Still delete the cookie even if database operation fails
    await deleteSessionCookie()
  }
}