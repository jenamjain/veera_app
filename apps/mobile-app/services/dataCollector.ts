import { LocationObject } from 'expo-location';
import WomenSafetyApiService, { RiskAssessmentData } from './api';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface POIData {
  count: number;
  types: string[];
}

export interface CrimeData {
  density: number;
  area: string;
}

export interface EnvironmentalData {
  hour: number;
  isNight: boolean;
  isIsolated: boolean;
}

/**
 * Service to collect and process data required for ML risk assessment
 */
export class DataCollectionService {
  
  /**
   * Collects all required data for risk assessment
   */
  static async collectRiskAssessmentData(
    userId: string,
    username: string,
    location: LocationObject,
    emergencyContacts?: any[]
  ): Promise<RiskAssessmentData> {
    
    console.log('🔄 collectRiskAssessmentData called with:', {
      userId,
      username,
      location: {
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude
      }
    });
    
    // Collect location-based data
    const locationData = await this.collectLocationData(location);
    console.log('📍 Location data collected:', locationData);
    
    // Collect POI data
    const poiData = await this.collectPOIData(locationData);
    console.log('🏢 POI data collected:', poiData);
    
    // Collect crime data
    const crimeData = await this.collectCrimeData(locationData);
    console.log('🚨 Crime data collected:', crimeData);
    
    // Collect environmental data
    const environmentalData = this.collectEnvironmentalData();
    console.log('🌍 Environmental data collected:', environmentalData);
    
    // Determine if area is isolated based on POI count and time
    const isIsolated = this.determineIsolation(poiData.count, environmentalData.hour);
    console.log('🔍 Isolation determined:', isIsolated);
    
    const finalData = {
      userId,
      username,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      hour: environmentalData.hour,
      crime_density: crimeData.density,    // ML service expects this
      poi_count: poiData.count,            // ML service expects this
      isNight: environmentalData.isNight,  // ML service expects this
      isIsolated: isIsolated,               // ML service expects this
    };
    
    console.log('📋 Final risk assessment data:', finalData);
    return finalData;
  }

  /**
   * Processes location data
   */
  private static async collectLocationData(location: LocationObject): Promise<LocationData> {
    if (!location.coords?.latitude || !location.coords?.longitude) {
      throw new Error('Invalid location coordinates');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  /**
   * Collects Points of Interest data around the location
   * In a real implementation, this would call Google Places API or similar
   */
  private static async collectPOIData(location: LocationData): Promise<POIData> {
    try {
      // Simulated POI data - replace with actual API call
      // const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=500&type=establishment&key=API_KEY`);
      
      // For demo purposes, simulate POI count based on location
      const simulatedPOICount = this.simulatePOICount(location);
      
      return {
        count: simulatedPOICount,
        types: ['restaurant', 'shop', 'hospital', 'police_station', 'public_place']
      };
    } catch (error) {
      console.error('Error collecting POI data:', error);
      return {
        count: 0,
        types: []
      };
    }
  }

  /**
   * Collects crime density data for the area
   * In a real implementation, this would call a crime data API
   */
  private static async collectCrimeData(location: LocationData): Promise<CrimeData> {
    try {
      // Simulated crime data - replace with actual API call
      // const response = await fetch(`https://api.crime-data.com/density?lat=${location.latitude}&lng=${location.longitude}`);
      
      // For demo purposes, simulate crime density based on location
      const simulatedCrimeDensity = this.simulateCrimeDensity(location);
      
      return {
        density: simulatedCrimeDensity,
        area: 'current_location'
      };
    } catch (error) {
      console.error('Error collecting crime data:', error);
      return {
        density: 0.1, // Default low density
        area: 'unknown'
      };
    }
  }

  /**
   * Collects environmental data (time, day/night, etc.)
   */
  private static collectEnvironmentalData(): EnvironmentalData {
    const currentHour = WomenSafetyApiService.getCurrentHour();
    
    return {
      hour: currentHour,
      isNight: WomenSafetyApiService.isNightTime(),
      isIsolated: false, // Will be determined after POI analysis
    };
  }

  /**
   * Determines if the current location is isolated
   */
  private static determineIsolation(poiCount: number, hour: number): boolean {
    // Consider area isolated if:
    // 1. Very few POIs nearby (less than 3)
    // 2. It's nighttime AND very few POIs (less than 5)
    const isNight = hour >= 20 || hour <= 6;
    
    if (poiCount < 3) return true;
    if (isNight && poiCount < 5) return true;
    
    return false;
  }

  /**
   * Simulates POI count for demo purposes
   * In production, replace with actual API call
   */
  private static simulatePOICount(location: LocationData): number {
    // Simulate different POI densities based on location
    // This is just for demonstration - use real data in production
    const lat = Math.abs(location.latitude);
    const lng = Math.abs(location.longitude);
    
    // Create a pseudo-random but consistent count based on coordinates
    const seed = (lat * lng * 1000) % 100;
    return Math.floor(seed) + 1;
  }

  /**
   * Simulates crime density for demo purposes
   * In production, replace with actual crime data API
   */
  private static simulateCrimeDensity(location: LocationData): number {
    // Simulate different crime densities based on location
    // This is just for demonstration - use real data in production
    const lat = Math.abs(location.latitude);
    const lng = Math.abs(location.longitude);
    
    // Create a pseudo-random but consistent density based on coordinates
    const seed = (lat * lng * 10000) % 100;
    return (seed / 100) * 0.8 + 0.1; // Range: 0.1 to 0.9
  }

  /**
   * Validates collected data before sending to API
   */
  static validateRiskAssessmentData(data: RiskAssessmentData): boolean {
    const requiredFields = [
      'userId', 'username', 'latitude', 'longitude', 
      'hour', 'crime_density', 'poi_count', 'isNight', 'isIsolated'
    ];
    
    for (const field of requiredFields) {
      if (data[field as keyof RiskAssessmentData] === undefined || 
          data[field as keyof RiskAssessmentData] === null) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Validate coordinate ranges
    console.log('🔍 Validating coordinates:', { 
      latitude: data.latitude, 
      longitude: data.longitude,
      latType: typeof data.latitude,
      lngType: typeof data.longitude
    });
    
    if (data.latitude < -90 || data.latitude > 90 ||
        data.longitude < -180 || data.longitude > 180) {
      console.error('❌ Invalid coordinates:', { 
        latitude: data.latitude, 
        longitude: data.longitude 
      });
      return false;
    }
    
    console.log('✅ Coordinates validation passed');
    
    // Validate hour range
    if (data.hour < 0 || data.hour > 23) {
      console.error('Invalid hour');
      return false;
    }
    
    // Validate ranges
    if (data.crime_density < 0 || data.poi_count < 0) {
      console.error('Invalid crime density or POI count');
      return false;
    }
    
    return true;
  }
}

export default DataCollectionService;
