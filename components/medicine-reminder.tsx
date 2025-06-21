"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, Plus, Trash2, Clock, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Medicine {
  id: string
  name: string
  dosage: string
  time: string
  frequency: "daily" | "weekly" | "as-needed"
  notes: string
  lastTaken?: string
}

interface MedicineReminderProps {
  onUpdate: (medicines: Medicine[]) => void
}

export function MedicineReminder({ onUpdate }: MedicineReminderProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    name: "",
    dosage: "",
    time: "20:00",
    frequency: "daily",
    notes: "",
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Add API integration
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const response = await fetch("/api/medicines")
      if (response.ok) {
        const data = await response.json()
        setMedicines(data)
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Check for medicine reminders
    checkReminders()
  }, [currentTime, medicines])

  const checkReminders = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    medicines.forEach((medicine) => {
      if (medicine.frequency === "daily") {
        const [hour, minute] = medicine.time.split(":").map(Number)

        // Check if it's time for this medicine (within 5 minutes)
        if (Math.abs(currentHour - hour) === 0 && Math.abs(currentMinute - minute) <= 5) {
          const lastTaken = medicine.lastTaken ? new Date(medicine.lastTaken) : null
          const today = now.toDateString()

          // Only remind if not taken today
          if (!lastTaken || lastTaken.toDateString() !== today) {
            showNotification(medicine)
          }
        }
      }
    })
  }

  const showNotification = (medicine: Medicine) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Medicine Reminder: ${medicine.name}`, {
        body: `Time to take ${medicine.dosage}`,
        icon: "/pill-icon.png",
      })
    }
  }

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  // Update addMedicine function
  const addMedicine = async () => {
    if (newMedicine.name && newMedicine.dosage && newMedicine.time) {
      try {
        const response = await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMedicine),
        })

        if (response.ok) {
          const medicine = await response.json()
          setMedicines([...medicines, medicine])
          setNewMedicine({ name: "", dosage: "", time: "20:00", frequency: "daily", notes: "" })
          setIsAdding(false)
        }
      } catch (error) {
        console.error("Failed to add medicine:", error)
      }
    }
  }

  const markAsTaken = (id: string) => {
    const updatedMedicines = medicines.map((med) =>
      med.id === id ? { ...med, lastTaken: new Date().toISOString() } : med,
    )
    onUpdate(updatedMedicines)
  }

  const deleteMedicine = (id: string) => {
    onUpdate(medicines.filter((med) => med.id !== id))
  }

  const getTodaysMedicines = () => {
    const today = new Date().toDateString()
    return medicines
      .filter((med) => {
        if (med.frequency === "daily") return true
        if (med.frequency === "weekly") {
          // For simplicity, show weekly medicines on the same day of week they were added
          return true
        }
        return false
      })
      .map((med) => ({
        ...med,
        taken: med.lastTaken && new Date(med.lastTaken).toDateString() === today,
      }))
  }

  const getUpcomingReminders = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    return medicines
      .filter((med) => med.frequency === "daily")
      .map((med) => {
        const [hour, minute] = med.time.split(":").map(Number)
        const medicineTime = hour * 60 + minute
        return {
          ...med,
          timeUntil: medicineTime > currentTime ? medicineTime - currentTime : 24 * 60 - currentTime + medicineTime,
        }
      })
      .sort((a, b) => a.timeUntil - b.timeUntil)
      .slice(0, 3)
  }

  const todaysMedicines = getTodaysMedicines()
  const upcomingReminders = getUpcomingReminders()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Medicine Reminder</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={requestNotificationPermission} size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Medicine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Medicine Name</label>
                <Input
                  placeholder="e.g., Vitamin D"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dosage</label>
                <Input
                  placeholder="e.g., 1 tablet, 500mg"
                  value={newMedicine.dosage}
                  onChange={(e) => setNewMedicine((prev) => ({ ...prev, dosage: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={newMedicine.time}
                  onChange={(e) => setNewMedicine((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={newMedicine.frequency}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      frequency: e.target.value as "daily" | "weekly" | "as-needed",
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input
                placeholder="Take with food, etc."
                value={newMedicine.notes}
                onChange={(e) => setNewMedicine((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addMedicine}>Add Medicine</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today's Medicines</TabsTrigger>
          <TabsTrigger value="all">All Medicines</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todaysMedicines.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No medicines scheduled for today</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            todaysMedicines.map((medicine) => (
              <Card key={medicine.id} className={medicine.taken ? "bg-green-50 border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{medicine.name}</h3>
                        <Badge variant={medicine.taken ? "default" : "secondary"}>
                          {medicine.taken ? "Taken" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} at {medicine.time}
                      </p>
                      {medicine.notes && <p className="text-xs text-muted-foreground mt-1">{medicine.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      {!medicine.taken && (
                        <Button size="sm" onClick={() => markAsTaken(medicine.id)}>
                          Mark Taken
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMedicine(medicine.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {medicines.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No medicines added yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            medicines.map((medicine) => (
              <Card key={medicine.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{medicine.name}</h3>
                        <Badge>{medicine.frequency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} at {medicine.time}
                      </p>
                      {medicine.notes && <p className="text-xs text-muted-foreground mt-1">{medicine.notes}</p>}
                      {medicine.lastTaken && (
                        <p className="text-xs text-green-600 mt-1">
                          Last taken: {new Date(medicine.lastTaken).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMedicine(medicine.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Next Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming reminders</p>
              ) : (
                <div className="space-y-3">
                  {upcomingReminders.map((medicine) => {
                    const hours = Math.floor(medicine.timeUntil / 60)
                    const minutes = medicine.timeUntil % 60
                    return (
                      <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{medicine.time}</p>
                          <p className="text-xs text-muted-foreground">
                            in {hours > 0 ? `${hours}h ` : ""}
                            {minutes}m
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
