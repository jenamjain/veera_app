import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ToastAndroid, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import Switcher1 from '../components/Switcher1'; // Adjust path as needed
import { LocationGeocodedAddress } from 'expo-location';
import { Ionicons } from '@expo/vector-icons'

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
  
  const localTime = new Date().toLocaleTimeString();
  
  const isValidIndianPhoneNumber = (phone: string): boolean => {
    const indianMobileRegex = /^[6-9]\d{9}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return indianMobileRegex.test(digitsOnly);
  };
  
  const safetyStatusText = isSafetyActive ? 'Safety Mode: Active' : 'Safety Mode: Inactive';
  const safetyStatusTextColor = isSafetyActive ? '#4CAF50' : '#EF4444';

  const handleCallContact = async (phoneNumber: string) => {
    try {
      const phoneUrl = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
        if (Platform.OS === 'android') {
          ToastAndroid.show(`Calling ${phoneNumber}`, ToastAndroid.SHORT);
        }
      } else {
        Alert.alert('Error', 'Cannot open phone app on this device');
      }
    } catch (error) {
      console.error('Error opening phone app:', error);
      Alert.alert('Error', 'Failed to open phone app');
    }
  };

 const handleSafetyToggle = async (newValue: boolean) => {
    setIsSafetyActive(newValue);
    
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
          
          // Construct SMS URL
          const url = `sms:${phoneNumber}?body=${encodeURIComponent(messageBody)}`;
          
          // Check if device supports SMS
          const supported = await Linking.canOpenURL(url);
          
          if (supported) {
            await Linking.openURL(url);
            console.log(`Safety mode SMS opened for ${contact.name}: ${phoneNumber}`);
          } else {
            console.error(`SMS not supported for ${contact.name}`);
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
      
      // Construct SMS URL using the correct format: sms:NUMBER?body=MESSAGE
      const url = `sms:${phoneNumber}?body=${encodeURIComponent(messageBody)}`;
      
      // Check if device supports SMS
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        console.log(`SMS opened for ${contact.name}: ${phoneNumber}`);
      } else {
        console.error(`SMS not supported for ${contact.name}`);
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

  // Fetch initial location on component mount
  useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        // Request permissions if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for safety features.');
          return;
        }
        
        // Get the current location immediately
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setCurrentLocation({ latitude, longitude });
        const address = await reverseGeocode(latitude, longitude);
        setCurrentAddress(address || 'Location unavailable');
        
        console.log('Initial location fetched on component mount');
      } catch (error) {
        console.error('Error fetching initial location:', error);
        setCurrentAddress('Location unavailable');
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
          async (location) => {
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
                    onChangeText={(text) => setNewContact({...newContact, name: text})}
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
                    onChangeText={(text) => {
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
                        if (emergencyContacts.some(contact => contact.number === newContact.number)) {
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
            emergencyContacts.map((contact, index) => (
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
                        setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
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
});
