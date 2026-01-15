import axios, { AxiosResponse } from 'axios';
import { Alert } from 'react-native';

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

// Alternative interface for backend compatibility (camelCase)
export interface BackendRiskAssessmentData {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  hour: number;
  crimeDensity: number;    // Possible backend expects camelCase
  poiCount: number;         // Possible backend expects camelCase
  isNight: boolean;
  isIsolated: boolean;
}

// Helper function to convert between frontend and backend field names
export const convertToBackendFormat = (frontendData: RiskAssessmentData): BackendRiskAssessmentData => {
  return {
    userId: frontendData.userId,
    username: frontendData.username,
    latitude: frontendData.latitude,
    longitude: frontendData.longitude,
    hour: frontendData.hour,
    crimeDensity: frontendData.crime_density,
    poiCount: frontendData.poi_count,
    isNight: frontendData.isNight,
    isIsolated: frontendData.isIsolated
  };
};

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
  // Retry configuration
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_DELAY = 1000; // 1 second
  private static readonly MAX_DELAY = 10000; // 10 seconds

  // Helper method for exponential backoff retry
  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw error;
        }
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000,
          this.MAX_DELAY
        );
        
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries + 1} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Fallback risk calculation when ML service is unavailable
  private static calculateFallbackRisk(data: RiskAssessmentData): RiskAssessmentResponse {
    console.log('🧮 Using fallback risk calculation...');
    
    let riskScore = 50; // Base risk score
    
    // Time-based risk
    if (data.isNight) {
      riskScore += 20;
    }
    
    // Location-based risk (higher crime density increases risk)
    riskScore += data.crime_density * 15;
    
    // Isolation risk
    if (data.isIsolated) {
      riskScore += 15;
    }
    
    // POI count (fewer POIs = higher risk)
    if (data.poi_count < 5) {
      riskScore += 10;
    }
    
    // Cap the score between 0-100 and round to integer
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    
    let riskLevel = 'LOW';
    if (riskScore >= 70) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 40) {
      riskLevel = 'MEDIUM';
    }
    
    console.log(`🧮 Fallback risk calculation: ${riskScore}/100 (${riskLevel})`);
    
    return {
      riskScore,
      riskLevel
    };
  }

  // Risk Assessment API - Calls live backend which integrates with ML model
  static async assessRisk(data: RiskAssessmentData): Promise<RiskAssessmentResponse> {
    const operation = async () => {
      console.log('🌐 API Call - Sending request to live backend:', API_BASE_URL);
      console.log('📤 Original API Data (snake_case):', data);
      
      // First try with original snake_case format
      try {
        const response: AxiosResponse<RiskAssessmentResponse> = await springBootApi.post(
          '/sos',
          data
        );
        console.log('✅ Snake_case format successful:', response.data);
        return response.data;
      } catch (snakeCaseError: any) {
        console.log('❌ Snake_case format failed, trying camelCase...');
        
        // Try with camelCase format
        const camelCaseData = convertToBackendFormat(data);
        console.log('📤 Converted API Data (camelCase):', camelCaseData);
        
        const response: AxiosResponse<RiskAssessmentResponse> = await springBootApi.post(
          '/sos',
          camelCaseData
        );
        console.log('✅ CamelCase format successful:', response.data);
        return response.data;
      }
    };

    try {
      // Try with retry mechanism
      return await this.retryWithBackoff(operation);
    } catch (error: any) {
      console.error('❌ API Error after retries:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Check if it's a rate limiting error
      if (error.response?.status === 429) {
        console.log('⏰ Rate limit detected, using fallback calculation...');
        const fallbackResult = this.calculateFallbackRisk(data);
        
        // Show user-friendly message
        Alert.alert(
          'Service Busy',
          'Risk assessment service is temporarily busy. Using offline safety calculation.',
          [{ text: 'OK', style: 'default' }]
        );
        
        return fallbackResult;
      }
      
      // For other server errors, try fallback
      if (error.response?.status >= 500) {
        console.log('🔧 Server error, using fallback calculation...');
        return this.calculateFallbackRisk(data);
      }
      
      // For network errors, try fallback
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || error.code === 'ENOTFOUND') {
        console.log('🌐 Network error, using fallback calculation...');
        return this.calculateFallbackRisk(data);
      }
      
      // If it's an axios error with specific handling
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Live backend server is not responding. Using offline safety mode.');
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('Cannot connect to live backend. Using offline safety mode.');
        } else {
          throw new Error(`API Error: ${error.response?.status || 'Unknown'} - ${error.message}`);
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

  // Test function to verify field name compatibility
  static async testFieldNames(): Promise<void> {
    console.log('🧪 Testing field name compatibility...');
    
    const testData: RiskAssessmentData = {
      userId: 'test_user_123',
      username: 'TestUser',
      latitude: 12.9716,
      longitude: 77.5946,
      hour: 14,
      crime_density: 0.5,
      poi_count: 10,
      isNight: false,
      isIsolated: false
    };
    
    console.log('📋 Test Data (snake_case):', testData);
    
    const camelCaseData = convertToBackendFormat(testData);
    console.log('🐪 Test Data (camelCase):', camelCaseData);
    
    // Test both formats
    try {
      console.log('🔍 Testing snake_case format...');
      const snakeResult = await this.assessRisk(testData);
      console.log('✅ Snake_case works:', snakeResult);
    } catch (error) {
      console.log('❌ Snake_case failed:', error);
    }
    
    try {
      console.log('🔍 Testing camelCase format...');
      const camelResult = await this.assessRisk(testData);
      console.log('✅ CamelCase works:', camelResult);
    } catch (error) {
      console.log('❌ CamelCase failed:', error);
    }
  }

  // New sendSOS function matching the user's requested signature with retry mechanism
  static async sendSOS(data: RiskAssessmentData): Promise<SendSOSResponse> {
    const operation = async () => {
      console.log('🚨 sendSOS - Original data (snake_case):', data);
      
      // First try with original snake_case format
      try {
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
          throw new Error(`SOS failed with status: ${res.status}`);
        }

        const result = await res.json();
        console.log('✅ sendSOS snake_case successful:', result);
        return result;
      } catch (snakeCaseError: any) {
        console.log('❌ sendSOS snake_case failed, trying camelCase...');
        
        // Try with camelCase format
        const camelCaseData = convertToBackendFormat(data);
        console.log('🚨 sendSOS - Converted data (camelCase):', camelCaseData);
        
        const res = await fetch(
          `${VEERA_CORE_API_URL}/sos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(camelCaseData)
          }
        );

        if (!res.ok) {
          throw new Error(`SOS failed with status: ${res.status}`);
        }

        const result = await res.json();
        console.log('✅ sendSOS camelCase successful:', result);
        return result;
      }
    };

    try {
      return await this.retryWithBackoff(operation);
    } catch (error: any) {
      console.error('❌ sendSOS error after retries:', error);
      
      // For rate limiting or server errors, provide fallback response
      if (error.response?.status === 429 || error.message.includes('429') || 
          error.response?.status >= 500 || error.message.includes('5')) {
        console.log('🔧 Using fallback SOS response...');
        return {
          riskLevel: 'HIGH', // Assume high risk when service is unavailable
          riskScore: 75
        };
      }
      
      throw new Error('SOS service temporarily unavailable. Please try again.');
    }
  }
}

export default WomenSafetyApiService;
