import Colors from '@/constants/colors';
import { FamilyMember } from '@/store/familyStore';
import { formatTimestamp } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { Battery, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FamilyMemberItemProps {
  member: FamilyMember;
  showDetails?: boolean;
}

export default function FamilyMemberItem({ member, showDetails = true }: FamilyMemberItemProps) {
  const router = useRouter();
  
  const getBatteryColor = () => {
    if (!member.battery) return Colors.light.inactive;
    
    if (member.battery < 20) {
      return Colors.light.danger;
    } else if (member.battery < 50) {
      return Colors.light.warning;
    }
    return Colors.light.success;
  };

  const handlePress = () => {
    router.push({
      pathname: '/member-detail',
      params: { id: member.id }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.initials}>
              {member.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {member.status === 'online' && <View style={styles.onlineIndicator} />}
        {member.status === 'sos' && <View style={styles.sosIndicator} />}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{member.name}</Text>
        
        {showDetails && (
          <>
            {member.lastLocation ? (
              <View style={styles.locationInfo}>
                <MapPin size={14} color={Colors.light.textSecondary} />
                <Text style={styles.locationText}>
                  Last updated {formatTimestamp(member.lastLocation.timestamp)}
                </Text>
              </View>
            ) : (
              <Text style={styles.locationText}>Location not available</Text>
            )}
            
            {member.lastCheckIn && (
              <View style={styles.checkInInfo}>
                <Clock size={14} color={Colors.light.textSecondary} />
                <Text style={styles.locationText}>
                  Checked in {formatTimestamp(member.lastCheckIn)}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      
      {member.battery !== undefined && (
        <View style={styles.batteryContainer}>
          <Battery size={16} color={getBatteryColor()} />
          <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
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
    padding: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
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
  placeholderAvatar: {
    backgroundColor: Colors.light.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    borderWidth: 2,
    borderColor: Colors.light.card,
  },
  sosIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.danger,
    borderWidth: 2,
    borderColor: Colors.light.card,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 