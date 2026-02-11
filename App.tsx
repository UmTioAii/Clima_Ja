import React, { useState, useEffect, useCallback } from 'react';
import { WeatherData } from './types';
import { fetchWeather } from './services/weatherService';
import { WeatherIcon, Search, Bell, Wind, Droplets, SunDim, Eye, Navigation } from './components/Icons';
import ForecastCard from './components/ForecastCard';
import StatCard from './components/StatCard';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCity, setActiveCity] = useState<string>('São Paulo');

  const loadWeather = useCallback(async (city: string) => {
    setLoading(true);
    const data = await fetchWeather(city);
    setWeather(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Tenta obter localização do usuário, senão usa padrão
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Em um app real, faríamos reverse geocoding.
          // Aqui mantemos o padrão visual solicitado, iniciando com São Paulo se não buscar.
          loadWeather("São Paulo"); 
        },
        (error) => {
          loadWeather("São Paulo");
        }
      );
    } else {
      loadWeather("São Paulo");
    }
  }, [loadWeather]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCity(searchQuery);
      loadWeather(searchQuery);
    }
  };

  if (!weather && loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!weather) return null;

  const today = new Date();
  // Formatação de data em Português
  const dateString = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  // Capitalizar a primeira letra da data (opcional, pois pt-BR retorna minúsculas)
  const formattedDateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-blue-500 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Clima Já</h1>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl w-full relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar cidade (ex: São Paulo, Rio de Janeiro)..."
            className="w-full bg-[#1C2533] border border-transparent focus:border-blue-500/50 rounded-2xl py-3 pl-12 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <button className="p-3 bg-[#1C2533] rounded-xl hover:bg-[#253042] transition-colors border border-white/5 relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-[#1C2533]"></span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column - Main Weather Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <div className="bg-app-card rounded-[32px] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/20 border border-white/5">
            {/* Background Gradient Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{weather.city}, {weather.countryCode}</h2>
                <p className="text-gray-400">{formattedDateString} | {weather.lastUpdated}</p>
              </div>
              <div className="bg-blue-600/20 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-500/20 animate-pulse">
                Ao Vivo
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
              <div className="text-[6rem] md:text-[8rem] font-bold leading-none tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {Math.round(weather.currentTemp)}°
              </div>
              <div className="flex flex-col items-center md:items-start mb-6">
                 <div className="text-yellow-400 mb-2">
                    <WeatherIcon type={weather.condition} size={48} />
                 </div>
                 <span className="text-2xl font-medium text-white mb-1">{weather.condition}</span>
                 <span className="text-gray-400">Sensação {Math.round(weather.feelsLike)}° • Máx: {Math.round(weather.high)}° Mín: {Math.round(weather.low)}°</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Vento" 
              value={`${weather.windSpeed} km/h`} 
              Icon={Wind} 
              iconColor="text-blue-400"
            />
            <StatCard 
              label="Umidade" 
              value={`${weather.humidity}%`} 
              Icon={Droplets} 
              iconColor="text-cyan-400"
            />
            <StatCard 
              label="Índice UV" 
              value={`${weather.uvIndex}`} 
              subValue={weather.uvLevel}
              Icon={SunDim} 
              iconColor="text-yellow-400"
            />
            <StatCard 
              label="Visibilidade" 
              value={`${weather.visibility} km`} 
              Icon={Eye} 
              iconColor="text-purple-400"
            />
          </div>
        </div>

        {/* Right Column - Map & Rain Chance */}
        <div className="space-y-6 flex flex-col">
          
          {/* Radar/Map Widget */}
          <div className="bg-app-card rounded-[32px] p-0 overflow-hidden relative h-64 border border-white/5 group shadow-lg">
             {/* Simulating a dark map style */}
             <div className="absolute inset-0 bg-[#162032] opacity-100">
                <div className="absolute w-full h-full opacity-20" 
                     style={{
                        backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                     }}>
                </div>
                <svg className="absolute inset-0 w-full h-full stroke-gray-600 opacity-20" strokeWidth="1">
                   <path fill="none" d="M0,50 Q100,100 200,50 T400,100" />
                   <path fill="none" d="M50,0 Q100,100 50,200 T100,400" />
                   <path fill="none" d="M200,0 L200,400" />
                   <path fill="none" d="M0,200 L400,200" />
                   <circle cx="200" cy="150" r="80" stroke="#3B82F6" strokeWidth="2" fill="none" className="opacity-40" />
                </svg>
             </div>
             
             <div className="absolute top-0 left-0 p-6 w-full h-full flex flex-col justify-between z-10 bg-gradient-to-t from-black/60 to-transparent">
               <div></div>
               <div className="flex justify-between items-end">
                 <span className="font-semibold text-white">Radar Meteorológico</span>
                 <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full transition-transform transform group-hover:scale-110">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                 </button>
               </div>
             </div>
          </div>

          {/* Chance of Rain */}
          <div className="bg-app-card rounded-[32px] p-6 flex-1 flex flex-col justify-center border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <div className="text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">Probabilidade de Chuva</h3>
            </div>

            <div className="space-y-6">
              {weather.rainForecast.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">{item.time}</span>
                    <span className="text-white font-bold">{item.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#151D29] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Previsão Semanal</h3>
        <div className="flex flex-wrap md:flex-nowrap gap-4 overflow-x-auto pb-4">
          {weather.dailyForecast.map((day, index) => (
            <ForecastCard 
              key={day.day} 
              data={day} 
              isActive={index === 0} 
            />
          ))}
        </div>
      </div>

      {/* Floating Action Button (Map) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-blue-500 hover:bg-blue-400 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
           <Navigation size={24} fill="white" />
        </button>
      </div>

    </div>
  );
};

export default App;