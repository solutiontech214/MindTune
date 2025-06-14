"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Camera, CameraOff, CameraIcon as Capture, Brain, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface StressAnalysis {
  stressLevel: number
  moodScore: number
  anxietyLevel: number
  confidence: number
  emotions: {
    stress: number
    calm: number
    anxiety: number
    focus: number
    happiness: number
    sadness: number
  }
  facialIndicators: string[]
  timestamp: Date
}

interface StressCameraProps {
  onAnalysisComplete?: (analysis: StressAnalysis) => void
}

export function StressCamera({ onAnalysisComplete }: StressCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState<StressAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Simulated AI stress detection based on captured image
  const analyzeStress = useCallback(async (imageData: string): Promise<StressAnalysis> => {
    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated comprehensive stress analysis
    const baseStress = Math.random() * 100
    const stressLevel = Math.max(0, Math.min(100, baseStress + (Math.random() - 0.5) * 20))

    // Calculate mood score (inverse relationship with stress)
    const moodScore = Math.max(10, Math.min(100, 100 - stressLevel + (Math.random() - 0.5) * 30))

    // Calculate anxiety level (correlated with stress)
    const anxietyLevel = Math.max(0, Math.min(100, stressLevel * 0.8 + (Math.random() - 0.5) * 25))

    const emotions = {
      stress: stressLevel,
      calm: Math.max(0, 100 - stressLevel + (Math.random() - 0.5) * 20),
      anxiety: anxietyLevel,
      focus: Math.max(0, 80 - stressLevel * 0.6 + (Math.random() - 0.5) * 20),
      happiness: Math.max(0, moodScore * 0.7 + (Math.random() - 0.5) * 15),
      sadness: Math.max(0, stressLevel * 0.5 + (Math.random() - 0.5) * 15),
    }

    const facialIndicators = []
    if (stressLevel > 70) {
      facialIndicators.push("High tension in facial muscles", "Deep frown lines", "Clenched jaw", "Narrowed eyes")
    } else if (stressLevel > 50) {
      facialIndicators.push("Moderate facial tension", "Slight frown", "Focused expression")
    } else if (stressLevel > 30) {
      facialIndicators.push("Mild concern", "Neutral expression", "Relaxed jaw")
    } else {
      facialIndicators.push("Relaxed facial features", "Calm expression", "Soft eye area", "Natural smile")
    }

    // Add mood-specific indicators
    if (moodScore > 70) {
      facialIndicators.push("Positive facial expression", "Bright eyes")
    } else if (moodScore < 40) {
      facialIndicators.push("Downturned mouth", "Tired appearance")
    }

    return {
      stressLevel: Math.round(stressLevel),
      moodScore: Math.round(moodScore),
      anxietyLevel: Math.round(anxietyLevel),
      confidence: Math.round(85 + Math.random() * 12),
      emotions,
      facialIndicators,
      timestamp: new Date(),
    }
  }, [])

  // Add this useEffect after the existing useCallback functions
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error)
      }
    }
  }, [stream])

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser")
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: "user",
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsActive(true)
    } catch (err: any) {
      let errorMessage = "Unable to access camera. "

      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions and try again."
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device."
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera is already in use by another application."
      } else {
        errorMessage += "Please check permissions and try again."
      }

      setError(errorMessage)
      console.error("Camera access error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsActive(false)
    setIsAnalyzing(false)
    setCapturedImage(null)
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsAnalyzing(true)
    setError(null)

    try {
      // Capture frame from video
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get image data for display
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageDataUrl)

        // Analyze stress using the captured image
        const analysis = await analyzeStress(imageDataUrl)
        setCurrentAnalysis(analysis)

        // Notify parent component
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis)
        }
      } else {
        throw new Error("Video not ready for capture")
      }
    } catch (err) {
      setError("Failed to capture and analyze image. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStressColor = (level: number) => {
    if (level < 30) return "text-green-600 bg-green-50 border-green-200"
    if (level < 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getMoodColor = (level: number) => {
    if (level > 70) return "text-green-600 bg-green-50 border-green-200"
    if (level > 40) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getStressLabel = (level: number) => {
    if (level < 30) return "Low Stress"
    if (level < 60) return "Moderate Stress"
    return "High Stress"
  }

  const getMoodLabel = (level: number) => {
    if (level > 70) return "Good Mood"
    if (level > 40) return "Neutral Mood"
    return "Low Mood"
  }

  return (
    <div className="space-y-6">
      {/* Camera Interface */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <span>AI Stress & Mood Detection</span>
            {isActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>}
          </CardTitle>
          <CardDescription>
            Capture your photo to analyze stress levels, mood, and emotional state using advanced AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Feed and Captured Image */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Live Camera Feed */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 border-b">Live Camera Feed</div>
              {isActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  onCanPlay={() => {
                    if (videoRef.current) {
                      videoRef.current.play()
                    }
                  }}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Camera not active</p>
                  </div>
                </div>
              )}

              {/* Analysis Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Analyzing facial expressions...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Captured Image */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 border-b">Captured Image</div>
              {capturedImage ? (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured for analysis"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <Capture className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No image captured</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {!isActive ? (
              <Button onClick={startCamera} className="bg-primary-600 hover:bg-primary-700">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
                <Button
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing}
                  className="bg-secondary-500 hover:bg-secondary-600"
                >
                  <Capture className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Capture & Analyze"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {currentAnalysis && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <div className="flex space-x-2">
                <Badge className={getStressColor(currentAnalysis.stressLevel)}>
                  {getStressLabel(currentAnalysis.stressLevel)}
                </Badge>
                <Badge className={getMoodColor(currentAnalysis.moodScore)}>
                  {getMoodLabel(currentAnalysis.moodScore)}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>Analysis completed at {currentAnalysis.timestamp.toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Stress Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stress Level</span>
                  <span className="text-2xl font-bold text-primary-600">{currentAnalysis.stressLevel}%</span>
                </div>
                <Progress value={currentAnalysis.stressLevel} className="h-3" />
              </div>

              {/* Mood Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mood Score</span>
                  <span className="text-2xl font-bold text-secondary-500">{currentAnalysis.moodScore}%</span>
                </div>
                <Progress value={currentAnalysis.moodScore} className="h-3" />
              </div>

              {/* Anxiety Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Anxiety Level</span>
                  <span className="text-2xl font-bold text-orange-600">{currentAnalysis.anxietyLevel}%</span>
                </div>
                <Progress value={currentAnalysis.anxietyLevel} className="h-3" />
              </div>
            </div>

            {/* Detailed Emotion Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-3">Detailed Emotional Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(currentAnalysis.emotions).map(([emotion, value]) => (
                  <div key={emotion} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm capitalize">{emotion}</span>
                      <span className="text-sm font-medium">{Math.round(value)}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Facial Indicators */}
            <div>
              <h4 className="text-sm font-medium mb-2">Detected Facial Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.facialIndicators.map((indicator, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Confidence and Recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                <span>Analysis Confidence</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{currentAnalysis.confidence}%</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">
                    {currentAnalysis.stressLevel > 60
                      ? "Consider taking a break or practicing relaxation"
                      : currentAnalysis.stressLevel > 30
                        ? "You're doing well, keep monitoring"
                        : "Great! You appear calm and relaxed"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
