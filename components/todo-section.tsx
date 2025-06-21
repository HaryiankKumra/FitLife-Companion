"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Todo {
  id: number
  text: string
  completed: boolean
  priority: "low" | "medium" | "high"
  created_at: string
}

export function TodoSection() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos")
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTodo, priority }),
      })

      if (response.ok) {
        const newTodoItem = await response.json()
        setTodos([newTodoItem, ...todos])
        setNewTodo("")
      }
    } catch (error) {
      console.error("Failed to add todo:", error)
    }
  }

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)))
      }
    } catch (error) {
      console.error("Failed to update todo:", error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Daily Tasks</h2>
        <Badge variant="outline" className="ml-auto">
          {completedCount}/{totalCount} completed
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="What do you need to do today?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              className="flex-1"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={addTodo}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No tasks yet. Add one above!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className={`transition-all ${todo.completed ? "opacity-60" : ""}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox checked={todo.completed} onCheckedChange={(checked) => toggleTodo(todo.id, !!checked)} />
                <div className="flex-1">
                  <p className={`${todo.completed ? "line-through text-muted-foreground" : ""}`}>{todo.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPriorityColor(todo.priority)}>{todo.priority}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(todo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {completedCount > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-green-800 font-medium">
              🎉 Great job! You've completed {completedCount} task{completedCount !== 1 ? "s" : ""} today!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
