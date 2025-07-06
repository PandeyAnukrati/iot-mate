// components/AddDeviceDialog.jsx
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
import { Plus } from "lucide-react"
import { useHouses } from "../context/HousesContext"

export default function AddDeviceDialog({ open, onOpenChange, houseId, floorIndex, roomIndex }) {
  const { houses, updateHouse } = useHouses()
  const [deviceName, setDeviceName] = useState("")
  const [deviceType, setDeviceType] = useState("")

  const handleAddDevice = () => {
    if (!deviceName) return alert("Enter device name")

    const house = houses.find((h) => h.id === houseId)
    if (!house) return

    const updatedFloors = [...house.floors]
    const room = updatedFloors[floorIndex]?.rooms?.[roomIndex]
    if (!room) return

    const newDevice = {
      id: Date.now(),
      name: deviceName,
      type: deviceType,
    }

    const updatedRoom = {
      ...room,
      devices: [...(room.devices || []), newDevice],
    }

    updatedFloors[floorIndex].rooms[roomIndex] = updatedRoom

    updateHouse({ ...house, floors: updatedFloors })
    setDeviceName("")
    setDeviceType("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Device</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Device Name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <Input
            placeholder="Device Type (e.g., Light, Fan)"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleAddDevice}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
