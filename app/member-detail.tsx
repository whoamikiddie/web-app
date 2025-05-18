import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { formatPhoneNumber, formatTimestamp } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Battery, CheckCircle, Clock, History, MapPin, Phone, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { members, removeMember, currentUserId, getLocationHistory, getLastCheckIn } = useFamilyStore();
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();
  
  const member = members.find(m => m.id === id);
  
  if (!member) {
    return (
      <View style={styles.notFound}>
        <Text>Member not found</Text>
      </View>
    );
  }

  const isCurrentUser = member.id === currentUserId;
  const locationHistory = getLocationHistory(member.id, 5);
  const lastCheckIn = getLastCheckIn(member.id);
  
  const getBatteryColor = (level?: number) => {
    if (!level) return Colors.light.textSecondary;
    if (level < 20) return Colors.light.danger;
    if (level < 40) return Colors.light.warning;
    return Colors.light.success;
  };

  const handleDeleteMember = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    removeMember(member.id);
    router.back();
  };

  const getDefaultAvatar = () => {
    return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&q=80';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image 
          source={{ uri: member.avatar || getDefaultAvatar() }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{member.name}</Text>
        {member.status === 'sos' && (
          <View style={styles.sosIndicator}>
            <AlertTriangle size={16} color="#FFFFFF" />
            <Text style={styles.sosText}>Emergency SOS Active</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        {member.lastLocation && (
          <View style={styles.infoItem}>
            <MapPin size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Location</Text>
              <Text style={styles.infoValue}>
                {member.lastLocation.latitude.toFixed(6)}, {member.lastLocation.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        )}
        
        {member.lastLocation && (
          <View style={styles.infoItem}>
            <Clock size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {formatTimestamp(member.lastLocation.timestamp)}
              </Text>
            </View>
          </View>
        )}
        
        {lastCheckIn && (
          <View style={styles.infoItem}>
            <CheckCircle size={20} color={Colors.light.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Check-in</Text>
              <Text style={styles.infoValue}>
                {formatTimestamp(lastCheckIn.timestamp)}
                {lastCheckIn.message && ` - "${lastCheckIn.message}"`}
              </Text>
            </View>
          </View>
        )}
        
        {member.battery !== undefined && (
          <View style={styles.infoItem}>
            <Battery size={20} color={getBatteryColor(member.battery)} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Battery Level</Text>
              <Text style={[styles.infoValue, { color: getBatteryColor(member.battery) }]}>
                {member.battery}%
              </Text>
            </View>
          </View>
        )}
        
        {member.phone && (
          <View style={styles.infoItem}>
            <Phone size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{formatPhoneNumber(member.phone)}</Text>
            </View>
          </View>
        )}
      </View>

      {locationHistory && locationHistory.locations.length > 0 && (
        <View style={styles.historySection}>
          <TouchableOpacity 
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <View style={styles.historyHeaderLeft}>
              <History size={20} color={Colors.light.primary} />
              <Text style={styles.historyTitle}>Location History</Text>
            </View>
            <Text style={styles.historyToggle}>
              {showHistory ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
          
          {showHistory && (
            <View style={styles.historyList}>
              {locationHistory.locations.map((location, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemDot} />
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTime}>
                      {formatTimestamp(location.timestamp)}
                    </Text>
                    <Text style={styles.historyItemLocation}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {!isCurrentUser && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteMember}
        >
          <Trash2 size={20} color={Colors.light.danger} />
          <Text style={styles.deleteText}>Remove from Family</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  sosIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.danger,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  historySection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: showHistory => showHistory ? 1 : 0,
    borderBottomColor: Colors.light.border,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  historyToggle: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyItemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
    marginTop: 4,
    marginRight: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  historyItemLocation: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.danger,
  },
});