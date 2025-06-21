"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Plus, Trash2, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Exercise {
  name: string
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  date: string
  muscleGroup: string
  exercises: Exercise[]
  duration: number
  notes: string
}

type GymTrackerProps = {}

const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body"]

export function GymTracker({}: GymTrackerProps) {
  const [isLogging, setIsLogging] = useState(false)
  const [currentWorkout, setCurrentWorkout] = useState<Partial<Workout>>({
    muscleGroup: "Chest",
    exercises: [],
    duration: 0,
    notes: "",
  })
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    sets: 1,
    reps: 10,
    weight: 0,
  })

  // Replace the existing component logic with API calls
  const [workouts, setWorkouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const response = await fetch("/api/workouts")
      if (response.ok) {
        const data = await response.json()
        setWorkouts(data)
      }
    } catch (error) {
      console.error("Failed to fetch workouts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setCurrentWorkout((prev) => ({
        ...prev,
        exercises: [...(prev.exercises || []), newExercise],
      }))
      setNewExercise({ name: "", sets: 1, reps: 10, weight: 0 })
    }
  }

  const removeExercise = (index: number) => {
    setCurrentWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises?.filter((_, i) => i !== index) || [],
    }))
  }

  // Update the saveWorkout function to use API
  const saveWorkout = async () => {
    if (currentWorkout.exercises && currentWorkout.exercises.length > 0) {
      try {
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            muscle_group: currentWorkout.muscleGroup,
            duration: currentWorkout.duration,
            notes: currentWorkout.notes,
            exercises: currentWorkout.exercises,
          }),
        })

        if (response.ok) {
          const newWorkout = await response.json()
          setWorkouts([newWorkout, ...workouts])
          setCurrentWorkout({ muscleGroup: "Chest", exercises: [], duration: 0, notes: "" })
          setIsLogging(false)
        }
      } catch (error) {
        console.error("Failed to save workout:", error)
      }
    }
  }

  const getRecentWorkouts = () => {
    return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
  }

  const getWorkoutStats = () => {
    const totalWorkouts = workouts.length
    const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0)
    const avgDuration =
      workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0

    return { totalWorkouts, totalExercises, avgDuration }
  }

  const stats = getWorkoutStats()

  if (isLogging) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">Log Workout</h2>
          </div>
          <Button variant="outline" onClick={() => setIsLogging(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Muscle Group</label>
                <select
                  value={currentWorkout.muscleGroup}
                  onChange={(e) => setCurrentWorkout((prev) => ({ ...prev, muscleGroup: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  {muscleGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  value={currentWorkout.duration}
                  onChange={(e) =>
                    setCurrentWorkout((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 0 }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="How did the workout feel?"
                value={currentWorkout.notes}
                onChange={(e) => setCurrentWorkout((prev) => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <Input
                placeholder="Exercise name"
                value={newExercise.name}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Sets"
                value={newExercise.sets}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, sets: Number.parseInt(e.target.value) || 1 }))}
              />
              <Input
                type="number"
                placeholder="Reps"
                value={newExercise.reps}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, reps: Number.parseInt(e.target.value) || 1 }))}
              />
              <Input
                type="number"
                placeholder="Weight (lbs)"
                value={newExercise.weight}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, weight: Number.parseInt(e.target.value) || 0 }))}
              />
            </div>
            <Button onClick={addExercise} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        {currentWorkout.exercises && currentWorkout.exercises.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} lbs
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(index)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={saveWorkout} className="w-full mt-4">
                Save Workout
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Gym Tracker</h2>
        </div>
        <Button onClick={() => setIsLogging(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
            <p className="text-sm text-muted-foreground">Total Workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalExercises}</p>
            <p className="text-sm text-muted-foreground">Total Exercises</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">
              {stats.avgDuration}
            </div>
            <p className="text-2xl font-bold">{stats.avgDuration}</p>
            <p className="text-sm text-muted-foreground">Avg Duration (min)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Workouts</TabsTrigger>
          <TabsTrigger value="all">All Workouts</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {getRecentWorkouts().length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No workouts logged yet. Start your first workout!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            getRecentWorkouts().map((workout) => (
              <Card key={workout.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{workout.muscleGroup}</Badge>
                    <span className="text-sm text-muted-foreground">{new Date(workout.date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    {workout.exercises.map((exercise, index) => (
                      <p key={index} className="text-sm">
                        <span className="font-medium">{exercise.name}</span> -{exercise.sets}×{exercise.reps} @{" "}
                        {exercise.weight}lbs
                      </p>
                    ))}
                  </div>
                  {workout.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{workout.notes}"</p>}
                  <p className="text-xs text-muted-foreground mt-2">Duration: {workout.duration} minutes</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No workouts logged yet. Start your fitness journey!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            workouts
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((workout) => (
                <Card key={workout.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{workout.muscleGroup}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {workout.exercises.map((exercise, index) => (
                        <p key={index} className="text-sm">
                          <span className="font-medium">{exercise.name}</span> -{exercise.sets}×{exercise.reps} @{" "}
                          {exercise.weight}lbs
                        </p>
                      ))}
                    </div>
                    {workout.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{workout.notes}"</p>}
                    <p className="text-xs text-muted-foreground mt-2">Duration: {workout.duration} minutes</p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
