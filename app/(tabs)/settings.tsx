import Colors from '@/constants/colors';
import useLocationTracking from '@/hooks/useLocationTracking';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { Battery, Bell, Clock, Info, LogOut, MapPin, MessageCircle, Moon, Shield, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { 
    currentUserId, 
    members, 
    privacyMode, 
    togglePrivacyMode,
    trackingFrequency,
    setTrackingFrequency
  } = useFamilyStore();
  const { startTracking, stopTracking, isTracking } = useLocationTracking();
  const router = useRouter();
  
  const [trackingEnabled, setTrackingEnabled] = useState(isTracking);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(trackingFrequency === 'battery-saver');
  
  const currentUser = members.find(member => member.id === currentUserId);

  const handleTrackingToggle = (value: boolean) => {
    setTrackingEnabled(value);
    if (value) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const handleLowPowerToggle = (value: boolean) => {
    setLowPowerMode(value);
    // Set tracking frequency based on low power mode
    setTrackingFrequency(value ? 'battery-saver' : 'medium');
    
    // Restart tracking with new settings
    if (isTracking) {
      stopTracking();
      startTracking();
    }
  };

  const handlePrivacyModeToggle = (value: boolean) => {
    togglePrivacyMode();
    
    if (value) {
      Alert.alert(
        'Privacy Mode Enabled',
        'Your location will not be shared with family members while privacy mode is on.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your family will not be able to see your location.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
            stopTracking();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your preferences and privacy
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MapPin size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Location Tracking</Text>
          </View>
          <Switch
            value={trackingEnabled}
            onValueChange={handleTrackingToggle}
            trackColor={{ false: Colors.light.inactive, true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Battery size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Battery Saver Mode</Text>
          </View>
          <Switch
            value={lowPowerMode}
            onValueChange={handleLowPowerToggle}
            trackColor={{ false: Colors.light.inactive, true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Clock size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Location Update Frequency</Text>
          </View>
          <TouchableOpacity 
            style={styles.frequencyButton}
            onPress={() => router.push('/tracking-frequency')}
          >
            <Text style={styles.frequencyButtonText}>
              {trackingFrequency === 'high' ? 'High' : 
               trackingFrequency === 'medium' ? 'Medium' : 
               trackingFrequency === 'low' ? 'Low' : 'Battery Saver'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.light.inactive, true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Shield size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Emergency Alerts</Text>
          </View>
          <Switch
            value={true}
            disabled={true}
            trackColor={{ false: Colors.light.inactive, true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Moon size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Privacy Mode</Text>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={handlePrivacyModeToggle}
            trackColor={{ false: Colors.light.inactive, true: Colors.light.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family</Text>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => router.push('/family-groups')}
        >
          <View style={styles.settingInfo}>
            <Users size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Family Groups</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => router.push('/emergency-contacts')}
        >
          <View style={styles.settingInfo}>
            <Shield size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Emergency Contacts</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={() => router.push('/emergency-messages')}
        >
          <View style={styles.settingInfo}>
            <MessageCircle size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>Emergency Messages</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingButton}>
          <View style={styles.settingInfo}>
            <Info size={20} color={Colors.light.primary} />
            <Text style={styles.settingText}>App Information</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color={Colors.light.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>
        Family Safety v1.0.0
      </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  frequencyButton: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 24,
  },
});