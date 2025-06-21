"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { TodoSection } from "@/components/todo-section"
import { GymTracker } from "@/components/gym-tracker"
import { SmartAssistant } from "@/components/smart-assistant"
import { MealPlanner } from "@/components/meal-planner"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { MedicineReminder } from "@/components/medicine-reminder"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function FitnessApp() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [activeSection, setActiveSection] = useState("dashboard")

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setActiveSection("dashboard")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <ProgressDashboard user={user} />
      case "todos":
        return <TodoSection />
      case "gym":
        return <GymTracker />
      case "assistant":
        return <SmartAssistant />
      case "meals":
        return <MealPlanner user={user} />
      case "medicine":
        return <MedicineReminder />
      default:
        return <ProgressDashboard user={user} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FitLife...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="w-full max-w-md px-4">
          {authMode === "login" ? (
            <LoginForm onSuccess={handleAuthSuccess} onToggleMode={() => setAuthMode("register")} />
          ) : (
            <RegisterForm onSuccess={handleAuthSuccess} onToggleMode={() => setAuthMode("login")} />
          )}
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FitLife Companion
            </h1>
            <span className="text-2xl">💪</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}!</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{renderActiveSection()}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
