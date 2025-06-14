import { cookies } from "next/headers"
import { findUserBySessionToken, deleteUserSession } from "./auth"
import type { User } from "./database"

const SESSION_COOKIE_NAME = "mindtune_session"

// Set session cookie
export async function setSessionCookie(sessionToken: string): Promise<void> {
  try {
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    console.log("Session cookie set successfully")
  } catch (error) {
    console.error("Error setting session cookie:", error)
  }
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
    const sessionToken = await getSessionCookie()

    if (!sessionToken) {
      console.log("No session token found")
      return null
    }

    console.log("Looking up user by session token")
    const user = await findUserBySessionToken(sessionToken)

    if (user) {
      console.log("User found:", user.email)
    } else {
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
