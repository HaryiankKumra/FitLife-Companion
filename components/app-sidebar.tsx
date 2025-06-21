"use client"

import { Dumbbell, Brain, UtensilsCrossed, BarChart3, Pill, CheckSquare } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    id: "dashboard",
    description: "Your progress overview",
  },
  {
    title: "Daily Tasks",
    icon: CheckSquare,
    id: "todos",
    description: "Plan your day",
  },
  {
    title: "Gym Tracker",
    icon: Dumbbell,
    id: "gym",
    description: "Log workouts",
  },
  {
    title: "Smart Assistant",
    icon: Brain,
    id: "assistant",
    description: "AI workout suggestions",
  },
  {
    title: "Meal Planner",
    icon: UtensilsCrossed,
    id: "meals",
    description: "Nutrition guidance",
  },
  {
    title: "Medicine Reminder",
    icon: Pill,
    id: "medicine",
    description: "Daily medications",
  },
]

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userData: any
}

export function AppSidebar({ activeSection, onSectionChange, userData }: AppSidebarProps) {
  const getItemBadge = (id: string) => {
    switch (id) {
      case "todos":
        return userData.todos?.filter((t: any) => !t.completed).length || 0
      case "gym":
        return (
          userData.workouts?.filter((w: any) => {
            const today = new Date().toDateString()
            return new Date(w.date).toDateString() === today
          }).length || 0
        )
      case "medicine":
        return userData.medicines?.length || 0
      default:
        return null
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
            F
          </div>
          <div>
            <p className="text-sm font-medium">FitLife</p>
            <p className="text-xs text-muted-foreground">Your fitness companion</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const badge = getItemBadge(item.id)
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      isActive={activeSection === item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {badge !== null && badge > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="p-2 text-center">
          <p className="text-xs text-muted-foreground">Stay strong! 💪</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
