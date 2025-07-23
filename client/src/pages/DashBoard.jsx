import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Home, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Moon, 
  Cloud, 
  Zap, 
  Activity, 
  Bell, 
  Settings, 
  ChevronRight,
  Lightbulb,
  Fan,
  Lock,
  Tv,
  Speaker,
  Wifi,
  AirVent,
  BarChart3,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react"
import Navbar from "../components/Navbar"
import { useHouses } from "../context/HousesContext"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import WeatherSection from "../components/WeatherSection"

// Simulated data for the dashboard

const energyData = {
  today: 12.4,
  yesterday: 14.2,
  thisWeek: 78.5,
  lastWeek: 82.1,
  thisMonth: 310.2,
  lastMonth: 325.8,
  savings: 4.8
}

const recentActivities = [
  { id: 1, device: "Living Room Light", action: "turned on", time: "2 minutes ago", user: "You", status: "success" },
  { id: 2, device: "Front Door Lock", action: "unlocked", time: "15 minutes ago", user: "Sarah", status: "success" },
  { id: 3, device: "Kitchen AC", action: "temperature changed to 23°C", time: "1 hour ago", user: "You", status: "success" },
  { id: 4, device: "Garage Door", action: "failed to close", time: "3 hours ago", user: "System", status: "error" },
  { id: 5, device: "Security System", action: "armed", time: "5 hours ago", user: "You", status: "success" },
  { id: 6, device: "Bedroom TV", action: "turned off", time: "Yesterday, 11:30 PM", user: "You", status: "success" },
]

const alerts = [
  { id: 1, message: "Front door left open for 30 minutes", severity: "warning", time: "30 minutes ago" },
  { id: 2, message: "Motion detected in backyard", severity: "info", time: "2 hours ago" },
  { id: 3, message: "Living room window sensor low battery", severity: "warning", time: "Yesterday" },
]

// Helper function to get device icon
const getDeviceIcon = (type) => {
  const iconMap = {
    'light': Lightbulb,
    'fan': Fan,
    'ac': AirVent,
    'thermostat': Thermometer,
    'tv': Tv,
    'speaker': Speaker,
    'router': Wifi,
    'lock': Lock,
    // Add more mappings as needed
  }
  
  return iconMap[type] || Home
}



const DashBoard = () => {
  const { houses } = useHouses()
  const [quickAccessDevices, setQuickAccessDevices] = useState([])
  const [deviceStates, setDeviceStates] = useState({})
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeDevices, setActiveDevices] = useState(0)
  const [offlineDevices, setOfflineDevices] = useState(0)
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Collect all devices for quick access and count active/offline devices
  useEffect(() => {
    const allDevices = []
    let activeCount = 0
    let offlineCount = 0
    
    houses.forEach(house => {
      house.floors?.forEach(floor => {
        floor.rooms?.forEach(room => {
          room.devices?.forEach(device => {
            // Add location info to device
            const deviceWithLocation = {
              ...device,
              houseName: house.name,
              floorName: floor.name,
              roomName: room.name
            }
            
            // Add to quick access if it's a controllable device
            if (['light', 'fan', 'ac', 'tv', 'speaker', 'lock'].includes(device.type)) {
              allDevices.push(deviceWithLocation)
            }
            
            // Count active/offline devices
            if (device.isOnline) {
              activeCount++
            } else {
              offlineCount++
            }
          })
        })
      })
    })
    
    // Sort by most recently added
    allDevices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Take only the first 6 devices for quick access
    setQuickAccessDevices(allDevices.slice(0, 6))
    setActiveDevices(activeCount)
    setOfflineDevices(offlineCount)
    
    // Initialize device states
    const initialStates = {}
    allDevices.forEach(device => {
      initialStates[device.id] = {
        isOn: Math.random() > 0.5, // Randomly set initial state
        brightness: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 10) + 18, // Random temp between 18-28
      }
    })
    setDeviceStates(initialStates)
  }, [houses])
  
  // Toggle device state
  const toggleDevice = (deviceId) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        isOn: !prev[deviceId].isOn
      }
    }))
  }
  
  // Update device brightness
  const updateBrightness = (deviceId, value) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        brightness: value[0]
      }
    }))
  }
  
  // Update device temperature
  const updateTemperature = (deviceId, value) => {
    setDeviceStates(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        temperature: value[0]
      }
    }))
  }
  
  // Count total houses, floors, rooms and devices
  const totalHouses = houses.length
  const totalFloors = houses.reduce((acc, house) => acc + (house.floors?.length || 0), 0)
  const totalRooms = houses.reduce((acc, house) => {
    return acc + house.floors?.reduce((floorAcc, floor) => {
      return floorAcc + (floor.rooms?.length || 0)
    }, 0) || 0
  }, 0)
  const totalDevices = houses.reduce((acc, house) => {
    return acc + house.floors?.reduce((floorAcc, floor) => {
      return floorAcc + floor.rooms?.reduce((roomAcc, room) => {
        return roomAcc + (room.devices?.length || 0)
      }, 0) || 0
    }, 0) || 0
  }, 0)
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-2" />
            <span>{currentTime.toLocaleString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}</span>
          </div>
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats */}
          <div className="space-y-6">
            {/* Overview Card */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <Home className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Houses</p>
                  <p className="text-2xl font-bold">{totalHouses}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Floors</p>
                  <p className="text-2xl font-bold">{totalFloors}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <Home className="w-6 h-6 text-purple-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Rooms</p>
                  <p className="text-2xl font-bold">{totalRooms}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <Zap className="w-6 h-6 text-amber-500 mb-2" />
                  <p className="text-sm text-muted-foreground">Devices</p>
                  <p className="text-2xl font-bold">{totalDevices}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Weather Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <WeatherSection houses={houses} />
            </motion.div>
            
            {/* Energy Usage Card */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Energy Usage</h2>
                <span className="text-sm text-green-500 flex items-center">
                  <span className="mr-1">-{energyData.savings}%</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Today</span>
                    <span className="font-medium">{energyData.today} kWh</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(energyData.today / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-medium">{energyData.thisWeek} kWh</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(energyData.thisWeek / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-medium">{energyData.thisMonth} kWh</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(energyData.thisMonth / 400) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-sm">View Detailed Report</Button>
            </motion.div>
          </div>
          
          {/* Middle Column - Quick Access & Activity */}
          <div className="space-y-6">
            {/* Quick Access Devices */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Quick Access</h2>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {quickAccessDevices.length > 0 ? (
                  quickAccessDevices.map(device => {
                    const DeviceIcon = getDeviceIcon(device.type)
                    const deviceState = deviceStates[device.id] || { isOn: false, brightness: 50, temperature: 22 }
                    
                    return (
                      <div key={device.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <DeviceIcon className={`w-5 h-5 mr-3 ${deviceState.isOn ? device.color : 'text-gray-400'}`} />
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {device.roomName}, {device.floorName}
                              </p>
                            </div>
                          </div>
                          <Switch 
                            checked={deviceState.isOn} 
                            onCheckedChange={() => toggleDevice(device.id)}
                          />
                        </div>
                        
                        {/* Device specific controls */}
                        {deviceState.isOn && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            {device.type === 'light' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Brightness</span>
                                  <span>{deviceState.brightness}%</span>
                                </div>
                                <Slider
                                  value={[deviceState.brightness]}
                                  min={1}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => updateBrightness(device.id, value)}
                                />
                              </div>
                            )}
                            
                            {device.type === 'ac' && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Temperature</span>
                                  <span>{deviceState.temperature}°C</span>
                                </div>
                                <Slider
                                  value={[deviceState.temperature]}
                                  min={16}
                                  max={30}
                                  step={1}
                                  onValueChange={(value) => updateTemperature(device.id, value)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No devices added yet</p>
                    <Button variant="outline" className="mt-2">Add Devices</Button>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Recent Activity */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className={`mt-0.5 p-1.5 rounded-full ${
                      activity.status === 'success' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.device}</span> was {activity.action}
                      </p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Alerts & Device Status */}
          <div className="space-y-6">
            {/* Device Status */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Device Status</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <p className="font-medium">Online Devices</p>
                      <p className="text-sm text-muted-foreground">Working properly</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{activeDevices}</p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center mr-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <p className="font-medium">Offline Devices</p>
                      <p className="text-sm text-muted-foreground">Need attention</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{offlineDevices}</p>
                </div>
                
                <Button variant="outline" className="w-full mt-2">Check All Devices</Button>
              </div>
            </motion.div>
            
            {/* Alerts */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Alerts</h2>
                <span className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {alerts.length} New
                </span>
              </div>
              
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className={`mt-0.5 p-1.5 rounded-full ${
                      alert.severity === 'warning' 
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' 
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {alert.severity === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-sm">View All Alerts</Button>
            </motion.div>
            
            {/* Calendar Events */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming</h2>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium">AC Filter Replacement</p>
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Maintenance
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tomorrow, 10:00 AM</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium">Security System Update</p>
                    <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      System
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Friday, 2:00 PM</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-sm">Manage Schedule</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashBoard