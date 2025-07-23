// components/AddLocationToHouse.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { useHouses } from '../context/HousesContext';
import { toast } from 'sonner';

const provider = new OpenStreetMapProvider();

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationSelector({ position, setPosition, setAddress }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      
      try {
        // Use reverse geocoding to get the address
        const results = await provider.search({ query: `${lat}, ${lng}` });
        if (results && results.length > 0) {
          const result = results[0];
          const addressStr = result.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(addressStr);
        } else {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
      
      setPosition([lat, lng]);
    },
  });
  
  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

const AddLocationToHouse = ({ house, onLocationAdded, onCancel }) => {
  const [position, setPosition] = useState([28.6139, 77.209]); // Default to Delhi
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const { updateHouse } = useHouses();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await provider.search({ query: searchQuery });
      setSearchResults(results.slice(0, 5));
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const { x: lng, y: lat } = result;
    setPosition([lat, lng]);
    setAddress(result.label);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    if (!address) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);
    try {
      const updatedHouse = {
        ...house,
        address: address,
        position: {
          lat: position[0],
          lng: position[1]
        }
      };

      await updateHouse(updatedHouse);
      onLocationAdded();
      toast.success('Location added successfully!');
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Add Location to {house.name}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                disabled={loading || searching}
              />
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={loading || searching || !searchQuery.trim()}
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
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

          {/* Selected Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selected Address</label>
            <Input 
              value={address} 
              readOnly 
              placeholder="Click on the map to select a location"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Map */}
          <div className="h-96 rounded-lg overflow-hidden border">
            <LeafletMapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector 
                position={position} 
                setPosition={setPosition} 
                setAddress={setAddress} 
              />
            </LeafletMapContainer>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !address}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Location
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AddLocationToHouse;