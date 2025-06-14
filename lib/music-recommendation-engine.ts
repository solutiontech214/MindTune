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

    // Sort by score and return top recommendations
    return categories.sort((a, b) => b.score - a.score).slice(0, 5)
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
