// pages/DevicesPage.jsx
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PhoneCall, ArrowLeft, Home, Building, DoorOpen, Loader2, MoreVertical, Edit, Trash2, Plus } from "lucide-react"
import Navbar from "../components/Navbar"
import houseImg from "../assets/house.jpg"
import AddHouseDialog from "../components/AddHouseDialog"
import EditHouseDialog from "../components/EditHouseDialog"
import AddFloorDialog from "../components/AddFloorDialog"
import AddRoomDialog from "../components/AddRoomDialog"
import AddDeviceDialog from "../components/AddDeviceDialog"
import RoomDrawingEditor from "../components/RoomDrawingEditor"
import { useHouses } from "../context/HousesContext"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DevicesPage() {
  const { houses, loading, error, fetchHouses, addFloorToHouse, addRoomToFloor, deleteFloorFromHouse, deleteRoomFromFloor, updateHouse, deleteHouse } = useHouses()
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [floorDialogOpen, setFloorDialogOpen] = useState(false)
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [newlyAddedHouseId, setNewlyAddedHouseId] = useState(null)
  const [editHouseId, setEditHouseId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [houseToDelete, setHouseToDelete] = useState(null)
  const [floorDeleteConfirmOpen, setFloorDeleteConfirmOpen] = useState(false)
  const [floorToDelete, setFloorToDelete] = useState(null)
  const [roomDeleteConfirmOpen, setRoomDeleteConfirmOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)

  // Fetch houses when component mounts
  useEffect(() => {
    fetchHouses();
  }, []);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

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
    // Set the newly added house ID to select it after it's added
    setNewlyAddedHouseId(newHouse.id)
    setDialogOpen(false)
  }
  
  const handleEditHouse = (houseId) => {
    // Set the house to edit
    setEditHouseId(houseId)
  }
  
  const handleHouseUpdated = (updatedHouse) => {
    // Close the edit dialog
    setEditHouseId(null)
    toast.success(`${updatedHouse.name} has been updated`)
  }
  
  const handleDeleteClick = (house, e) => {
    // Prevent the click from propagating to the card
    e.stopPropagation()
    
    // Set the house to delete and open the confirmation dialog
    setHouseToDelete(house)
    setDeleteConfirmOpen(true)
  }
  
  const confirmDelete = async () => {
    if (!houseToDelete) return
    
    try {
      await deleteHouse(houseToDelete.id)
      toast.success(`${houseToDelete.name} has been deleted`)
      setHouseToDelete(null)
      setDeleteConfirmOpen(false)
    } catch (error) {
      toast.error(`Failed to delete house: ${error.message}`)
    }
  }

  const handleAddFloor = async (floor) => {
    if (!selectedHouse) return
    try {
      const updatedHouse = await addFloorToHouse(selectedHouse.id, floor)
      // Update the selected house with the new data
      setSelectedHouse(updatedHouse)
      setFloorDialogOpen(false)
    } catch (error) {
      console.error('Failed to add floor:', error)
    }
  }

  const handleAddRoom = async (room) => {
    if (!selectedHouse || selectedFloorIndex === null) return
    try {
      const updatedHouse = await addRoomToFloor(selectedHouse.id, selectedFloorIndex, room)
      // Update the selected house with the new data
      setSelectedHouse(updatedHouse)
      setSelectedRoomIndex((updatedHouse.floors[selectedFloorIndex].rooms || []).length - 1)
      setRoomDialogOpen(false)
    } catch (error) {
      console.error('Failed to add room:', error)
    }
  }

  const handleFloorDeleteClick = (floorIndex, floorName, e) => {
    e.stopPropagation()
    setFloorToDelete({ index: floorIndex, name: floorName })
    setFloorDeleteConfirmOpen(true)
  }

  const handleFloorDeleteConfirm = async () => {
    if (!selectedHouse || floorToDelete === null) return
    
    try {
      const updatedHouse = await deleteFloorFromHouse(selectedHouse.id, floorToDelete.index)
      setSelectedHouse(updatedHouse)
      
      // Reset floor selection if the deleted floor was selected
      if (selectedFloorIndex === floorToDelete.index) {
        setSelectedFloorIndex(null)
        setSelectedRoomIndex(null)
      } else if (selectedFloorIndex > floorToDelete.index) {
        // Adjust floor index if a floor before the selected one was deleted
        setSelectedFloorIndex(selectedFloorIndex - 1)
      }
      
      setFloorDeleteConfirmOpen(false)
      setFloorToDelete(null)
    } catch (error) {
      toast.error(`Failed to delete floor: ${error.message}`)
    }
  }

  const handleRoomDeleteClick = (roomIndex, roomName, e) => {
    e.stopPropagation()
    setRoomToDelete({ index: roomIndex, name: roomName })
    setRoomDeleteConfirmOpen(true)
  }

  const handleRoomDeleteConfirm = async () => {
    if (!selectedHouse || selectedFloorIndex === null || roomToDelete === null) return
    
    try {
      const updatedHouse = await deleteRoomFromFloor(selectedHouse.id, selectedFloorIndex, roomToDelete.index)
      setSelectedHouse(updatedHouse)
      
      // Reset room selection if the deleted room was selected
      if (selectedRoomIndex === roomToDelete.index) {
        setSelectedRoomIndex(null)
      } else if (selectedRoomIndex > roomToDelete.index) {
        // Adjust room index if a room before the selected one was deleted
        setSelectedRoomIndex(selectedRoomIndex - 1)
      }
      
      setRoomDeleteConfirmOpen(false)
      setRoomToDelete(null)
    } catch (error) {
      toast.error(`Failed to delete room: ${error.message}`)
    }
  }

  const handleRoomSketchSave = async (roomData) => {
    if (!selectedHouse || selectedFloorIndex === null || selectedRoomIndex === null) return
    
    try {
      // Update the room with sketch data
      const updatedHouse = { ...selectedHouse }
      const room = updatedHouse.floors[selectedFloorIndex].rooms[selectedRoomIndex]
      room.sketch = roomData.sketch
      room.devices = roomData.devices
      
      // Update the house
      await updateHouse(updatedHouse)
      setSelectedHouse(updatedHouse)
      toast.success('Room layout saved successfully')
    } catch (error) {
      toast.error(`Failed to save room layout: ${error.message}`)
    }
  }

  const handleDeviceAddFromCanvas = (deviceData) => {
    // This will be handled by the RoomDrawingEditor component
    // The device is already added to the room's device list in the component
    toast.success(`Device "${deviceData.name}" added to room layout`)
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {houseToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Floor Delete Confirmation Dialog */}
      <AlertDialog open={floorDeleteConfirmOpen} onOpenChange={setFloorDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Floor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{floorToDelete?.name}" and all its rooms and devices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFloorDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Floor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Room Delete Confirmation Dialog */}
      <AlertDialog open={roomDeleteConfirmOpen} onOpenChange={setRoomDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{roomToDelete?.name}" and all its devices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRoomDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit House Dialog */}
      <EditHouseDialog 
        open={editHouseId !== null}
        onOpenChange={(open) => {
          if (!open) setEditHouseId(null);
        }}
        houseId={editHouseId}
        onUpdate={handleHouseUpdated}
      />
      
      <section className="px-6 py-20 max-w-7xl mx-auto space-y-16">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Smart Spaces
        </motion.h1>

        {/* Breadcrumb Navigation */}
        {selectedHouse && (
          <motion.div
            className="flex items-center gap-2 text-sm text-muted-foreground justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => {
                setSelectedHouse(null)
                setSelectedFloorIndex(null)
                setSelectedRoomIndex(null)
              }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Houses
            </button>
            <span>/</span>
            <button
              onClick={() => {
                setSelectedFloorIndex(null)
                setSelectedRoomIndex(null)
              }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {selectedHouse.name}
            </button>
            {selectedFloorIndex !== null && (
              <>
                <span>/</span>
                <button
                  onClick={() => setSelectedRoomIndex(null)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Building className="w-4 h-4" />
                  {currentFloor?.name || `Floor ${selectedFloorIndex + 1}`}
                </button>
              </>
            )}
            {selectedRoomIndex !== null && (
              <>
                <span>/</span>
                <span className="flex items-center gap-1 text-foreground">
                  <DoorOpen className="w-4 h-4" />
                  {currentRoom?.name}
                </span>
              </>
            )}
          </motion.div>
        )}

        {!selectedHouse && houses.length > 0 && (
          <div className="flex justify-end mb-6">
            <AddHouseDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onAdd={handleAddHouse}
            />
          </div>
        )}

        {!selectedHouse ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your houses...</p>
            </div>
          ) : houses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-6 rounded-full mb-4">
                <Home className="w-12 h-12 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Houses Found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't added any houses yet. Add your first house to start managing your smart devices.
              </p>
              <AddHouseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAdd={handleAddHouse}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {houses.map((h) => (
                <motion.div
                  key={h.id}
                  className="p-4 bg-white/70 dark:bg-white/10 rounded-xl border border-white/20 shadow backdrop-blur-md space-y-4 relative"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedHouse(h)}
                >
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditHouse(h.id);
                          }}
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                          onClick={(e) => handleDeleteClick(h, e)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🏢 {h.floors?.length || 0} floors</span>
                    <span>🚪 {h.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 0} rooms</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : selectedFloorIndex === null ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedHouse(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-semibold">{selectedHouse.name}</h2>
              </div>
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
                  className="p-4 bg-white/80 dark:bg-white/10 rounded-xl border border-white/20 shadow hover:shadow-lg backdrop-blur-md cursor-pointer relative"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedFloorIndex(idx)}
                >
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                          onClick={(e) => handleFloorDeleteClick(idx, floor.name || `Floor ${idx + 1}`, e)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-xl font-semibold">🏢 {floor.name || `Floor ${idx + 1}`}</h3>
                  <p className="text-sm text-muted-foreground">
                    🚪 {floor.rooms?.length || 0} rooms
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : selectedRoomIndex === null ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedFloorIndex(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-semibold">{currentFloor.name || `Floor ${selectedFloorIndex + 1}`}</h2>
              </div>
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
                  className="bg-white/80 dark:bg-white/10 rounded-xl border border-white/20 shadow hover:shadow-lg backdrop-blur-md cursor-pointer overflow-hidden relative"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedRoomIndex(idx)}
                >
                  {/* Room Image */}
                  {room.image?.url ? (
                    <div className="h-32 w-full overflow-hidden relative">
                      <img
                        src={room.image.url}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Three-dot menu on image */}
                      <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="p-1 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                              onClick={(e) => handleRoomDeleteClick(idx, room.name, e)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
                      <span className="text-4xl">🛏️</span>
                      {/* Three-dot menu on placeholder */}
                      <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="p-1 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
                              onClick={(e) => handleRoomDeleteClick(idx, room.name, e)}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                  
                  {/* Room Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      🔌 {room.devices?.length || 0} devices
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedRoomIndex(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-semibold">{currentRoom.name}</h2>
            </div>
            
            <RoomDrawingEditor
              room={currentRoom}
              onSave={handleRoomSketchSave}
              onDeviceAdd={handleDeviceAddFromCanvas}
            />
          </div>
        )}
      </section>
    </>
  )
}
