import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
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
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { Plus, Maximize, X, Loader2, Search, MapPin } from "lucide-react"
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import { useHouses } from "../context/HousesContext"

// Initialize geocoding provider
const provider = new OpenStreetMapProvider()

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const dummyHouses = [
  {
    name: "Green Villa",
    phone: "9876543210",
    address: "123 Green St, Delhi",
    position: [28.6205, 77.2090],
  },
  {
    name: "Sky Residency",
    phone: "9123456780",
    address: "456 Blue Lane, Delhi",
    position: [28.6140, 77.2200],
  },
  {
    name: "Sunset Homes",
    phone: "9988776655",
    address: "789 Red Road, Delhi",
    position: [28.6090, 77.2000],
  },
]

function FitBounds({ markers }) {
  const map = useMap()
  if (markers.length === 0) return null
  const bounds = L.latLngBounds(markers.map((m) => m.position))
  map.fitBounds(bounds, { padding: [50, 50] })
  return null
}

function LocationSelector({ position, setPosition, setAddress, onSelect }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng
      console.log("🗺 Selected location:", lat, lng)
      
      try {
        // Use reverse geocoding to get the real address
        const results = await provider.search({ query: `${lat}, ${lng}` })
        if (results && results.length > 0) {
          const result = results[0]
          const addressStr = result.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          console.log("📍 Reverse geocoded address:", addressStr)
          setAddress(addressStr)
        } else {
          // Fallback to coordinates if no address found
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error)
        // Fallback to coordinates
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
      
      setPosition([lat, lng])
      if (onSelect) onSelect()
    },
  })
  return position ? <Marker position={position} icon={defaultIcon} /> : null
}

function HouseMarkers({ houses }) {
  return houses.map((house, idx) => (
    <Marker key={idx} position={house.position} icon={defaultIcon}>
      <Popup>
        <strong>{house.name}</strong><br />
        {house.phone}<br />
        {house.address}
      </Popup>
    </Marker>
  ))
}

export default function AddHouseDialog({ open, onOpenChange, onAdd }) {
  const { currentUser } = useAuth();
  const dialogOpenState = open ?? false
  const setDialogOpenState = onOpenChange ?? (() => {})

  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    caretakerName: "",
    image: null,
  })
  const [preview, setPreview] = useState("")
  const [address, setAddress] = useState("")
  const [position, setPosition] = useState([28.6139, 77.209])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const { houses } = useHouses()

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // Reset errors when form changes
  useEffect(() => {
    setErrors({})
  }, [form, address])

  const resetForm = () => {
    setForm({ name: "", phone: "", caretakerName: "", image: null })
    setPreview("")
    setAddress("")
    setPosition([28.6139, 77.209])
    setErrors({})
    setSearchQuery("")
    setSearchResults([])
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const results = await provider.search({ query: searchQuery })
      setSearchResults(results.slice(0, 5)) // Limit to 5 results
      console.log("🔍 Search results:", results)
    } catch (error) {
      console.error("Search failed:", error)
      toast.error("Search failed. Please try again.")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectSearchResult = (result) => {
    const { x: lng, y: lat } = result
    setPosition([lat, lng])
    setAddress(result.label)
    setSearchResults([])
    setSearchQuery("")
    console.log("📍 Selected search result:", result.label, lat, lng)
  }

  const { addHouse: addHouseToContext } = useHouses();

  const handleSubmit = async () => {
    const newErrors = {}
    
    if (!form.name.trim()) {
      newErrors.name = "House name is required"
    }
    
    if (!form.caretakerName.trim()) {
      newErrors.caretakerName = "Caretaker name is required"
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }
    
    if (!address) {
      newErrors.address = "Please select a location on the map"
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      // Create house object for the API
      const houseData = {
        name: form.name.trim(),
        caretakerName: form.caretakerName.trim(),
        phone: form.phone.trim(),
        address: address,
        position: {
          lat: position[0],
          lng: position[1]
        },
        image: form.image
      };
      
      // Use the context function to add the house
      const newHouse = await addHouseToContext(houseData);
      
      console.log("✅ New house object:", newHouse);

      if (onAdd) onAdd(newHouse);

      resetForm();
      setDialogOpenState(false);
      setExpanded(false);
    } catch (error) {
      console.error("Error adding house:", error);
      // Toast notification is already handled in the context
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={dialogOpenState} onOpenChange={setDialogOpenState}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" onClick={() => setDialogOpenState(true)}>
            <Plus className="w-4 h-4" /> Add House
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add a New House</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to add a new house to your smart home network.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - House Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">House Name *</label>
                <Input
                  placeholder="e.g., Green Villa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Caretaker Name *</label>
                <Input
                  placeholder="e.g., John Smith"
                  value={form.caretakerName}
                  onChange={(e) => setForm({ ...form, caretakerName: e.target.value })}
                  className={errors.caretakerName ? "border-red-500 focus:ring-red-500" : ""}
                  disabled={loading}
                />
                {errors.caretakerName && (
                  <p className="text-xs text-red-500">{errors.caretakerName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Caretaker Phone *</label>
                <Input
                  placeholder="e.g., 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">House Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setPreview(url)
                      setForm({ ...form, image: file })
                    }
                  }}
                  disabled={loading}
                />
              </div>
              
              {preview && (
                <div className="relative w-full h-40 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            {/* Right Column - Location */}
            <div className="space-y-4">
              {/* Search Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Location</label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                    disabled={loading || searching}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSearch}
                    disabled={loading || searching || !searchQuery.trim()}
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center gap-2"
                        onClick={() => selectSearchResult(result)}
                      >
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate">{result.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location *</label>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Selected Address" 
                    value={address} 
                    readOnly 
                    className={`flex-1 ${errors.address ? "border-red-500 focus:ring-red-500" : ""}`}
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Expand Map"
                    onClick={() => {
                      setDialogOpenState(false)
                      setExpanded(true)
                    }}
                    disabled={loading}
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
                {errors.address ? (
                  <p className="text-xs text-red-500">{errors.address}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Search above or click on the map to select a location</p>
                )}
              </div>

              <div className="relative h-[300px] w-full rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <HouseMarkers houses={[...dummyHouses, ...houses]} />
                  <LocationSelector
                    position={position}
                    setPosition={setPosition}
                    setAddress={setAddress}
                  />
                </MapContainer>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpenState(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding House...
                </>
              ) : (
                "Add House"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5">
          <div className="relative w-full max-w-6xl h-[90vh] rounded-md overflow-hidden bg-white/95 dark:bg-gray-900/95 shadow-lg">
            <MapContainer
              center={position}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds markers={[...dummyHouses, ...houses]} />
              <HouseMarkers houses={[...dummyHouses, ...houses]} />
              <LocationSelector
                position={position}
                setPosition={setPosition}
                setAddress={setAddress}
                onSelect={() => {
                  setExpanded(false)
                  setTimeout(() => setDialogOpenState(true), 200)
                }}
              />
            </MapContainer>

            <Button
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-white rounded-full shadow"
              size="icon"
              onClick={() => setExpanded(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
