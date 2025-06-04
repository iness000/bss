import { motion } from 'framer-motion';
import { Droplets, Eye, Gauge, Sunrise, Sunset, Wind } from 'lucide-react';
import { WeatherData } from '../types/weather';
import { formatTime } from '../utils/weatherUtils';

interface WeatherDetailsProps {
  weatherData: WeatherData;
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ weatherData }) => {
  if (!weatherData) return null;
  
  const detailItems = [
    {
      icon: <Droplets size={20} className="text-blue-300" />,
      label: 'Humidity',
      value: `${weatherData.main.humidity}%`,
    },
    {
      icon: <Wind size={20} className="text-blue-300" />,
      label: 'Wind Speed',
      value: `${weatherData.wind.speed} m/s`,
    },
    {
      icon: <Gauge size={20} className="text-blue-300" />,
      label: 'Pressure',
      value: `${weatherData.main.pressure} hPa`,
    },
    {
      icon: <Eye size={20} className="text-blue-300" />,
      label: 'Visibility',
      value: `${(weatherData.visibility / 1000).toFixed(1)} km`,
    },
    {
      icon: <Sunrise size={20} className="text-amber-300" />,
      label: 'Sunrise',
      value: formatTime(weatherData.sys.sunrise),
    },
    {
      icon: <Sunset size={20} className="text-amber-400" />,
      label: 'Sunset',
      value: formatTime(weatherData.sys.sunset),
    },
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="mt-8"
    >
      <h2 className="text-xl font-semibold text-white mb-4">Weather Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {detailItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 + (index * 0.1), duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center"
          >
            <div className="mr-3 bg-white/10 rounded-full p-2">
              {item.icon}
            </div>
            <div>
              <p className="text-white/60 text-sm">{item.label}</p>
              <p className="text-white font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeatherDetails;