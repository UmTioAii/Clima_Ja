import { WeatherData, DailyForecast, RainChance } from "../types";

const API_KEY = "419a17a1e5054f5d37e144dc61c88e07";

// Dados de fallback em caso de falha na API
const FALLBACK_DATA: WeatherData = {
  city: "São Paulo",
  countryCode: "BR",
  currentTemp: 24,
  condition: "Parcialmente Nublado",
  high: 28,
  low: 19,
  feelsLike: 26,
  windSpeed: 12,
  humidity: 64,
  uvIndex: 5,
  uvLevel: "Moderado",
  visibility: 10,
  rainForecast: [
    { time: "10:00", percentage: 15 },
    { time: "13:00", percentage: 45 },
    { time: "16:00", percentage: 80 },
  ],
  dailyForecast: [
    { day: "SEG", icon: "sunny", high: 28, low: 19 },
    { day: "TER", icon: "cloudy", high: 25, low: 18 },
    { day: "QUA", icon: "rain", high: 22, low: 17 },
    { day: "QUI", icon: "cloudy", high: 24, low: 18 },
    { day: "SEX", icon: "partly-cloudy", high: 26, low: 19 },
  ],
  lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
};

const getIconType = (id: number): string => {
  if (id >= 200 && id < 300) return 'storm';
  if (id >= 300 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'rain'; // Neve -> simplificado para chuva/frio no ícone
  if (id >= 700 && id < 800) return 'cloudy'; // Atmosfera (Névoa, etc.)
  if (id === 800) return 'sunny';
  if (id === 801 || id === 802) return 'partly-cloudy';
  if (id >= 803) return 'cloudy';
  return 'sunny';
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  try {
    // 1. Buscar Clima Atual (Adicionado &lang=pt_br)
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`
    );

    // 2. Buscar Previsão (5 Dias / 3 Horas) (Adicionado &lang=pt_br)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${API_KEY}`
    );

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error("Falha ao buscar dados do OpenWeatherMap");
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    // --- Mapear Clima Atual ---
    const currentTemp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Converter m/s para km/h
    const humidity = weatherData.main.humidity;
    const visibility = Math.round((weatherData.visibility || 10000) / 1000); // metros para km
    const condition = capitalizeFirstLetter(weatherData.weather[0].description); // Descrição em PT-BR
    const countryCode = weatherData.sys.country;

    // --- Processar Previsão de Chuva ---
    // Pegar os próximos 4 segmentos (aprox 12 horas)
    const rainForecast: RainChance[] = forecastData.list.slice(0, 4).map((item: any) => {
      const date = new Date(item.dt * 1000);
      return {
        // Formato brasileiro de hora (HH:mm)
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        percentage: Math.round((item.pop || 0) * 100)
      };
    });

    // --- Processar Previsão Diária (Máx/Mín) ---
    const groupedByDay: { [key: string]: { min: number; max: number; icon: number; dayName: string } } = {};
    
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groupedByDay[dayKey]) {
        // Formatar dia da semana em PT-BR e remover o ponto (ex: 'seg.' -> 'SEG')
        let dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
        
        groupedByDay[dayKey] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].id,
          dayName: dayName
        };
      } else {
        groupedByDay[dayKey].min = Math.min(groupedByDay[dayKey].min, item.main.temp_min);
        groupedByDay[dayKey].max = Math.max(groupedByDay[dayKey].max, item.main.temp_max);
        
        // Priorizar ícone do meio do dia (11:00 - 15:00) para melhor representação
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

    // --- Determinar Máxima/Mínima de Hoje ---
    const todayKey = new Date().toISOString().split('T')[0];
    const todayStats = groupedByDay[todayKey];
    
    const high = todayStats ? Math.round(todayStats.max) : Math.round(weatherData.main.temp_max);
    const low = todayStats ? Math.round(todayStats.min) : Math.round(weatherData.main.temp_min);

    // --- Retornar Objeto Completo ---
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
      uvIndex: 4, // API Padrão não fornece índice UV gratuitamente
      uvLevel: "Moderado",
      visibility,
      rainForecast,
      dailyForecast: finalDailyForecast,
      lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return { ...FALLBACK_DATA, city };
  }
};