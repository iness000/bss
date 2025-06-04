import { motion } from 'framer-motion';
import { ForecastData } from '../types/weather';
import { groupForecastByDay } from '../utils/weatherUtils';
import ForecastItem from './ForecastItem';

interface ForecastSectionProps {
  forecastData: ForecastData;
}

const ForecastSection: React.FC<ForecastSectionProps> = ({ forecastData }) => {
  if (!forecastData) return null;
  
  // Group forecast by day and limit to 5 days
  const dailyForecast = groupForecastByDay(forecastData.list).slice(0, 5);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mt-8"
    >
      <h2 className="text-xl font-semibold text-white mb-4">5-Day Forecast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {dailyForecast.map((day, index) => (
          <ForecastItem
            key={day.date}
            date={day.date}
            minTemp={day.minTemp}
            maxTemp={day.maxTemp}
            weather={day.weather}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ForecastSection;