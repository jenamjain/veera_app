import { Incident, RiskLevel } from '@/types/incident';

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export const mockIncidents: Incident[] = [
  {
    id: '1',
    uid: 'VR-2024-001',
    location: 'Connaught Place, New Delhi',
    latitude: 28.6315,
    longitude: 77.2167,
    riskScore: 85,
    riskLevel: getRiskLevel(85),
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    emergencyContactStatus: 'contacted',
  },
  {
    id: '2',
    uid: 'VR-2024-002',
    location: 'Andheri West, Mumbai',
    latitude: 19.1197,
    longitude: 72.8464,
    riskScore: 72,
    riskLevel: getRiskLevel(72),
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 mins ago
    emergencyContactStatus: 'pending',
  },
  {
    id: '3',
    uid: 'VR-2024-003',
    location: 'Koramangala, Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
    riskScore: 55,
    riskLevel: getRiskLevel(55),
    timestamp: new Date(Date.now() - 18 * 60 * 1000), // 18 mins ago
    emergencyContactStatus: 'not_contacted',
  },
  {
    id: '4',
    uid: 'VR-2024-004',
    location: 'Salt Lake City, Kolkata',
    latitude: 22.5804,
    longitude: 88.4175,
    riskScore: 92,
    riskLevel: getRiskLevel(92),
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    emergencyContactStatus: 'contacted',
  },
  {
    id: '5',
    uid: 'VR-2024-005',
    location: 'Banjara Hills, Hyderabad',
    latitude: 17.4156,
    longitude: 78.4347,
    riskScore: 35,
    riskLevel: getRiskLevel(35),
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    emergencyContactStatus: 'contacted',
  },
  {
    id: '6',
    uid: 'VR-2024-006',
    location: 'T Nagar, Chennai',
    latitude: 13.0418,
    longitude: 80.2341,
    riskScore: 28,
    riskLevel: getRiskLevel(28),
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    emergencyContactStatus: 'contacted',
  },
  {
    id: '7',
    uid: 'VR-2024-007',
    location: 'MG Road, Pune',
    latitude: 18.5196,
    longitude: 73.8553,
    riskScore: 68,
    riskLevel: getRiskLevel(68),
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 mins ago
    emergencyContactStatus: 'pending',
  },
  {
    id: '8',
    uid: 'VR-2024-008',
    location: 'Sector 17, Chandigarh',
    latitude: 30.7411,
    longitude: 76.7854,
    riskScore: 78,
    riskLevel: getRiskLevel(78),
    timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 mins ago
    emergencyContactStatus: 'not_contacted',
  },
];
