import { generateId, generateInviteCode } from '@/utils/helpers';
import { create } from 'zustand';

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

  interface FamilyStore {
    // User and members
    currentUserId: string | null;
    members: FamilyMember[];
    places: Place[];
    
    // Family groups
    familyGroups: FamilyGroup[];
    currentGroupId: string | null;
    
    // Emergency
    emergencyContacts: EmergencyContact[];
    emergencyMessages: EmergencyMessage[];
    
    // Settings
    trackingFrequency: 'high' | 'medium' | 'low' | 'battery-saver' | 'ultra-efficient';
    privacyMode: boolean;
    pauseTrackingWhenStationary: boolean;
    reducedAccuracyWhenBackground: boolean;
    
    // Location tracking
    lastReportedLocation: { latitude: number; longitude: number } | null;
    lastMovementTimestamp: number | null;
    
    // Actions
    setTrackingFrequency: (frequency: 'high' | 'medium' | 'low' | 'battery-saver' | 'ultra-efficient') => void;
    togglePrivacyMode: () => void;
    setPauseTrackingWhenStationary: (pause: boolean) => void;
    setReducedAccuracyWhenBackground: (reduce: boolean) => void;
    updateLocation: (update: LocationUpdate) => void;
    setLastReportedLocation: (location: { latitude: number; longitude: number }) => void;
    addPlace: (place: Place) => void;
    createFamilyGroup: (name: string, createdById: string) => FamilyGroup;
    joinFamilyGroup: (inviteCode: string, memberId: string) => boolean;
    setCurrentGroup: (groupId: string) => void;
    leaveFamilyGroup: (groupId: string, memberId: string) => void;
    addMember: (member: Omit<FamilyMember, 'id'>) => string;
    updateMember: (id: string, updates: Partial<FamilyMember>) => void;
    removeMember: (id: string) => void;
    setCurrentUser: (id: string) => void;
    addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
    getLocationHistory: (memberId: string) => LocationHistory | null;
    getLastCheckIn: (memberId: string) => CheckIn | null;
    addEmergencyMessage: (message: Omit<EmergencyMessage, 'id'>) => string;
    updateEmergencyMessage: (id: string, updates: Partial<EmergencyMessage>) => void;
    removeEmergencyMessage: (id: string) => void;
  }
  
  export const useFamilyStore = create<FamilyStore>((set, get) => ({
    // Initial state
    currentUserId: null,
    members: [],
    places: [],
    familyGroups: [],
    currentGroupId: null,
    emergencyContacts: [],
    emergencyMessages: [],
    trackingFrequency: 'medium',
    privacyMode: false,
    pauseTrackingWhenStationary: false,
    reducedAccuracyWhenBackground: false,
    lastReportedLocation: null,
    lastMovementTimestamp: null,
    
    // Actions
    setTrackingFrequency: (frequency) => set({ trackingFrequency: frequency }),
    
    togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
    
    setPauseTrackingWhenStationary: (pause) => set({ pauseTrackingWhenStationary: pause }),
    
    setReducedAccuracyWhenBackground: (reduce) => set({ reducedAccuracyWhenBackground: reduce }),
    
    updateLocation: (update) => set((state) => {
      const updatedMembers = state.members.map(member => {
        if (member.id === update.memberId) {
          return {
            ...member,
            lastLocation: {
              latitude: update.latitude,
              longitude: update.longitude,
              timestamp: update.timestamp,
              accuracy: update.accuracy
            },
            battery: update.battery || member.battery,
            status: 'online' as const
          };
        }
        return member;
      });
      
      return { 
        members: updatedMembers,
        lastMovementTimestamp: Date.now()
      };
    }),
    
    setLastReportedLocation: (location) => set({ lastReportedLocation: location }),
    
    addPlace: (place) => set((state) => ({
      places: [...state.places, place]
    })),
    
    createFamilyGroup: (name, createdById) => {
      const newGroup: FamilyGroup = {
        id: generateId(),
        name,
        createdBy: createdById,
        inviteCode: generateInviteCode(),
        members: [createdById], // Add creator as the first member
        createdAt: Date.now(),
      };
      
      set((state) => ({
        familyGroups: [...state.familyGroups, newGroup],
        currentGroupId: newGroup.id, // Set as current group
      }));
      
      return newGroup;
    },
    
    joinFamilyGroup: (inviteCode, memberId) => {
      let joined = false;
      
      set((state) => {
        const updatedGroups = state.familyGroups.map(group => {
          if (group.inviteCode === inviteCode && !group.members.includes(memberId)) {
            joined = true;
            return {
              ...group,
              members: [...group.members, memberId]
            };
          }
          return group;
        });
        
        const joinedGroup = updatedGroups.find(g => g.inviteCode === inviteCode);
        
        return {
          familyGroups: updatedGroups,
          currentGroupId: joined && joinedGroup ? joinedGroup.id : state.currentGroupId
        };
      });
      
      return joined;
    },
    
    setCurrentGroup: (groupId) => set({ currentGroupId: groupId }),
    
    leaveFamilyGroup: (groupId, memberId) => {
      set((state) => {
        const updatedGroups = state.familyGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              members: group.members.filter(id => id !== memberId)
            };
          }
          return group;
        });
        
        return {
          familyGroups: updatedGroups,
          // If leaving current group, set currentGroupId to null
          currentGroupId: state.currentGroupId === groupId ? null : state.currentGroupId
        };
      });
    },
    
    addMember: (member) => {
      const id = generateId();
      const newMember = { ...member, id };
      
      set((state) => ({
        members: [...state.members, newMember]
      }));
      
      return id;
    },
    
    updateMember: (id, updates) => {
      set((state) => ({
        members: state.members.map(member => 
          member.id === id ? { ...member, ...updates } : member
        )
      }));
    },
    
    removeMember: (id) => {
      set((state) => ({
        members: state.members.filter(member => member.id !== id)
      }));
    },
    
    setCurrentUser: (id) => set({ currentUserId: id }),
    
    addCheckIn: (checkIn) => {
      // Implementation would be added here
      console.log('Check-in added:', checkIn);
    },
    
    getLocationHistory: (memberId) => {
      // This would fetch from a real database in a production app
      return null;
    },
    
    getLastCheckIn: (memberId) => {
      // This would fetch from a real database in a production app
      return null;
    },
    
    addEmergencyMessage: (message) => {
      const id = generateId();
      // Implementation would be added here
      console.log('Emergency message added:', { ...message, id });
      return id;
    },
    
    updateEmergencyMessage: (id, updates) => {
      // Implementation would be added here
      console.log('Emergency message updated:', { id, ...updates });
    },
    
    removeEmergencyMessage: (id) => {
      // Implementation would be added here
      console.log('Emergency message removed:', id);
    }
  }));