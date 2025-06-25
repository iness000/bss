import { motion } from 'framer-motion';
import { Battery, CheckCircle, Clock, CreditCard } from 'lucide-react';
import BatteryHealthDisplay from './BatteryHealthDisplay';
import { SwapSession } from '../../types/battery';


interface StepContentProps {
  step: number;
  onBack?: () => void;
  swapSession: SwapSession | null;
  onNext?: () => void;
  
  
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

const StepContent: React.FC<StepContentProps> = ({ step, swapSession , onNext }) => {
  
  const currentStep = steps[step - 1];
  console.log(currentStep)
  

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

   

      {step === 4 && (
        <div className="mb-6">
          <BatteryHealthDisplay
            soh={swapSession?.newBatterySoh ?? 0} 
            soc={swapSession?.newBatterySoc ?? 0}
            temperature={swapSession?.newBatteryTemp ?? 0}
          />
          <button
             onClick={onNext}
             className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
            Continue
            </button>
 
        </div>
        
      )}

      
      
    </motion.div>
  );
};

export default StepContent;