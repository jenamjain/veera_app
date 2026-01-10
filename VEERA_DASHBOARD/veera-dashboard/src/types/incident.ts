export type RiskLevel = 'high' | 'medium' | 'low';

export interface Incident {
  id: string;
  uid: string;
  location: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: Date;
  emergencyContactStatus: 'contacted' | 'not_contacted' | 'pending';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'operator' | 'supervisor';
}
