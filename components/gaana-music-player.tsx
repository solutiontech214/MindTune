"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Download,
  AlertCircle,
  RefreshCw,
  TestTube,
} from "lucide-react"
import { formatDuration } from "@/lib/music-recommendation-engine"
import type { ReliableAudioTrack } from "@/lib/reliable-audio-sources"

interface GaanaMusicPlayerProps {
  currentTrack: ReliableAudioTrack | null
  playlist: ReliableAudioTrack[]
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
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isSourceTesting, setIsSourceTesting] = useState(false)

  // Get current audio source
 // ...existing code...
const currentSource =
  currentTrack && Array.isArray(currentTrack.sources) && currentTrack.sources.length > 0 && currentSourceIndex >= 0 && currentSourceIndex < currentTrack.sources.length
    ? currentTrack.sources[currentSourceIndex]
    : undefined


  // Load audio source when track or source index changes
  useEffect(() => {
    if (currentTrack && currentSource && audioRef.current) {
      setIsLoading(true)
      setAudioError(null)

      audioRef.current.src = currentSource.url
      audioRef.current.load()
      setCurrentTime(0)
      setDuration(0)
    }
  }, [currentTrack, currentSource])

  // Handle play/pause with proper promise management
  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current || !currentSource) return

    try {
      if (isPlaying) {
        if (!hasUserInteracted) {
          setHasUserInteracted(true)
        }
        await audioRef.current.play()
        setAudioError(null)
      } else {
        audioRef.current.pause()
      }
    } catch (error: any) {
      console.error("Playback error:", error)
      setAudioError(`Playback failed: ${error.message}`)

      // Try next source if available
      if (currentTrack && currentSourceIndex < currentTrack.sources.length - 1) {
        setCurrentSourceIndex((prev) => prev + 1)
      }
    }
  }, [isPlaying, currentSource, hasUserInteracted, currentTrack, currentSourceIndex])

  // Sync with external play state
  useEffect(() => {
    if (hasUserInteracted) {
      handlePlayPause()
    }
  }, [isPlaying, handlePlayPause, hasUserInteracted])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [volume, isMuted])

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
    setIsLoading(false)
  }

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      }
    } else {
      onTrackEnd()
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setAudioError(null)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    setAudioError(null)
  }

  const handleWaiting = () => {
    setIsLoading(true)
  }

  const handlePlaying = () => {
    setIsLoading(false)
    setAudioError(null)
  }

  // Enhanced error handler with automatic source switching
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget
    const error = audio.error

    if (error) {
      let errorMessage = "Audio playback error"

      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Audio playback was aborted"
          break
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio"
          break
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Audio format not supported - trying next source"
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio source not supported - trying next source"
          break
        default:
          errorMessage = error.message || "Unknown audio error"
      }

      console.error("Audio error:", {
        code: error.code,
        message: error.message,
        track: currentTrack?.title,
        source: currentSource?.description,
        sourceIndex: currentSourceIndex,
      })

      // Try next source automatically for format/decode errors
      if (
        (error.code === MediaError.MEDIA_ERR_DECODE || error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) &&
        currentTrack &&
        currentSourceIndex < currentTrack.sources.length - 1
      ) {
        console.log(`Trying next source: ${currentSourceIndex + 1}`)
        setCurrentSourceIndex((prev) => prev + 1)
        return // Don't show error yet, trying next source
      }

      setAudioError(errorMessage)
    }

    setIsLoading(false)
  }

  // Handle user interaction for autoplay policy
  const handleUserInteraction = () => {
    setHasUserInteracted(true)
    onPlayPause()
  }

  // Try next audio source
  const handleNextSource = () => {
    if (currentTrack && currentSourceIndex < currentTrack.sources.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1)
      setAudioError(null)
    } else {
      // Reset to first source
      setCurrentSourceIndex(0)
      setAudioError(null)
    }
  }

  // Test current audio source
  const handleTestSource = async () => {
    if (!currentSource || !audioRef.current) return

    setIsSourceTesting(true)
    try {
      // Create a test audio element
      const testAudio = new Audio(currentSource.url)
      testAudio.volume = 0.1

      await new Promise((resolve, reject) => {
        testAudio.oncanplay = resolve
        testAudio.onerror = reject
        testAudio.load()
      })

      // Play for 1 second
      await testAudio.play()
      setTimeout(() => {
        testAudio.pause()
        testAudio.src = ""
      }, 1000)

      setAudioError(null)
      alert(`✅ Source test successful!\n${currentSource.description}`)
    } catch (error: any) {
      console.error("Source test failed:", error)
      setAudioError(`Source test failed: ${error.message}`)
    } finally {
      setIsSourceTesting(false)
    }
  }

  if (!currentTrack) {
    return null
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
     
<CardContent className="p-4">

  {/* Only render audio if currentSource exists */}
  {currentSource && (
    <audio
      ref={audioRef}
      src={currentSource.url}
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
  )}

      


        {/* Error Alert */}
        {audioError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>{audioError}</span>
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-xs text-red-600">
                  Source {currentSourceIndex + 1}/{currentTrack.sources.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextSource}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Next Source
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
                {currentSource?.generated && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    Generated
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs text-blue-600">
                  {currentSource?.quality.toUpperCase()}
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
                onClick={hasUserInteracted ? onPlayPause : handleUserInteraction}
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
                disabled={isLoading || !!audioError}
              />
              <span className="text-xs text-gray-500 w-10">{formatDuration(duration || currentTrack.duration)}</span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestSource}
              disabled={isSourceTesting || !currentSource}
              className="text-blue-600"
              title="Test current audio source"
            >
              {isSourceTesting ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
            </Button>

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

        {/* Source Information */}
        {currentSource && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            {currentSource.description} • Format: {currentSource.format.toUpperCase()} • Quality:{" "}
            {currentSource.quality}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
