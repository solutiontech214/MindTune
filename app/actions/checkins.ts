"use server"

import {
  createOrUpdateCheckin,
  getCheckinByDate,
  getMonthlyCheckins,
  getMonthlyStats,
  getCheckinStreak,
} from "@/lib/checkins"
import { getCurrentUser } from "@/lib/session"
import { z } from "zod"

const CheckinSchema = z.object({
  moodRating: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  sleepQuality: z.number().min(1).max(10),
  anxietyLevel: z.number().min(1).max(10),
  notes: z.string().optional(),
  activities: z.array(z.string()),
  gratitudeNotes: z.string().optional(),
  goalsAchieved: z.number().min(0).max(10),
})

export type CheckinFormState = {
  errors?: {
    moodRating?: string[]
    stressLevel?: string[]
    energyLevel?: string[]
    sleepQuality?: string[]
    anxietyLevel?: string[]
    notes?: string[]
    activities?: string[]
    gratitudeNotes?: string[]
    goalsAchieved?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export async function submitCheckinAction(prevState: CheckinFormState, formData: FormData): Promise<CheckinFormState> {
  try {
    console.log("Check-in submission started")

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        errors: {
          _form: ["You must be signed in to submit a check-in"],
        },
      }
    }

    // Parse activities from form data
    const activities: string[] = []
    const activityKeys = ["exercise", "meditation", "reading", "socializing", "work", "hobbies", "rest", "outdoors"]
    activityKeys.forEach((key) => {
      if (formData.get(key) === "on") {
        activities.push(key)
      }
    })

    // Validate form data
    const validatedFields = CheckinSchema.safeParse({
      moodRating: Number(formData.get("moodRating")),
      stressLevel: Number(formData.get("stressLevel")),
      energyLevel: Number(formData.get("energyLevel")),
      sleepQuality: Number(formData.get("sleepQuality")),
      anxietyLevel: Number(formData.get("anxietyLevel")),
      notes: formData.get("notes") || undefined,
      activities,
      gratitudeNotes: formData.get("gratitudeNotes") || undefined,
      goalsAchieved: Number(formData.get("goalsAchieved")) || 0,
    })

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten().fieldErrors)
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const today = new Date().toISOString().split("T")[0]

    console.log("Creating check-in for user:", user.id)

    // Create or update check-in
    const checkin = await createOrUpdateCheckin({
      userId: user.id,
      checkinDate: today,
      moodRating: data.moodRating,
      stressLevel: data.stressLevel,
      energyLevel: data.energyLevel,
      sleepQuality: data.sleepQuality,
      anxietyLevel: data.anxietyLevel,
      notes: data.notes,
      activities: data.activities,
      gratitudeNotes: data.gratitudeNotes,
      goalsAchieved: data.goalsAchieved,
    })

    if (!checkin) {
      return {
        errors: {
          _form: ["Failed to save check-in. Please try again."],
        },
      }
    }

    console.log("Check-in saved successfully")

    return {
      success: true,
      message: "Daily check-in saved successfully!",
    }
  } catch (error) {
    console.error("Check-in submission error:", error)
    return {
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    }
  }
}

export async function getTodayCheckinAction() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    const today = new Date().toISOString().split("T")[0]
    return await getCheckinByDate(user.id, today)
  } catch (error) {
    console.error("Error getting today's check-in:", error)
    return null
  }
}

export async function getMonthlyCheckinsAction(year: number, month: number) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    return await getMonthlyCheckins(user.id, year, month)
  } catch (error) {
    console.error("Error getting monthly check-ins:", error)
    return []
  }
}

export async function getMonthlyStatsAction(year: number, month: number) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    return await getMonthlyStats(user.id, year, month)
  } catch (error) {
    console.error("Error getting monthly stats:", error)
    return null
  }
}

export async function getCheckinStreakAction() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return 0
    }

    return await getCheckinStreak(user.id)
  } catch (error) {
    console.error("Error getting check-in streak:", error)
    return 0
  }
}
