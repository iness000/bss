import { Battery } from 'lucide-react';

interface BatterySlotProps {
  label: string;
  status: 'empty' | 'checking' | 'charged';
}

const BatterySlot: React.FC<BatterySlotProps> = ({ label, status }) => {
  const getSlotStyles = () => {
    switch (status) {
      case 'empty':
        return 'border-2 border-dashed border-blue-400/50';
      case 'checking':
        return 'bg-blue-400/20 animate-pulse';
      case 'charged':
        return 'bg-green-400/20';
      default:
        return '';
    }
  };

  const getBatteryColor = () => {
    switch (status) {
      case 'empty':
        return 'text-blue-400/50';
      case 'checking':
        return 'text-blue-400';
      case 'charged':
        return 'text-green-400';
      default:
        return '';
    }
  };

  return (
    <div className="col-span-1">
      <div className="text-white/60 text-sm mb-2">{label}</div>
      <div className={`w-16 h-28 ${getSlotStyles()} rounded-lg flex items-center justify-center`}>
        <Battery className={`w-8 h-8 ${getBatteryColor()}`} />
      </div>
    </div>
  );
};

export default BatterySlot;