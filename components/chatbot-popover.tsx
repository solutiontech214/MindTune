
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bot, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const predefinedResponses: { [key: string]: string } = {
  "hello": "Hello! I'm your wellness assistant. I can help you with stress management, mood tracking, and wellness tips. How can I assist you today?",
  "hi": "Hi there! I'm here to help with your wellness journey. What would you like to know?",
  "stress": "I understand you're dealing with stress. Here are some quick tips: 1) Take deep breaths for 2 minutes, 2) Try the 5-4-3-2-1 grounding technique, 3) Consider a short meditation session. Would you like me to guide you through any of these?",
  "meditation": "Meditation is great for mental wellness! Start with just 5 minutes daily. Focus on your breath, let thoughts pass without judgment. You can also check out our guided meditation tools in the dashboard.",
  "mood": "Your mood tracking helps identify patterns. I see you've been monitoring your mood - that's excellent! Regular check-ins help you understand what affects your emotional state. Keep it up!",
  "anxiety": "Anxiety is manageable with the right tools. Try: 1) Box breathing (4-4-4-4 pattern), 2) Progressive muscle relaxation, 3) Mindfulness exercises. Your dashboard shows real-time anxiety tracking - use this data to identify triggers.",
  "sleep": "Good sleep is crucial for mental health. Aim for 7-9 hours, maintain a regular schedule, and create a relaxing bedtime routine. Your sleep quality tracking can help identify what works best for you.",
  "help": "I can assist with: stress management techniques, meditation guidance, mood tracking insights, anxiety coping strategies, sleep tips, and general wellness advice. What specific area would you like help with?",
  "default": "I'm here to help with your wellness journey! You can ask me about stress management, meditation, mood tracking, anxiety, sleep, or any other wellness topics. What would you like to know?"
}

export function ChatbotPopover() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your wellness assistant. I can help you with stress management, meditation guidance, and wellness tips. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for keywords in the message
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response
      }
    }
    
    return predefinedResponses.default
  }

  const sendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: getBotResponse(inputValue),
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botResponse])
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 h-[500px] p-0 mr-4 mb-4" 
        align="end"
        side="top"
      >
        <Card className="h-full border-0 shadow-none">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary-600 to-primary-500">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Bot className="h-5 w-5" />
              <span>Wellness Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-full flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className="h-4 w-4 mt-0.5 text-primary-600" />
                        )}
                        {message.sender === 'user' && (
                          <User className="h-4 w-4 mt-0.5 text-white" />
                        )}
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about stress, meditation, mood..."
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ask me about stress management, meditation, mood tracking, and wellness tips!
              </p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
