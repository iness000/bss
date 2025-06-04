// import { motion } from 'framer-motion'; // Marked as unused
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating sessionId
import { batteryApi } from '../api/batteryApi';
import { SwapSession, User } from '../types/battery'; // RFIDCard removed as it's part of SwapSession.user.rfidCard
import BatteryGrid from './battery/BatteryGrid';
import ProgressSteps from './battery/ProgressSteps';
import StepContent from './battery/StepContent';
import { set } from 'date-fns';



interface BatterySwapFlowProps {
  step: number;
  onBack: () => void;
  onStepComplete: (step: number) => void;
  swapSession: SwapSession | null;
  setSwapSession: (session: SwapSession | null) => void;
  setStep: (step: number) => void; 
}

const BatterySwapFlow: React.FC<BatterySwapFlowProps> = ({ 
  step, 
  onBack, 
  onStepComplete,
  swapSession,
  setSwapSession,
  setStep
  
}) => {
  useEffect(() => {
    const handleStepLogic = async () => {
      try {
        switch (step) {
          case 1: // RFID Scan
            // Logic is primarily handled by handleRFIDScanned
            break;
          
          case 2: { 
            console.log("Step 2: Return batteries - UI/logic to select slot for return needed.");
            break;
          }
          
          case 3: { // Checking batteries - Wrapped in block
            if (swapSession?.returnedBatterySlot && swapSession.rfidCard?.assigned_battery_id) {
              // Assuming returnedBatterySlot is the ID of the battery they are returning
              // And rfidCard.assigned_battery_id was the battery they had
              
              // For now, let's assume we check the health of the battery they *had*.
              // const batteryToCheck = await batteryApi.getBattery(swapSession.rfidCard.assigned_battery_id);
              // const healthLogs = await batteryApi.getBatteryHealthLogs(batteryToCheck.id);
              // console.log(`Health logs for battery ${batteryToCheck.serial_number}:`, healthLogs);
              // if (healthLogs.length > 0 && healthLogs[0].soh_percent && healthLogs[0].soh_percent > 20) { // Arbitrary health check
              //   onStepComplete(step);
              // } else {
              //   alert("Returned battery health is too low or data unavailable.");
              // }
              console.log("Step 3: Checking returned battery - Logic needs to be implemented with new API.");
              // Simulating success for now
              onStepComplete(step);
            } else {
              console.log("Step 3: Cannot check battery, missing returnedBatterySlot or assigned_battery_id in session.");
            }
            break;
          }
          
          case 4: { // Take out new batteries - Wrapped in block
            // Wait for user to take batteries
            // This would involve finding an 'available' battery at the station
            console.log("Step 4: Take out new batteries - UI/logic to select available battery needed.");
            break;
          }
          
          case 5: { // Complete - Wrapped in block
            if (swapSession?.sessionId) {
              // await batteryApi.completeSwapSession(swapSession.sessionId); 
              // What does completing a session mean in the new API?
              // Maybe update RFID card's assigned_battery_id to the new battery?
              // Update status of old and new batteries?
              console.log(`Step 5: Swap session ${swapSession.sessionId} to be marked complete.`);
              // For now, just log.
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error in battery swap flow:', error);
      }
    };

    handleStepLogic();
  }, [step, swapSession]);

  const handleBackToWeatherClick = () => {
    setStep(1);
    setSwapSession(null);
    onBack();
  };

  const handleRFIDScanned = async (rfidCode: string) => {
    try {
      console.log(`Attempting to find RFID card with code: ${rfidCode}`);
      // 1. Find the RFID card by its code using the new API endpoint
      const foundCard = await batteryApi.getRFIDCardByCode(rfidCode);

      console.log('Found RFID Card:', foundCard);

      if (foundCard.status !== 'active') {
        console.error(`RFID card ${rfidCode} is not active. Status: ${foundCard.status}`);
        alert(`RFID card ${rfidCode} is not active.`);
        return;
      }

      // 2. Fetch the associated user.
      let user: User | undefined = undefined;
      if (foundCard.user_id) {
        try {
          user = await batteryApi.getUser(foundCard.user_id);
          console.log('Found User:', user);
        } catch (userError) {
          console.error(`Failed to fetch user with ID ${foundCard.user_id}:`, userError);
          // Decide if this is a critical failure or if we can proceed without full user details
          alert(`Could not fetch user details for card ${rfidCode}.`);
          // return; // Or proceed with partial data
        }
      } else {
        console.warn(`RFID card ${rfidCode} is not associated with a user.`);
        // Decide if this is allowed
      }
      
      // 3. Create and set the swap session.
      const newSwapSession: SwapSession = {
        sessionId: uuidv4(), // Generate a unique session ID
        status: 'pending_return', // Initial status after RFID scan
        rfidCard: foundCard,
        user: user,
        // returnedBatterySlot and newBatterySlot will be set in later steps
      };
      setSwapSession(newSwapSession);
      console.log('Swap session started:', newSwapSession);
      onStepComplete(1); // Proceed to the next step

    } catch (error) {
      console.error('Failed to start swap session with RFID code:', error);
      // Handle UI: show specific error message
      if (error instanceof Error && error.message.includes('RFID card not found')) {
        alert(`RFID card with code ${rfidCode} not found.`);
      } else {
        alert('Failed to start swap session. Please try again.');
      }
    }
  };

  const handleNext = () => {
    onStepComplete(step);
  };

  return (
    <div className="max-w-md mx-auto">
      <ProgressSteps totalSteps={5} currentStep={step} />

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
        <StepContent
          step={step}
          onNext={handleNext}
          onRFIDScanned={handleRFIDScanned}
        />
        
        <BatteryGrid 
          step={step}
          swapSession={swapSession}
        />

        <button
          onClick={onBack}
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