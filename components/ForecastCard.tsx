import React from 'react';
import { DailyForecast } from '../types';
import { WeatherIcon } from './Icons';

interface ForecastCardProps {
  data: DailyForecast;
  isActive?: boolean;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ data, isActive = false }) => {
  return (
    <div 
      className={`
        flex-1 min-w-[100px] rounded-[24px] p-4 flex flex-col items-center justify-between aspect-[3/4]
        transition-all duration-300 cursor-pointer
        ${isActive 
          ? 'bg-[#1C2533] border border-blue-500/50 shadow-lg shadow-blue-500/10' 
          : 'bg-[#202B3B] hover:bg-[#2A3749] border border-transparent'}
      `}
    >
      <span className={`text-sm font-semibold uppercase ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
        {data.day}
      </span>
      
      <div className={`${isActive ? 'text-yellow-400' : 'text-gray-200'}`}>
        <WeatherIcon type={data.icon} size={32} />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-white">{Math.round(data.high)}°</span>
        <span className="text-sm text-gray-500">{Math.round(data.low)}°</span>
      </div>
    </div>
  );
};

export default ForecastCard;