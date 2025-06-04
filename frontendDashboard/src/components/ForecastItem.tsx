import { motion } from 'framer-motion';
import { formatDayOfWeek, getWeatherType, roundTemp } from '../utils/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface ForecastItemProps {
  date: number;
  minTemp: number;
  maxTemp: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  };
  index: number;
}

const ForecastItem: React.FC<ForecastItemProps> = ({ 
  date, 
  minTemp, 
  maxTemp, 
  weather,
  index
}) => {
  const weatherType = getWeatherType(weather);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="flex flex-col items-center space-y-2 bg-white/10 backdrop-blur-lg rounded-xl p-4 transition-all hover:bg-white/20"
    >
      <p className="text-white/80 font-medium">{formatDayOfWeek(date)}</p>
      
      <div className="my-2">
        <WeatherIcon 
          weatherType={weatherType} 
          size={36} 
          isAnimated={true}
        />
      </div>
      
      <div className="flex space-x-2 text-white">
        <span className="font-medium">{roundTemp(maxTemp)}°</span>
        <span className="text-white/60">{roundTemp(minTemp)}°</span>
      </div>
    </motion.div>
  );
};

export default ForecastItem;