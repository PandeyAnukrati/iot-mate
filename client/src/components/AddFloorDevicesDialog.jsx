
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

export default function AddFloorDevicesDialog({ house }) {
  const { addFloorToHouse, addDeviceToRoom } = useHouses()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)

  const [floorName, setFloorName] = useState("")
  const [roomName, setRoomName] = useState("")
  const [devices, setDevices] = useState([])
  const [deviceName, setDeviceName] = useState("")

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleAddDevice = () => {
    if (deviceName.trim()) {
      setDevices([...devices, { id: Date.now(), name: deviceName.trim() }])
      setDeviceName("")
    }
  }

  const handleFinish = () => {
    const newFloor = {
      name: floorName.trim(),
      rooms: [
        {
          name: roomName.trim(),
          devices,
        },
      ],
    }
    addFloorToHouse(house.id, newFloor)
    setOpen(false)
    setStep(1)
    setFloorName("")
    setRoomName("")
    setDevices([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Floor & Devices
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? "Add Floor"
              : step === 2
              ? "Add Room"
              : "Add Devices"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <Input
            placeholder="Floor Name"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
          />
        )}

        {step === 2 && (
          <Input
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        )}

        {step === 3 && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <Button onClick={handleAddDevice}>Add</Button>
            </div>
            <ul className="list-disc pl-6">
              {devices.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-4 flex justify-between">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack}>
              ← Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next →</Button>
          ) : (
            <Button onClick={handleFinish}>Finish</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
