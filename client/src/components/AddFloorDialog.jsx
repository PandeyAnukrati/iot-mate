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
import { Plus } from "lucide-react"

export default function AddFloorDialog({ open, onOpenChange, house }) {
  const [floorName, setFloorName] = useState("")
  const { addFloorToHouse } = useHouses()

  const handleAddFloor = () => {
    if (!floorName.trim()) {
      alert("Please enter a floor name")
      return
    }

    const newFloor = {
      name: floorName,
      rooms: [],
    }

    addFloorToHouse(house.id, newFloor)
    setFloorName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Floor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Floor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Floor Name (e.g., Ground Floor)"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
          />
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleAddFloor}>Add Floor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}