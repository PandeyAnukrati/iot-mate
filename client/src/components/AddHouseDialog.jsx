import { useState, useEffect } from "react"
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
import { Plus, Maximize, X } from "lucide-react"
import { useHouses } from "../context/HousesContext"

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
    click(e) {
      const { lat, lng } = e.latlng
      const addressStr = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
      console.log("🗺 Selected location:", addressStr)
      setPosition([lat, lng])
      setAddress(addressStr)
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

  const { houses } = useHouses()

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.caretakerName || !address) {
      alert("Please fill all fields and select a location.")
      return
    }

    const newHouse = {
      name: form.name,
      address,
      position,
      image: preview,
      caretaker: {
        name: form.caretakerName,
        phone: form.phone,
      },
      floors: [], // Must include for safe rendering
    }

    console.log("✅ New house object:", newHouse)

    if (onAdd) onAdd(newHouse)

    setForm({ name: "", phone: "", caretakerName: "", image: null })
    setPreview("")
    setAddress("")
    setPosition([28.6139, 77.209])
    setDialogOpenState(false)
    setExpanded(false)
  }

  return (
    <>
      <Dialog open={dialogOpenState} onOpenChange={setDialogOpenState}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" onClick={() => setDialogOpenState(true)}>
            <Plus className="w-4 h-4" /> Add House
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a New House</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="House Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Caretaker Name"
              value={form.caretakerName}
              onChange={(e) => setForm({ ...form, caretakerName: e.target.value })}
            />
            <Input
              placeholder="Caretaker Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
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
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-40 w-full object-cover rounded-md"
              />
            )}

            <div className="flex items-center justify-between">
              <Input placeholder="Selected Address" value={address} readOnly />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDialogOpenState(false)
                  setExpanded(true)
                }}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative h-64 w-full rounded-md overflow-hidden">
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

          <DialogFooter>
            <Button onClick={handleSubmit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-5">
          <div className="relative w-full max-w-6xl h-[90vh] rounded-md overflow-hidden bg-white shadow-lg">
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
