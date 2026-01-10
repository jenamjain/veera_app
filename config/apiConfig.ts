// API Configuration
export const API_CONFIG = {
  // Spring Boot Backend (ML Integration)
  SPRING_BOOT_BASE_URL: __DEV__ 
    ? 'http://localhost:8080' 
    : 'https://your-production-backend.com',
  
  // Node.js Backend (SMS Services)
  NODE_JS_BASE_URL: __DEV__ 
    ? 'http://localhost:3000' 
    : 'https://your-production-sms-service.com',
  
  // ML Service
  ML_SERVICE_URL: __DEV__ 
    ? 'http://localhost:8000' 
    : 'https://your-production-ml-service.com',
  
  // API Endpoints
  ENDPOINTS: {
    RISK_ASSESSMENT: '/api/sos',
    SOS_ALERT: '/api/send-sos',
    ML_PREDICT: '/predict',
  },
  
  // Timeouts
  TIMEOUTS: {
    DEFAULT: 10000,
    ML_SERVICE: 15000, // ML services might take longer
    SMS_SERVICE: 20000, // SMS operations can be slower
  },
  
  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
  }
};

// Development/Production checks
export const isDevelopment = () => __DEV__;
export const isProduction = () => !__DEV__;

// Helper to get full URL
export const getApiUrl = (service: 'spring-boot' | 'node-js' | 'ml', endpoint?: string) => {
  const baseUrl = service === 'spring-boot' 
    ? API_CONFIG.SPRING_BOOT_BASE_URL
    : service === 'node-js'
    ? API_CONFIG.NODE_JS_BASE_URL
    : API_CONFIG.ML_SERVICE_URL;
  
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};

export default API_CONFIG;
