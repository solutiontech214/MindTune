import { sql } from "./database"

export interface DailyCheckin {
  id: number
  user_id: number
  checkin_date: string
  mood_rating: number
  stress_level: number
  energy_level: number
  sleep_quality: number
  anxiety_level: number
  notes?: string
  activities: string[]
  gratitude_notes?: string
  goals_achieved: number
  created_at: Date
  updated_at: Date
}

export interface CreateCheckinData {
  userId: number
  checkinDate: string
  moodRating: number
  stressLevel: number
  energyLevel: number
  sleepQuality: number
  anxietyLevel: number
  notes?: string
  activities: string[]
  gratitudeNotes?: string
  goalsAchieved: number
}

// Mock check-ins for development
const mockCheckins: DailyCheckin[] = []

// Generate mock data for current month
const generateMockMonthlyData = (userId: number, year: number, month: number): DailyCheckin[] => {
  const mockData: DailyCheckin[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= Math.min(daysInMonth, 15); day++) {
    const date = new Date(year, month - 1, day)
    const dateString = date.toISOString().split("T")[0]

    mockData.push({
      id: day,
      user_id: userId,
      checkin_date: dateString,
      mood_rating: Math.floor(Math.random() * 4) + 6, // 6-10
      stress_level: Math.floor(Math.random() * 5) + 3, // 3-7
      energy_level: Math.floor(Math.random() * 4) + 5, // 5-8
      sleep_quality: Math.floor(Math.random() * 3) + 7, // 7-9
      anxiety_level: Math.floor(Math.random() * 4) + 2, // 2-5
      notes: day % 3 === 0 ? "Had a great day today!" : undefined,
      activities: day % 2 === 0 ? ["exercise", "meditation"] : ["reading"],
      gratitude_notes: day % 4 === 0 ? "Grateful for family and health" : undefined,
      goals_achieved: Math.floor(Math.random() * 3),
      created_at: date,
      updated_at: date,
    })
  }

  return mockData
}

// Create or update daily check-in
export async function createOrUpdateCheckin(data: CreateCheckinData): Promise<DailyCheckin | null> {
  try {
    if (sql) {
      try {
        const result = await sql`
          INSERT INTO daily_checkins (
            user_id, checkin_date, mood_rating, stress_level, energy_level,
            sleep_quality, anxiety_level, notes, activities, gratitude_notes, goals_achieved
          )
          VALUES (
            ${data.userId}, ${data.checkinDate}, ${data.moodRating}, ${data.stressLevel},
            ${data.energyLevel}, ${data.sleepQuality}, ${data.anxietyLevel}, ${data.notes || null},
            ${JSON.stringify(data.activities)}, ${data.gratitudeNotes || null}, ${data.goalsAchieved}
          )
          ON CONFLICT (user_id, checkin_date)
          DO UPDATE SET
            mood_rating = EXCLUDED.mood_rating,
            stress_level = EXCLUDED.stress_level,
            energy_level = EXCLUDED.energy_level,
            sleep_quality = EXCLUDED.sleep_quality,
            anxiety_level = EXCLUDED.anxiety_level,
            notes = EXCLUDED.notes,
            activities = EXCLUDED.activities,
            gratitude_notes = EXCLUDED.gratitude_notes,
            goals_achieved = EXCLUDED.goals_achieved,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `
        return result[0] as DailyCheckin
      } catch (dbError: any) {
        console.warn("Database table not found, using mock implementation:", dbError.message)
        // Fall through to mock implementation
      }
    }

    // Mock implementation for development
    console.log("Using mock check-in creation for development")

    const existingIndex = mockCheckins.findIndex(
      (c) => c.user_id === data.userId && c.checkin_date === data.checkinDate,
    )

    const checkin: DailyCheckin = {
      id: existingIndex >= 0 ? mockCheckins[existingIndex].id : mockCheckins.length + 1,
      user_id: data.userId,
      checkin_date: data.checkinDate,
      mood_rating: data.moodRating,
      stress_level: data.stressLevel,
      energy_level: data.energyLevel,
      sleep_quality: data.sleepQuality,
      anxiety_level: data.anxietyLevel,
      notes: data.notes || undefined,
      activities: data.activities,
      gratitude_notes: data.gratitudeNotes || undefined,
      goals_achieved: data.goalsAchieved,
      created_at: new Date(),
      updated_at: new Date(),
    }

    if (existingIndex >= 0) {
      mockCheckins[existingIndex] = checkin
    } else {
      mockCheckins.push(checkin)
    }

    return checkin
  } catch (error) {
    console.error("Error creating/updating check-in:", error)
    return null
  }
}

// Get check-in for specific date
export async function getCheckinByDate(userId: number, date: string): Promise<DailyCheckin | null> {
  try {
    if (sql) {
      try {
        const result = await sql`
          SELECT * FROM daily_checkins
          WHERE user_id = ${userId} AND checkin_date = ${date}
          LIMIT 1
        `
        return (result[0] as DailyCheckin) || null
      } catch (dbError: any) {
        console.warn("Database table not found, using mock implementation:", dbError.message)
        // Fall through to mock implementation
      }
    }

    // Mock implementation
    return mockCheckins.find((c) => c.user_id === userId && c.checkin_date === date) || null
  } catch (error) {
    console.error("Error getting check-in by date:", error)
    return null
  }
}

// Get monthly check-ins
export async function getMonthlyCheckins(userId: number, year: number, month: number): Promise<DailyCheckin[]> {
  try {
    if (sql) {
      try {
        const result = await sql`
          SELECT * FROM daily_checkins
          WHERE user_id = ${userId}
          AND EXTRACT(YEAR FROM checkin_date) = ${year}
          AND EXTRACT(MONTH FROM checkin_date) = ${month}
          ORDER BY checkin_date ASC
        `
        return result as DailyCheckin[]
      } catch (dbError: any) {
        console.warn("Database table not found, using mock implementation:", dbError.message)
        // Fall through to mock implementation
      }
    }

    // Mock implementation - generate some sample data for current month
    console.log("Using mock monthly check-ins for development")
    return generateMockMonthlyData(userId, year, month)
  } catch (error) {
    console.error("Error getting monthly check-ins:", error)
    return []
  }
}

// Get check-in streak
export async function getCheckinStreak(userId: number): Promise<number> {
  try {
    if (sql) {
      try {
        const result = await sql`
          WITH RECURSIVE streak_cte AS (
            SELECT checkin_date, 1 as streak_length
            FROM daily_checkins
            WHERE user_id = ${userId} AND checkin_date = CURRENT_DATE
            
            UNION ALL
            
            SELECT dc.checkin_date, sc.streak_length + 1
            FROM daily_checkins dc
            JOIN streak_cte sc ON dc.checkin_date = sc.checkin_date - INTERVAL '1 day'
            WHERE dc.user_id = ${userId}
          )
          SELECT COALESCE(MAX(streak_length), 0) as streak
          FROM streak_cte
        `
        return result[0]?.streak || 0
      } catch (dbError: any) {
        console.warn("Database table not found, using mock implementation:", dbError.message)
        // Fall through to mock implementation
      }
    }

    // Mock implementation
    console.log("Using mock check-in streak for development")
    return Math.floor(Math.random() * 7) + 1 // 1-7 days
  } catch (error) {
    console.error("Error getting check-in streak:", error)
    return 0
  }
}

// Get monthly stats
export async function getMonthlyStats(userId: number, year: number, month: number) {
  try {
    const checkins = await getMonthlyCheckins(userId, year, month)

    if (checkins.length === 0) {
      return {
        totalCheckins: 0,
        averageMood: 0,
        averageStress: 0,
        averageEnergy: 0,
        averageSleep: 0,
        averageAnxiety: 0,
        totalGoalsAchieved: 0,
        mostCommonActivities: [],
      }
    }

    const totalCheckins = checkins.length
    const averageMood = Math.round(checkins.reduce((sum, c) => sum + c.mood_rating, 0) / totalCheckins)
    const averageStress = Math.round(checkins.reduce((sum, c) => sum + c.stress_level, 0) / totalCheckins)
    const averageEnergy = Math.round(checkins.reduce((sum, c) => sum + c.energy_level, 0) / totalCheckins)
    const averageSleep = Math.round(checkins.reduce((sum, c) => sum + c.sleep_quality, 0) / totalCheckins)
    const averageAnxiety = Math.round(checkins.reduce((sum, c) => sum + c.anxiety_level, 0) / totalCheckins)
    const totalGoalsAchieved = checkins.reduce((sum, c) => sum + c.goals_achieved, 0)

    // Count activities
    const activityCount: { [key: string]: number } = {}
    checkins.forEach((checkin) => {
      checkin.activities.forEach((activity) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1
      })
    })

    const mostCommonActivities = Object.entries(activityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity, count]) => ({ activity, count }))

    return {
      totalCheckins,
      averageMood,
      averageStress,
      averageEnergy,
      averageSleep,
      averageAnxiety,
      totalGoalsAchieved,
      mostCommonActivities,
    }
  } catch (error) {
    console.error("Error getting monthly stats:", error)
    return {
      totalCheckins: 0,
      averageMood: 0,
      averageStress: 0,
      averageEnergy: 0,
      averageSleep: 0,
      averageAnxiety: 0,
      totalGoalsAchieved: 0,
      mostCommonActivities: [],
    }
  }
}
