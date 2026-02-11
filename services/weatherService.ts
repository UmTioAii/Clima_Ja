import { WeatherData, DailyForecast, RainChance } from "../types";

const API_KEY = "419a17a1e5054f5d37e144dc61c88e07";

// Default fallback data in case of API failure
const FALLBACK_DATA: WeatherData = {
  city: "San Francisco",
  countryCode: "US",
  currentTemp: 19,
  condition: "Partly Cloudy",
  high: 22,
  low: 14,
  feelsLike: 17,
  windSpeed: 12,
  humidity: 64,
  uvIndex: 4,
  uvLevel: "Moderate",
  visibility: 10,
  rainForecast: [
    { time: "10 AM", percentage: 15 },
    { time: "1 PM", percentage: 45 },
    { time: "4 PM", percentage: 80 },
  ],
  dailyForecast: [
    { day: "MON", icon: "sunny", high: 22, low: 14 },
    { day: "TUE", icon: "cloudy", high: 19, low: 13 },
    { day: "WED", icon: "rain", high: 17, low: 11 },
    { day: "THU", icon: "cloudy", high: 20, low: 15 },
    { day: "FRI", icon: "partly-cloudy", high: 24, low: 16 },
  ],
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const getIconType = (id: number): string => {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'rain'; // Snow -> simplified to rain
  if (id >= 700 && id < 800) return 'cloudy'; // Atmosphere (Mist, Fog, etc.)
  if (id === 800) return 'sunny';
  if (id === 801 || id === 802) return 'partly-cloudy';
  if (id >= 803) return 'cloudy';
  return 'sunny';
};

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  try {
    // 1. Fetch Current Weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    // 2. Fetch Forecast (5 Day / 3 Hour)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error("Failed to fetch weather data from OpenWeatherMap");
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    // --- Map Current Weather ---
    const currentTemp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convert m/s to km/h
    const humidity = weatherData.main.humidity;
    const visibility = Math.round((weatherData.visibility || 10000) / 1000); // meters to km
    const condition = weatherData.weather[0].main; // 'Rain', 'Clouds', 'Clear'
    const countryCode = weatherData.sys.country;

    // --- Process Forecast for Rain Chance ---
    // Take the next 4 segments (approx 12 hours)
    const rainForecast: RainChance[] = forecastData.list.slice(0, 4).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
        percentage: Math.round((item.pop || 0) * 100)
      };
    });

    // --- Process Forecast for Daily High/Low ---
    const groupedByDay: { [key: string]: { min: number; max: number; icon: number; dayName: string } } = {};
    
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groupedByDay[dayKey]) {
        groupedByDay[dayKey] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].id,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
        };
      } else {
        groupedByDay[dayKey].min = Math.min(groupedByDay[dayKey].min, item.main.temp_min);
        groupedByDay[dayKey].max = Math.max(groupedByDay[dayKey].max, item.main.temp_max);
        
        // Prioritize icon from mid-day (11 AM - 3 PM) for better representation
        if (date.getHours() >= 11 && date.getHours() <= 15) {
          groupedByDay[dayKey].icon = item.weather[0].id;
        }
      }
    });

    const finalDailyForecast: DailyForecast[] = Object.values(groupedByDay).map(d => ({
      day: d.dayName,
      icon: getIconType(d.icon),
      high: Math.round(d.max),
      low: Math.round(d.min)
    }));

    // --- Determine Today's High/Low ---
    const todayKey = new Date().toISOString().split('T')[0];
    const todayStats = groupedByDay[todayKey];
    
    // Use forecast aggregation if available, otherwise current weather stats (which are less precise for daily high/low)
    const high = todayStats ? Math.round(todayStats.max) : Math.round(weatherData.main.temp_max);
    const low = todayStats ? Math.round(todayStats.min) : Math.round(weatherData.main.temp_min);

    // --- Return Full Object ---
    return {
      city: weatherData.name,
      countryCode,
      currentTemp,
      condition,
      high,
      low,
      feelsLike,
      windSpeed,
      humidity,
      uvIndex: 4, // OWM Standard API does not provide UV index freely, simplified to mock
      uvLevel: "Moderate",
      visibility,
      rainForecast,
      dailyForecast: finalDailyForecast,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error) {
    console.error("Error fetching weather:", error);
    // Return fallback with the requested city name so the UI doesn't break completely
    return { ...FALLBACK_DATA, city };
  }
};