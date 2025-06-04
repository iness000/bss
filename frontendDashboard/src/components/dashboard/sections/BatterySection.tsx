import React from 'react';
import { motion } from 'framer-motion';
import BatterySwapFlow from '../../BatterySwapFlow';
import { SwapSession } from '../../../types/battery';

interface BatterySectionProps {
  swapSession: SwapSession | null;
  setSwapSession: (session: SwapSession | null) => void;
  swapStep: number;
  setSwapStep: (step: number) => void;
  onBack: () => void;
}

const BatterySection: React.FC<BatterySectionProps> = ({
  swapSession,
  setSwapSession,
  swapStep,
  setSwapStep,
  onBack
}) => {
  const handleStepComplete = (step: number) => {
    setSwapStep(step + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BatterySwapFlow
        step={swapStep}
        onBack={onBack}
        onStepComplete={handleStepComplete}
        setStep={setSwapStep}
        swapSession={swapSession}
        setSwapSession={setSwapSession}
      />
    </motion.div>
  );
};

export default BatterySection;