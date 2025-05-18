export interface FamilyMember {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    isEmergencyContact: boolean;
    lastLocation?: {
      latitude: number;
      longitude: number;
      timestamp: number;
      accuracy?: number;
    };
    status?: 'online' | 'offline' | 'sos';
    battery?: number;
    places?: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      radius: number;
    }[];
    lastCheckIn?: number;
  }
  
  export interface LocationUpdate {
    memberId: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy?: number;
    battery?: number;
  }
  
  export interface Place {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
    address?: string;
  }
  
  export interface FamilyGroup {
    id: string;
    name: string;
    createdBy: string;
    inviteCode: string;
    members: string[]; // Array of member IDs
    createdAt: number;
  }
  
  export interface CheckIn {
    id: string;
    memberId: string;
    timestamp: number;
    location?: {
      latitude: number;
      longitude: number;
    };
    message?: string;
  }
  
  export interface LocationHistory {
    memberId: string;
    locations: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
      accuracy?: number;
    }>;
  }
  
  export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    relationship?: string;
    notifyOnSOS: boolean;
    notifyOnLowBattery: boolean;
  }
  
  export interface EmergencyMessage {
    id: string;
    message: string;
    includeLocation: boolean;
  }