
"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { createDiaryEntryAction, updateDiaryEntryAction, type DiaryFormState, type DiaryEntry } from "@/app/actions/diary"
import { Heart, Brain, Smile, Frown, Angry, Meh, Sun, CloudRain } from "lucide-react"

interface DiaryEntryFormProps {
  entry?: DiaryEntry
  onSuccess?: () => void
}

const emotions = [
  { value: "Joy", label: "Joy", icon: Smile, color: "text-yellow-500" },
  { value: "Sadness", label: "Sadness", icon: Frown, color: "text-blue-500" },
  { value: "Anger", label: "Anger", icon: Angry, color: "text-red-500" },
  { value: "Anxiety", label: "Anxiety", icon: CloudRain, color: "text-gray-500" },
  { value: "Love", label: "Love", icon: Heart, color: "text-pink-500" },
  { value: "Peace", label: "Peace", icon: Sun, color: "text-green-500" },
  { value: "Confusion", label: "Confusion", icon: Brain, color: "text-purple-500" },
  { value: "Neutral", label: "Neutral", icon: Meh, color: "text-gray-400" },
]

export function DiaryEntryForm({ entry, onSuccess }: DiaryEntryFormProps) {
  const [selectedEmotion, setSelectedEmotion] = useState(entry?.emotion || "")
  const [moodRating, setMoodRating] = useState([entry?.mood_rating || 7])
  const [isPrivate, setIsPrivate] = useState(entry?.is_private ?? true)

  const action = entry 
    ? updateDiaryEntryAction.bind(null, entry.id)
    : createDiaryEntryAction

  const [state, formAction] = useFormState<DiaryFormState, FormData>(action, {})

  const handleSubmit = async (formData: FormData) => {
    formData.set("emotion", selectedEmotion)
    formData.set("mood_rating", moodRating[0].toString())
    formData.set("is_private", isPrivate ? "on" : "off")
    
    const result = await formAction(formData)
    if (result.success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          {entry ? "Edit Diary Entry" : "New Diary Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Give your entry a title..."
              defaultValue={entry?.title || ""}
              className="w-full"
            />
            {state.errors?.title && (
              <p className="text-sm text-red-600">{state.errors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Thoughts & Feelings</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Express yourself freely... This is your private space."
              defaultValue={entry?.content || ""}
              rows={8}
              className="w-full resize-none"
            />
            {state.errors?.content && (
              <p className="text-sm text-red-600">{state.errors.content[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>How are you feeling?</Label>
            <div className="grid grid-cols-4 gap-2">
              {emotions.map((emotion) => {
                const Icon = emotion.icon
                return (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedEmotion === emotion.value
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto ${emotion.color}`} />
                    <span className="text-xs mt-1 block">{emotion.label}</span>
                  </button>
                )
              })}
            </div>
            {state.errors?.emotion && (
              <p className="text-sm text-red-600">{state.errors.emotion[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mood Rating: {moodRating[0]}/10</Label>
            <Slider
              value={moodRating}
              onValueChange={setMoodRating}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="is_private" className="text-sm">
              Keep this entry private (recommended)
            </Label>
          </div>

          {state.errors?._form && (
            <div className="text-red-600 text-sm">{state.errors._form[0]}</div>
          )}

          {state.success && (
            <div className="text-green-600 text-sm">{state.message}</div>
          )}

          <Button type="submit" className="w-full">
            {entry ? "Update Entry" : "Save Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
