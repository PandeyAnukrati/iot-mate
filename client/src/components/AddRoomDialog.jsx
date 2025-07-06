// components/AddRoomDialog.jsx
import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useHouses } from "../context/HousesContext"
import { Plus } from "lucide-react"

export default function AddRoomDialog({ open, onOpenChange, houseId, floorIndex }) {
  const [roomName, setRoomName] = useState("")
  const { houses, updateHouse } = useHouses()

  const handleAddRoom = () => {
    if (!roomName.trim()) return

    const updatedHouses = houses.map((house) => {
      if (house.id !== houseId) return house

      const updatedFloors = [...house.floors]
      const floor = updatedFloors[floorIndex]

      const updatedRooms = [...(floor.rooms || []), { name: roomName, devices: [] }]
      updatedFloors[floorIndex] = {
        ...floor,
        rooms: updatedRooms,
      }

      return {
        ...house,
        floors: updatedFloors,
      }
    })

    const updatedHouse = updatedHouses.find((h) => h.id === houseId)
    updateHouse(updatedHouse)
    setRoomName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Room</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleAddRoom}>Add Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
