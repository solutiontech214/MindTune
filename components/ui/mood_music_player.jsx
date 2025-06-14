// app/page.tsx
"use client"

import { useState } from "react"
import MoodSelector from "@/components/MoodSelector"
import { GaanaMusicPlayer } from "@/components/gaana-music-player"
import { fetchSongsByMood } from "@/lib/fetchSongs"
// import { ReliableAudioTrack } from "@/lib/reliable-audio-sources" // Types are not used in JS files

export default function MoodMusicApp() {
  const [mood, setMood] = useState("")
  const [playlist, setPlaylist] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleMoodSelect = async (mood) => {
    setMood(mood)
    const tracks = await fetchSongsByMood(mood)
    setPlaylist(tracks)
    setCurrentIndex(0)
    setIsPlaying(true)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }

  return (
    <div>
      <MoodSelector onSelect={handleMoodSelect} />
      <GaanaMusicPlayer
        currentTrack={playlist[currentIndex]}
        playlist={playlist}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((p) => !p)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTrackEnd={handleNext}
      />
    </div>
  )
}
