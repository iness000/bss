import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ForecastData, WeatherData } from '../../../types/weather';
import CurrentWeather from '../../CurrentWeather';
import ForecastSection from '../../ForecastSection';
import WeatherDetails from '../../WeatherDetails';

interface WeatherSectionProps {
  onStartBatterySwap: () => void;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ onStartBatterySwap }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = 'f1906f61e481b52c549c16d07b07b26a';

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=Tunisia&appid=${API_KEY}&units=metric`
      );
      setWeather(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Tunisia&appid=${API_KEY}&units=metric`
      );
      setForecast(forecastResponse.data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-white text-xl">
          Loading weather data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-lg text-white p-4 rounded-xl">
        <p>{error}</p>
        <button
          onClick={fetchWeatherData}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weather && <CurrentWeather weatherData={weather} />}
      {forecast && <ForecastSection forecastData={forecast} />}
      {weather && <WeatherDetails weatherData={weather} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <button
          onClick={onStartBatterySwap}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Battery Swap
        </button>
      </motion.div>
    </div>
  );
};

export default WeatherSection;