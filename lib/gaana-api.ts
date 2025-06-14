// Unofficial Gaana API integration for music streaming
// Note: This is for educational purposes. In production, use official APIs with proper licensing.

export interface GaanaTrack {
  track_id: string
  title: string
  artist: string
  album?: string
  duration: number
  artwork: string
  stream_url: string
  genre: string
  language: string
  release_date?: string
  popularity?: number
}

export interface GaanaSearchResult {
  tracks: GaanaTrack[]
  total: number
  page: number
}

export interface GaanaPlaylist {
  playlist_id: string
  title: string
  description: string
  tracks: GaanaTrack[]
  artwork: string
}

class GaanaAPI {
  private baseUrl = "https://gaana.com/apiv2"
  private webUrl = "https://gaana.com"

  // Search for tracks
  async searchTracks(query: string, limit = 20): Promise<GaanaSearchResult> {
    try {
      // Using a proxy approach to avoid CORS issues
      const searchUrl = `${this.baseUrl}/search.php?q=${encodeURIComponent(query)}&type=song&limit=${limit}`

      // In a real implementation, you'd use a backend proxy or CORS-enabled endpoint
      const response = await this.makeRequest(searchUrl)

      return this.parseSearchResults(response)
    } catch (error) {
      console.error("Error searching tracks:", error)
      return { tracks: [], total: 0, page: 1 }
    }
  }

  // Get track stream URL
  async getStreamUrl(trackId: string): Promise<string> {
    try {
      const streamUrl = `${this.baseUrl}/player/getStreamUrl.php?track_id=${trackId}&quality=high`
      const response = await this.makeRequest(streamUrl)

      return response.stream_url || ""
    } catch (error) {
      console.error("Error getting stream URL:", error)
      return ""
    }
  }

  // Get curated playlists for different moods
  async getMoodPlaylist(mood: "calm" | "energetic" | "devotional" | "classical"): Promise<GaanaPlaylist> {
    const moodQueries = {
      calm: "meditation peaceful calm instrumental",
      energetic: "bollywood dance upbeat energetic",
      devotional: "bhajan devotional spiritual mantra",
      classical: "classical indian raga instrumental",
    }

    try {
      const searchResult = await this.searchTracks(moodQueries[mood], 15)

      return {
        playlist_id: `mood_${mood}`,
        title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Music`,
        description: `Curated ${mood} music for your wellness journey`,
        tracks: searchResult.tracks,
        artwork: searchResult.tracks[0]?.artwork || "/placeholder.svg?height=300&width=300",
      }
    } catch (error) {
      console.error("Error getting mood playlist:", error)
      return {
        playlist_id: `mood_${mood}`,
        title: `${mood} Music`,
        description: "Music playlist",
        tracks: [],
        artwork: "/placeholder.svg?height=300&width=300",
      }
    }
  }

  // Get trending tracks
  async getTrendingTracks(limit = 20): Promise<GaanaTrack[]> {
    try {
      const trendingUrl = `${this.baseUrl}/trending.php?type=song&limit=${limit}`
      const response = await this.makeRequest(trendingUrl)

      return this.parseTrackList(response.tracks || [])
    } catch (error) {
      console.error("Error getting trending tracks:", error)
      return []
    }
  }

  // Private method to make API requests
  private async makeRequest(url: string): Promise<any> {
    // Since we can't directly call Gaana API due to CORS, we'll simulate the response
    // In a real implementation, you'd use a backend proxy or official API

    // For demo purposes, return mock data based on the URL
    if (url.includes("search.php")) {
      return this.getMockSearchResults(url)
    } else if (url.includes("getStreamUrl.php")) {
      return this.getMockStreamUrl(url)
    } else if (url.includes("trending.php")) {
      return this.getMockTrendingResults()
    }

    return {}
  }

  // Mock search results for demo
  private getMockSearchResults(url: string): any {
    const query = new URL(url).searchParams.get("q") || ""

    // Return different mock results based on search query
    if (query.includes("meditation") || query.includes("calm")) {
      return {
        tracks: [
          {
            track_id: "calm_1",
            title: "Om Namah Shivaya",
            artist: "Anuradha Paudwal",
            album: "Divine Chants",
            duration: 480,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            genre: "Devotional",
            language: "Sanskrit",
          },
          {
            track_id: "calm_2",
            title: "Raga Yaman - Evening Peace",
            artist: "Pandit Ravi Shankar",
            album: "Classical Ragas",
            duration: 720,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
            genre: "Classical",
            language: "Instrumental",
          },
          {
            track_id: "calm_3",
            title: "Gayatri Mantra",
            artist: "Hariharan",
            album: "Sacred Mantras",
            duration: 360,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-03.wav",
            genre: "Devotional",
            language: "Sanskrit",
          },
        ],
        total: 3,
      }
    } else if (query.includes("bollywood") || query.includes("energetic")) {
      return {
        tracks: [
          {
            track_id: "energetic_1",
            title: "Kun Faya Kun",
            artist: "A.R. Rahman, Javed Ali",
            album: "Rockstar",
            duration: 428,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-02.wav",
            genre: "Sufi",
            language: "Hindi",
          },
          {
            track_id: "energetic_2",
            title: "Vande Mataram",
            artist: "A.R. Rahman",
            album: "Patriotic Songs",
            duration: 345,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
            genre: "Patriotic",
            language: "Hindi",
          },
        ],
        total: 2,
      }
    } else if (query.includes("devotional") || query.includes("bhajan")) {
      return {
        tracks: [
          {
            track_id: "devotional_1",
            title: "Hanuman Chalisa",
            artist: "Hariharan",
            album: "Devotional Classics",
            duration: 435,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-06.wav",
            genre: "Devotional",
            language: "Hindi",
          },
          {
            track_id: "devotional_2",
            title: "Meera Bhajan",
            artist: "M.S. Subbulakshmi",
            album: "Classical Devotional",
            duration: 380,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-07.wav",
            genre: "Classical Devotional",
            language: "Hindi",
          },
        ],
        total: 2,
      }
    } else if (query.includes("classical") || query.includes("raga")) {
      return {
        tracks: [
          {
            track_id: "classical_1",
            title: "Raga Bhairav",
            artist: "Ustad Ali Akbar Khan",
            album: "Morning Ragas",
            duration: 920,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-08.wav",
            genre: "Classical",
            language: "Instrumental",
          },
          {
            track_id: "classical_2",
            title: "Bansuri Meditation",
            artist: "Pandit Hariprasad Chaurasia",
            album: "Flute Meditations",
            duration: 1200,
            artwork: "/placeholder.svg?height=300&width=300",
            stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-09.wav",
            genre: "Instrumental",
            language: "Instrumental",
          },
        ],
        total: 2,
      }
    }

    return { tracks: [], total: 0 }
  }

  private getMockStreamUrl(url: string): any {
    const trackId = new URL(url).searchParams.get("track_id")

    // Return different stream URLs based on track ID
    const streamUrls: { [key: string]: string } = {
      calm_1: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
      calm_2: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
      calm_3: "https://www.soundjay.com/misc/sounds/bell-ringing-03.wav",
      energetic_1: "https://www.soundjay.com/misc/sounds/bell-ringing-02.wav",
      energetic_2: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
      devotional_1: "https://www.soundjay.com/misc/sounds/bell-ringing-06.wav",
      devotional_2: "https://www.soundjay.com/misc/sounds/bell-ringing-07.wav",
      classical_1: "https://www.soundjay.com/misc/sounds/bell-ringing-08.wav",
      classical_2: "https://www.soundjay.com/misc/sounds/bell-ringing-09.wav",
    }

    return {
      stream_url: streamUrls[trackId || ""] || "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    }
  }

  private getMockTrendingResults(): any {
    return {
      tracks: [
        {
          track_id: "trending_1",
          title: "Kesariya",
          artist: "Arijit Singh",
          album: "Brahmastra",
          duration: 268,
          artwork: "/placeholder.svg?height=300&width=300",
          stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
          genre: "Bollywood",
          language: "Hindi",
        },
        {
          track_id: "trending_2",
          title: "Raataan Lambiyan",
          artist: "Tanishk Bagchi, Jubin Nautiyal",
          album: "Shershaah",
          duration: 245,
          artwork: "/placeholder.svg?height=300&width=300",
          stream_url: "https://www.soundjay.com/misc/sounds/bell-ringing-02.wav",
          genre: "Bollywood",
          language: "Hindi",
        },
      ],
    }
  }

  private parseSearchResults(response: any): GaanaSearchResult {
    return {
      tracks: this.parseTrackList(response.tracks || []),
      total: response.total || 0,
      page: 1,
    }
  }

  private parseTrackList(tracks: any[]): GaanaTrack[] {
    return tracks.map((track) => ({
      track_id: track.track_id || track.id || "",
      title: track.title || track.name || "",
      artist: track.artist || track.artists?.[0]?.name || "",
      album: track.album || track.album_name || "",
      duration: track.duration || 0,
      artwork: track.artwork || track.image || "/placeholder.svg?height=300&width=300",
      stream_url: track.stream_url || "",
      genre: track.genre || "",
      language: track.language || "",
      release_date: track.release_date || "",
      popularity: track.popularity || 0,
    }))
  }
}

// Export singleton instance
export const gaanaAPI = new GaanaAPI()

// Helper function to convert seconds to MM:SS format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Helper function to get mood-based search queries
export function getMoodSearchQuery(stressLevel: number, mood: number, anxiety: number): string {
  if (stressLevel >= 7 || anxiety >= 7) {
    return "meditation peaceful calm instrumental raga"
  } else if (stressLevel >= 4 || anxiety >= 4) {
    return "devotional bhajan spiritual mantra"
  } else if (mood >= 8) {
    return "bollywood upbeat energetic dance"
  } else if (mood <= 4) {
    return "soothing healing peaceful spiritual"
  } else {
    return "indian classical contemporary"
  }
}
