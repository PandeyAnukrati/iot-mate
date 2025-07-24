// components/AddDeviceDialog.jsx
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Lightbulb, 
  Fan, 
  Thermometer, 
  Camera, 
  Speaker, 
  Tv, 
  Wifi, 
  Zap, 
  Lock,
  Smartphone,
  Monitor,
  Refrigerator,
  WashingMachine,
  AirVent,
  Lamp,
  Volume2,
  Shield,
  Gauge,
  Loader2,
  Upload
} from "lucide-react"

const deviceTypes = [
  { id: 'Light', name: 'Light', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'Fan', name: 'Fan', icon: Fan, color: 'text-blue-500' },
  { id: 'Air Conditioner', name: 'Air Conditioner', icon: AirVent, color: 'text-cyan-500' },
  { id: 'Thermostat', name: 'Thermostat', icon: Thermometer, color: 'text-red-500' },
  { id: 'Camera', name: 'Security Camera', icon: Camera, color: 'text-gray-600' },
  { id: 'Speaker', name: 'Smart Speaker', icon: Speaker, color: 'text-purple-500' },
  { id: 'TV', name: 'Smart TV', icon: Tv, color: 'text-indigo-500' },
  { id: 'Router', name: 'WiFi Router', icon: Wifi, color: 'text-green-500' },
  { id: 'Switch', name: 'Smart Switch', icon: Zap, color: 'text-orange-500' },
  { id: 'Lock', name: 'Smart Lock', icon: Lock, color: 'text-gray-700' },
  { id: 'Phone', name: 'Smart Phone Hub', icon: Smartphone, color: 'text-blue-600' },
  { id: 'Monitor', name: 'Monitor', icon: Monitor, color: 'text-slate-600' },
  { id: 'Refrigerator', name: 'Smart Refrigerator', icon: Refrigerator, color: 'text-blue-400' },
  { id: 'Washer', name: 'Washing Machine', icon: WashingMachine, color: 'text-teal-500' },
  { id: 'Lamp', name: 'Table Lamp', icon: Lamp, color: 'text-amber-500' },
  { id: 'Sound', name: 'Sound System', icon: Volume2, color: 'text-pink-500' },
  { id: 'Security', name: 'Security System', icon: Shield, color: 'text-red-600' },
  { id: 'Sensor', name: 'Sensor', icon: Gauge, color: 'text-emerald-500' },
  { id: 'Other', name: 'Other Device', icon: Smartphone, color: 'text-gray-500' },
]

export default function AddDeviceDialog({ open, onOpenChange, onAdd, selectedHouse, selectedFloorIndex, selectedRoomIndex }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceDescription, setDeviceDescription] = useState("");
  const [deviceLocation, setDeviceLocation] = useState("");
  const [deviceImage, setDeviceImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [backendHouses, setBackendHouses] = useState([]);
  const [fetchingHouses, setFetchingHouses] = useState(false);
  const [selectedBackendHouse, setSelectedBackendHouse] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [customRoomName, setCustomRoomName] = useState("");

  // Fetch houses from backend when dialog opens
  useEffect(() => {
    if (open && currentUser) {
      fetchHouses();
    }
  }, [open, currentUser]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Fetch houses from backend
  const fetchHouses = async () => {
    if (!currentUser) return;
    
    setFetchingHouses(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("http://localhost:5000/api/houses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch houses");
      }
      
      const data = await response.json();
      setBackendHouses(data.data);
      
      // If we have a selected house from the UI, try to find a matching backend house
      if (selectedHouse) {
        const matchingHouse = data.data.find(h => h.name === selectedHouse.name);
        if (matchingHouse) {
          setSelectedBackendHouse(matchingHouse._id);
          
          // If we have a selected room, set it
          if (selectedFloorIndex !== null && selectedRoomIndex !== null) {
            const room = selectedHouse.floors[selectedFloorIndex]?.rooms[selectedRoomIndex]?.name;
            if (room) {
              setSelectedRoom(room);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching houses:", error);
      toast.error("Failed to load houses. Please try again.");
    } finally {
      setFetchingHouses(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDeviceImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDeviceType(null);
    setDeviceName("");
    setDeviceBrand("");
    setDeviceModel("");
    setDeviceDescription("");
    setDeviceLocation("");
    setDeviceImage(null);
    setImagePreview(null);
    setErrors({});
    setSelectedBackendHouse(null);
    setSelectedRoom("");
    setCustomRoomName("");
  };

  // Handle form submission
  const handleAddDevice = async () => {
    if (loading) return // Prevent multiple submissions
    
    // Validate form
    const newErrors = {};
    
    if (!deviceName.trim()) {
      newErrors.name = "Device name is required";
    }
    
    if (!selectedDeviceType) {
      newErrors.type = "Please select a device type";
    }
    
    if (!selectedBackendHouse) {
      newErrors.house = "Please select a house";
    }
    
    const finalRoomName = selectedRoom === "Other" ? customRoomName.trim() : selectedRoom;
    if (!finalRoomName) {
      newErrors.room = "Please select or enter a room name";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = await currentUser.getIdToken();
      
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      const finalRoomName = selectedRoom === "Other" ? customRoomName.trim() : selectedRoom;
      
      formDataToSend.append("name", deviceName.trim());
      formDataToSend.append("type", selectedDeviceType.id);
      formDataToSend.append("room", finalRoomName);
      formDataToSend.append("house", selectedBackendHouse);
      
      // Add optional fields if they exist
      if (deviceBrand.trim()) {
        const settings = {
          brand: deviceBrand.trim(),
          model: deviceModel.trim(),
          location: deviceLocation.trim(),
          description: deviceDescription.trim()
        };
        formDataToSend.append("settings", JSON.stringify(settings));
      }
      
      if (deviceImage) {
        formDataToSend.append("image", deviceImage);
      }
      
      const response = await fetch("http://localhost:5000/api/devices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Device creation failed:', errorData);
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(`Validation failed: ${errorData.errors.join(', ')}`);
        }
        
        throw new Error(errorData.message || "Failed to create device");
      }
      
      const data = await response.json();
      toast.success("Device added successfully!");
      
      // Create a device object for the UI
      const newDevice = {
        id: data.data._id,
        name: deviceName.trim(),
        type: selectedDeviceType.id.toLowerCase(),
        typeName: selectedDeviceType.name,
        icon: selectedDeviceType.icon.name,
        color: selectedDeviceType.color,
        brand: deviceBrand.trim(),
        model: deviceModel.trim(),
        description: deviceDescription.trim(),
        location: deviceLocation.trim(),
        status: data.data.status || 'Offline',
        isOnline: data.data.status === 'Online',
        lastSeen: new Date().toISOString(),
        createdAt: data.data.createdAt || new Date().toISOString(),
        image: data.data.image?.url
      };
      
      // Call the onAdd function to update the UI
      onAdd(newDevice);
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding device:", error);
      toast.error(error.message || "Failed to add device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get rooms for selected house
  const getHouseRooms = () => {
    if (!selectedBackendHouse) return [];
    const house = backendHouses.find(h => h._id === selectedBackendHouse);
    return house ? house.rooms : [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> Add Device
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Device
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Device Type *</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {deviceTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedDeviceType(type)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedDeviceType?.id === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 mx-auto mb-1 ${type.color}`} />
                    <p className="text-xs text-center font-medium">{type.name}</p>
                  </button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* House and Room Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="house">House *</Label>
              <select
                id="house"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                value={selectedBackendHouse || ""}
                onChange={(e) => setSelectedBackendHouse(e.target.value)}
                disabled={fetchingHouses}
              >
                <option value="">{fetchingHouses ? "Loading houses..." : "Select a house"}</option>
                {backendHouses.map((house) => (
                  <option key={house._id} value={house._id}>
                    {house.name}
                  </option>
                ))}
              </select>
              {errors.house && (
                <p className="text-xs text-red-500">{errors.house}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room *</Label>
              <select
                id="room"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedBackendHouse}
              >
                <option value="">Select a room</option>
                {getHouseRooms().map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {selectedRoom === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter room name"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                />
              )}
              {errors.room && (
                <p className="text-xs text-red-500">{errors.room}</p>
              )}
            </div>
          </div>

          {/* Device Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name *</Label>
              <Input
                id="deviceName"
                placeholder="e.g., Living Room Light"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceLocation">Location</Label>
              <Input
                id="deviceLocation"
                placeholder="e.g., Near the window"
                value={deviceLocation}
                onChange={(e) => setDeviceLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceBrand">Brand</Label>
              <Input
                id="deviceBrand"
                placeholder="e.g., Philips, Samsung"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceModel">Model</Label>
              <Input
                id="deviceModel"
                placeholder="e.g., Hue White A19"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceDescription">Description</Label>
            <Textarea
              id="deviceDescription"
              placeholder="Additional details about the device..."
              value={deviceDescription}
              onChange={(e) => setDeviceDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Device Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="deviceImage">Device Image</Label>
            <div className="flex items-center gap-4">
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                  </div>
                )}
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Label>
            </div>
          </div>

          {/* Selected Device Preview */}
          {selectedDeviceType && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">Device Preview:</h4>
              <div className="flex items-center gap-3">
                <selectedDeviceType.icon className={`w-8 h-8 ${selectedDeviceType.color}`} />
                <div>
                  <p className="font-medium">{deviceName || 'Device Name'}</p>
                  <p className="text-sm text-muted-foreground">{selectedDeviceType.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddDevice} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Device...
              </>
            ) : (
              "Add Device"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
