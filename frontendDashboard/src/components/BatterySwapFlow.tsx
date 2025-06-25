import React, { useEffect, useCallback, useRef } from 'react';
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
  status: 'success' | 'error' | 'failure';
  message?: string;
  sessionId?: string;
  user?: User;
  rfidCard?: RFIDCard;
}

interface SwapInitiatedData {
  slot_id_returned: string;
  battery_id: string;
}

interface SwapResultData {
  status: 'success' | 'error';
  message?: string;
  slot_id_new?: string;
  battery_id_new?: string;
  soh?: number;
  soc?: number;
  temperature?: number;
}

interface SwapRefusedData {
  reason: string;
}

const BatterySwapFlow: React.FC<BatterySwapFlowProps> = ({ 
  onBack, 
  swapSession,
  setSwapSession,
}) => {
  console.log('--- BATTERYSWAPFLOW IS RENDERING ---');
  const { currentStep: step, setCurrentStep } = useProgress();

  // Use refs to store the latest values without causing re-renders
  const setSwapSessionRef = useRef(setSwapSession);
  const setCurrentStepRef = useRef(setCurrentStep);
  const onBackRef = useRef(onBack);

  // Update refs when props change
  useEffect(() => {
    setSwapSessionRef.current = setSwapSession;
    setCurrentStepRef.current = setCurrentStep;
    onBackRef.current = onBack;
  });

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

  // Create stable socket event handlers using useCallback with empty deps
  const handleAuthResponse = useCallback((data: AuthResponseData) => {
    console.log('[BatterySwapFlow] handleAuthResponse called with data:', data);
    console.log('[SocketIO] Received auth_response:', data);
    
    if (data && data.status === 'success') {
      setSwapSessionRef.current((prev: SwapSession | null) => {
        if (data.sessionId) {
          const newSessionBase: Partial<SwapSession> = {
            sessionId: data.sessionId,
            rfidCard: data.rfidCard,
            user: data.user,
            status: 'authenticated',
          };
          if (prev) {
            return { ...prev, ...newSessionBase };
          }
          return newSessionBase as SwapSession; 
        }
        return null;
      });
      setCurrentStepRef.current(2);
    } else {
      alert(`Authentication Failed: ${data?.message || 'Unknown error'}`);
      setCurrentStepRef.current(1);
      setSwapSessionRef.current(null);
    }
  }, []); // Empty deps - handler is stable

  const handleSwapInitiated = useCallback((data: SwapInitiatedData) => {
    console.log('[BatterySwapFlow] handleSwapInitiated called with data:', data);
    console.log('[SocketIO] Received swap_initiated:', data);
    
    if (data && data.slot_id_returned) {
      setSwapSessionRef.current((prev: SwapSession | null) => {
        if (!prev) {
          console.error('Swap initiated without an active session.');
          return null;
        }
        return {
          ...prev,
          returnedBatterySlot: data.slot_id_returned,
          returnedBatteryId: data.battery_id,
          status: 'battery_return_initiated',
        };
      });
      setCurrentStepRef.current(3);
    } else {
      console.error('Swap initiated event missing data', data);
    }
  }, []); // Empty deps - handler is stable

  const handleSwapResult = useCallback((data: SwapResultData) => {
    console.log('[BatterySwapFlow] handleSwapResult called with data:', data);
    console.log('[SocketIO] Received swap_result:', data);
    
    if (data && data.status === 'success') {
      setSwapSessionRef.current((prev: SwapSession | null) => {
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
      setCurrentStepRef.current(4);
    } else {
      alert(`Swap Failed: ${data?.message || 'Unknown error'}`);
      setCurrentStepRef.current(2);
    }
  }, []); // Empty deps - handler is stable

  const handleSwapRefused = useCallback((data: SwapRefusedData) => {
    console.log('[BatterySwapFlow] handleSwapRefused called with data:', data);
    console.log('[SocketIO] Received swap_refused:', data);
    
    alert(`Swap Refused: ${data?.reason || 'Unknown reason'}`);
    setCurrentStepRef.current(2);
  }, []); // Empty deps - handler is stable

  // Register socket event listeners with stable handlers
  useSocket({
    onAuth: handleAuthResponse,
    onSwapInitiated: handleSwapInitiated,
    onSwapResult: handleSwapResult,
    onSwapRefused: handleSwapRefused,
  });

  const handleBackToWeatherClick = useCallback(() => {
    setCurrentStep(1);
    setSwapSession(null);
    onBack();
  }, [setCurrentStep, setSwapSession, onBack]);
   const handleProceedToStep5 = () => {
     setCurrentStep(5);
      };
  return (
    <div className="max-w-md mx-auto">
      <ProgressSteps totalSteps={5} currentStep={step} />

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
        <StepContent key={step} step={step} swapSession={swapSession}  onNext={handleProceedToStep5} />
        <button
          onClick={handleBackToWeatherClick} 
          className="mt-6 text-white/60 hover:text-white transition-colors"
        >
          Back to Weather
        </button>
      </div>
    </div>
  );
};

export default BatterySwapFlow;