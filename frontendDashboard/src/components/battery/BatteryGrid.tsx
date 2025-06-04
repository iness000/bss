import { useEffect, useState } from 'react';
import { BatteryStatus, SwapSession } from '../../types/battery';
import { batteryApi } from '../../api/batteryApi';
import BatterySlot from './BatterySlot';

interface BatteryGridProps {
  step: number;
  swapSession: SwapSession | null;
}

const BatteryGrid: React.FC<BatteryGridProps> = ({ step, swapSession }) => {
  const [slots, setSlots] = useState<BatteryStatus[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const availableSlots = await batteryApi.getAvailableSlot();
        setSlots(availableSlots);
      } catch (error) {
        console.error('Failed to fetch battery slots:', error);
      }
    };

    if (step === 2) {
      fetchSlots();
    }
  }, [step]);

  if (step < 2 || step > 4) return null;

  const getSlotStatus = (slotId: string) => {
    const slot = slots.find(s => s.slotId === slotId);
    
    if (!slot) return 'empty';
    
    switch (step) {
      case 2:
        return slot.isAvailable ? 'empty' : 'charged';
      case 3:
        return swapSession?.returnedBatterySlot === slotId ? 'checking' : 'empty';
      case 4:
        return swapSession?.newBatterySlot === slotId ? 'charged' : 'empty';
      default:
        return 'empty';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {slots.map((slot) => (
        <BatterySlot
          key={slot.slotId}
          label={slot.slotId}
          status={getSlotStatus(slot.slotId)}
        />
      ))}
    </div>
  );
};

export default BatteryGrid;