
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Trophy, Timer, RotateCcw, Star } from "lucide-react"

interface MemoryCard {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

interface GameStats {
  moves: number
  matches: number
  timeElapsed: number
  score: number
}

const cardSymbols = ["🧘", "🌸", "🌊", "🌱", "☀️", "🦋", "🍃", "💚"]

export function MemoryGame() {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [gameStats, setGameStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    score: 0
  })
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (gameStarted && !gameCompleted && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        setGameStats(prev => ({ ...prev, timeElapsed: elapsed }))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStarted, gameCompleted, startTime])

  const initializeGame = () => {
    const gameCards: MemoryCard[] = []
    const shuffledSymbols = [...cardSymbols, ...cardSymbols]
      .sort(() => Math.random() - 0.5)

    shuffledSymbols.forEach((symbol, index) => {
      gameCards.push({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      })
    })

    setCards(gameCards)
    setFlippedCards([])
    setGameStats({ moves: 0, matches: 0, timeElapsed: 0, score: 0 })
    setGameStarted(false)
    setGameCompleted(false)
    setStartTime(null)
  }

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true)
      setStartTime(new Date())
    }

    const card = cards[cardId]
    
    // Don't allow clicking on already flipped or matched cards
    if (card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return
    }

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // Flip the card
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }))
      
      const [firstCardId, secondCardId] = newFlippedCards
      const firstCard = cards[firstCardId]
      const secondCard = cards[secondCardId]

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isMatched: true }
              : c
          ))
          setGameStats(prev => ({ ...prev, matches: prev.matches + 1 }))
          setFlippedCards([])
          
          // Check if game is completed
          if (gameStats.matches + 1 === cardSymbols.length) {
            completeGame()
          }
        }, 1000)
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstCardId || c.id === secondCardId 
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const completeGame = () => {
    setGameCompleted(true)
    
    // Calculate score based on moves and time
    const baseScore = 1000
    const timeBonus = Math.max(0, 120 - gameStats.timeElapsed) * 5 // Bonus for completing under 2 minutes
    const movesPenalty = Math.max(0, gameStats.moves - cardSymbols.length) * 10
    const finalScore = Math.max(0, baseScore + timeBonus - movesPenalty)
    
    setGameStats(prev => ({ ...prev, score: finalScore }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceRating = () => {
    if (gameStats.score >= 800) return { rating: "Excellent", color: "text-green-600", stars: 3 }
    if (gameStats.score >= 600) return { rating: "Good", color: "text-blue-600", stars: 2 }
    return { rating: "Keep Practicing", color: "text-orange-600", stars: 1 }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary-600" />
            <span>Memory Match Game</span>
          </div>
          {gameCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <Trophy className="w-4 h-4 mr-1" />
              Completed!
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Match pairs of wellness symbols to improve cognitive function and focus
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <div className="text-xl font-bold text-primary-600">{gameStats.moves}</div>
            <p className="text-sm text-gray-600">Moves</p>
          </div>
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <div className="text-xl font-bold text-secondary-500">
              <Timer className="w-4 h-4 inline mr-1" />
              {formatTime(gameStats.timeElapsed)}
            </div>
            <p className="text-sm text-gray-600">Time</p>
          </div>
          <div className="text-center p-3 bg-accent-50 rounded-lg">
            <div className="text-xl font-bold text-primary-500">
              {gameStats.matches}/{cardSymbols.length}
            </div>
            <p className="text-sm text-gray-600">Matches</p>
          </div>
        </div>

        {/* Game Completion Results */}
        {gameCompleted && (
          <div className="text-center p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
            <div className="text-3xl font-bold text-primary-600 mb-2">{gameStats.score} points</div>
            
            {(() => {
              const performance = getPerformanceRating()
              return (
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <span className={`font-semibold ${performance.color}`}>{performance.rating}</span>
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < performance.stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              )
            })()}
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>Memory games help improve cognitive function and concentration.</p>
              <p>Regular practice can enhance your focus and mental clarity.</p>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={gameCompleted}
              className={`
                aspect-square rounded-lg border-2 text-2xl font-bold transition-all duration-300 
                ${card.isFlipped || card.isMatched 
                  ? 'bg-primary-100 border-primary-300 text-primary-700' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }
                ${card.isMatched ? 'ring-2 ring-green-400' : ''}
                disabled:cursor-not-allowed
              `}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center">
          <Button
            onClick={initializeGame}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Game</span>
          </Button>
        </div>

        {/* Game Instructions */}
        {!gameStarted && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How to Play:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Click cards to flip them and reveal wellness symbols</p>
              <p>• Find matching pairs of symbols</p>
              <p>• Complete the game in fewer moves for a higher score</p>
              <p>• Regular memory games can improve cognitive function</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
