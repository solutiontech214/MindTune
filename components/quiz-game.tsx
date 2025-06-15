
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Trophy, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: "stress" | "mindfulness" | "wellness" | "mental-health"
}

interface QuizResult {
  score: number
  totalQuestions: number
  timeTaken: number
  category: string
  recommendations: string[]
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the recommended duration for a beginner's meditation session?",
    options: ["1-2 minutes", "5-10 minutes", "20-30 minutes", "45-60 minutes"],
    correctAnswer: 1,
    explanation: "For beginners, 5-10 minutes is ideal to build a consistent habit without overwhelming yourself.",
    category: "mindfulness"
  },
  {
    id: 2,
    question: "Which breathing technique is most effective for immediate stress relief?",
    options: ["Rapid breathing", "4-7-8 breathing", "Holding breath", "Shallow breathing"],
    correctAnswer: 1,
    explanation: "The 4-7-8 breathing technique (inhale 4, hold 7, exhale 8) activates the parasympathetic nervous system.",
    category: "stress"
  },
  {
    id: 3,
    question: "How many hours of sleep do adults typically need for optimal mental health?",
    options: ["4-5 hours", "6-7 hours", "7-9 hours", "10-12 hours"],
    correctAnswer: 2,
    explanation: "Adults need 7-9 hours of quality sleep for optimal cognitive function and emotional regulation.",
    category: "wellness"
  },
  {
    id: 4,
    question: "What is a common symptom of chronic stress?",
    options: ["Improved memory", "Better sleep quality", "Muscle tension", "Increased energy"],
    correctAnswer: 2,
    explanation: "Chronic stress often manifests as persistent muscle tension, especially in the neck, shoulders, and jaw.",
    category: "stress"
  },
  {
    id: 5,
    question: "Which activity is proven to boost mood naturally?",
    options: ["Watching TV", "Physical exercise", "Eating sugar", "Staying indoors"],
    correctAnswer: 1,
    explanation: "Physical exercise releases endorphins, which are natural mood elevators and stress reducers.",
    category: "mental-health"
  },
  {
    id: 6,
    question: "What is mindfulness primarily focused on?",
    options: ["Past experiences", "Future planning", "Present moment awareness", "Problem solving"],
    correctAnswer: 2,
    explanation: "Mindfulness is the practice of maintaining awareness of the present moment without judgment.",
    category: "mindfulness"
  },
  {
    id: 7,
    question: "Which of these is a healthy coping mechanism for anxiety?",
    options: ["Avoiding all stressful situations", "Deep breathing exercises", "Excessive caffeine", "Social isolation"],
    correctAnswer: 1,
    explanation: "Deep breathing exercises help activate the body's relaxation response and reduce anxiety symptoms.",
    category: "mental-health"
  },
  {
    id: 8,
    question: "How often should you practice gratitude for mental wellness benefits?",
    options: ["Once a month", "Once a week", "Daily", "Only when feeling good"],
    correctAnswer: 2,
    explanation: "Daily gratitude practice has been shown to significantly improve mood and overall life satisfaction.",
    category: "wellness"
  }
]

export function QuizGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    if (!quizStartTime) {
      setQuizStartTime(new Date())
    }
  }, [quizStartTime])

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowExplanation(false)
    } else {
      finishQuiz()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowExplanation(false)
    }
  }

  const finishQuiz = () => {
    if (!quizStartTime) return

    const correctAnswers = selectedAnswers.filter((answer, index) => 
      answer === quizQuestions[index].correctAnswer
    ).length

    const timeTaken = Math.round((new Date().getTime() - quizStartTime.getTime()) / 1000)
    const score = Math.round((correctAnswers / quizQuestions.length) * 100)

    let recommendations: string[] = []
    if (score >= 80) {
      recommendations = [
        "Excellent knowledge! You're well-informed about mental wellness.",
        "Consider sharing your knowledge with others who might benefit.",
        "Keep up your healthy mental wellness practices."
      ]
    } else if (score >= 60) {
      recommendations = [
        "Good foundation! Consider exploring mindfulness techniques further.",
        "Try incorporating daily meditation into your routine.",
        "Learn more about stress management strategies."
      ]
    } else {
      recommendations = [
        "Great start! Mental wellness is a journey of continuous learning.",
        "Consider taking our stress assessment for personalized insights.",
        "Explore our guided meditation and breathing exercises."
      ]
    }

    setQuizResult({
      score,
      totalQuestions: quizQuestions.length,
      timeTaken,
      category: "Mental Wellness",
      recommendations
    })
    setShowResult(true)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResult(false)
    setQuizStartTime(new Date())
    setQuizResult(null)
    setShowExplanation(false)
  }

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation)
  }

  if (showResult && quizResult) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Quiz Complete!</span>
          </CardTitle>
          <CardDescription>Mental Wellness Knowledge Quiz Results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {quizResult.score}%
            </div>
            <p className="text-gray-600">
              {quizResult.score >= 80 ? "Excellent!" : quizResult.score >= 60 ? "Good job!" : "Keep learning!"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {selectedAnswers.filter((answer, index) => 
                  answer === quizQuestions[index].correctAnswer
                ).length}
              </div>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-secondary-50 rounded-lg">
              <div className="text-2xl font-bold text-secondary-500">
                {Math.floor(quizResult.timeTaken / 60)}:{(quizResult.timeTaken % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-600">Time Taken</p>
            </div>
            <div className="text-center p-4 bg-accent-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-500">
                {quizResult.totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Total Questions</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Personalized Recommendations:</h3>
            {quizResult.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-gray-600">{rec}</p>
              </div>
            ))}
          </div>

          <Button 
            onClick={resetQuiz} 
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <span>Mental Wellness Quiz</span>
          </div>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {quizQuestions.length}
          </Badge>
        </CardTitle>
        <CardDescription>Test your knowledge about mental wellness and mindfulness</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Badge className="mb-4 bg-primary-100 text-primary-800">
            {currentQuestion.category.replace('-', ' ').toUpperCase()}
          </Badge>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
              className="w-full text-left justify-start h-auto p-4"
              onClick={() => handleAnswerSelect(index)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestionIndex] === index 
                    ? 'bg-primary-600 border-primary-600' 
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            </Button>
          ))}
        </div>

        {selectedAnswers[currentQuestionIndex] !== undefined && (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={toggleExplanation}
              className="w-full"
            >
              {showExplanation ? "Hide" : "Show"} Explanation
            </Button>
            
            {showExplanation && (
              <div className={`p-4 rounded-lg ${
                selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              } border`}>
                <div className="flex items-center space-x-2 mb-2">
                  {selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer 
                      ? "Correct!" 
                      : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
                {selectedAnswers[currentQuestionIndex] !== currentQuestion.correctAnswer && (
                  <p className="text-sm text-green-700 mt-2">
                    Correct answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
