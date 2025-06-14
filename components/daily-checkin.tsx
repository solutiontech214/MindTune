"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Calendar, Heart, Brain, Zap, Moon, AlertTriangle, CheckCircle, Target, Smile, Frown, Meh } from "lucide-react"
import { submitCheckinAction, getTodayCheckinAction, type CheckinFormState } from "@/app/actions/checkins"
import type { DailyCheckin } from "@/lib/checkins"

const activities = [
  { key: "exercise", label: "Exercise", icon: "🏃‍♂️" },
  { key: "meditation", label: "Meditation", icon: "🧘‍♀️" },
  { key: "reading", label: "Reading", icon: "📚" },
  { key: "socializing", label: "Socializing", icon: "👥" },
  { key: "work", label: "Work/Study", icon: "💼" },
  { key: "hobbies", label: "Hobbies", icon: "🎨" },
  { key: "rest", label: "Rest/Relax", icon: "😴" },
  { key: "outdoors", label: "Outdoors", icon: "🌳" },
]

const getRatingColor = (value: number, reverse = false) => {
  if (reverse) {
    // For stress and anxiety - lower is better
    if (value <= 3) return "text-green-600"
    if (value <= 6) return "text-yellow-600"
    return "text-red-600"
  } else {
    // For mood, energy, sleep - higher is better
    if (value >= 8) return "text-green-600"
    if (value >= 5) return "text-yellow-600"
    return "text-red-600"
  }
}

const getRatingIcon = (value: number, reverse = false) => {
  if (reverse) {
    if (value <= 3) return <Smile className="w-4 h-4" />
    if (value <= 6) return <Meh className="w-4 h-4" />
    return <Frown className="w-4 h-4" />
  } else {
    if (value >= 8) return <Smile className="w-4 h-4" />
    if (value >= 5) return <Meh className="w-4 h-4" />
    return <Frown className="w-4 h-4" />
  }
}

export function DailyCheckin() {
  const [state, formAction, isPending] = useActionState<CheckinFormState, FormData>(submitCheckinAction, {})
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [moodRating, setMoodRating] = useState([7])
  const [stressLevel, setStressLevel] = useState([4])
  const [energyLevel, setEnergyLevel] = useState([6])
  const [sleepQuality, setSleepQuality] = useState([7])
  const [anxietyLevel, setAnxietyLevel] = useState([3])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [goalsAchieved, setGoalsAchieved] = useState([1])

  
  useEffect(() => {
    const loadTodayCheckin = async () => {
      try {
        const checkin = await getTodayCheckinAction()
        if (checkin) {
          setTodayCheckin(checkin)
          // Pre-fill form with existing data
          setMoodRating([checkin.mood_rating])
          setStressLevel([checkin.stress_level])
          setEnergyLevel([checkin.energy_level])
          setSleepQuality([checkin.sleep_quality])
          setAnxietyLevel([checkin.anxiety_level])
          setSelectedActivities(checkin.activities)
          setGoalsAchieved([checkin.goals_achieved])
        }
      } catch (error) {
        console.error("Error loading today's check-in:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTodayCheckin()
  }, [])

  // Update today's check-in after successful submission
  useEffect(() => {
    if (state.success) {
      const loadUpdatedCheckin = async () => {
        const checkin = await getTodayCheckinAction()
        setTodayCheckin(checkin)
      }
      loadUpdatedCheckin()
    }
  }, [state.success])

  const handleActivityToggle = (activityKey: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityKey) ? prev.filter((a) => a !== activityKey) : [...prev, activityKey],
    )
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading check-in...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          <span>Daily Check-in</span>
          {todayCheckin && <Badge className="bg-green-100 text-green-800">Completed Today</Badge>}
        </CardTitle>
        <CardDescription>
          {todayCheckin ? "Update your daily wellness check-in" : "Track your daily mood, stress, and activities"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Message */}
        {state.success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {state.errors?._form && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{state.errors._form[0]}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-6">
          {/* Mood Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-secondary-500" />
                <span>Mood Rating</span>
              </Label>
              <div className={`flex items-center space-x-2 ${getRatingColor(moodRating[0])}`}>
                {getRatingIcon(moodRating[0])}
                <span className="text-2xl font-bold">{moodRating[0]}/10</span>
              </div>
            </div>
            <Slider value={moodRating} onValueChange={setMoodRating} max={10} min={1} step={1} className="w-full" />
            <input type="hidden" name="moodRating" value={moodRating[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Stress Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-primary-600" />
                <span>Stress Level</span>
              </Label>
              <div className={`flex items-center space-x-2 ${getRatingColor(stressLevel[0], true)}`}>
                {getRatingIcon(stressLevel[0], true)}
                <span className="text-2xl font-bold">{stressLevel[0]}/10</span>
              </div>
            </div>
            <Slider value={stressLevel} onValueChange={setStressLevel} max={10} min={1} step={1} className="w-full" />
            <input type="hidden" name="stressLevel" value={stressLevel[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Energy Level</span>
              </Label>
              <div className={`flex items-center space-x-2 ${getRatingColor(energyLevel[0])}`}>
                {getRatingIcon(energyLevel[0])}
                <span className="text-2xl font-bold">{energyLevel[0]}/10</span>
              </div>
            </div>
            <Slider value={energyLevel} onValueChange={setEnergyLevel} max={10} min={1} step={1} className="w-full" />
            <input type="hidden" name="energyLevel" value={energyLevel[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Exhausted</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Sleep Quality</span>
              </Label>
              <div className={`flex items-center space-x-2 ${getRatingColor(sleepQuality[0])}`}>
                {getRatingIcon(sleepQuality[0])}
                <span className="text-2xl font-bold">{sleepQuality[0]}/10</span>
              </div>
            </div>
            <Slider value={sleepQuality} onValueChange={setSleepQuality} max={10} min={1} step={1} className="w-full" />
            <input type="hidden" name="sleepQuality" value={sleepQuality[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Anxiety Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Anxiety Level</span>
              </Label>
              <div className={`flex items-center space-x-2 ${getRatingColor(anxietyLevel[0], true)}`}>
                {getRatingIcon(anxietyLevel[0], true)}
                <span className="text-2xl font-bold">{anxietyLevel[0]}/10</span>
              </div>
            </div>
            <Slider value={anxietyLevel} onValueChange={setAnxietyLevel} max={10} min={1} step={1} className="w-full" />
            <input type="hidden" name="anxietyLevel" value={anxietyLevel[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-3">
            <Label>Today's Activities</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activities.map((activity) => (
                <div key={activity.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={activity.key}
                    name={activity.key}
                    checked={selectedActivities.includes(activity.key)}
                    onCheckedChange={() => handleActivityToggle(activity.key)}
                  />
                  <Label htmlFor={activity.key} className="text-sm cursor-pointer">
                    <span className="mr-1">{activity.icon}</span>
                    {activity.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Achieved */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <span>Goals Achieved Today</span>
              </Label>
              <span className="text-2xl font-bold text-green-600">{goalsAchieved[0]}</span>
            </div>
            <Slider
              value={goalsAchieved}
              onValueChange={setGoalsAchieved}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <input type="hidden" name="goalsAchieved" value={goalsAchieved[0]} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>None</span>
              <span>All Goals</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Daily Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="How was your day? Any thoughts or reflections..."
              className="min-h-[80px]"
              defaultValue={todayCheckin?.notes || ""}
            />
          </div>

          {/* Gratitude Notes */}
          <div className="space-y-2">
            <Label htmlFor="gratitudeNotes">Gratitude Notes (Optional)</Label>
            <Textarea
              id="gratitudeNotes"
              name="gratitudeNotes"
              placeholder="What are you grateful for today?"
              className="min-h-[60px]"
              defaultValue={todayCheckin?.gratitude_notes || ""}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700" disabled={isPending}>
            {isPending ? "Saving..." : todayCheckin ? "Update Check-in" : "Save Check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
