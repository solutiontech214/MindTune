import { reliableAudioTracks, type ReliableAudioTrack } from "./reliable-audio-sources"

export interface UserMentalState {
  stressLevel: number // 1-10
  mood: "anxious" | "calm" | "depressed" | "energetic" | "neutral"
  sleepQuality: number // 1-10
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
  preferredGenres: string[]
  sessionGoal: "relaxation" | "focus" | "sleep" | "energy" | "meditation"
}

export interface RecommendationCategory {
  name: string
  description: string
  tracks: ReliableAudioTrack[]
  score: number
  reasoning: string
}

export class MusicRecommendationEngine {
  private tracks: ReliableAudioTrack[]

  constructor() {
    this.tracks = reliableAudioTracks
  }

  generateRecommendations(userState: UserMentalState): RecommendationCategory[] {
    const categories: RecommendationCategory[] = []

    // Stress-based recommendations
    if (userState.stressLevel >= 7) {
      categories.push({
        name: "Immediate Stress Relief",
        description: "Calming sounds to reduce high stress levels",
        tracks: this.getTracksByMood(["calm", "peaceful"]),
        score: 95,
        reasoning: "High stress level detected - prioritizing immediate calming effects",
      })
    }

    if (userState.stressLevel >= 4 && userState.stressLevel < 7) {
      categories.push({
        name: "Moderate Stress Management",
        description: "Gentle music to ease moderate stress",
        tracks: this.getTracksByCategory(["meditation", "relaxation"]),
        score: 85,
        reasoning: "Moderate stress - using gentle relaxation techniques",
      })
    }

    // Mood-based recommendations
    switch (userState.mood) {
      case "anxious":
        categories.push({
          name: "Anxiety Relief",
          description: "Gentle sounds to ease anxiety and promote calm",
          tracks: this.getTracksByCategory(["meditation", "nature"]),
          score: 90,
          reasoning: "Anxiety detected - using proven calming frequencies",
        })
        break
      case "depressed":
        categories.push({
          name: "Mood Uplift",
          description: "Uplifting ambient sounds to improve mood",
          tracks: this.getTracksByMood(["peaceful", "relaxed"]),
          score: 85,
          reasoning: "Low mood detected - gentle uplifting sounds recommended",
        })
        break
      case "energetic":
        categories.push({
          name: "Focus Enhancement",
          description: "Ambient sounds to channel energy into focus",
          tracks: this.getTracksByCategory(["ambient", "meditation"]),
          score: 80,
          reasoning: "High energy - channeling into productive focus",
        })
        break
      case "calm":
        categories.push({
          name: "Maintain Calmness",
          description: "Peaceful sounds to maintain your calm state",
          tracks: this.getTracksByMood(["calm", "peaceful"]),
          score: 82,
          reasoning: "Already calm - maintaining peaceful state",
        })
        break
      case "neutral":
        categories.push({
          name: "Balanced Wellness",
          description: "Balanced music for overall well-being",
          tracks: this.getTracksByCategory(["ambient", "nature"]),
          score: 75,
          reasoning: "Neutral mood - balanced approach to wellness",
        })
        break
    }

    // Time-based recommendations
    const timeRecommendations = this.getTimeBasedRecommendations(userState.timeOfDay)
    if (timeRecommendations) {
      categories.push(timeRecommendations)
    }

    // Session goal recommendations
    const goalRecommendations = this.getGoalBasedRecommendations(userState.sessionGoal)
    if (goalRecommendations) {
      categories.push(goalRecommendations)
    }

    // Sleep quality recommendations
    if (userState.sleepQuality <= 5) {
      categories.push({
        name: "Sleep Improvement",
        description: "Sounds designed to improve sleep quality",
        tracks: this.getTracksByCategory(["sleep", "ambient"]),
        score: 88,
        reasoning: "Poor sleep quality - using sleep-optimized frequencies",
      })
    }

    // Additional wellness categories
    categories.push({
      name: "Daily Mindfulness",
      description: "Mindful music for everyday wellness",
      tracks: this.getTracksByCategory(["meditation", "nature"]),
      score: 70,
      reasoning: "Regular mindfulness practice for overall mental health",
    })

    if (userState.stressLevel <= 3) {
      categories.push({
        name: "Creative Flow",
        description: "Inspiring sounds to enhance creativity",
        tracks: this.getTracksByCategory(["ambient", "relaxation"]),
        score: 78,
        reasoning: "Low stress allows for creative exploration",
      })
    }

    // Sort by score and return top recommendations
    return categories.sort((a, b) => b.score - a.score).slice(0, 6)
  }

  private getTracksByMood(moods: string[]): ReliableAudioTrack[] {
    return this.tracks.filter((track) => moods.includes(track.mood))
  }

  private getTracksByCategory(categories: string[]): ReliableAudioTrack[] {
    return this.tracks.filter((track) => categories.includes(track.category))
  }

  private getTimeBasedRecommendations(timeOfDay: string): RecommendationCategory | null {
    switch (timeOfDay) {
      case "morning":
        return {
          name: "Morning Mindfulness",
          description: "Gentle sounds to start your day peacefully",
          tracks: this.getTracksByCategory(["meditation", "nature"]),
          score: 75,
          reasoning: "Morning routine - gentle awakening sounds",
        }
      case "evening":
        return {
          name: "Evening Wind-Down",
          description: "Relaxing sounds to transition to rest",
          tracks: this.getTracksByCategory(["ambient", "relaxation"]),
          score: 82,
          reasoning: "Evening time - preparing for rest and relaxation",
        }
      case "night":
        return {
          name: "Night-Time Relaxation",
          description: "Deep relaxation sounds for better sleep",
          tracks: this.getTracksByCategory(["sleep", "ambient"]),
          score: 90,
          reasoning: "Night time - optimizing for sleep preparation",
        }
      default:
        return null
    }
  }

  private getGoalBasedRecommendations(goal: string): RecommendationCategory | null {
    switch (goal) {
      case "meditation":
        return {
          name: "Deep Meditation",
          description: "Sounds specifically designed for meditation practice",
          tracks: this.getTracksByCategory(["meditation"]),
          score: 95,
          reasoning: "Meditation goal - using traditional meditation sounds",
        }
      case "sleep":
        return {
          name: "Sleep Induction",
          description: "Sounds to help you fall asleep faster",
          tracks: this.getTracksByCategory(["sleep", "ambient"]),
          score: 93,
          reasoning: "Sleep goal - using sleep-optimized frequencies",
        }
      case "relaxation":
        return {
          name: "Deep Relaxation",
          description: "Comprehensive relaxation soundscape",
          tracks: this.getTracksByCategory(["relaxation", "nature"]),
          score: 88,
          reasoning: "Relaxation goal - multi-layered calming sounds",
        }
      case "focus":
        return {
          name: "Focus Enhancement",
          description: "Ambient sounds to improve concentration",
          tracks: this.getTracksByCategory(["ambient", "meditation"]),
          score: 85,
          reasoning: "Focus goal - non-distracting background sounds",
        }
      default:
        return null
    }
  }

  getAllTracks(): ReliableAudioTrack[] {
    return this.tracks
  }

  getTrackById(id: string): ReliableAudioTrack | undefined {
    return this.tracks.find((track) => track.track_id === id)
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function getCurrentTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 21) return "evening"
  return "night"
}

// Export singleton instance
export const musicRecommendationEngine = new MusicRecommendationEngine()
