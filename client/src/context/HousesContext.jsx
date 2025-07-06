// context/HousesContext.jsx
import { createContext, useContext, useState } from "react"

const HousesContext = createContext()

export function HousesProvider({ children }) {
  const [houses, setHouses] = useState([])
 
  const addHouse = (house) => {
    setHouses((prev) => [...prev, house])
  }

  const updateHouse = (updatedHouse) => {
    setHouses((prev) =>
      prev.map((h) => (h.id === updatedHouse.id ? updatedHouse : h))
    )
  }

  const addFloorToHouse = (houseId, newFloor) => {
    setHouses((prev) =>
      prev.map((house) => {
        if (house.id === houseId) {
          return {
            ...house,
            floors: [...(house.floors || []), newFloor],
          }
        }
        return house
      })
    )
  }

  const addFloorsToHouse = (houseId, newFloors) => {
    setHouses((prev) =>
      prev.map((house) => {
        if (house.id === houseId) {
          return {
            ...house,
            floors: [...(house.floors || []), ...newFloors],
          }
        }
        return house
      })
    )
  }

  return (
    <HousesContext.Provider value={{ houses, addHouse, updateHouse, addFloorToHouse, addFloorsToHouse }}>
      {children}
    </HousesContext.Provider>
  )
}

export const useHouses = () => useContext(HousesContext)
