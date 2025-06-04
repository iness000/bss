import { motion } from 'framer-motion';
import { Battery, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { useState } from 'react';
import BatteryHealthDisplay from './BatteryHealthDisplay';

interface StepContentProps {
  step: number;
  onBack?: () => void;
  onNext: () => void;
  onRFIDScanned?: (token: string) => void;
}

const steps = [
  {
    title: "Please touch your card",
    description: "Place your RFID card on the scanner",
    icon: <CreditCard className="w-12 h-12 text-blue-400" />,
  },
  {
    title: "Please return batteries",
    description: "Insert your discharged batteries into the slots",
    icon: <Battery className="w-12 h-12 text-blue-400" />,
  },
  {
    title: "Please wait a moment",
    description: "Checking batteries status",
    icon: <Clock className="w-12 h-12 text-blue-400" />,
  },
  {
    title: "Please take out batteries",
    description: "Remove the fully charged batteries",
    icon: <Battery className="w-12 h-12 text-blue-400" />,
  },
  {
    title: "Swap Complete",
    description: "Battery swap successful. Have a safe journey!",
    icon: <CheckCircle className="w-12 h-12 text-green-400" />,
  }
];

const StepContent: React.FC<StepContentProps> = ({ step, onRFIDScanned, onNext }) => {
  const [rfidInput, setRfidInput] = useState('');
  const currentStep = steps[step - 1];
  console.log(currentStep)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfidInput && onRFIDScanned) {
      onRFIDScanned(rfidInput);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="flex justify-center mb-6">
        {currentStep.icon}
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        {currentStep.title}
      </h2>
      <p className="text-white/80 mb-6">
        {currentStep.description}
      </p>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
          <input
            type="text"
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            placeholder="Enter RFID token"
            className="w-full bg-white/10 backdrop-blur-lg text-white placeholder-white/60 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white/30 transition-all mb-4"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors"
            disabled={!rfidInput}
          >
            Scan Card
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="mb-6">
          <BatteryHealthDisplay
            soh={85}
            soc={29}
            temperature={27}
          />
        </div>
      )}

      {step > 1 && step != steps.length && (
        <button
          onClick={onNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors"
        >
          Next
        </button>
      )}
    </motion.div>
  );
};

export default StepContent;