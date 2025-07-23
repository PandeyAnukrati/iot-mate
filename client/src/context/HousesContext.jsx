// context/HousesContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const HousesContext = createContext();

export function HousesProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const user = auth?.user;
  const token = auth?.token;

  // Fetch houses when user is authenticated
  useEffect(() => {
    if (auth?.isAuthenticated && auth?.token) {
      fetchHouses();
    }
  }, [auth?.isAuthenticated, auth?.token]);

  // Fetch houses from API
  const fetchHouses = async () => {
    if (!auth?.token) {
      console.error("No authentication token available");
      setError("Authentication required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/houses`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch houses');
      }
      
      // Transform API data to match our client structure
      const transformedHouses = data.data.map(house => ({
        id: house._id,
        name: house.name,
        address: house.address,
        position: {
          lat: house.location?.coordinates[1] || 0,
          lng: house.location?.coordinates[0] || 0
        },
        image: house.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: house.caretakerName || 'Unknown',
          phone: house.phone || 'N/A',
        },
        floors: house.floors || [
          {
            name: 'Ground Floor',
            rooms: (house.rooms || []).map(roomName => ({
              name: roomName,
              devices: []
            }))
          }
        ],
        rooms: house.rooms || []
      }));
      
      setHouses(transformedHouses);
      toast.success(`${transformedHouses.length} houses loaded`);
    } catch (error) {
      console.error('Error fetching houses:', error);
      setError(error.message);
      toast.error(`Failed to load houses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new house
  const addHouse = async (houseData) => {
    setLoading(true);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('name', houseData.name);
      formData.append('caretakerName', houseData.caretakerName || 'Unknown');
      formData.append('phone', houseData.phone || 'N/A');
      formData.append('address', houseData.address);
      
      if (houseData.position) {
        formData.append('latitude', houseData.position.lat || 0);
        formData.append('longitude', houseData.position.lng || 0);
      }
      
      if (houseData.image && houseData.image instanceof File) {
        formData.append('image', houseData.image);
      }
      
      const response = await fetch(`${API_URL}/houses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create house');
      }
      
      // Transform the response to match our client structure
      const newHouse = {
        id: data.data._id,
        name: data.data.name,
        address: data.data.address,
        position: {
          lat: data.data.location?.coordinates[1] || 0,
          lng: data.data.location?.coordinates[0] || 0
        },
        image: data.data.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: data.data.caretakerName || 'Unknown',
          phone: data.data.phone || 'N/A',
        },
        floors: [],
        rooms: data.data.rooms || []
      };
      
      setHouses(prev => [...prev, newHouse]);
      toast.success('House created successfully');
      return newHouse;
    } catch (error) {
      console.error('Error creating house:', error);
      toast.error(`Failed to create house: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a house
  const updateHouse = async (updatedHouse) => {
    setLoading(true);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('name', updatedHouse.name);
      formData.append('caretakerName', updatedHouse.caretaker?.name || 'Unknown');
      formData.append('phone', updatedHouse.caretaker?.phone || 'N/A');
      formData.append('address', updatedHouse.address);
      
      if (updatedHouse.position) {
        formData.append('latitude', updatedHouse.position.lat || 0);
        formData.append('longitude', updatedHouse.position.lng || 0);
      }
      
      if (updatedHouse.image && updatedHouse.image instanceof File) {
        formData.append('image', updatedHouse.image);
      }
      
      // Add rooms if available
      if (updatedHouse.rooms) {
        formData.append('rooms', JSON.stringify(updatedHouse.rooms));
      }
      
      const response = await fetch(`${API_URL}/houses/${updatedHouse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update house');
      }
      
      // Update the house in state
      setHouses(prev =>
        prev.map(h => (h.id === updatedHouse.id ? updatedHouse : h))
      );
      
      toast.success('House updated successfully');
      return updatedHouse;
    } catch (error) {
      console.error('Error updating house:', error);
      toast.error(`Failed to update house: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a house
  const deleteHouse = async (houseId) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/houses/${houseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete house');
      }
      
      // Remove the house from state
      setHouses(prev => prev.filter(h => h.id !== houseId));
      toast.success('House deleted successfully');
    } catch (error) {
      console.error('Error deleting house:', error);
      toast.error(`Failed to delete house: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a floor to a house
  const addFloorToHouse = async (houseId, newFloor) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/houses/${houseId}/floors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newFloor.name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add floor');
      }
      
      // Update the house in state with the returned data
      const updatedHouse = {
        id: data.data._id,
        name: data.data.name,
        address: data.data.address,
        position: {
          lat: data.data.location?.coordinates[1] || 0,
          lng: data.data.location?.coordinates[0] || 0
        },
        image: data.data.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: data.data.caretakerName || 'Unknown',
          phone: data.data.phone || 'N/A',
        },
        floors: data.data.floors || [],
        rooms: data.data.rooms || []
      };
      
      setHouses(prev =>
        prev.map(house => house.id === houseId ? updatedHouse : house)
      );
      
      toast.success('Floor added successfully');
      return updatedHouse;
    } catch (error) {
      console.error('Error adding floor:', error);
      toast.error(`Failed to add floor: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add multiple floors to a house
  const addFloorsToHouse = async (houseId, newFloors) => {
    for (const floor of newFloors) {
      await addFloorToHouse(houseId, floor);
    }
  };

  // Add a room to a floor
  const addRoomToFloor = async (houseId, floorIndex, newRoom) => {
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newRoom.name);
      
      if (newRoom.image) {
        formData.append('image', newRoom.image);
      }
      
      const response = await fetch(`${API_URL}/houses/${houseId}/floors/${floorIndex}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add room');
      }
      
      // Update the house in state with the returned data
      const updatedHouse = {
        id: data.data._id,
        name: data.data.name,
        address: data.data.address,
        position: {
          lat: data.data.location?.coordinates[1] || 0,
          lng: data.data.location?.coordinates[0] || 0
        },
        image: data.data.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: data.data.caretakerName || 'Unknown',
          phone: data.data.phone || 'N/A',
        },
        floors: data.data.floors || [],
        rooms: data.data.rooms || []
      };
      
      setHouses(prev =>
        prev.map(house => house.id === houseId ? updatedHouse : house)
      );
      
      toast.success('Room added successfully');
      return updatedHouse;
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error(`Failed to add room: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a floor from a house
  const deleteFloorFromHouse = async (houseId, floorIndex) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/houses/${houseId}/floors/${floorIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete floor');
      }
      
      // Update the house in state with the returned data
      const updatedHouse = {
        id: data.data._id,
        name: data.data.name,
        address: data.data.address,
        position: {
          lat: data.data.location?.coordinates[1] || 0,
          lng: data.data.location?.coordinates[0] || 0
        },
        image: data.data.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: data.data.caretakerName || 'Unknown',
          phone: data.data.phone || 'N/A',
        },
        floors: data.data.floors || [],
        rooms: data.data.rooms || []
      };
      
      setHouses(prev =>
        prev.map(house => house.id === houseId ? updatedHouse : house)
      );
      
      toast.success('Floor deleted successfully');
      return updatedHouse;
    } catch (error) {
      console.error('Error deleting floor:', error);
      toast.error(`Failed to delete floor: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a room from a floor
  const deleteRoomFromFloor = async (houseId, floorIndex, roomIndex) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/houses/${houseId}/floors/${floorIndex}/rooms/${roomIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete room');
      }
      
      // Update the house in state with the returned data
      const updatedHouse = {
        id: data.data._id,
        name: data.data.name,
        address: data.data.address,
        position: {
          lat: data.data.location?.coordinates[1] || 0,
          lng: data.data.location?.coordinates[0] || 0
        },
        image: data.data.image?.url || '/placeholder-house.jpg',
        caretaker: {
          name: data.data.caretakerName || 'Unknown',
          phone: data.data.phone || 'N/A',
        },
        floors: data.data.floors || [],
        rooms: data.data.rooms || []
      };
      
      setHouses(prev =>
        prev.map(house => house.id === houseId ? updatedHouse : house)
      );
      
      toast.success('Room deleted successfully');
      return updatedHouse;
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(`Failed to delete room: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <HousesContext.Provider 
      value={{ 
        houses, 
        loading, 
        error, 
        fetchHouses,
        addHouse, 
        updateHouse, 
        deleteHouse,
        addFloorToHouse, 
        addFloorsToHouse,
        addRoomToFloor,
        deleteFloorFromHouse,
        deleteRoomFromFloor 
      }}
    >
      {children}
    </HousesContext.Provider>
  );
}

export const useHouses = () => useContext(HousesContext);
