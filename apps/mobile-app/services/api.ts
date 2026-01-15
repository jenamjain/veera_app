import axios, { AxiosResponse } from 'axios';

// API base configuration
// All services now use live backend - veera-core.onrender.com
const API_BASE_URL = 'https://veera-core.onrender.com/api';
const SOS_API_BASE_URL = 'https://veera-core.onrender.com/api';
const VEERA_CORE_API_URL = 'https://veera-core.onrender.com/api';

// Alternative: Try multiple possible addresses - prioritize live service first
const POSSIBLE_BASE_URLS = [
  'https://veera-core.onrender.com/api',   // Live service - try first
  'http://localhost:8080/api',           // Local development - fallback
  'http://10.0.2.2:8080/api',          // Android Emulator
  'http://192.168.1.12:8080/api',       // Your machine's IP - last fallback
];

// Create axios instances with fallback URLs
const springBootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to try fallback URLs on error
springBootApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      // Try fallback URLs
      for (const url of POSSIBLE_BASE_URLS) {
        if (url !== API_BASE_URL) {
          try {
            console.log(`🔄 Trying fallback URL: ${url}`);
            const response = await axios.post(url, error.config.data, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000,
            });
            return response;
          } catch (fallbackError: any) {
            console.log(`❌ Fallback ${url} failed:`, fallbackError.message);
            continue;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

const sosApi = axios.create({
  baseURL: SOS_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API requests and responses
export interface RiskAssessmentData {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  hour: number;
  crime_density: number;    // ML service expects this
  poi_count: number;        // ML service expects this
  isNight: boolean;         // ML service expects this
  isIsolated: boolean;      // ML service expects this
}

export interface RiskAssessmentResponse {
  riskScore: number;
  riskLevel: string;
}

export interface EmergencyContact {
  name: string;
  number: string;
}

export interface SOSRequest {
  emergencyContacts: EmergencyContact[];
  name: string;
  location: string;
  currentTime: string;
}

export interface SOSResponse {
  success: boolean;
  messagesSent?: number;
  messageIds?: string[];
  error?: string;
}

export interface SendSOSData {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  hour: number;
  crime_density: number;    // ML service expects this
  poi_count: number;        // ML service expects this
  isNight: boolean;         // ML service expects this
  isIsolated: boolean;      // ML service expects this
}

export interface SendSOSResponse {
  riskLevel: string;
  riskScore?: number;
}

// API Service Class
export class WomenSafetyApiService {
  // Risk Assessment API - Calls live backend which integrates with ML model
  static async assessRisk(data: RiskAssessmentData): Promise<RiskAssessmentResponse> {
    try {
      console.log('🌐 API Call - Sending request to live backend:', API_BASE_URL);
      console.log('📤 API Data:', data);
      
      const response: AxiosResponse<RiskAssessmentResponse> = await springBootApi.post(
        '/sos',
        data
      );
      
      console.log('🎯 Live Risk assessment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Live API Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Live backend server is not responding. Please check veera-core.onrender.com status.');
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('Cannot connect to live backend. Check your internet connection.');
        } else {
          throw new Error(`Live API Error: ${error.response?.status || 'Unknown'} - ${error.message}`);
        }
      }
      throw error;
    }
  }

  // SOS Alert API - Calls live backend for SMS notifications
  static async sendSOSAlert(data: SOSRequest): Promise<SOSResponse> {
    try {
      console.log('🚀 Sending SOS alert to live backend:', SOS_API_BASE_URL);
      
      const response: AxiosResponse<SOSResponse> = await sosApi.post(
        '/api/send-sos',
        data
      );
      
      console.log('📥 Live SOS alert response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Live SMS API Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Live SMS backend server is not responding. Please check veera-core.onrender.com status.');
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('Cannot connect to live SMS backend. Check your internet connection.');
        } else {
          throw new Error(`Live SMS API Error: ${error.response?.status || 'Unknown'} - ${error.message}`);
        }
      }
      throw error;
    }
  }

  // Helper method to get current hour for risk assessment
  static getCurrentHour(): number {
    return new Date().getHours();
  }

  // Helper method to determine if it's nighttime
  static isNightTime(): boolean {
    const hour = this.getCurrentHour();
    return hour >= 20 || hour <= 6; // 8 PM to 6 AM
  }

  // Helper method to format current time for SOS
  static getCurrentTimeString(): string {
    return new Date().toLocaleString();
  }

  // Helper method to format location string
  static formatLocationString(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // New sendSOS function matching the user's requested signature
  static async sendSOS(data: SendSOSData): Promise<SendSOSResponse> {
    const res = await fetch(
      `${VEERA_CORE_API_URL}/sos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    if (!res.ok) {
      throw new Error("SOS failed");
    }

    return await res.json();
  }
}

export default WomenSafetyApiService;
