'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash } from 'lucide-react'

type TodoItem = {
  id: string
  text: string
  completed: boolean
}

type TodoProps = {
  initialItems?: TodoItem[]
  onItemsChange?: (items: TodoItem[]) => void
  className?: string
}

export function Todo({ initialItems = [], onItemsChange, className = '' }: TodoProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems)
  const [newItemText, setNewItemText] = useState('')

  const handleAddItem = () => {
    if (newItemText.trim() === '') return
    
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: newItemText,
      completed: false
    }
    
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    setNewItemText('')
    
    if (onItemsChange) {
      onItemsChange(updatedItems)
    }
  }

  const handleToggleItem = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    
    setItems(updatedItems)
    
    if (onItemsChange) {
      onItemsChange(updatedItems)
    }
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    setItems(updatedItems)
    
    if (onItemsChange) {
      onItemsChange(updatedItems)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new item..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddItem()
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleAddItem}>Add</Button>
      </div>
      
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={item.completed}
                onCheckedChange={() => handleToggleItem(item.id)}
                id={`todo-item-${item.id}`}
              />
              <label 
                htmlFor={`todo-item-${item.id}`}
                className={`${item.completed ? 'line-through text-gray-500' : ''}`}
              >
                {item.text}
              </label>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDeleteItem(item.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
} 