import { motion } from 'framer-motion';
import { 
  Cloud, 
  CloudDrizzle, 
  CloudFog, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  Sun,
  CloudSun,
  Wind
} from 'lucide-react';
import { WeatherType } from '../types/weather';

interface WeatherIconProps {
  weatherType: WeatherType;
  size?: number;
  className?: string;
  isAnimated?: boolean;
  isDaytime?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  weatherType, 
  size = 24, 
  className = '',
  isAnimated = true,
  isDaytime = true
}) => {
  // Animation properties
  const floatAnimation = isAnimated ? {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};
  
  const pulseAnimation = isAnimated ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};
  
  const getIconColor = () => {
    switch (weatherType) {
      case 'Clear':
        return isDaytime ? 'text-amber-400' : 'text-amber-200';
      case 'Clouds':
        return 'text-gray-300';
      case 'Rain':
      case 'Drizzle':
        return 'text-blue-300';
      case 'Snow':
        return 'text-blue-100';
      case 'Thunderstorm':
        return 'text-purple-300';
      default:
        return 'text-gray-300';
    }
  };
  
  const renderIcon = () => {
    switch (weatherType) {
      case 'Clear':
        return <Sun size={size} className={`${getIconColor()} ${className}`} />;
      case 'Clouds':
        return isDaytime ? 
          <CloudSun size={size} className={`${getIconColor()} ${className}`} /> : 
          <Cloud size={size} className={`${getIconColor()} ${className}`} />;
      case 'Rain':
        return <CloudRain size={size} className={`${getIconColor()} ${className}`} />;
      case 'Drizzle':
        return <CloudDrizzle size={size} className={`${getIconColor()} ${className}`} />;
      case 'Snow':
        return <CloudSnow size={size} className={`${getIconColor()} ${className}`} />;
      case 'Thunderstorm':
        return <CloudLightning size={size} className={`${getIconColor()} ${className}`} />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <CloudFog size={size} className={`${getIconColor()} ${className}`} />;
      case 'Dust':
      case 'Smoke':
      case 'Tornado':
        return <Wind size={size} className={`${getIconColor()} ${className}`} />;
      default:
        return <Cloud size={size} className={`${getIconColor()} ${className}`} />;
    }
  };
  
  return (
    <motion.div
      animate={weatherType === 'Clear' ? pulseAnimation : floatAnimation}
      className="inline-flex items-center justify-center"
    >
      {renderIcon()}
    </motion.div>
  );
};

export default WeatherIcon;