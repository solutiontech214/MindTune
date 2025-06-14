"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, Download } from "lucide-react"
import { gaanaAPI, type GaanaTrack, formatDuration } from "@/lib/gaana-api"

interface GaanaMusicPlayerProps {
  currentTrack: GaanaTrack | null
  playlist: GaanaTrack[]
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onTrackEnd: () => void
}

export function GaanaMusicPlayer({
  currentTrack,
  playlist,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onTrackEnd,
}: GaanaMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string>("")

  // Get stream URL when track changes
  useEffect(() => {
    const loadStreamUrl = async () => {
      if (currentTrack) {
        setIsLoading(true)
        try {
          // First try to use the existing stream_url
          if (currentTrack.stream_url) {
            setStreamUrl(currentTrack.stream_url)
          } else {
            // Otherwise, fetch from Gaana API
            const url = await gaanaAPI.getStreamUrl(currentTrack.track_id)
            setStreamUrl(url)
          }
        } catch (error) {
          console.error("Error loading stream URL:", error)
          // Fallback to demo audio
          setStreamUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadStreamUrl()
  }, [currentTrack])

  // Update audio element when stream URL changes
  useEffect(() => {
    if (audioRef.current && streamUrl) {
      audioRef.current.src = streamUrl
      audioRef.current.load()
    }
  }, [streamUrl])

  // Handle play/pause with proper promise management
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return

    let playPromise: Promise<void> | null = null

    const handlePlayPause = async () => {
      try {
        if (isPlaying && !isLoading) {
          // If there's a pending play promise, wait for it to resolve first
          if (playPromise) {
            try {
              await playPromise
            } catch (error) {
              // Ignore errors from previous play attempts
            }
          }

          playPromise = audio.play()
          await playPromise
          playPromise = null
        } else {
          // If there's a pending play promise, wait for it to resolve before pausing
          if (playPromise) {
            try {
              await playPromise
              audio.pause()
            } catch (error) {
              // If play was aborted, that's fine - we wanted to pause anyway
            }
            playPromise = null
          } else {
            audio.pause()
          }
        }
      } catch (error) {
        // Handle play/pause errors gracefully
        if (error.name !== "AbortError") {
          console.error("Audio playback error:", error)
        }
        playPromise = null
      }
    }

    handlePlayPause()

    // Cleanup function
    return () => {
      if (playPromise) {
        playPromise
          .then(() => {
            if (audio && !audio.paused) {
              audio.pause()
            }
          })
          .catch(() => {
            // Ignore cleanup errors
          })
      }
    }
  }, [isPlaying, streamUrl, isLoading])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  // Duration change handler
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  // Track ended handler
  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      onTrackEnd()
    }
  }

  // Seek handler
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  // Add loading state management
  const handleLoadStart = () => {
    setIsLoading(true)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleWaiting = () => {
    setIsLoading(true)
  }

  const handlePlaying = () => {
    setIsLoading(false)
  }

  // Error handler with better error management
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget
    const error = audio.error

    if (error) {
      console.error("Audio error:", {
        code: error.code,
        message: error.message,
        track: currentTrack?.title,
      })
    }

    setIsLoading(false)
    // Don't automatically stop playback on error - let user retry
  }

  if (!currentTrack) {
    return null
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
      <CardContent className="p-4">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPause={() => setIsLoading(false)}
          preload="metadata"
          crossOrigin="anonymous"
        />

        <div className="flex items-center space-x-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 flex-shrink-0">
              <img
                src={currentTrack.artwork || "/placeholder.svg?height=48&width=48"}
                alt={currentTrack.title}
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate">{currentTrack.title}</h4>
              <p className="text-sm text-gray-600 truncate">{currentTrack.artist}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {currentTrack.genre}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentTrack.language}
                </Badge>
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsShuffle(!isShuffle)}
                className={isShuffle ? "text-primary-600" : "text-gray-600"}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              <Button variant="ghost" size="sm" onClick={onPrevious} disabled={playlist.length <= 1}>
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                onClick={onPlayPause}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button variant="ghost" size="sm" onClick={onNext} disabled={playlist.length <= 1}>
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRepeat(!isRepeat)}
                className={isRepeat ? "text-primary-600" : "text-gray-600"}
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-500 w-10">{formatDuration(Math.floor(currentTime))}</span>
              <Slider
                value={[currentTime]}
                max={duration || currentTrack.duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
                disabled={isLoading}
              />
              <span className="text-xs text-gray-500 w-10">{formatDuration(duration || currentTrack.duration)}</span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-red-500" : "text-gray-600"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-600">
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 flex-1 justify-end max-w-32">
            <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="text-gray-600">
              {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={volume} max={100} step={1} onValueChange={setVolume} className="w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
