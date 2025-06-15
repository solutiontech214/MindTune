
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DiaryEntryForm } from "./diary-entry-form"
import { getDiaryEntries, deleteDiaryEntryAction, type DiaryEntry } from "@/app/actions/diary"
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar,
  Heart,
  Smile,
  Frown,
  Angry,
  Meh,
  Sun,
  CloudRain,
  Brain
} from "lucide-react"
import { format } from "date-fns"

const emotionIcons = {
  Joy: { icon: Smile, color: "text-yellow-500" },
  Sadness: { icon: Frown, color: "text-blue-500" },
  Anger: { icon: Angry, color: "text-red-500" },
  Anxiety: { icon: CloudRain, color: "text-gray-500" },
  Love: { icon: Heart, color: "text-pink-500" },
  Peace: { icon: Sun, color: "text-green-500" },
  Confusion: { icon: Brain, color: "text-purple-500" },
  Neutral: { icon: Meh, color: "text-gray-400" },
}

export function DiaryEntriesList() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const fetchedEntries = await getDiaryEntries()
      setEntries(fetchedEntries)
      setFilteredEntries(fetchedEntries)
    } catch (error) {
      console.error("Error loading diary entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    const filtered = entries.filter(entry =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.emotion.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredEntries(filtered)
  }, [searchQuery, entries])

  const handleDelete = async (entryId: number) => {
    try {
      await deleteDiaryEntryAction(entryId)
      await loadEntries()
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const getMoodColor = (rating: number) => {
    if (rating >= 8) return "bg-green-100 text-green-800"
    if (rating >= 6) return "bg-yellow-100 text-yellow-800"
    if (rating >= 4) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Loading your diary entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No entries found" : "No diary entries yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery 
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start expressing your thoughts and emotions by creating your first diary entry."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => {
            const emotionConfig = emotionIcons[entry.emotion as keyof typeof emotionIcons] || emotionIcons.Neutral
            const EmotionIcon = emotionConfig.icon

            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{entry.title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                        <div className="flex items-center gap-1">
                          <EmotionIcon className={`w-4 h-4 ${emotionConfig.color}`} />
                          {entry.emotion}
                        </div>
                        <Badge className={getMoodColor(entry.mood_rating)}>
                          Mood: {entry.mood_rating}/10
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Entry</DialogTitle>
                          </DialogHeader>
                          <DiaryEntryForm
                            entry={editingEntry}
                            onSuccess={() => {
                              setEditingEntry(null)
                              loadEntries()
                            }}
                          />
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this diary entry? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(entry.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-3">
                    {entry.content.length > 200 
                      ? `${entry.content.substring(0, 200)}...` 
                      : entry.content
                    }
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto mt-2"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        Read more
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <EmotionIcon className={`w-5 h-5 ${emotionConfig.color}`} />
                          {entry.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                          </div>
                          <Badge className={getMoodColor(entry.mood_rating)}>
                            Mood: {entry.mood_rating}/10
                          </Badge>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{entry.content}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
