import { format, fromUnixTime } from 'date-fns';
import { WeatherCondition, WeatherType } from '../types/weather';

// Format date from unix timestamp
export const formatDate = (unixTimestamp: number): string => {
  const date = fromUnixTime(unixTimestamp);
  return format(date, 'EEEE, MMMM d');
};

// Format time from unix timestamp
export const formatTime = (unixTimestamp: number): string => {
  const date = fromUnixTime(unixTimestamp);
  return format(date, 'h:mm a');
};

// Get current time
export const getCurrentTime = (): string => {
  return format(new Date(), 'h:mm a');
};

// Get current date
export const getCurrentDate = (): string => {
  return format(new Date(), 'EEEE, MMMM d');
};

// Format day of week from unix timestamp
export const formatDayOfWeek = (unixTimestamp: number): string => {
  const date = fromUnixTime(unixTimestamp);
  return format(date, 'EEEE');
};

// Round temperature to nearest integer
export const roundTemp = (temp: number): number => {
  return Math.round(temp);
};

// Convert weather condition to an appropriate type
export const getWeatherType = (condition?: WeatherCondition): WeatherType => {
  if (!condition) return 'Unknown';
  
  const weatherMain = condition.main;
  
  if (weatherMain.includes('Clear')) return 'Clear';
  if (weatherMain.includes('Cloud')) return 'Clouds';
  if (weatherMain.includes('Rain')) return 'Rain';
  if (weatherMain.includes('Snow')) return 'Snow';
  if (weatherMain.includes('Mist')) return 'Mist';
  if (weatherMain.includes('Fog')) return 'Fog';
  if (weatherMain.includes('Haze')) return 'Haze';
  if (weatherMain.includes('Thunderstorm')) return 'Thunderstorm';
  if (weatherMain.includes('Drizzle')) return 'Drizzle';
  if (weatherMain.includes('Dust')) return 'Dust';
  if (weatherMain.includes('Smoke')) return 'Smoke';
  if (weatherMain.includes('Tornado')) return 'Tornado';
  
  return 'Unknown';
};

// Get background gradient based on weather and time
export const getBackgroundGradient = (weatherType: WeatherType, isDay: boolean): string => {
  if (isDay) {
    switch (weatherType) {
      case 'Clear':
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
      case 'Clouds':
        return 'bg-gradient-to-br from-blue-300 to-gray-500';
      case 'Rain':
      case 'Drizzle':
        return 'bg-gradient-to-br from-gray-400 to-gray-700';
      case 'Snow':
        return 'bg-gradient-to-br from-blue-100 to-gray-300';
      case 'Thunderstorm':
        return 'bg-gradient-to-br from-gray-600 to-gray-900';
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return 'bg-gradient-to-br from-gray-300 to-gray-500';
      default:
        return 'bg-gradient-to-br from-blue-400 to-blue-600';
    }
  } else {
    // Night gradients
    switch (weatherType) {
      case 'Clear':
        return 'bg-gradient-to-br from-blue-900 to-indigo-950';
      case 'Clouds':
        return 'bg-gradient-to-br from-gray-700 to-gray-900';
      case 'Rain':
      case 'Drizzle':
        return 'bg-gradient-to-br from-gray-800 to-gray-950';
      case 'Snow':
        return 'bg-gradient-to-br from-gray-600 to-blue-900';
      case 'Thunderstorm':
        return 'bg-gradient-to-br from-gray-800 to-gray-950';
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return 'bg-gradient-to-br from-gray-700 to-gray-900';
      default:
        return 'bg-gradient-to-br from-blue-900 to-indigo-950';
    }
  }
};

// Get day or night based on sunrise and sunset
export const isDayTime = (
  currentTime: number,
  sunrise: number,
  sunset: number
): boolean => {
  return currentTime >= sunrise && currentTime <= sunset;
};

// Group forecast items by day
export const groupForecastByDay = (forecastList: any[]): any[] => {
  const grouped: Record<string, any[]> = {};
  
  forecastList.forEach(item => {
    const date = fromUnixTime(item.dt);
    const day = format(date, 'yyyy-MM-dd');
    
    if (!grouped[day]) {
      grouped[day] = [];
    }
    
    grouped[day].push(item);
  });
  
  return Object.values(grouped).map(dayItems => {
    // Find min and max temperatures for the day
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let weatherCondition = dayItems[0].weather[0];
    
    dayItems.forEach(item => {
      if (item.main.temp_min < minTemp) {
        minTemp = item.main.temp_min;
      }
      if (item.main.temp_max > maxTemp) {
        maxTemp = item.main.temp_max;
      }
      
      // Prioritize daytime weather condition for the icon
      if (item.sys.pod === 'd') {
        weatherCondition = item.weather[0];
      }
    });
    
    return {
      date: dayItems[0].dt,
      minTemp,
      maxTemp,
      weather: weatherCondition,
      items: dayItems
    };
  });
};