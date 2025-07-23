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
import { Plus, Loader2, Upload, X } from "lucide-react"

export default function AddRoomDialog({ open, onOpenChange, onAdd }) {
  const [roomName, setRoomName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const roomSuggestions = [
    "Living Room", "Bedroom", "Kitchen", "Bathroom", "Dining Room", 
    "Office", "Guest Room", "Garage", "Basement", "Attic", "Balcony", "Study Room"
  ]

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleAddRoom = async () => {
    if (isLoading) return // Prevent multiple submissions
    
    if (!roomName.trim()) {
      alert("Please enter a room name")
      return
    }

    const newRoom = {
      name: roomName.trim(),
      devices: [],
      image: selectedImage
    }

    setIsLoading(true)
    try {
      await onAdd(newRoom)
      setRoomName("")
      setSelectedImage(null)
      setImagePreview(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add room:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (isLoading) return // Prevent cancel during loading
    setRoomName("")
    setSelectedImage(null)
    setImagePreview(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Room Name (e.g., Living Room)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Room Image (Optional)</p>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload a room image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="room-image-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="room-image-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose Image
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Room preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {roomSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setRoomName(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddRoom} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Room'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
