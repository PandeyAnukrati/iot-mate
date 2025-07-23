// services/weatherService.js
const WEATHER_API_KEY = '895284fb2d2c50a520ea537456963d15'; // OpenWeatherMap API key
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Alternative API endpoints
const ALTERNATIVE_WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

// Fallback weather function using Open-Meteo API (no API key required)
const getWeatherFromOpenMeteo = async (lat, lon, location = 'Unknown') => {
  try {
    console.log(`🌤️ Fetching weather from Open-Meteo for coordinates: ${lat}, ${lon}`);
    
    const url = `${ALTERNATIVE_WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    console.log('🌤️ Open-Meteo URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🌤️ Open-Meteo data:', data);
    
    // Map weather codes to conditions
    const getWeatherCondition = (code) => {
      if (code <= 3) return 'Clear';
      if (code <= 48) return 'Cloudy';
      if (code <= 67) return 'Rain';
      if (code <= 77) return 'Snow';
      if (code <= 82) return 'Rain';
      if (code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };
    
    const currentCondition = getWeatherCondition(data.current.weather_code);
    
    return {
      location: location,
      coordinates: { lat, lon },
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.temperature_2m), // Open-Meteo doesn't provide feels_like
        humidity: data.current.relative_humidity_2m,
        pressure: 1013, // Default pressure as Open-Meteo doesn't provide it in free tier
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        visibility: 10, // Default visibility
        condition: currentCondition,
        description: currentCondition.toLowerCase(),
        icon: '01d', // Default icon
        sunrise: new Date(),
        sunset: new Date(),
        cityName: location,
        country: 'XX'
      },
      forecast: data.daily.weather_code.slice(0, 5).map((code, index) => ({
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
        day: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: Math.round(data.daily.temperature_2m_max[index]),
        condition: getWeatherCondition(code),
        description: getWeatherCondition(code).toLowerCase(),
        icon: '01d',
        humidity: 50, // Default humidity
        windSpeed: Math.round(data.current.wind_speed_10m)
      })),
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Open-Meteo API error:', error);
    throw error;
  }
};

// Cache for weather data to avoid excessive API calls
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const getWeatherByCoordinates = async (lat, lon, location = 'Unknown') => {
  const cacheKey = `${lat},${lon}`;
  
  // Check cache first
  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  try {
    console.log(`🌤️ Fetching weather for coordinates: ${lat}, ${lon}`);
    
    // Get current weather
    const currentWeatherUrl = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log('🌤️ Current weather URL:', currentWeatherUrl);
    
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    
    if (!currentWeatherResponse.ok) {
      const errorText = await currentWeatherResponse.text();
      console.error('❌ Weather API error:', currentWeatherResponse.status, errorText);
      throw new Error(`Weather API error: ${currentWeatherResponse.status} - ${errorText}`);
    }
    
    const currentWeatherData = await currentWeatherResponse.json();
    console.log('🌤️ Current weather data:', currentWeatherData);
    
    // Get forecast data
    const forecastUrl = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log('🌤️ Forecast URL:', forecastUrl);
    
    const forecastResponse = await fetch(forecastUrl);
    
    let forecastData = null;
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
      console.log('🌤️ Forecast data:', forecastData);
    } else {
      console.warn('⚠️ Forecast API failed:', forecastResponse.status);
    }
    
    // Process the data
    const weatherInfo = {
      location: location,
      coordinates: { lat, lon },
      current: {
        temperature: Math.round(currentWeatherData.main.temp),
        feelsLike: Math.round(currentWeatherData.main.feels_like),
        humidity: currentWeatherData.main.humidity,
        pressure: currentWeatherData.main.pressure,
        windSpeed: Math.round(currentWeatherData.wind?.speed * 3.6 || 0), // Convert m/s to km/h
        windDirection: currentWeatherData.wind?.deg || 0,
        visibility: currentWeatherData.visibility ? Math.round(currentWeatherData.visibility / 1000) : 0, // Convert m to km
        condition: currentWeatherData.weather[0].main,
        description: currentWeatherData.weather[0].description,
        icon: currentWeatherData.weather[0].icon,
        sunrise: new Date(currentWeatherData.sys.sunrise * 1000),
        sunset: new Date(currentWeatherData.sys.sunset * 1000),
        cityName: currentWeatherData.name,
        country: currentWeatherData.sys.country
      },
      forecast: forecastData ? processForecastData(forecastData) : [],
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the result
    weatherCache.set(cacheKey, {
      data: weatherInfo,
      timestamp: Date.now()
    });
    
    return weatherInfo;
    
  } catch (error) {
    console.error('❌ OpenWeatherMap API failed:', error);
    
    // Try fallback API (Open-Meteo)
    try {
      console.log('🔄 Trying fallback weather API...');
      const fallbackData = await getWeatherFromOpenMeteo(lat, lon, location);
      
      // Cache the fallback result
      weatherCache.set(cacheKey, {
        data: fallbackData,
        timestamp: Date.now()
      });
      
      return fallbackData;
    } catch (fallbackError) {
      console.error('❌ Fallback weather API also failed:', fallbackError);
      
      // Return fallback data with error indicator
      return {
        location: location,
        coordinates: { lat, lon },
        current: {
          temperature: 20,
          feelsLike: 20,
          humidity: 50,
          pressure: 1013,
          windSpeed: 10,
          windDirection: 0,
          visibility: 10,
          condition: 'Unknown',
          description: 'Weather data unavailable',
          icon: '01d',
          sunrise: new Date(),
          sunset: new Date(),
          cityName: 'Unknown',
          country: 'XX'
        },
        forecast: [],
        lastUpdated: new Date().toISOString(),
        error: `Both APIs failed: ${error.message} | ${fallbackError.message}`
      };
    }
  }
};

// Process forecast data to get daily forecasts
const processForecastData = (forecastData) => {
  const dailyForecasts = [];
  const processedDates = new Set();
  
  forecastData.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const dateString = date.toDateString();
    
    // Skip if we already processed this date
    if (processedDates.has(dateString)) {
      return;
    }
    
    processedDates.add(dateString);
    
    // Only take the first 5 days
    if (dailyForecasts.length < 5) {
      dailyForecasts.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: Math.round(forecast.main.temp),
        condition: forecast.weather[0].main,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        humidity: forecast.main.humidity,
        windSpeed: Math.round(forecast.wind?.speed * 3.6 || 0)
      });
    }
  });
  
  return dailyForecasts;
};

// Get weather for multiple locations
export const getWeatherForMultipleLocations = async (locations) => {
  const promises = locations.map(async (location) => {
    const weather = await getWeatherByCoordinates(
      location.coordinates[1], // latitude
      location.coordinates[0], // longitude
      location.name
    );
    return {
      ...weather,
      houseId: location.id,
      houseName: location.name
    };
  });
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching weather for multiple locations:', error);
    return [];
  }
};

// Get weather icon URL
export const getWeatherIconUrl = (icon, size = '2x') => {
  return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
};

// Get weather condition icon (for local icons)
export const getWeatherConditionIcon = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  const iconMap = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️',
    'dust': '🌫️',
    'sand': '🌫️',
    'ash': '🌫️',
    'squall': '🌪️',
    'tornado': '🌪️'
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (conditionLower.includes(key)) {
      return icon;
    }
  }
  
  return '🌤️'; // Default icon
};

// Clear cache (useful for testing or manual refresh)
export const clearWeatherCache = () => {
  weatherCache.clear();
};

// Test function to verify weather service is working
export const testWeatherService = async () => {
  try {
    // Test with Delhi coordinates
    const testData = await getWeatherByCoordinates(28.6139, 77.2090, 'Delhi, India');
    console.log('✅ Weather service test successful:', testData);
    return testData;
  } catch (error) {
    console.error('❌ Weather service test failed:', error);
    throw error;
  }
};