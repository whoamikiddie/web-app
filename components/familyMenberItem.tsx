import Colors from '@/constants/colors';
import { FamilyMember } from '@/types/family';
import { formatTimestamp } from '@/utils/helpers';
import { AlertTriangle, Battery, CheckCircle, MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FamilyMemberItemProps {
  member: FamilyMember;
  onPress: (member: FamilyMember) => void;
}

export default function FamilyMemberItem({ member, onPress }: FamilyMemberItemProps) {
  const getBatteryColor = (level?: number) => {
    if (!level) return Colors.light.textSecondary;
    if (level < 20) return Colors.light.danger;
    if (level < 40) return Colors.light.warning;
    return Colors.light.success;
  };

  const getStatusColor = (status?: string) => {
    if (status === 'sos') return Colors.light.danger;
    if (status === 'offline') return Colors.light.inactive;
    return Colors.light.success;
  };

  const getDefaultAvatar = () => {
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&q=80';
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(member)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: member.avatar || getDefaultAvatar() }} 
          style={styles.avatar} 
        />
        <View 
          style={[
            styles.statusIndicator, 
            { backgroundColor: getStatusColor(member.status) }
          ]} 
        />
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{member.name}</Text>
          {member.status === 'sos' && (
            <View style={styles.sosIndicator}>
              <AlertTriangle size={14} color="#FFFFFF" />
              <Text style={styles.sosText}>SOS</Text>
            </View>
          )}
          {member.lastCheckIn && (
            <View style={styles.checkInIndicator}>
              <CheckCircle size={12} color={Colors.light.info} />
              <Text style={styles.checkInText}>
                Checked in {formatTimestamp(member.lastCheckIn)}
              </Text>
            </View>
          )}
        </View>
        
        {member.lastLocation ? (
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.light.textSecondary} />
            <Text style={styles.locationText}>
              Updated {formatTimestamp(member.lastLocation.timestamp)}
            </Text>
          </View>
        ) : (
          <Text style={styles.locationText}>No location data</Text>
        )}
      </View>
      
      {member.battery !== undefined && (
        <View style={styles.batteryContainer}>
          <Battery size={16} color={getBatteryColor(member.battery)} />
          <Text style={[styles.batteryText, { color: getBatteryColor(member.battery) }]}>
            {member.battery}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.light.card,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  sosIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.danger,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  checkInIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkInText: {
    fontSize: 10,
    color: Colors.light.info,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});