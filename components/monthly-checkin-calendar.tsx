"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Target, Activity } from "lucide-react"
import { getMonthlyCheckinsAction, getMonthlyStatsAction, getCheckinStreakAction } from "@/app/actions/checkins"
import type { DailyCheckin } from "@/lib/checkins"

interface MonthlyStats {
  totalCheckins: number
  averageMood: number
  averageStress: number
  averageEnergy: number
  averageSleep: number
  averageAnxiety: number
  totalGoalsAchieved: number
  mostCommonActivities: { activity: string; count: number }[]
}

export function MonthlyCheckinCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [checkins, setCheckins] = useState<DailyCheckin[]>([])
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  // Load monthly data
  useEffect(() => {
    const loadMonthlyData = async () => {
      setIsLoading(true)
      try {
        const [monthlyCheckins, monthlyStats, checkinStreak] = await Promise.all([
          getMonthlyCheckinsAction(year, month),
          getMonthlyStatsAction(year, month),
          getCheckinStreakAction(),
        ])

        setCheckins(monthlyCheckins)
        setStats(monthlyStats)
        setStreak(checkinStreak)
      } catch (error) {
        console.error("Error loading monthly data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMonthlyData()
  }, [year, month])

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const getCheckinForDate = (day: number) => {
    const dateString = new Date(year, month - 1, day).toISOString().split("T")[0]
    return checkins.find((c) => c.checkin_date === dateString)
  }

  const getMoodColor = (moodRating: number) => {
    if (moodRating >= 8) return "bg-green-100 border-green-300 text-green-800"
    if (moodRating >= 6) return "bg-yellow-100 border-yellow-300 text-yellow-800"
    if (moodRating >= 4) return "bg-orange-100 border-orange-300 text-orange-800"
    return "bg-red-100 border-red-300 text-red-800"
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const checkin = getCheckinForDate(day)
      const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString()

      days.push(
        <div
          key={day}
          className={`h-16 border border-gray-200 p-1 relative ${isToday ? "ring-2 ring-primary-500" : ""}`}
        >
          <div className="text-sm font-medium text-gray-700">{day}</div>
          {checkin && (
            <div
              className={`absolute bottom-1 left-1 right-1 h-2 rounded-full ${
                getMoodColor(checkin.mood_rating).split(" ")[0]
              }`}
              title={`Mood: ${checkin.mood_rating}/10`}
            ></div>
          )}
          {checkin && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading calendar...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check-ins</p>
                <p className="text-2xl font-bold text-primary-600">{stats?.totalCheckins || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Mood</p>
                <p className="text-2xl font-bold text-green-600">{stats?.averageMood || 0}/10</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Goals</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.totalGoalsAchieved || 0}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-secondary-500">{streak} days</p>
              </div>
              <Activity className="w-8 h-8 text-secondary-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span>Monthly Check-in Calendar</span>
              </CardTitle>
              <CardDescription>
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-4 border-t">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>Check-in completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                <span>Good mood (8-10)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
                <span>Okay mood (6-7)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                <span>Low mood (1-5)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Activities */}
      {stats && stats.mostCommonActivities.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Most Common Activities</CardTitle>
            <CardDescription>Your top activities this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.mostCommonActivities.map(({ activity, count }) => (
                <Badge key={activity} variant="secondary" className="text-sm">
                  {activity} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
