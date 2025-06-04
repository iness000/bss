import { motion } from 'framer-motion';
import { WeatherData } from '../types/weather';
import { formatDate, getCurrentTime, getWeatherType, isDayTime, roundTemp } from '../utils/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface CurrentWeatherProps {
  weatherData: WeatherData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weatherData }) => {
  if (!weatherData) return null;
  
  const weatherType = getWeatherType(weatherData.weather[0]);
  const daytime = isDayTime(
    weatherData.dt,
    weatherData.sys.sunrise,
    weatherData.sys.sunset
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-white">{weatherData.name}</h1>
          <div className="flex items-center mt-1">
            <p className="text-lg text-white/80">{formatDate(weatherData.dt)}</p>
            <p className="mx-2 text-white/60">•</p>
            <p className="text-lg text-white/80">{getCurrentTime()}</p>
          </div>
        </div>
        
        <div className="flex items-center mt-4 lg:mt-0">
          <div className="text-center lg:text-right">
            <p className="text-xl text-white/80">{weatherData.weather[0].description}</p>
            <p className="text-white/70 text-sm">
              Feels like {roundTemp(weatherData.main.feels_like)}°C
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between mt-6">
        <div className="flex items-center mb-6 md:mb-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mr-4"
          >
            <WeatherIcon 
              weatherType={weatherType} 
              size={80} 
              isAnimated={true} 
              isDaytime={daytime}
            />
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-6xl md:text-7xl font-bold text-white"
            >
              {roundTemp(weatherData.main.temp)}°
            </motion.h2>
            <div className="flex text-white/80 text-lg space-x-2 mt-1">
              <span>H: {roundTemp(weatherData.main.temp_max)}°</span>
              <span>L: {roundTemp(weatherData.main.temp_min)}°</span>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-2 gap-6"
        >
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-lg rounded-xl p-3 min-w-[120px]">
            <span className="text-white/60 text-sm">Humidity</span>
            <span className="text-white font-medium text-xl">{weatherData.main.humidity}%</span>
          </div>
          
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-lg rounded-xl p-3 min-w-[120px]">
            <span className="text-white/60 text-sm">Wind</span>
            <span className="text-white font-medium text-xl">{weatherData.wind.speed} m/s</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CurrentWeather;