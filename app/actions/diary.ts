
"use server"

import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/database"
import { redirect } from "next/navigation"
import { z } from "zod"

export interface DiaryEntry {
  id: number
  user_id: number
  title: string
  content: string
  emotion: string
  mood_rating: number
  is_private: boolean
  created_at: Date
  updated_at: Date
}

const DiaryEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  emotion: z.string().min(1, "Please select an emotion"),
  mood_rating: z.number().min(1).max(10),
  is_private: z.boolean().default(true),
})

export type DiaryFormState = {
  errors?: {
    title?: string[]
    content?: string[]
    emotion?: string[]
    mood_rating?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export async function createDiaryEntryAction(
  prevState: DiaryFormState,
  formData: FormData
): Promise<DiaryFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/signin")
    }

    const validatedFields = DiaryEntrySchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      emotion: formData.get("emotion"),
      mood_rating: Number(formData.get("mood_rating")),
      is_private: formData.get("is_private") === "on",
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { title, content, emotion, mood_rating, is_private } = validatedFields.data

    if (!sql) {
      // Mock data for development
      console.log("Would create diary entry:", { title, content, emotion, mood_rating })
      return {
        success: true,
        message: "Diary entry saved successfully!",
      }
    }

    await sql`
      INSERT INTO diary_entries (user_id, title, content, emotion, mood_rating, is_private)
      VALUES (${user.id}, ${title}, ${content}, ${emotion}, ${mood_rating}, ${is_private})
    `

    return {
      success: true,
      message: "Diary entry saved successfully!",
    }
  } catch (error) {
    console.error("Error creating diary entry:", error)
    return {
      errors: {
        _form: ["Failed to save diary entry. Please try again."],
      },
    }
  }
}

export async function updateDiaryEntryAction(
  entryId: number,
  prevState: DiaryFormState,
  formData: FormData
): Promise<DiaryFormState> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/signin")
    }

    const validatedFields = DiaryEntrySchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      emotion: formData.get("emotion"),
      mood_rating: Number(formData.get("mood_rating")),
      is_private: formData.get("is_private") === "on",
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { title, content, emotion, mood_rating, is_private } = validatedFields.data

    if (!sql) {
      console.log("Would update diary entry:", entryId, { title, content, emotion, mood_rating })
      return {
        success: true,
        message: "Diary entry updated successfully!",
      }
    }

    await sql`
      UPDATE diary_entries 
      SET title = ${title}, content = ${content}, emotion = ${emotion}, 
          mood_rating = ${mood_rating}, is_private = ${is_private}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${entryId} AND user_id = ${user.id}
    `

    return {
      success: true,
      message: "Diary entry updated successfully!",
    }
  } catch (error) {
    console.error("Error updating diary entry:", error)
    return {
      errors: {
        _form: ["Failed to update diary entry. Please try again."],
      },
    }
  }
}

export async function deleteDiaryEntryAction(entryId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      redirect("/auth/signin")
    }

    if (!sql) {
      console.log("Would delete diary entry:", entryId)
      return
    }

    await sql`
      DELETE FROM diary_entries 
      WHERE id = ${entryId} AND user_id = ${user.id}
    `
  } catch (error) {
    console.error("Error deleting diary entry:", error)
    throw new Error("Failed to delete diary entry")
  }
}

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    if (!sql) {
      // Return mock data for development
      return [
        {
          id: 1,
          user_id: user.id,
          title: "Today was amazing!",
          content: "I had such a wonderful day. Everything went perfectly and I'm feeling grateful for all the good things in my life.",
          emotion: "Joy",
          mood_rating: 9,
          is_private: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user_id: user.id,
          title: "Feeling a bit anxious",
          content: "Work has been stressful lately and I'm having trouble sleeping. Need to find ways to manage this anxiety better.",
          emotion: "Anxiety",
          mood_rating: 4,
          is_private: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]
    }

    const entries = await sql`
      SELECT * FROM diary_entries 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC
    `

    return entries
  } catch (error) {
    console.error("Error fetching diary entries:", error)
    return []
  }
}

export async function getDiaryEntry(entryId: number): Promise<DiaryEntry | null> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return null
    }

    if (!sql) {
      // Return mock data for development
      return {
        id: entryId,
        user_id: user.id,
        title: "Sample Entry",
        content: "This is a sample diary entry for development.",
        emotion: "Neutral",
        mood_rating: 7,
        is_private: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }

    const entries = await sql`
      SELECT * FROM diary_entries 
      WHERE id = ${entryId} AND user_id = ${user.id}
    `

    return entries[0] || null
  } catch (error) {
    console.error("Error fetching diary entry:", error)
    return null
  }
}
