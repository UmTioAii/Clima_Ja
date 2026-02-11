import React from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  CloudSun, 
  Wind, 
  Droplets, 
  Eye, 
  SunDim,
  MapPin,
  Search,
  Bell,
  Navigation
} from 'lucide-react';

interface WeatherIconProps {
  type: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ type, className, size = 24 }) => {
  const normalizedType = type.toLowerCase().replace(' ', '-');
  
  switch (true) {
    case normalizedType.includes('rain'):
    case normalizedType.includes('drizzle'):
      return <CloudRain className={className} size={size} />;
    case normalizedType.includes('storm'):
    case normalizedType.includes('thunder'):
      return <CloudLightning className={className} size={size} />;
    case normalizedType.includes('partly'):
    case normalizedType.includes('cloudy') && normalizedType.includes('sun'):
      return <CloudSun className={className} size={size} />;
    case normalizedType.includes('cloud'):
    case normalizedType.includes('overcast'):
      return <Cloud className={className} size={size} />;
    case normalizedType.includes('sun'):
    case normalizedType.includes('clear'):
      return <Sun className={className} size={size} />;
    default:
      return <Sun className={className} size={size} />;
  }
};

export { 
  Wind, 
  Droplets, 
  Eye, 
  SunDim, 
  MapPin, 
  Search, 
  Bell, 
  Navigation 
};