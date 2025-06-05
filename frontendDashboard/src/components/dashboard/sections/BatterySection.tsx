import React from 'react';
import { motion } from 'framer-motion';
import BatterySwapFlow from '../../BatterySwapFlow';
import { SwapSession } from '../../../types/battery';

interface BatterySectionProps {
  swapSession: SwapSession | null;
  setSwapSession: React.Dispatch<React.SetStateAction<SwapSession | null>>;
  
  onBack: () => void;
}

const BatterySection: React.FC<BatterySectionProps> = ({
  swapSession,
  setSwapSession,
  
  onBack
}) => {
  console.log('[BatterySection] Rendering');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BatterySwapFlow
        
        onBack={onBack}
        
        swapSession={swapSession}
        setSwapSession={setSwapSession}
      />
    </motion.div>
  );
};

export default BatterySection;