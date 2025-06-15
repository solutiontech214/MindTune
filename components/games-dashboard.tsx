
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuizGame } from "./quiz-game"
import { MemoryGame } from "./memory-game"
import { BreathingGame } from "./breathing-game"
import { Brain, Gamepad2, Wind, Trophy, Target, TrendingUp } from "lucide-react"

interface GameStats {
  quizzes: { completed: number; averageScore: number }
  memory: { gamesPlayed: number; bestScore: number }
  breathing: { sessionsCompleted: number; totalMinutes: number }
}

export function GamesDashboard() {
  const [gameStats] = useState<GameStats>({
    quizzes: { completed: 12, averageScore: 78 },
    memory: { gamesPlayed: 8, bestScore: 950 },
    breathing: { sessionsCompleted: 15, totalMinutes: 45 }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gamepad2 className="w-6 h-6 text-primary-600" />
            <span>Wellness Games & Activities</span>
          </CardTitle>
          <CardDescription>
            Interactive games designed to improve mental wellness, cognitive function, and stress management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Brain className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{gameStats.quizzes.completed}</div>
              <p className="text-sm text-gray-600">Quizzes Completed</p>
              <p className="text-xs text-primary-600">{gameStats.quizzes.averageScore}% avg score</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Target className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{gameStats.memory.gamesPlayed}</div>
              <p className="text-sm text-gray-600">Memory Games</p>
              <p className="text-xs text-secondary-500">Best: {gameStats.memory.bestScore} pts</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Wind className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{gameStats.breathing.totalMinutes}</div>
              <p className="text-sm text-gray-600">Minutes of Breathing</p>
              <p className="text-xs text-primary-500">{gameStats.breathing.sessionsCompleted} sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Tabs */}
      <Tabs defaultValue="quiz" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Memory</span>
            </TabsTrigger>
            <TabsTrigger value="breathing" className="flex items-center space-x-2">
              <Wind className="w-4 h-4" />
              <span className="hidden sm:inline">Breathing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quiz">
          <QuizGame />
        </TabsContent>

        <TabsContent value="memory">
          <MemoryGame />
        </TabsContent>

        <TabsContent value="breathing">
          <BreathingGame />
        </TabsContent>
      </Tabs>

      {/* Benefits Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <span>Game Benefits for Mental Wellness</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-800">Knowledge Quiz</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Learn about mental wellness practices</p>
                <p>• Reinforce healthy habits knowledge</p>
                <p>• Track learning progress over time</p>
                <p>• Get personalized recommendations</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-secondary-500" />
                <h3 className="font-semibold text-gray-800">Memory Game</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Improve cognitive function</p>
                <p>• Enhance concentration and focus</p>
                <p>• Strengthen working memory</p>
                <p>• Reduce cognitive decline risk</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-800">Breathing Exercise</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Reduce stress and anxiety</p>
                <p>• Lower heart rate and blood pressure</p>
                <p>• Improve emotional regulation</p>
                <p>• Activate relaxation response</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
