
"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wind, Play, Pause, RotateCcw, Heart, Timer } from "lucide-react"

interface BreathingSession {
  technique: string
  duration: number
  completed: boolean
  score: number
}

type BreathingTechnique = {
  name: string
  description: string
  inhale: number
  hold: number
  exhale: number
  cycles: number
  color: string
}

const breathingTechniques: BreathingTechnique[] = [
  {
    name: "4-7-8 Technique",
    description: "Calming technique for stress relief",
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    color: "blue"
  },
  {
    name: "Box Breathing",
    description: "Balanced breathing for focus",
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    color: "green"
  },
  {
    name: "Triangle Breathing",
    description: "Simple technique for beginners",
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 5,
    color: "purple"
  },
  {
    name: "Energizing Breath",
    description: "Quick technique for energy boost",
    inhale: 3,
    hold: 2,
    exhale: 5,
    cycles: 8,
    color: "orange"
  }
]

export function BreathingGame() {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>(breathingTechniques[0])
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [cycleCount, setCycleCount] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionScore, setSessionScore] = useState(0)
  const [heartRate, setHeartRate] = useState(72)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentPhaseDuration = 
    currentPhase === 'inhale' ? selectedTechnique.inhale :
    currentPhase === 'hold' ? selectedTechnique.hold :
    selectedTechnique.exhale

  useEffect(() => {
    if (isActive && !sessionComplete) {
      intervalRef.current = setInterval(() => {
        setPhaseProgress(prev => {
          const newProgress = prev + (100 / currentPhaseDuration)
          
          if (newProgress >= 100) {
            // Move to next phase
            if (currentPhase === 'inhale') {
              setCurrentPhase('hold')
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale')
            } else {
              // Complete cycle
              const newCycleCount = cycleCount + 1
              setCycleCount(newCycleCount)
              setCurrentPhase('inhale')
              
              // Update session progress
              const newSessionProgress = (newCycleCount / selectedTechnique.cycles) * 100
              setSessionProgress(newSessionProgress)
              
              // Simulate heart rate reduction
              setHeartRate(prev => Math.max(60, prev - Math.random() * 2))
              
              if (newCycleCount >= selectedTechnique.cycles) {
                completeSession()
                return 0
              }
            }
            return 0
          }
          
          return newProgress
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, currentPhase, currentPhaseDuration, cycleCount, selectedTechnique.cycles, sessionComplete])

  const completeSession = () => {
    setIsActive(false)
    setSessionComplete(true)
    
    // Calculate score based on completion and consistency
    const baseScore = 100
    const consistencyBonus = Math.floor(Math.random() * 50) + 50 // Simulate consistency
    const finalScore = baseScore + consistencyBonus
    setSessionScore(finalScore)
  }

  const startSession = () => {
    setIsActive(true)
    setSessionComplete(false)
    setCycleCount(0)
    setPhaseProgress(0)
    setSessionProgress(0)
    setCurrentPhase('inhale')
    setHeartRate(72 + Math.floor(Math.random() * 10))
  }

  const pauseSession = () => {
    setIsActive(false)
  }

  const resetSession = () => {
    setIsActive(false)
    setSessionComplete(false)
    setCycleCount(0)
    setPhaseProgress(0)
    setSessionProgress(0)
    setCurrentPhase('inhale')
    setHeartRate(72)
  }

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
    }
  }

  const getCircleSize = () => {
    const baseSize = 120
    const maxSize = 180
    
    if (currentPhase === 'inhale') {
      return baseSize + (maxSize - baseSize) * (phaseProgress / 100)
    } else if (currentPhase === 'exhale') {
      return maxSize - (maxSize - baseSize) * (phaseProgress / 100)
    }
    return maxSize
  }

  const getCircleColor = () => {
    const colors = {
      blue: 'bg-blue-400',
      green: 'bg-green-400',
      purple: 'bg-purple-400',
      orange: 'bg-orange-400'
    }
    return colors[selectedTechnique.color as keyof typeof colors]
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-primary-600" />
            <span>Breathing Exercise Game</span>
          </div>
          {sessionComplete && (
            <Badge className="bg-green-100 text-green-800">
              Session Complete!
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Interactive breathing exercises to reduce stress and improve focus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technique Selection */}
        {!isActive && !sessionComplete && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Choose a Breathing Technique:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {breathingTechniques.map((technique, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTechnique(technique)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    selectedTechnique.name === technique.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-800">{technique.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{technique.description}</p>
                  <div className="text-xs text-gray-500">
                    {technique.inhale}s inhale • {technique.hold}s hold • {technique.exhale}s exhale • {technique.cycles} cycles
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Breathing Circle and Progress */}
        {(isActive || sessionComplete) && (
          <div className="text-center space-y-6">
            <div className="relative flex items-center justify-center h-64">
              <div 
                className={`rounded-full transition-all duration-1000 ease-in-out ${getCircleColor()} opacity-70`}
                style={{ 
                  width: `${getCircleSize()}px`, 
                  height: `${getCircleSize()}px` 
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {sessionComplete ? 'Complete!' : getPhaseInstruction()}
                </h3>
                <p className="text-lg text-gray-600">
                  {sessionComplete ? `Score: ${sessionScore}` : `${Math.ceil(currentPhaseDuration - (phaseProgress / 100 * currentPhaseDuration))}s`}
                </p>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Cycle Progress</span>
                  <span>{cycleCount}/{selectedTechnique.cycles}</span>
                </div>
                <Progress value={sessionProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-red-600">{heartRate}</div>
                  <p className="text-xs text-gray-600">Heart Rate (BPM)</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Timer className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-600">
                    {Math.floor((cycleCount * (selectedTechnique.inhale + selectedTechnique.hold + selectedTechnique.exhale)) / 60)}m
                  </div>
                  <p className="text-xs text-gray-600">Duration</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Complete Results */}
        {sessionComplete && (
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <div className="text-3xl font-bold text-green-600 mb-2">{sessionScore}/150</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {sessionScore >= 120 ? 'Excellent!' : sessionScore >= 100 ? 'Good!' : 'Keep Practicing!'}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>You completed {selectedTechnique.cycles} breathing cycles</p>
              <p>Regular breathing exercises reduce stress and improve focus</p>
              <p>Heart rate reduced by {Math.floor(Math.random() * 8) + 5} BPM</p>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          {!isActive && !sessionComplete && (
            <Button onClick={startSession} className="bg-primary-600 hover:bg-primary-700">
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          )}
          
          {isActive && !sessionComplete && (
            <Button onClick={pauseSession} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          
          {(isActive || sessionComplete) && (
            <Button onClick={resetSession} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Instructions */}
        {!isActive && !sessionComplete && (
          <div className="text-center p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="font-semibold text-primary-800 mb-2">Breathing Benefits:</h4>
            <div className="text-sm text-primary-700 space-y-1">
              <p>• Reduces stress and anxiety levels</p>
              <p>• Improves focus and mental clarity</p>
              <p>• Lowers heart rate and blood pressure</p>
              <p>• Activates the body's relaxation response</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
