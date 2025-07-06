// pages/DevicesPage.jsx
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PhoneCall } from "lucide-react"
import Navbar from "../components/Navbar"
import houseImg from "../assets/house.jpg"
import AddHouseDialog from "../components/AddHouseDialog"
import AddFloorDialog from "../components/AddFloorDialog"
import AddRoomDialog from "../components/AddRoomDialog"
import AddDeviceDialog from "../components/AddDeviceDialog"
import { useHouses } from "../context/HousesContext"

export default function DevicesPage() {
  const { houses, addHouse, addFloorToHouse, updateHouse } = useHouses()
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [floorDialogOpen, setFloorDialogOpen] = useState(false)
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [newlyAddedHouseId, setNewlyAddedHouseId] = useState(null)

  useEffect(() => {
    if (newlyAddedHouseId !== null) {
      const found = houses.find((h) => h.id === newlyAddedHouseId)
      if (found) {
        setSelectedHouse(found)
        setNewlyAddedHouseId(null)
      }
    }
  }, [houses, newlyAddedHouseId])

  const handleAddHouse = (newHouse) => {
    const newId = houses.length + 1
    const house = {
      id: newId,
      name: newHouse.name,
      address: newHouse.address,
      position: newHouse.position,
      image: newHouse.image || houseImg,
      caretaker: {
        name: newHouse.caretakerName || "Unknown",
        phone: newHouse.phone,
      },
      floors: [],
    }
    addHouse(house)
    setNewlyAddedHouseId(newId)
    setDialogOpen(false)
  }

  const handleAddFloor = (floor) => {
    if (!selectedHouse) return
    addFloorToHouse(selectedHouse.id, floor)
    setSelectedFloorIndex(selectedHouse.floors.length)
    setFloorDialogOpen(false)
  }

  const handleAddRoom = (room) => {
    const house = { ...selectedHouse }
    const floor = house.floors[selectedFloorIndex]
    floor.rooms = [...(floor.rooms || []), room]
    house.floors[selectedFloorIndex] = floor
    updateHouse(house)
    setSelectedRoomIndex((floor.rooms || []).length - 1)
    setRoomDialogOpen(false)
  }

  const handleAddDevice = (device) => {
    const house = { ...selectedHouse }
    const floor = house.floors[selectedFloorIndex]
    const room = floor.rooms[selectedRoomIndex]
    room.devices = [...(room.devices || []), device]
    floor.rooms[selectedRoomIndex] = room
    house.floors[selectedFloorIndex] = floor
    updateHouse(house)
    setDeviceDialogOpen(false)
  }

  const currentFloor = selectedHouse?.floors?.[selectedFloorIndex]
  const currentRoom = currentFloor?.rooms?.[selectedRoomIndex]

  return (
    <>
      <Navbar />
      <section className="px-6 py-20 max-w-7xl mx-auto space-y-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Smart Spaces
        </motion.h1>

        {!selectedHouse && (
          <div className="flex justify-end mb-6">
            <AddHouseDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onAdd={handleAddHouse}
            />
          </div>
        )}

        {!selectedHouse ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {houses.map((h) => (
              <motion.div
                key={h.id}
                className="p-4 bg-white/70 dark:bg-white/10 rounded-xl border border-white/20 shadow backdrop-blur-md space-y-4"
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedHouse(h)}
              >
                <img
                  src={h.image}
                  alt={h.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h2 className="text-xl font-semibold text-cyan-600">🏠 {h.name}</h2>
                <p className="text-sm text-muted-foreground">📍 {h.address}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">👤 {h.caretaker.name}</p>
                  <a
                    href={`tel:${h.caretaker.phone}`}
                    className="text-cyan-500 hover:text-cyan-600"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : selectedFloorIndex === null ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold mb-4">{selectedHouse.name}</h2>
              <AddFloorDialog
                open={floorDialogOpen}
                onOpenChange={setFloorDialogOpen}
                onAdd={handleAddFloor}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedHouse.floors.map((floor, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 bg-white/80 dark:bg-white/10 rounded-xl border border-white/20 shadow hover:shadow-lg backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedFloorIndex(idx)}
                >
                  <h3 className="text-xl font-semibold">🏢 {floor.name || `Floor ${idx + 1}`}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedRoomIndex === null ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold">{currentFloor.name || `Floor ${selectedFloorIndex + 1}`}</h2>
              <AddRoomDialog
                open={roomDialogOpen}
                onOpenChange={setRoomDialogOpen}
                onAdd={handleAddRoom}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentFloor.rooms?.map((room, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 bg-white/80 dark:bg-white/10 rounded-xl border border-white/20 shadow hover:shadow-lg backdrop-blur-md cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRoomIndex(idx)}
                >
                  <h3 className="text-xl font-semibold">🛏️ {room.name}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-semibold">{currentRoom.name}</h2>
              <AddDeviceDialog
                open={deviceDialogOpen}
                onOpenChange={setDeviceDialogOpen}
                onAdd={handleAddDevice}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentRoom.devices?.map((device) => (
                <motion.div
                  key={device.id}
                  className="bg-white/80 dark:bg-white/10 p-6 rounded-xl shadow border border-white/20 backdrop-blur-md space-y-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="font-medium text-lg">🔌 {device.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
