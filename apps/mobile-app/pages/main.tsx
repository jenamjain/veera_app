import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ToastAndroid, Linking, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import Switcher1 from '../components/Switcher1';
import { LocationGeocodedAddress } from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import WomenSafetyApiService, { RiskAssessmentData, RiskAssessmentResponse, SOSRequest, SendSOSData, SendSOSResponse } from '../services/api';
import DataCollectionService from '../services/dataCollector';

type RouteParams = {
  text?: string;
};

interface LocationData {
  latitude: number;
  longitude: number;
}

interface ReverseGeocodeResult {
  formattedAddress?: string;
}

export default function Main() {
  const route = useRoute();
  const { text } = route.params as RouteParams;
  const [isSafetyActive, setIsSafetyActive] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{name: string, number: string}>>([
    {name: 'Women Helpline', number: '181'},
    {name: 'Police', number: '100'}
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  
  // Backend integration states
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResponse | null>(null);
  const [isAssessingRisk, setIsAssessingRisk] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [lastAssessmentTime, setLastAssessmentTime] = useState<Date | null>(null);
  
  const localTime = new Date().toLocaleTimeString();
  
  const isValidIndianPhoneNumber = (phone: string): boolean => {
    const indianMobileRegex = /^[6-9]\d{9}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return indianMobileRegex.test(digitsOnly);
  };
  
  const safetyStatusText = isSafetyActive ? 'Safety Mode: Active' : 'Safety Mode: Inactive';
  const safetyStatusTextColor = isSafetyActive ? '#4CAF50' : '#EF4444';

  // Enhanced risk assessment function
  const assessCurrentRisk = async () => {
    console.log('🔍 assessCurrentRisk called');
    console.log('📍 currentLocation:', currentLocation);
    console.log('👤 text:', text);
    
    if (!currentLocation || !text) {
      console.log('❌ Location or user info not available for risk assessment');
      console.log('currentLocation exists:', !!currentLocation);
      console.log('text exists:', !!text);
      return;
    }

    console.log('✅ Starting risk assessment...');
    setIsAssessingRisk(true);
    
    try {
      console.log('🔄 Collecting data for ML model...');
      
      // Convert LocationData to LocationObject format for DataCollectionService
      const locationObject = {
        coords: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      };
      
      // Collect all required data for ML model
      const riskData = await DataCollectionService.collectRiskAssessmentData(
        'user_123', // In a real app, this would come from authentication
        text,
        locationObject, // Proper LocationObject format
        emergencyContacts
      );

      console.log('📊 Risk data collected:', riskData);

      // Validate data before sending
      if (!DataCollectionService.validateRiskAssessmentData(riskData)) {
        throw new Error('Invalid risk assessment data');
      }

      console.log('📡 Sending risk assessment data to backend...');
      
      // Call backend API for risk assessment
      const response = await WomenSafetyApiService.assessRisk(riskData);
      
      console.log('🎯 Risk assessment response:', response);
      setRiskAssessment(response);
      setLastAssessmentTime(new Date());
      
      // Show risk level to user
      Alert.alert(
        'Risk Assessment Complete',
        `Risk Level: ${response.riskLevel}\nRisk Score: ${response.riskScore}/100`,
        [{ text: 'OK', style: 'default' }]
      );

      // Auto-trigger SOS if high risk
      if (response.riskLevel.toUpperCase() === 'HIGH') {
        Alert.alert(
          'High Risk Detected!',
          'Your current location has been assessed as high risk. Would you like to send an SOS alert?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Send SOS', onPress: () => handleSOSsms() }
          ]
        );
      }

    } catch (error) {
      console.error('Risk assessment failed:', error);
      Alert.alert(
        'Assessment Failed',
        'Unable to complete risk assessment. Please check your connection and try again.'
      );
    } finally {
      setIsAssessingRisk(false);
    }
  };

  // New sendSOS function matching the user's requested implementation
  const sendSOS = async (data: SendSOSData) => {
    const res = await fetch(
      "https://veera-core.onrender.com/api/sos",
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
  };

  // Test function with the user's exact requested data
  const testSendSOS = async () => {
    try {
      const result = await sendSOS({
        userId: "u20",
        username: "tt",
        latitude: 17.02,
        longitude: 72.57,
        hour: 2,
        crime_density: 0.8,
        poi_count: 23,
        isNight: true,
        isIsolated: true
      });

      console.log(result.riskLevel);
      Alert.alert('Risk Assessment Result', `Risk Level: ${result.riskLevel}`);
    } catch (error) {
      console.error('sendSOS error:', error);
      Alert.alert('Error', 'Failed to send SOS request');
    }
  };

  // Enhanced SOS function using backend API
  const handleEnhancedSOS = async () => {
    if (!currentLocation || !text) {
      Alert.alert('Error', 'Location or user information not available');
      return;
    }

    setIsSendingSOS(true);
    try {
      console.log('Sending enhanced SOS alert...');
      
      const sosRequest: SOSRequest = {
        emergencyContacts,
        name: text,
        location: WomenSafetyApiService.formatLocationString(
          currentLocation.latitude,
          currentLocation.longitude
        ),
        currentTime: WomenSafetyApiService.getCurrentTimeString()
      };

      const response = await WomenSafetyApiService.sendSOSAlert(sosRequest);
      
      if (response.success) {
        ToastAndroid.show(
          `SOS alert sent to ${response.messagesSent} contacts via SMS!`,
          ToastAndroid.LONG
        );
        
        Alert.alert(
          'SOS Alert Sent',
          `Successfully sent SOS alert to ${response.messagesSent} emergency contacts.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        throw new Error(response.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Enhanced SOS failed:', error);
      Alert.alert(
        'SOS Failed',
        'Failed to send SOS alert via backend. Falling back to SMS app...',
        [{ text: 'OK', onPress: () => handleSOSsms() }]
      );
    } finally {
      setIsSendingSOS(false);
    }
  };

  const handleCallContact = async (phoneNumber: string) => {
    try {
      const phoneUrl = `tel:${phoneNumber}`;
      console.log(`Trying to call ${phoneNumber}`);
      
      // Try opening directly without canOpenURL check
      await Linking.openURL(phoneUrl);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Calling ${phoneNumber}`, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error opening phone app:', error);
      Alert.alert('Error', 'Failed to open phone app');
    }
  };

 const handleSafetyToggle = async (newValue: boolean) => {
    console.log('🔄 Safety toggle called with:', newValue);
    console.log('📍 Current location available:', !!currentLocation);
    
    setIsSafetyActive(newValue);
    
    // Start risk assessment when safety mode is turned ON
    if (newValue && currentLocation) {
      console.log('🚀 Safety mode ON and location available, starting risk assessment...');
      // Assess risk immediately when safety mode is activated
      assessCurrentRisk();
      
      // Set up periodic risk assessment
      const assessmentInterval = setInterval(() => {
        if (isSafetyActive && currentLocation) {
          assessCurrentRisk();
        }
      }, 5 * 60 * 1000); // Every 5 minutes
      
      // Store interval ID for cleanup
      (riskAssessment as any).__interval = assessmentInterval;
    }
    
    // Send SMS when safety mode is turned ON
    if (newValue) {
      const name = text || 'User';
      const location = currentAddress || 'Location unavailable';
      const currentTime = new Date().toLocaleString();
      const messageBody = `${name} switched their location on, they might be in trouble,\nLocation: ${location}\nTime: ${currentTime}\nCalling them might help`;
      
      try {
        // Send SMS to ALL emergency contacts
        for (const contact of emergencyContacts) {
          // Format phone number with +91 prefix for India
          const phoneNumber = contact.number.startsWith('+91') 
            ? contact.number 
            : `+91${contact.number}`;
          
          // Try different SMS URL formats for better compatibility
          const smsFormats = [
            `sms:${phoneNumber}?body=${encodeURIComponent(messageBody)}`,
            `sms:${phoneNumber}&body=${encodeURIComponent(messageBody)}`,
            `sms:${phoneNumber};body=${encodeURIComponent(messageBody)}`
          ];
          
          let smsOpened = false;
          
          for (const url of smsFormats) {
            try {
              console.log(`Trying SMS URL for ${contact.name}: ${url}`);
              // Try opening directly without canOpenURL check
              await Linking.openURL(url);
              console.log(`SMS opened for ${contact.name}: ${phoneNumber}`);
              smsOpened = true;
              break; // Exit loop if successful
            } catch (urlError) {
              console.log(`SMS URL format failed: ${url}`, urlError);
              continue; // Try next format
            }
          }
          
          if (!smsOpened) {
            console.error(`All SMS formats failed for ${contact.name}: ${phoneNumber}`);
            // Try opening SMS app without body as fallback
            try {
              const fallbackUrl = `sms:${phoneNumber}`;
              console.log(`Trying fallback SMS URL for ${contact.name}: ${fallbackUrl}`);
              await Linking.openURL(fallbackUrl);
              console.log(`Fallback SMS opened for ${contact.name}: ${phoneNumber}`);
            } catch (fallbackError) {
              console.error(`Fallback SMS also failed for ${contact.name}`, fallbackError);
            }
          }
          
          // Small delay between contacts
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Success feedback
        ToastAndroid.show(
          `Safety mode alert sent to ${emergencyContacts.length} contacts!`, 
          ToastAndroid.LONG
        );
        
      } catch (error) {
        console.error('Safety mode SMS Error:', error);
        Alert.alert(
          'SMS Error', 
          'Failed to open SMS app. Please check your device settings.'
        );
      }
    }
  };

 const handleSOSsms = async () => {
  console.log('SOS SMS button pressed');
  
  const name = text || 'User';
  const location = currentAddress || 'Location unavailable';
  const currentTime = new Date().toLocaleString();
  const messageBody = `🚨 SOS ALERT\n${name} needs help.\nLocation: ${location}\nTime: ${currentTime}`;
  
  try {
    // Send SMS to ALL emergency contacts
    for (const contact of emergencyContacts) {
      // Format phone number with +91 prefix for India
      const phoneNumber = contact.number.startsWith('+91') 
        ? contact.number 
        : `+91${contact.number}`;
      
      // Try different SMS URL formats for better compatibility
      const smsFormats = [
        `sms:${phoneNumber}?body=${encodeURIComponent(messageBody)}`,
        `sms:${phoneNumber}&body=${encodeURIComponent(messageBody)}`,
        `sms:${phoneNumber};body=${encodeURIComponent(messageBody)}`
      ];
      
      let smsOpened = false;
      
      for (const url of smsFormats) {
        try {
          console.log(`Trying SOS SMS URL for ${contact.name}: ${url}`);
          // Try opening directly without canOpenURL check
          await Linking.openURL(url);
          console.log(`SOS SMS opened for ${contact.name}: ${phoneNumber}`);
          smsOpened = true;
          break; // Exit loop if successful
        } catch (urlError) {
          console.log(`SOS SMS URL format failed: ${url}`, urlError);
          continue; // Try next format
        }
      }
      
      if (!smsOpened) {
        console.error(`All SOS SMS formats failed for ${contact.name}: ${phoneNumber}`);
        // Try opening SMS app without body as fallback
        try {
          const fallbackUrl = `sms:${phoneNumber}`;
          console.log(`Trying SOS fallback SMS URL for ${contact.name}: ${fallbackUrl}`);
          await Linking.openURL(fallbackUrl);
          console.log(`SOS fallback SMS opened for ${contact.name}: ${phoneNumber}`);
        } catch (fallbackError) {
          console.error(`SOS fallback SMS also failed for ${contact.name}`, fallbackError);
        }
      }
      
      // Small delay between contacts to prevent overwhelming the SMS app
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Success feedback
    ToastAndroid.show(
      `SOS sent to ${emergencyContacts.length} contacts!`, 
      ToastAndroid.LONG
    );
    
  } catch (error) {
    console.error('SMS Error:', error);
    Alert.alert(
      'SMS Error', 
      'Failed to open SMS app. Please check your device settings.'
    );
  }
};

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const location: LocationData = { latitude, longitude };
      const reverseCodedAddress: LocationGeocodedAddress[] = await Location.reverseGeocodeAsync(location);

      if (reverseCodedAddress && reverseCodedAddress.length > 0) {
        const address = reverseCodedAddress[0].formattedAddress;
        console.log('Formatted Address:', address);
        return address;
      }
      return null;
    } catch (error: unknown) {
      console.error('Error during reverse geocoding:', error);
      return null;
    }
  };

  // Auto-assess risk when safety mode is activated and location is available
  useEffect(() => {
    if (isSafetyActive && currentLocation && !isAssessingRisk) {
      // Assess risk immediately when safety mode is activated
      assessCurrentRisk();
      
      // Set up periodic risk assessment
      const assessmentInterval = setInterval(() => {
        if (isSafetyActive && currentLocation) {
          assessCurrentRisk();
        }
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(assessmentInterval);
    }
  }, [isSafetyActive, currentLocation]);

  // Fetch initial location on component mount
  useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        console.log('Requesting location permissions...');
        // Request permissions if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Location permission status:', status);
        
        if (status !== 'granted') {
          console.log('Permission denied, using default location');
          // Use default location for testing
          const defaultLat = 12.9716; // Bangalore
          const defaultLng = 77.5946;
          setCurrentLocation({ latitude: defaultLat, longitude: defaultLng });
          setCurrentAddress('Default location (Bangalore) - Testing mode');
          return;
        }
        
        console.log('Getting current location...');
        // Get the current location immediately
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        
        console.log('Location obtained:', { latitude, longitude });
        setCurrentLocation({ latitude, longitude });
        
        console.log('Reverse geocoding...');
        const address = await reverseGeocode(latitude, longitude);
        setCurrentAddress(address || 'Location available but address not found');
        
        console.log('Initial location fetched successfully:', address);
      } catch (error: any) {
        console.error('Error fetching initial location:', error);
        
        // AUTOMATICALLY use default location for testing
        console.log('Location failed, using default location for testing');
        const defaultLat = 12.9716; // Bangalore
        const defaultLng = 77.5946;
        setCurrentLocation({ latitude: defaultLat, longitude: defaultLng });
        setCurrentAddress('Default location (Bangalore) - Testing mode');
        
        console.log('Using default location:', { defaultLat, defaultLng });
      }
    };
    
    fetchInitialLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Handle location watching based on safety mode
  useEffect(() => {
    let isMounted = true;
    let watchSubscription: Location.LocationSubscription | null = null;
    
    const startWatchingLocation = async () => {
      try {
        // Request permissions if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for safety features.');
          return;
        }
        
        // Start watching for updates
        watchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 2 * 60 * 1000, // 2 minutes in milliseconds
          },
          async (location: Location.LocationObject) => {
            if (!isMounted) return;
            
            const { latitude, longitude } = location.coords;
            console.log('Location updated at:', new Date().toLocaleTimeString());
            
            setCurrentLocation({ latitude, longitude });
            
            // Update address
            const address = await reverseGeocode(latitude, longitude);
            setCurrentAddress(address || 'Location unavailable');
            
            // Show toast on Android when location updates
            if (Platform.OS === 'android') {
              ToastAndroid.show('Location updated', ToastAndroid.SHORT);
            }
          }
        );
        
        if (isMounted) {
          setLocationSubscription(watchSubscription);
        }
      } catch (error) {
        console.error('Error watching location:', error);
        Alert.alert('Error', 'Failed to start location updates');
      }
    };
    
    if (isSafetyActive) {
      startWatchingLocation();
    } else if (locationSubscription) {
      // Clean up subscription when safety mode is turned off
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (watchSubscription) {
        watchSubscription.remove();
      }
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isSafetyActive]);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return '#EF4444';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Greetings */}
        <View style={styles.greetings}>
          <Text style={styles.greetingText}>
            Stay safe, {text || 'User'}!
          </Text>
          <Text>{currentTime}</Text>
        </View>
        
        {/* Safety Mode */}
        <View style={styles.safetyContainer}>
          <View style={styles.safetyContent}>
            <Text style={[styles.safetyText, { color: safetyStatusTextColor }]}>
              {safetyStatusText}
            </Text>
            <Switcher1 
              isChecked={isSafetyActive} 
              onToggle={handleSafetyToggle} 
            />
          </View>
        </View>

        {/* Risk Assessment Display - positioned based on safety mode */}
        {riskAssessment && (
          <View style={[styles.riskCard, { borderLeftColor: getRiskLevelColor(riskAssessment.riskLevel) }]}>
            <View style={styles.riskHeader}>
              <Ionicons name="shield-checkmark" size={24} color={getRiskLevelColor(riskAssessment.riskLevel)} />
              <Text style={styles.riskTitle}>Risk Assessment</Text>
            </View>
            <Text style={[styles.riskLevel, { color: getRiskLevelColor(riskAssessment.riskLevel) }]}>
              {riskAssessment.riskLevel.toUpperCase()}
            </Text>
            <Text style={styles.riskScore}>Score: {riskAssessment.riskScore}/100</Text>
            {lastAssessmentTime && (
              <Text style={styles.assessmentTime}>
                Last assessed: {lastAssessmentTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        )}

        {/* Debug: Manual Risk Assessment Button */}
        <View style={{ margin: 15, alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#2196F3', 
              padding: 10, 
              borderRadius: 8,
              paddingHorizontal: 20,
              marginBottom: 10
            }}
            onPress={assessCurrentRisk}
            disabled={isAssessingRisk}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {isAssessingRisk ? 'Assessing...' : '🔍 Test Risk Assessment'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FF6B35', 
              padding: 10, 
              borderRadius: 8,
              paddingHorizontal: 20
            }}
            onPress={testSendSOS}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              🚨 Test New sendSOS Function
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display location and time */}
        {isSafetyActive && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Current Location:</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {currentAddress}
            </Text>
            {currentLocation && (
              <Text style={styles.coordsText}>
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        )}

        {/* SOS SMS button */}
        <TouchableOpacity 
          style={{ 
            alignItems: 'center', 
            marginTop: 20 
          }}
          onPress={handleSOSsms}
        >
          <View style={{ 
            backgroundColor: '#ff4757', 
            padding: 16, 
            width: 180, 
            height: 180, 
            borderRadius: 90, 
            justifyContent: 'center', 
            alignItems: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 28, 
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 32,
              paddingHorizontal: 10,
              letterSpacing: 1,
              textTransform: 'uppercase',
              textShadowColor: 'rgba(0, 0, 0, 0.25)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
              includeFontPadding: false,
            }}>
              SOS
            </Text>
          </View>
        </TouchableOpacity>

        {/* Emergency contacts section */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Emergency Contacts</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>Add your emergency contacts here to quickly alert them in case of emergency.</Text>
          
          <TouchableOpacity 
            style={{ marginTop: 10, padding: 10, backgroundColor: '#f6625f', borderRadius: 8, width: '100%', alignSelf: 'flex-start' }}
            onPress={() => setShowAddContact(!showAddContact)}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>+ Add Contact</Text>
          </TouchableOpacity>

          {/* Add Contact Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showAddContact}
            onRequestClose={() => setShowAddContact(false)}
          >
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Emergency Contact</Text>
                  
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter name"
                    value={newContact.name}
                    onChangeText={(text: string) => setNewContact({...newContact, name: text})}
                    autoCapitalize="words"
                  />
                  
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      phoneError && styles.inputError
                    ]}
                    placeholder="e.g., 9876543210"
                    value={newContact.number}
                    onChangeText={(text: string) => {
                      // Only allow numbers and limit to 10 digits
                      const cleaned = text.replace(/\D/g, '').slice(0, 10);
                      setNewContact({...newContact, number: cleaned});
                      // Clear error when user types
                      if (phoneError) setPhoneError(null);
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  {phoneError && (
                    <Text style={styles.errorText}>{phoneError}</Text>
                  )}
                  
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.button, styles.cancelButton]} 
                      onPress={() => {
                        setShowAddContact(false);
                        setNewContact({ name: '', number: '' });
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.button, styles.saveButton]}
                      onPress={() => {
                        if (!newContact.name) {
                          Alert.alert('Error', 'Please enter a name');
                          return;
                        }
                        
                        if (!newContact.number) {
                          setPhoneError('Please enter a phone number');
                          return;
                        }
                        
                        if (!isValidIndianPhoneNumber(newContact.number)) {
                          setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6-9');
                          return;
                        }
                        
                        // Check if number already exists
                        if (emergencyContacts.some((contact: {name: string, number: string}) => contact.number === newContact.number)) {
                          setPhoneError('This number is already in your emergency contacts');
                          return;
                        }
                        
                        // If all validations pass
                        setEmergencyContacts([...emergencyContacts, newContact]);
                        setNewContact({ name: '', number: '' });
                        setShowAddContact(false);
                        setPhoneError(null);
                        ToastAndroid.show('Contact added successfully!', ToastAndroid.SHORT);
                      }}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
        
        {/* Contacts List */}
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Emergency Contacts:</Text>
          {emergencyContacts.length === 0 ? (
            <Text style={{ color: 'gray' }}>No contacts added yet</Text>
          ) : (
            emergencyContacts.map((contact: {name: string, number: string}, index: number) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <View style={{ padding: 10, backgroundColor: 'transparent', borderRadius: 8, flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{contact.name}</Text>
                  <Text style={{ color: '#4d4d4d97', fontSize: 14 }}>+91 {contact.number}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
                  <TouchableOpacity 
                    style={{ 
                      padding: 8, 
                      backgroundColor: '#007AFF', 
                      borderRadius: 8,
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onPress={() => handleCallContact(contact.number)}
                  >
                    <Ionicons name="call" size={20} color="white" />
                  </TouchableOpacity>
                  
                  {!['181', '100'].includes(contact.number) && (
                    <TouchableOpacity 
                      style={{ 
                        padding: 8, 
                        backgroundColor: '#FF3B30', 
                        borderRadius: 8,
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onPress={() => {
                        setEmergencyContacts(emergencyContacts.filter((_: any, i: number) => i !== index));
                        ToastAndroid.show(`Contact ${contact.name} removed successfully`, ToastAndroid.LONG);
                      }}
                    >
                      <Ionicons name="trash" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    minWidth: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#f6625f',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 40,
  },
  greetings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  safetyContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  safetyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safetyText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  locationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 8,
  },
  coordsText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  // Risk assessment styles
  riskCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  riskScore: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  assessmentTime: {
    fontSize: 12,
    color: '#999',
  },
});
