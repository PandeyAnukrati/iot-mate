// components/WeatherSection.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Sunrise,
  Sunset
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getWeatherForMultipleLocations, getWeatherIconUrl, clearWeatherCache, testWeatherService } from '../services/weatherService';
import AddLocationToHouse from './AddLocationToHouse';
import { toast } from 'sonner';

const WeatherSection = ({ houses }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [housesWithoutLocation, setHousesWithoutLocation] = useState([]);

  // Fetch weather data for all houses
  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter houses that have location data (either in location.coordinates or position)
      const housesWithLocation = houses.filter(house => {
        // Check if location.coordinates exists (direct from DB)
        if (house.location && house.location.coordinates && house.location.coordinates.length === 2) {
          return true;
        }
        // Check if position exists (from HousesContext transformation)
        if (house.position && house.position.lat && house.position.lng) {
          return true;
        }
        return false;
      });
      
      // Track houses without location data
      const housesWithoutLocationData = houses.filter(house => {
        // Check if location.coordinates exists (direct from DB)
        if (house.location && house.location.coordinates && house.location.coordinates.length === 2) {
          return false;
        }
        // Check if position exists (from HousesContext transformation)
        if (house.position && house.position.lat && house.position.lng) {
          return false;
        }
        return true;
      });
      
      setHousesWithoutLocation(housesWithoutLocationData);
      
      if (housesWithLocation.length === 0) {
        setError('No houses with location data found. Please add location data to your houses.');
        setLoading(false);
        return;
      }
      
      // Prepare location data for weather service
      const locations = housesWithLocation.map(house => {
        let coordinates;
        
        // Use location.coordinates if available (direct from DB)
        if (house.location && house.location.coordinates && house.location.coordinates.length === 2) {
          coordinates = house.location.coordinates;
        } 
        // Use position if available (from HousesContext transformation)
        else if (house.position && house.position.lat && house.position.lng) {
          coordinates = [house.position.lng, house.position.lat]; // [longitude, latitude]
        }
        
        return {
          id: house._id || house.id,
          name: house.name,
          coordinates: coordinates
        };
      });
      
      console.log('🌤️ Fetching weather for locations:', locations);
      const weatherResults = await getWeatherForMultipleLocations(locations);
      console.log('🌤️ Weather results:', weatherResults);
      setWeatherData(weatherResults);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data on component mount and when houses change
  useEffect(() => {
    if (houses && houses.length > 0) {
      fetchWeatherData();
    }
  }, [houses]);

  // Auto-refresh weather data every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [houses]);

  // Get weather icon based on condition
  const getWeatherIcon = (condition, size = 'w-8 h-8') => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className={`${size} text-yellow-500`} />;
    }
    if (conditionLower.includes('cloud')) {
      return <Cloud className={`${size} text-gray-500`} />;
    }
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className={`${size} text-blue-500`} />;
    }
    if (conditionLower.includes('snow')) {
      return <CloudSnow className={`${size} text-blue-200`} />;
    }
    if (conditionLower.includes('thunder')) {
      return <CloudLightning className={`${size} text-purple-500`} />;
    }
    
    return <Cloud className={`${size} text-gray-500`} />;
  };

  // Refresh weather data
  const handleRefresh = async () => {
    clearWeatherCache();
    await fetchWeatherData();
  };

  // Test weather service
  const handleTestWeatherService = async () => {
    try {
      setLoading(true);
      const testResult = await testWeatherService();
      console.log('✅ Weather service test result:', testResult);
      toast.success('Weather service test successful!');
    } catch (error) {
      console.error('❌ Weather service test failed:', error);
      toast.error(`Weather service test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2">Loading weather data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertTriangle className="w-6 h-6" />
            <span className="ml-2">{error}</span>
          </div>
          
          {/* Show houses without location data */}
          {housesWithoutLocation.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Houses without location data:</h4>
              <div className="grid gap-2">
                {housesWithoutLocation.map((house) => (
                  <div key={house.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium">{house.name}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedHouse(house);
                        setShowAddLocation(true);
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Add Location
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={handleRefresh} className="w-full mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Handle location added
  const handleLocationAdded = () => {
    setShowAddLocation(false);
    setSelectedHouse(null);
    // Refresh weather data
    fetchWeatherData();
  };

  return (
    <>
      {/* Add Location Dialog */}
      {showAddLocation && selectedHouse && (
        <AddLocationToHouse
          house={selectedHouse}
          onLocationAdded={handleLocationAdded}
          onCancel={() => {
            setShowAddLocation(false);
            setSelectedHouse(null);
          }}
        />
      )}
      
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Information
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              onClick={handleTestWeatherService} 
              size="sm" 
              variant="outline"
              disabled={loading}
            >
              Test API
            </Button>
            <Button 
              onClick={handleRefresh} 
              size="sm" 
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {weatherData.map((weather, index) => (
            <motion.div
              key={weather.houseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
            >
              {/* House Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">{weather.houseName}</span>
                </div>
                {weather.current.cityName && (
                  <Badge variant="secondary" className="text-xs">
                    {weather.current.cityName}, {weather.current.country}
                  </Badge>
                )}
              </div>

              {/* Current Weather */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Temperature and Condition */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.current.condition, 'w-12 h-12')}
                    <div>
                      <div className="text-2xl font-bold">
                        {weather.current.temperature}°C
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Feels like {weather.current.feelsLike}°C
                      </div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{weather.current.condition}</div>
                    <div className="text-muted-foreground capitalize">
                      {weather.current.description}
                    </div>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>{weather.current.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{weather.current.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>{weather.current.pressure} hPa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>{weather.current.visibility} km</span>
                  </div>
                </div>
              </div>

              {/* Sunrise/Sunset */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Sunrise className="w-4 h-4 text-orange-500" />
                  <span>Sunrise: {weather.current.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-orange-600" />
                  <span>Sunset: {weather.current.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Forecast */}
              {weather.forecast && weather.forecast.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">5-Day Forecast</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {weather.forecast.map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                        <div className="text-xs font-medium mb-1">{day.day}</div>
                        <div className="flex justify-center mb-1">
                          {getWeatherIcon(day.condition, 'w-5 h-5')}
                        </div>
                        <div className="text-xs font-bold">{day.temperature}°</div>
                        <div className="text-xs text-muted-foreground">{day.humidity}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error indicator */}
              {weather.error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Weather data may be outdated</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {weatherData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No weather data available</p>
            <p className="text-sm">Add location data to your houses to see weather information</p>
            
            {/* Test with sample data */}
            <div className="mt-4">
              <Button 
                onClick={async () => {
                  try {
                    setLoading(true);
                    // Test with sample coordinates (Delhi)
                    const sampleLocations = [
                      { id: 'test-1', name: 'Delhi Sample', coordinates: [77.2090, 28.6139] },
                      { id: 'test-2', name: 'Mumbai Sample', coordinates: [72.8777, 19.0760] }
                    ];
                    const testResults = await getWeatherForMultipleLocations(sampleLocations);
                    setWeatherData(testResults);
                    setLastUpdated(new Date());
                    toast.success('Sample weather data loaded!');
                  } catch (error) {
                    console.error('Sample weather test failed:', error);
                    toast.error('Sample weather test failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Test with Sample Data
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default WeatherSection;