// components/AddFloorDialog.jsx
import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useHouses } from "../context/HousesContext"
import { Plus, X, Building, Loader2 } from "lucide-react"

export default function AddFloorDialog({ open, onOpenChange, onAdd }) {
  const [floors, setFloors] = useState([{ name: "", id: Date.now() }])
  const [isLoading, setIsLoading] = useState(false)

  const addFloorInput = () => {
    setFloors([...floors, { name: "", id: Date.now() }])
  }

  const removeFloorInput = (id) => {
    if (floors.length > 1) {
      setFloors(floors.filter(floor => floor.id !== id))
    }
  }

  const updateFloorName = (id, name) => {
    setFloors(floors.map(floor => 
      floor.id === id ? { ...floor, name } : floor
    ))
  }

  const handleAddFloors = async () => {
    if (isLoading) return // Prevent multiple submissions
    
    const validFloors = floors.filter(floor => floor.name.trim())
    
    if (validFloors.length === 0) {
      alert("Please enter at least one floor name")
      return
    }

    setIsLoading(true)
    try {
      for (const floor of validFloors) {
        const newFloor = {
          name: floor.name.trim(),
          rooms: [],
        }
        await onAdd(newFloor)
      }
      
      setFloors([{ name: "", id: Date.now() }])
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add floors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFloors([{ name: "", id: Date.now() }])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Floor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Add Floors
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {floors.map((floor, index) => (
            <div key={floor.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  placeholder={`Floor ${index + 1} name (e.g., Ground Floor)`}
                  value={floor.name}
                  onChange={(e) => updateFloorName(floor.id, e.target.value)}
                />
              </div>
              {floors.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFloorInput(floor.id)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addFloorInput}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Floor
          </Button>
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddFloors} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${floors.filter(f => f.name.trim()).length || 0} Floor(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}