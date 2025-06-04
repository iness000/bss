import { Battery } from 'lucide-react';

interface BatteryHealthDisplayProps {
  soh: number; // State of Health percentage
  soc: number; // State of Charge percentage
  temperature: number; // Temperature in Celsius
}

const BatteryHealthDisplay: React.FC<BatteryHealthDisplayProps> = ({ 
  soh, 
  soc, 
  temperature 
}) => {
  const getSohColor = (soh: number) => {
    if (soh >= 80) return 'text-green-400';
    if (soh >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSocColor = (soc: number) => {
    if (soc >= 70) return 'text-green-400';
    if (soc >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTempColor = (temp: number) => {
    if (temp <= 35) return 'text-blue-400';
    if (temp <= 45) return 'text-green-400';
    if (temp <= 55) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-700/50 backdrop-blur-lg rounded-xl p-6 max-w-xs mx-auto mb-6">
      <div className="flex justify-center mb-4">
        <Battery className="w-8 h-8 text-green-400" />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">SOH:</span>
          <span className={`font-bold text-lg ${getSohColor(soh)}`}>
            {soh}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">SOC:</span>
          <span className={`font-bold text-lg ${getSocColor(soc)}`}>
            {soc}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/80 text-sm">🌡️</span>
          <span className={`font-bold text-lg ${getTempColor(temperature)}`}>
            {temperature}°C
          </span>
        </div>
      </div>
      
      {/* Health indicator bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              soh >= 80 ? 'bg-green-400' : 
              soh >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${soh}%` }}
          ></div>
        </div>
        <p className="text-xs text-white/60 mt-1 text-center">Battery Health</p>
      </div>
    </div>
  );
};

export default BatteryHealthDisplay;