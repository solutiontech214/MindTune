"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Heart,
  Music,
  Play,
  Pause,
  Clock,
  Star,
  ArrowLeft,
  Brain,
  Smile,
  Search,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { signOutAction } from "@/app/actions/auth"
import type { User } from "@/lib/database"
import { GaanaMusicPlayer } from "@/components/gaana-music-player"
import { gaanaAPI, type GaanaTrack, formatDuration, getMoodSearchQuery } from "@/lib/gaana-api"
import { musicRecommendationEngine, type UserMentalState } from "@/lib/music-recommendation-engine"

interface UserMoodData {
  currentMood: number
  currentStress: number
  currentAnxiety: number
  recommendations: string[]
}

interface AIRecommendation {
  category: string
  description: string
  tracks: GaanaTrack[]
  reasoning: string
  score: number
}



export default function MusicTherapyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<GaanaTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlist, setPlaylist] = useState<GaanaTrack[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<GaanaTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recommendedTracks, setRecommendedTracks] = useState<GaanaTrack[]>([])
  const [trendingTracks, setTrendingTracks] = useState<GaanaTrack[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [isLoadingAIRecommendations, setIsLoadingAIRecommendations] = useState(false)
  const [userMoodData, setUserMoodData] = useState<UserMoodData>({
    currentMood: 7,
    currentStress: 4,
    currentAnxiety: 3,
    recommendations: [
      "Moderate stress - Devotional music can help",
      "Sufi music for emotional balance",
      "Great mood - Celebrate with joyful music",
    ],
  })

  // Add a ref to track if we're currently switching tracks
  const [isSwitchingTrack, setIsSwitchingTrack] = useState(false)

  // Get current user - requires real authentication
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          console.log("User not authenticated")
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Load initial music data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingRecommendations(true)
      setIsLoadingAIRecommendations(true)
      try {
        // Load mood-based recommendations
        const moodQuery = getMoodSearchQuery(
          userMoodData.currentStress,
          userMoodData.currentMood,
          userMoodData.currentAnxiety,
        )
        const moodResults = await gaanaAPI.searchTracks(moodQuery, 6)
        setRecommendedTracks(moodResults.tracks)

        // Load trending tracks
        const trending = await gaanaAPI.getTrendingTracks(10)
        setTrendingTracks(trending)

        // Generate AI recommendations
        await generateAIRecommendations()
      } catch (error) {
        console.error("Error loading initial music data:", error)
      } finally {
        setIsLoadingRecommendations(false)
        setIsLoadingAIRecommendations(false)
      }
    }

    if (!isLoading) {
      loadInitialData()
    }
  }, [isLoading, userMoodData.currentMood, userMoodData.currentStress, userMoodData.currentAnxiety])

  // Generate AI-powered music recommendations
  const generateAIRecommendations = async () => {
    try {
      // Convert mood data to recommendation engine format
      const currentHour = new Date().getHours()
      let timeOfDay: "morning" | "afternoon" | "evening" | "night"
      if (currentHour >= 5 && currentHour < 12) timeOfDay = "morning"
      else if (currentHour >= 12 && currentHour < 17) timeOfDay = "afternoon"
      else if (currentHour >= 17 && currentHour < 21) timeOfDay = "evening"
      else timeOfDay = "night"

      let mood: "anxious" | "calm" | "depressed" | "energetic" | "neutral"
      if (userMoodData.currentAnxiety >= 7) mood = "anxious"
      else if (userMoodData.currentMood >= 8) mood = "energetic"
      else if (userMoodData.currentMood <= 4) mood = "depressed"
      else if (userMoodData.currentStress <= 3) mood = "calm"
      else mood = "neutral"

      const userState: UserMentalState = {
        stressLevel: userMoodData.currentStress,
        mood: mood,
        sleepQuality: 7, // Default value
        timeOfDay: timeOfDay,
        preferredGenres: ["devotional", "classical", "ambient"],
        sessionGoal: userMoodData.currentStress >= 6 ? "relaxation" : "focus"
      }

      const recommendations = musicRecommendationEngine.generateRecommendations(userState)

      // Convert to AI recommendations with Gaana tracks
      const aiRecs: AIRecommendation[] = []

      for (const rec of recommendations) {
        const searchQueries = [
          "meditation peaceful calm",
          "devotional bhajan spiritual",
          "classical indian raga",
          "ambient nature sounds",
          "bollywood romantic",
          "sufi music healing",
          "instrumental flute",
          "yoga meditation"
        ]

        const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)]
        const searchResult = await gaanaAPI.searchTracks(randomQuery, 8)

        if (searchResult.tracks.length > 0) {
          aiRecs.push({
            category: rec.name,
            description: rec.description,
            tracks: searchResult.tracks,
            reasoning: rec.reasoning,
            score: rec.score
          })
        }
      }

      setAiRecommendations(aiRecs)
    } catch (error) {
      console.error("Error generating AI recommendations:", error)
    }
  }

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await gaanaAPI.searchTracks(searchQuery, 20)
      setSearchResults(results.tracks)
    } catch (error) {
      console.error("Error searching tracks:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Update the handlePlayTrack function
  const handlePlayTrack = async (track: GaanaTrack, trackList: GaanaTrack[] = []) => {
    if (isSwitchingTrack) return // Prevent rapid track switching

    setIsSwitchingTrack(true)

    try {
      const trackIndex = trackList.findIndex((t) => t.track_id === track.track_id)

      // If it's the same track, just toggle play/pause
      if (currentTrack?.track_id === track.track_id) {
        setIsPlaying(!isPlaying)
      } else {
        // Different track - stop current playback first
        setIsPlaying(false)

        // Small delay to ensure current track stops
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Set new track
        setCurrentTrack(track)
        setPlaylist(trackList.length > 0 ? trackList : [track])
        setCurrentTrackIndex(trackIndex >= 0 ? trackIndex : 0)

        // Start playing new track
        setIsPlaying(true)
      }
    } finally {
      setIsSwitchingTrack(false)
    }
  }

  // Update the handlePlayPause function
  const handlePlayPause = () => {
    if (!isSwitchingTrack) {
      setIsPlaying(!isPlaying)
    }
  }

  // Add debouncing to next/previous functions
  const handleNext = async () => {
    if (playlist.length > 0 && !isSwitchingTrack) {
      setIsSwitchingTrack(true)
      setIsPlaying(false)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const nextIndex = (currentTrackIndex + 1) % playlist.length
      setCurrentTrackIndex(nextIndex)
      setCurrentTrack(playlist[nextIndex])
      setIsPlaying(true)

      setIsSwitchingTrack(false)
    }
  }

  const handlePrevious = async () => {
    if (playlist.length > 0 && !isSwitchingTrack) {
      setIsSwitchingTrack(true)
      setIsPlaying(false)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1
      setCurrentTrackIndex(prevIndex)
      setCurrentTrack(playlist[prevIndex])
      setIsPlaying(true)

      setIsSwitchingTrack(false)
    }
  }

  const handleTrackEnd = () => {
    handleNext()
  }

  // Refresh AI recommendations
  const refreshAIRecommendations = async () => {
    setIsLoadingAIRecommendations(true)
    await generateAIRecommendations()
    setIsLoadingAIRecommendations(false)
  }

  const getStressColor = (level: number) => {
    if (level <= 3) return "text-green-600"
    if (level <= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getMoodColor = (level: number) => {
    if (level >= 8) return "text-green-600"
    if (level >= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const TrackCard = ({ track, trackList = [] }: { track: GaanaTrack; trackList?: GaanaTrack[] }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start space-x-3">
          <img
            src={track.artwork || "/placeholder.svg?height=80&width=80"}
            alt={track.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=80&width=80"
            }}
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate">{track.title}</CardTitle>
            <p className="text-sm text-gray-600 mb-2 truncate">{track.artist}</p>
            {track.album && <p className="text-xs text-gray-500 mb-2 truncate">{track.album}</p>}
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {track.genre}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {track.language}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(track.duration)}</span>
          </div>
          <Button
            onClick={() => handlePlayTrack(track, trackList)}
            className="bg-primary-600 hover:bg-primary-700"
            size="sm"
            disabled={isSwitchingTrack}
          >
            {isSwitchingTrack && currentTrack?.track_id === track.track_id ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Loading
              </>
            ) : currentTrack?.track_id === track.track_id && isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Play
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading music therapy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pb-24">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-md border-b border-gray-800/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Music Therapy</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-200 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/music" className="text-white font-medium">
                  Music Therapy
                </Link>
                <Link href="/support" className="text-gray-200 hover:text-white transition-colors">
                  Support
                </Link>
              </nav>
              <form action={signOutAction}>
                <Button
                  variant="outline"
                  type="submit"
                  className="border-gray-600 text-gray-200 hover:bg-white/10 hover:text-white"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Therapy for {user?.first_name} 🎵</h1>
            <p className="text-gray-600">
              Discover Indian classical, devotional, and contemporary music powered by Gaana's vast music library.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary-600" />
                <span>Search Music</span>
              </CardTitle>
              <CardDescription>Search for your favorite songs, artists, or albums</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching} className="bg-primary-600 hover:bg-primary-700">
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((track) => (
                  <TrackCard key={track.track_id} track={track} trackList={searchResults} />
                ))}
              </div>
            </div>
          )}

          {/* Current Mood & Stress Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-secondary-50 to-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Mood</p>
                    <p className={`text-3xl font-bold ${getMoodColor(userMoodData.currentMood)}`}>
                      {userMoodData.currentMood}/10
                    </p>
                  </div>
                  <Smile className="w-8 h-8 text-secondary-500" />
                </div>
                <Progress value={userMoodData.currentMood * 10} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary-50 to-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stress Level</p>
                    <p className={`text-3xl font-bold ${getStressColor(userMoodData.currentStress)}`}>
                      {userMoodData.currentStress}/10
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-primary-600" />
                </div>
                <Progress value={userMoodData.currentStress * 10} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Anxiety Level</p>
                    <p className={`text-3xl font-bold ${getStressColor(userMoodData.currentAnxiety)}`}>
                      {userMoodData.currentAnxiety}/10
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-orange-500" />
                </div>
                <Progress value={userMoodData.currentAnxiety * 10} className="mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-primary-500 to-secondary-400 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>AI Music Recommendations</span>
              </CardTitle>
              <CardDescription className="text-primary-100">
                Based on your current mood and stress levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userMoodData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-primary-100">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Music Recommendations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-primary-600" />
                <span>AI-Powered Music Recommendations</span>
                {isLoadingAIRecommendations && <Loader2 className="w-5 h-5 animate-spin text-primary-600" />}
              </h2>
              <Button
                onClick={refreshAIRecommendations}
                disabled={isLoadingAIRecommendations}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAIRecommendations ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {aiRecommendations.length > 0 ? (
              <div className="space-y-8">
                {aiRecommendations.map((recommendation, index) => (
                  <div key={index} className="space-y-4">
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-primary-50 to-secondary-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl text-primary-700">{recommendation.category}</CardTitle>
                            <CardDescription className="text-gray-600 mt-1">
                              {recommendation.description}
                            </CardDescription>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                Score: {recommendation.score}%
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {recommendation.tracks.length} tracks
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Brain className="w-4 h-4" />
                            <span>AI Generated</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 italic mb-4">
                          💡 {recommendation.reasoning}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recommendation.tracks.map((track) => (
                        <TrackCard key={`${recommendation.category}_${track.track_id}`} track={track} trackList={recommendation.tracks} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Generating AI-powered recommendations based on your mood...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommended Tracks */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span>Quick Recommendations</span>
              {isLoadingRecommendations && <Loader2 className="w-5 h-5 animate-spin text-primary-600" />}
            </h2>
            {recommendedTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedTracks.map((track) => (
                  <TrackCard key={track.track_id} track={track} trackList={recommendedTracks} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading personalized recommendations...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Trending Tracks */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <span>Trending Now</span>
            </h2>
            {trendingTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTracks.map((track) => (
                  <TrackCard key={track.track_id} track={track} trackList={trendingTracks} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading trending tracks...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Gaana Music Player */}
      <GaanaMusicPlayer
        currentTrack={currentTrack}
        playlist={playlist}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTrackEnd={handleTrackEnd}
      />
    </div>
  )
}