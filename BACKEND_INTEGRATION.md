# Women Safety App - Backend Integration Guide

## Overview
This document outlines the integration between the React Native frontend and the backend services for the Women Safety App.

## Architecture

### Backend Services
1. **Spring Boot API** (Port 8080) - Main backend with ML integration
2. **Node.js SMS Service** (Port 3000) - Handles SMS notifications via Twilio
3. **Python ML Service** (Port 8000) - Machine learning model for risk assessment

### Frontend Integration
- **React Native App** - Mobile application with enhanced safety features

## API Endpoints

### 1. Risk Assessment API
**Endpoint**: `POST http://localhost:8080/api/sos`

**Request Body**:
```json
{
  "userId": "user_123",
  "username": "John Doe",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "hour": 14,
  "crimeDensity": 0.45,
  "poiCount": 12,
  "night": false,
  "isolated": false
}
```

**Response**:
```json
{
  "riskScore": 35,
  "riskLevel": "LOW"
}
```

### 2. SOS Alert API
**Endpoint**: `POST http://localhost:3000/api/send-sos`

**Request Body**:
```json
{
  "emergencyContacts": [
    {"name": "Police", "number": "100"},
    {"name": "Women Helpline", "number": "181"}
  ],
  "name": "John Doe",
  "location": "12.971600, 77.594600",
  "currentTime": "1/10/2026, 2:30:45 PM"
}
```

**Response**:
```json
{
  "success": true,
  "messagesSent": 2,
  "messageIds": ["msg_id_1", "msg_id_2"]
}
```

## Data Flow

### Risk Assessment Flow
1. **Frontend** collects location and environmental data
2. **DataCollectionService** processes and validates the data
3. **WomenSafetyApiService** sends data to Spring Boot API
4. **Spring Boot** forwards features to ML service
5. **ML Service** returns risk score and level
6. **Spring Boot** saves incident and returns response
7. **Frontend** displays risk assessment to user

### SOS Alert Flow
1. **Frontend** triggers SOS with user location and contacts
2. **WomenSafetyApiService** sends data to Node.js SMS service
3. **Node.js** formats message and sends via Twilio
4. **Twilio** delivers SMS to emergency contacts
5. **Frontend** shows confirmation to user

## ML Model Features

The ML model uses the following features for risk assessment:

1. **Location Data**
   - Latitude, Longitude
   - Geographic coordinates

2. **Temporal Data**
   - Hour of day (0-23)
   - Night time indicator

3. **Environmental Data**
   - Crime density of area
   - Points of Interest count
   - Isolation indicator

4. **Risk Levels**
   - LOW (0-33)
   - MEDIUM (34-66)
   - HIGH (67-100)

## Setup Instructions

### 1. Backend Services Setup

#### Spring Boot Application
```bash
cd Women-safety-project
./mvnw spring-boot:run
```
- Runs on port 8080
- Integrates with ML service on port 8000

#### Node.js SMS Service
```bash
cd backend
npm install
npm start
```
- Runs on port 3000
- Requires Twilio credentials in .env file

#### Python ML Service
```bash
cd Women-safety-project/Ml-services/women_safety_ml
pip install -r requirements.txt
python app.py
```
- Runs on port 8000
- Provides risk prediction endpoint

### 2. Frontend Setup
```bash
npm install
npm start
```

### 3. Environment Configuration
Create `.env` files for each service:

#### Node.js SMS Service (.env)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
PORT=3000
```

#### React Native (if needed)
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_SMS_API_URL=http://localhost:3000
```

## Key Features

### Enhanced Safety Mode
- **Automatic Risk Assessment**: Evaluates risk when safety mode is activated
- **Periodic Reassessment**: Updates risk assessment every 5 minutes
- **High Risk Auto-SOS**: Automatically offers to send SOS if high risk detected

### Data Collection
- **Location Services**: Real-time location tracking
- **POI Analysis**: Counts nearby points of interest
- **Crime Data**: Simulated crime density (replace with real API)
- **Environmental Factors**: Time of day, isolation detection

### Alert System
- **Backend SMS**: Uses Twilio for reliable SMS delivery
- **Fallback SMS**: Native SMS app as backup
- **Emergency Contacts**: Configurable contact list

## Development Notes

### API Service Classes
- `WomenSafetyApiService`: Main API integration service
- `DataCollectionService`: Data processing and validation

### Components
- `MainEnhanced`: Enhanced main page with backend integration
- `Switcher1`: Safety mode toggle component

### Configuration
- `apiConfig.ts`: Centralized API configuration
- Development/Production environment support

## Testing

### Unit Testing
Test individual services:
```bash
# Test API service
npm test -- services/api.test.js

# Test data collection
npm test -- services/dataCollector.test.js
```

### Integration Testing
Test full flow:
1. Start all backend services
2. Run React Native app
3. Enable safety mode
4. Verify risk assessment
5. Test SOS functionality

## Production Deployment

### Backend Services
- Deploy Spring Boot to cloud platform (AWS, Azure, etc.)
- Deploy Node.js service with proper Twilio configuration
- Deploy ML service as containerized application

### Frontend
- Build React Native app for production
- Update API endpoints to production URLs
- Configure proper SSL certificates

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend services allow cross-origin requests
2. **Connection Refused**: Verify all services are running on correct ports
3. **ML Service Unavailable**: Check Python service status and dependencies
4. **SMS Failures**: Verify Twilio credentials and phone numbers

### Debugging
- Enable console logging in development
- Check network requests in browser dev tools
- Monitor backend service logs
- Verify ML service responses

## Security Considerations

1. **API Security**: Implement authentication and authorization
2. **Data Privacy**: Encrypt sensitive location data
3. **SMS Security**: Validate phone numbers and prevent spam
4. **Rate Limiting**: Implement API rate limiting

## Future Enhancements

1. **Real Crime Data**: Integrate with actual crime data APIs
2. **Advanced ML**: Improve ML model with more features
3. **Push Notifications**: Add real-time push notifications
4. **Offline Support**: Enable offline risk assessment
5. **Multi-language Support**: Add localization features
