"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Target, Calendar, Dumbbell, CheckSquare } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, Box, Sphere } from "@react-three/drei"
import { useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"

function AnimatedDumbbell() {
  const meshRef = useRef<any>()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Dumbbell handle */}
      <Box args={[2, 0.2, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4a5568" />
      </Box>
      {/* Left weight */}
      <Box args={[0.3, 0.8, 0.8]} position={[-1.2, 0, 0]}>
        <meshStandardMaterial color="#2d3748" />
      </Box>
      {/* Right weight */}
      <Box args={[0.3, 0.8, 0.8]} position={[1.2, 0, 0]}>
        <meshStandardMaterial color="#2d3748" />
      </Box>
      {/* Floating text */}
      <Text position={[0, 1.5, 0]} fontSize={0.3} color="#8b5cf6" anchorX="center" anchorY="middle">
        Keep Lifting! 💪
      </Text>
    </group>
  )
}

function ProgressSphere({ progress }: { progress: number }) {
  const meshRef = useRef<any>()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  const sphereColor = progress > 75 ? "#10b981" : progress > 50 ? "#f59e0b" : "#ef4444"

  return (
    <Sphere ref={meshRef} args={[0.8]} position={[2, 0, 0]}>
      <meshStandardMaterial color={sphereColor} />
    </Sphere>
  )
}

interface ProgressDashboardProps {
  userData: any
}

export function ProgressDashboard({ userData }: ProgressDashboardProps) {
  const getWeeklyStats = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weeklyWorkouts = userData.workouts?.filter((w: any) => new Date(w.date) >= weekAgo) || []

    const weeklyTodos = userData.todos?.filter((t: any) => new Date(t.createdAt) >= weekAgo) || []

    const completedTodos = userData.todos?.filter((t: any) => t.completed) || []

    return {
      workoutsThisWeek: weeklyWorkouts.length,
      todosThisWeek: weeklyTodos.length,
      completedTodos: completedTodos.length,
      totalTodos: userData.todos?.length || 0,
      totalWorkouts: userData.workouts?.length || 0,
      fitnessGoal: userData.fitnessGoal || "maintenance",
    }
  }

  const stats = getWeeklyStats()
  const completionRate = stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0
  const workoutProgress = Math.min(100, (stats.workoutsThisWeek / 4) * 100) // Target: 4 workouts per week

  const getMotivationalMessage = () => {
    if (stats.workoutsThisWeek >= 4 && completionRate >= 80) {
      return "🔥 You're absolutely crushing it! Keep up the amazing work!"
    } else if (stats.workoutsThisWeek >= 3 || completionRate >= 60) {
      return "💪 Great progress! You're building strong habits!"
    } else if (stats.workoutsThisWeek >= 1 || completionRate >= 30) {
      return "🌟 Good start! Every step counts towards your goals!"
    } else {
      return "🚀 Ready to start your fitness journey? Let's make today count!"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Progress Dashboard</h2>
      </div>

      {/* Motivational Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Welcome back! 👋</h3>
              <p className="text-purple-100">{getMotivationalMessage()}</p>
            </div>
            <div className="text-4xl">💪</div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.workoutsThisWeek}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-sm text-muted-foreground">Tasks Done</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
            <p className="text-sm text-muted-foreground">Total Workouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <Badge className="capitalize">{stats.fitnessGoal}</Badge>
            <p className="text-sm text-muted-foreground mt-1">Current Goal</p>
          </CardContent>
        </Card>
      </div>

      {/* 3D Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
            Interactive Progress Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <Canvas camera={{ position: [0, 0, 8] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <AnimatedDumbbell />
              <ProgressSphere progress={workoutProgress} />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Workout Goal</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${workoutProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.workoutsThisWeek}/4 workouts</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Task Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedTodos}/{stats.totalTodos} completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.workoutsThisWeek < 4 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Dumbbell className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Schedule a workout session</span>
                </div>
              )}
              {stats.totalTodos > stats.completedTodos && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Complete pending tasks</span>
                </div>
              )}
              {userData.medicines?.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Don't forget your medicine</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Workouts completed:</span>
                <span className="font-medium">{stats.workoutsThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks completed:</span>
                <span className="font-medium">{stats.completedTodos}</span>
              </div>
              <div className="flex justify-between">
                <span>Current goal:</span>
                <Badge className="capitalize">{stats.fitnessGoal}</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {stats.workoutsThisWeek >= 3 ? "Great consistency! " : "Try to be more consistent. "}
                  Keep pushing towards your goals! 🎯
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
