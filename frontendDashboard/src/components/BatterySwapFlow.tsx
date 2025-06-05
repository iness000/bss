// import { motion } from 'framer-motion'; // Marked as unused
import React, { useEffect } from 'react';
import { useSocket } from '../Hooks/useSocket';
import { SwapSession, RFIDCard, User } from '../types/battery';
import ProgressSteps from './battery/ProgressSteps';
import StepContent from './battery/StepContent';
import { useProgress } from '../context/ProgressContext';




interface BatterySwapFlowProps {
  
  onBack: () => void;

  swapSession: SwapSession | null;
  setSwapSession: React.Dispatch<React.SetStateAction<SwapSession | null>>;
  
}

// Interfaces for socket event data
interface AuthResponseData {
  status: 'success' | 'error';
  message?: string;
  sessionId?: string; // CRITICAL: Assumed to be sent by backend on successful auth
  user?: User;
  rfidCard?: RFIDCard;
}

interface SwapInitiatedData {
  slot_id_returned: string;
  battery_id_returned: string;
}

interface SwapResultData {
  status: 'success' | 'error';
  message?: string;
  slot_id_new?: string;
  battery_id_new?: string;
  soh?: number; // State of Health for the new battery
  soc?: number; // State of Charge for the new battery
  temperature?: number; // Temperature of the new battery
}

interface SwapRefusedData {
  reason: string;
}

const BatterySwapFlow: React.FC<BatterySwapFlowProps> = ({ 
  onBack, 
  swapSession,
  setSwapSession,
}) => {
  console.log('[BatterySwapFlow] Rendering');
  const { currentStep: step, setCurrentStep } = useProgress();

  // Debug: Log component mount/unmount
  useEffect(() => {
    console.log('[BatterySwapFlow] Component mounted');
    return () => {
      console.log('[BatterySwapFlow] Component unmounting');
    };
  }, []);

  // Debug: Log swapSession changes
  useEffect(() => {
    console.log('[BatterySwapFlow] swapSession updated:', swapSession);
  }, [swapSession]);

  // Socket event handlers
  const handleAuthResponse = (data: AuthResponseData) => {
    console.log('[BatterySwapFlow] handleAuthResponse called with data:', data);
    console.log('[SocketIO] Received auth_response:', data);
    console.log('Socket event: auth_response', data);
    if (data && data.status === 'success') {
      // Assuming data contains necessary info like rfidCard, user details, or at least user_id
      // You might need to fetch full card/user details if not provided directly
      setSwapSession((prev: SwapSession | null) => {
        if (data.sessionId) { // Ensure sessionId is present for a valid session
          const newSessionBase: Partial<SwapSession> = {
            sessionId: data.sessionId,
            rfidCard: data.rfidCard,
            user: data.user,
            status: 'authenticated',
          };
          if (prev) { // Update existing session
            return { ...prev, ...newSessionBase };
          }
          // Creating a new session, ensure all required fields are met
          // This assumes SwapSession's required fields are sessionId and status.
          // Other fields are optional or will be added by subsequent events.
          return newSessionBase as SwapSession; 
        }
        return null; // Invalid auth data or missing sessionId
      });
      setCurrentStep(2); // Proceed to Return Battery step
    } else {
      alert(`Authentication Failed: ${data?.message || 'Unknown error'}`);
      setCurrentStep(1);
      setSwapSession(null);
    }
  };

  const handleSwapInitiated = (data: SwapInitiatedData) => {
    console.log('[BatterySwapFlow] handleSwapInitiated called with data:', data);
    console.log('[SocketIO] Received swap_initiated:', data);
    console.log('Socket event: swap_initiated', data);
    if (data && data.slot_id_returned) {
      setSwapSession((prev: SwapSession | null) => {
        if (!prev) {
          console.error('Swap initiated without an active session.');
          return null;
        }
        return {
          ...prev,
          returnedBatterySlot: data.slot_id_returned,
          returnedBatteryId: data.battery_id_returned,
          status: 'battery_return_initiated',
        };
      });
      setCurrentStep(3); // Proceed to Checking Battery step
    } else {
      console.error('Swap initiated event missing data', data);
      // Optionally handle this error, e.g., by alerting the user or staying on the current step
    }
  };

  const handleSwapResult = (data: SwapResultData) => {
    console.log('[BatterySwapFlow] handleSwapResult called with data:', data);
    console.log('[SocketIO] Received swap_result:', data);
    console.log('Socket event: swap_result', data);
    if (data && data.status === 'success') {
      setSwapSession((prev: SwapSession | null) => {
        if (!prev) {
          console.error('Swap result received without an active session.');
          return null;
        }
        return {
          ...prev,
          newBatterySlot: data.slot_id_new,
          newBatteryId: data.battery_id_new,
          newBatterySoh: data.soh,
          newBatterySoc: data.soc,
          newBatteryTemp: data.temperature,
          status: 'new_battery_assigned',
        };
      });
      setCurrentStep(4); // Proceed to Take New Battery step
    } else {
      alert(`Swap Failed: ${data?.message || 'Unknown error'}`);
      // Potentially revert to a previous step or show an error state
      // For now, let's go back to step 2 (Return Battery)
      setCurrentStep(2);
    }
  };

  const handleSwapRefused = (data: SwapRefusedData) => {
    console.log('[BatterySwapFlow] handleSwapRefused called with data:', data);
    console.log('[SocketIO] Received swap_refused:', data);
    console.log('Socket event: swap_refused', data);
    alert(`Swap Refused: ${data?.reason || 'Unknown reason'}`);
    // Potentially revert to a previous step, e.g., step 2
    setCurrentStep(2);
  };

  // Register socket event listeners
  // Register socket event listeners at the top level (NOT inside useEffect)
  useSocket({
    onAuth: handleAuthResponse,
    onSwapInitiated: handleSwapInitiated,
    onSwapResult: handleSwapResult,
    onSwapRefused: handleSwapRefused,
  });

  const handleBackToWeatherClick = () => {
    setCurrentStep(1);
    setSwapSession(null);
    onBack();
  };


      
      
      

  

  return (
    <div className="max-w-md mx-auto">
      <ProgressSteps totalSteps={5} currentStep={step} />

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
        <StepContent key={step} step={step} swapSession={swapSession} />
        <button
            onClick={handleBackToWeatherClick} 
            className="mt-6 text-white/60 hover:text-white transition-colors">
            Back to Weather
          </button>
      </div>
    </div>
  );
};

export default BatterySwapFlow;