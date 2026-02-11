export interface DailyForecast {
  day: string;
  icon: string; // 'sunny' | 'cloudy' | 'rain' | 'storm' | 'partly-cloudy'
  high: number;
  low: number;
}

export interface RainChance {
  time: string;
  percentage: number;
}

export interface WeatherData {
  city: string;
  countryCode: string; // e.g., 'US', 'BR'
  currentTemp: number;
  condition: string; // e.g., 'Partly Cloudy'
  high: number;
  low: number;
  feelsLike: number;
  windSpeed: number; // km/h
  humidity: number; // %
  uvIndex: number;
  uvLevel: string; // 'Low' | 'Moderate' | 'High'
  visibility: number; // km
  rainForecast: RainChance[];
  dailyForecast: DailyForecast[];
  lastUpdated: string;
}
