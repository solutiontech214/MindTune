import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  try {
    console.log("API user route called")
    const user = await getCurrentUser()

    if (!user) {
      console.log("No user found in getCurrentUser")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("User found:", user.email)

    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      ageRange: user.age_range,
      emailVerified: user.email_verified,
      subscribeNewsletter: user.subscribe_newsletter,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}