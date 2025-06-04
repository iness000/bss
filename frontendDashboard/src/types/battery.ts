export interface BatteryStatus {
  slotId: string;
  health: number;
  isCharging: boolean;
  isAvailable: boolean;
}

export interface BatterySwapResponse {
  success: boolean;
  message: string;
  availableSlot?: string;
  batteryHealth?: number;
}

// Duplicating User and RFIDCard here for now. Ideally, move all related types here.
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  license_number?: string | null;
  license_expiry?: string | null;
  motocycle_model?: string | null;
  motocycle_year?: string | null;
  subscription_plan_id?: number | null;
  subscription_start?: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface RFIDCard {
  id: number;
  user_id: number;
  rfid_code: string;
  assigned_battery_id?: number | null;
  issued_at: string;
  status: string; // 'active', 'inactive', 'lost'
  user_email?: string | null;
}


export interface SwapSession {
  sessionId: string; // This might be generated client-side or come from a future dedicated session endpoint
  status: 'pending_rfid' | 'pending_return' | 'checking_returned' | 'pending_collection' | 'complete' | 'cancelled';
  returnedBatterySlot?: string; // Slot ID where user returned battery
  newBatterySlot?: string; // Slot ID for the new battery
  rfidCard?: RFIDCard; // Added
  user?: User; // Added
  // We might also want to store the actual Battery objects
  // returnedBattery?: Battery;
  // newBattery?: Battery;
}