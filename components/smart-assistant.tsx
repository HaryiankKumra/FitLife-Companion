"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, TrendingUp, Calendar, Loader2 } from "lucide-react"

export function SmartAssistant() {
  const [suggestion, setSuggestion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    generateSuggestion()
  }, [])

  const generateSuggestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/workout-suggestion")
      if (response.ok) {
        const data = await response.json()
        setSuggestion(data)
      }
    } catch (error) {
      console.error("Failed to get workout suggestion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const acceptSuggestion = async () => {
    if (!suggestion) return

    setIsAccepting(true)
    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          muscle_group: suggestion.muscleGroup,
          duration: 60,
          notes: "AI Suggested Workout",
          exercises: suggestion.exercises,
        }),
      })

      if (response.ok) {
        // Show success message or refresh data
        alert("Workout added to your log! 🎉")
        generateSuggestion() // Get a new suggestion
      }
    } catch (error) {
      console.error("Failed to accept suggestion:", error)
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Smart Assistant</h2>
        <Sparkles className="h-5 w-5 text-yellow-500" />
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            AI-Powered Workout Suggestion
            <Button variant="outline" size="sm" onClick={generateSuggestion} disabled={isLoading} className="ml-auto">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">AI is analyzing your workout history...</p>
              </div>
            </div>
          ) : suggestion ? (
            <>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">{suggestion.muscleGroup}</Badge>
                <span className="text-sm text-muted-foreground">AI Recommended</span>
              </div>

              <p className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg">🧠 {suggestion.reasoning}</p>

              <div className="space-y-2">
                <h4 className="font-medium">Suggested Exercises:</h4>
                {suggestion.exercises?.map((exercise: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="font-medium">{exercise.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {exercise.sets}×{exercise.reps} {exercise.weight > 0 && `@ ${exercise.weight}lbs`}
                    </span>
                  </div>
                ))}
              </div>

              {suggestion.tips && (
                <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  💡 <strong>Tips:</strong> {suggestion.tips}
                </p>
              )}

              <Button onClick={acceptSuggestion} className="w-full" disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding to Workouts...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Accept & Add to My Workouts
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Unable to generate suggestion. Please try again.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                1
              </div>
              <p>AI analyzes your recent workout history and patterns</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                2
              </div>
              <p>Identifies muscle groups that need attention for balanced development</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                3
              </div>
              <p>Generates personalized exercise recommendations with optimal sets, reps, and weights</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                4
              </div>
              <p>Considers your fitness goals and provides form tips for safe training</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
