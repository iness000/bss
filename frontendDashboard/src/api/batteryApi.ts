import axios from 'axios';

// Define the base URL for your Flask API
const API_BASE_URL = 'http://localhost:5000/api'; // Updated port with API prefix

// --- Type Definitions (Ideally, move to src/types/battery.ts) ---

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  license_number?: string | null;
  license_expiry?: string | null; // Date as string
  motocycle_model?: string | null;
  motocycle_year?: string | null;
  subscription_plan_id?: number | null;
  subscription_start?: string | null; // Date as string
  password_hash?: string; // Usually not sent to frontend, but present in create/update
  is_active: boolean;
  role: string; // 'user', 'admin'
  created_at: string; // DateTime as string
  updated_at: string; // DateTime as string
}

export interface RFIDCard {
  id: number;
  user_id: number;
  rfid_code: string;
  assigned_battery_id?: number | null;
  issued_at: string; // DateTime as string
  status: string; // 'active', 'inactive', 'lost'
  user_email?: string | null; // Example if backend sends related user info
  // battery?: Battery; // If backend populates this relation
}

export interface Battery {
  id: number;
  station_id?: number | null;
  status: string; // 'available', 'in_use', 'charging', 'maintenance'
  serial_number: string;
  battery_type?: string | null;
  battery_capacity?: number | null; // Float
  manufacture_date?: string | null; // String or Date as string
  created_at: string; // DateTime as string
  updated_at: string; // DateTime as string
  // health_logs?: BatteryHealthLog[]; // If backend populates this relation
}

export interface BatteryHealthLog {
  id: number;
  battery_id: number;
  soh_percent?: number | null;
  pack_voltage?: number | null;
  cell_voltage_min?: number | null;
  cell_voltage_max?: number | null;
  cell_voltage_diff?: number | null;
  max_temp?: number | null;
  ambient_temp?: number | null;
  humidity?: number | null;
  internal_resist?: number | null;
  cycle_count?: number | null;
  error_code?: string | null;
  created_at: string; // DateTime as string
}


// Helper for error handling
import { AxiosError } from 'axios';

const handleError = (error: unknown, message: string) => {
  let errorMessage = message;
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || message;
    console.error(message, axiosError.response?.data || axiosError.message);
  } else if (error instanceof Error) {
    errorMessage = error.message;
    console.error(message, error.message);
  } else {
    console.error(message, error);
  }
  throw new Error(errorMessage);
};

export const batteryApi = {
  // --- User Endpoints ---
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch users');
      return []; // Should not be reached due to throw
    }
  },
  async getUser(userId: number): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch user ${userId}`);
      throw error; // Re-throw after logging
    }
  },
  async createUser(userData: Partial<User>): Promise<{ message: string; user_id: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create user');
      throw error;
    }
  },
  async updateUser(userId: number, userData: Partial<User>): Promise<{ message: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to update user ${userId}`);
      throw error;
    }
  },
  async deleteUser(userId: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to delete user ${userId}`);
      throw error;
    }
  },

  // --- RFIDCard Endpoints ---
  async getRFIDCards(): Promise<RFIDCard[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rfid_cards`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch RFID cards');
      return [];
    }
  },
  async getRFIDCard(cardId: number): Promise<RFIDCard> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rfid_cards/${cardId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch RFID card ${cardId}`);
      throw error;
    }
  },
  async getRFIDCardByCode(rfidCode: string): Promise<RFIDCard> {
    try {
      const response = await axios.get(`${API_BASE_URL}/rfid_cards/by_code/${rfidCode}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch RFID card with code ${rfidCode}`);
      throw error;
    }
  },
  async createRFIDCard(cardData: Partial<RFIDCard>): Promise<{ message: string; card_id: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/rfid_cards`, cardData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create RFID card');
      throw error;
    }
  },
  async updateRFIDCard(cardId: number, cardData: Partial<RFIDCard>): Promise<{ message: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/rfid_cards/${cardId}`, cardData);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to update RFID card ${cardId}`);
      throw error;
    }
  },
  async deleteRFIDCard(cardId: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/rfid_cards/${cardId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to delete RFID card ${cardId}`);
      throw error;
    }
  },

  // --- Battery Endpoints ---
  async getBatteries(): Promise<Battery[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/batteries`);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch batteries');
      return [];
    }
  },
  async getBattery(batteryId: number): Promise<Battery> {
    try {
      const response = await axios.get(`${API_BASE_URL}/batteries/${batteryId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch battery ${batteryId}`);
      throw error;
    }
  },
  async createBattery(batteryData: Partial<Battery>): Promise<{ message: string; battery_id: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/batteries`, batteryData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create battery');
      throw error;
    }
  },
  async updateBattery(batteryId: number, batteryData: Partial<Battery>): Promise<{ message: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/batteries/${batteryId}`, batteryData);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to update battery ${batteryId}`);
      throw error;
    }
  },
  async deleteBattery(batteryId: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/batteries/${batteryId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to delete battery ${batteryId}`);
      throw error;
    }
  },

  // --- BatteryHealthLog Endpoints ---
  async getBatteryHealthLogs(batteryId?: number): Promise<BatteryHealthLog[]> {
    try {
      const params = batteryId ? { battery_id: batteryId } : {};
      const response = await axios.get(`${API_BASE_URL}/battery_health_logs`, { params });
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to fetch battery health logs');
      return [];
    }
  },
  async getBatteryHealthLog(logId: number): Promise<BatteryHealthLog> {
    try {
      const response = await axios.get(`${API_BASE_URL}/battery_health_logs/${logId}`);
      return response.data;
    } catch (error) {
      handleError(error, `Failed to fetch battery health log ${logId}`);
      throw error;
    }
  },
  async createBatteryHealthLog(logData: Partial<BatteryHealthLog>): Promise<{ message: string; log_id: number }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/battery_health_logs`, logData);
      return response.data;
    } catch (error) {
      handleError(error, 'Failed to create battery health log');
      throw error;
    }
  },
  
};