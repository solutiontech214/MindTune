import { audioGenerator } from "./audio-generator"

export interface ReliableAudioTrack {
  track_id: string
  title: string
  artist: string
  genre: string
  language: string
  duration: number
  artwork: string
  sources: AudioSource[]
  mood: string
  category: string
}

export interface AudioSource {
  url: string
  format: "wav" | "mp3" | "ogg"
  quality: "high" | "medium" | "low"
  description: string
  generated: boolean
}

let cachedTracks: ReliableAudioTrack[] | null = null

export function generateReliableAudioSources(): ReliableAudioTrack[] {
  const tracks: ReliableAudioTrack[] = [
    {
      track_id: "meditation-bell-1",
      title: "Peaceful Meditation Bell",
      artist: "MindTune Generator",
      genre: "Meditation",
      language: "Instrumental",
      duration: 300, // 5 minutes
      artwork: "/placeholder.svg?height=300&width=300",
      mood: "calm",
      category: "meditation",
      sources: [
        {
          url: audioGenerator.generateMeditationBell(300),
          format: "wav",
          quality: "high",
          description: "Generated meditation bell with harmonics",
          generated: true,
        },
        {
          url: audioGenerator.generateAmbientSound(300),
          format: "wav",
          quality: "medium",
          description: "Generated ambient meditation sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateTestTone(30, 440),
          format: "wav",
          quality: "medium",
          description: "Test tone (440Hz for 30 seconds)",
          generated: true,
        },
        {
          url: audioGenerator.generateSilentAudio(300),
          format: "wav",
          quality: "low",
          description: "Silent audio fallback",
          generated: true,
        },
      ],
    },
    {
      track_id: "nature-sounds-1",
      title: "Forest Ambience",
      artist: "MindTune Generator",
      genre: "Nature",
      language: "Instrumental",
      duration: 600, // 10 minutes
      artwork: "/placeholder.svg?height=300&width=300",
      mood: "relaxed",
      category: "nature",
      sources: [
        {
          url: audioGenerator.generateNatureSound(600),
          format: "wav",
          quality: "high",
          description: "Generated nature sounds with wind and birds",
          generated: true,
        },
        {
          url: audioGenerator.generateAmbientSound(600),
          format: "wav",
          quality: "medium",
          description: "Generated ambient nature sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateSilentAudio(600),
          format: "wav",
          quality: "low",
          description: "Silent audio fallback",
          generated: true,
        },
      ],
    },
    {
      track_id: "ambient-calm-1",
      title: "Deep Relaxation",
      artist: "MindTune Generator",
      genre: "Ambient",
      language: "Instrumental",
      duration: 900, // 15 minutes
      artwork: "/placeholder.svg?height=300&width=300",
      mood: "peaceful",
      category: "relaxation",
      sources: [
        {
          url: audioGenerator.generateAmbientSound(900),
          format: "wav",
          quality: "high",
          description: "Generated ambient relaxation sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateMeditationBell(900),
          format: "wav",
          quality: "medium",
          description: "Generated meditation bell sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateSilentAudio(900),
          format: "wav",
          quality: "low",
          description: "Silent audio fallback",
          generated: true,
        },
      ],
    },
    {
      track_id: "sleep-sounds-1",
      title: "Gentle Sleep Sounds",
      artist: "MindTune Generator",
      genre: "Sleep",
      language: "Instrumental",
      duration: 1800, // 30 minutes
      artwork: "/placeholder.svg?height=300&width=300",
      mood: "sleepy",
      category: "sleep",
      sources: [
        {
          url: audioGenerator.generateAmbientSound(1800),
          format: "wav",
          quality: "high",
          description: "Generated gentle sleep sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateNatureSound(1800),
          format: "wav",
          quality: "medium",
          description: "Generated nature sleep sounds",
          generated: true,
        },
        {
          url: audioGenerator.generateSilentAudio(1800),
          format: "wav",
          quality: "low",
          description: "Silent audio fallback",
          generated: true,
        },
      ],
    },
  ]

  return tracks
}

export function getReliableAudioTracks(): ReliableAudioTrack[] {
  if (!cachedTracks) {
    cachedTracks = generateReliableAudioSources()
  }
  return cachedTracks
}

export function refreshAudioSources(): ReliableAudioTrack[] {
  cachedTracks = generateReliableAudioSources()
  return cachedTracks
}

export function getTestAudioSource(): AudioSource {
  return {
    url: audioGenerator.generateMeditationBell(30),
    format: "wav",
    quality: "high",
    description: "Test audio - 30 second meditation bell",
    generated: true,
  }
}

// Export the reliable audio tracks array
export const reliableAudioTracks = generateReliableAudioSources()

// Get fresh reliable audio tracks
export function getReliableAudioTracksSync(): ReliableAudioTrack[] {
  return generateReliableAudioSources()
}
