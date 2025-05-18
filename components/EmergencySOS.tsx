import Colors from '@/constants/colors';
import useLocationTracking from '@/hooks/useLocationTracking';
import { useFamilyStore } from '@/store/familyStore';
import * as Haptics from 'expo-haptics';
import { AlertTriangle, MessageCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EmergencySOS() {
  const [pressing, setPressing] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const { 
    currentUserId, 
    triggerEmergency, 
    isEmergencyActive, 
    cancelEmergency,
    emergencyMessages
  } = useFamilyStore();
  const { getOneTimeLocation } = useLocationTracking();

  const handleSOSPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setPressing(true);
  };

  const handleSOSRelease = () => {
    setPressing(false);
  };

  const handleSOSLongPress = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You need to set up your profile first');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Get current location before triggering emergency
    await getOneTimeLocation();
    
    // If there are emergency messages, show options
    if (emergencyMessages && emergencyMessages.length > 0) {
      setShowEmergencyOptions(true);
    } else {
      // Otherwise trigger default emergency
      triggerEmergency(currentUserId);
      
      Alert.alert(
        'Emergency Activated',
        'Your emergency contacts have been notified of your situation and location.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancelEmergency = () => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            cancelEmergency();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } 
        }
      ]
    );
  };

  const handleSelectEmergencyMessage = (messageId: string) => {
    if (!currentUserId) return;
    
    // In a real app, you would send this specific message
    // For now, we'll just trigger the emergency
    triggerEmergency(currentUserId);
    
    setShowEmergencyOptions(false);
    
    Alert.alert(
      'Emergency Activated',
      'Your emergency contacts have been notified with your selected message and location.',
      [{ text: 'OK' }]
    );
  };

  const handleQuickMessage = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You need to set up your profile first');
      return;
    }

    // Get current location
    await getOneTimeLocation();
    
    // Add a check-in with a predefined message
    useFamilyStore.getState().addCheckIn(
      currentUserId, 
      "I'm safe, just checking in."
    );
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      'Check-in Sent',
      'Your family members have been notified that you are safe.',
      [{ text: 'OK' }]
    );
  };

  if (isEmergencyActive) {
    return (
      <TouchableOpacity 
        style={styles.cancelContainer}
        onPress={handleCancelEmergency}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelText}>CANCEL EMERGENCY</Text>
      </TouchableOpacity>
    );
  }

  if (showEmergencyOptions) {
    // Show emergency message options
    return (
      <View style={styles.emergencyOptionsContainer}>
        <Text style={styles.emergencyOptionsTitle}>Select Emergency Type:</Text>
        
        {/* Default emergency messages if none are set */}
        {(!emergencyMessages || emergencyMessages.length === 0) ? (
          <>
            <TouchableOpacity 
              style={styles.emergencyOption}
              onPress={() => handleSelectEmergencyMessage('default')}
            >
              <Text style={styles.emergencyOptionText}>Medical Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.emergencyOption}
              onPress={() => handleSelectEmergencyMessage('default')}
            >
              <Text style={styles.emergencyOptionText}>Need Help Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          // User's custom emergency messages
          emergencyMessages.map(message => (
            <TouchableOpacity 
              key={message.id}
              style={styles.emergencyOption}
              onPress={() => handleSelectEmergencyMessage(message.id)}
            >
              <Text style={styles.emergencyOptionText}>{message.message}</Text>
            </TouchableOpacity>
          ))
        )}
        
        <TouchableOpacity 
          style={styles.cancelOption}
          onPress={() => setShowEmergencyOptions(false)}
        >
          <Text style={styles.cancelOptionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.checkInButton}
        onPress={handleQuickMessage}
        activeOpacity={0.7}
      >
        <MessageCircle size={20} color="#FFFFFF" />
        <Text style={styles.checkInText}>Check In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.container, pressing && styles.pressing]}
        onPressIn={handleSOSPress}
        onPressOut={handleSOSRelease}
        onLongPress={handleSOSLongPress}
        delayLongPress={2000}
        activeOpacity={0.9}
      >
        <AlertTriangle size={24} color="#FFFFFF" />
        <Text style={styles.text}>Hold for SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  container: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.light.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pressing: {
    backgroundColor: Colors.light.danger,
    transform: [{ scale: 1.05 }],
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelContainer: {
    backgroundColor: Colors.light.danger,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  checkInButton: {
    backgroundColor: Colors.light.info,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.light.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emergencyOption: {
    backgroundColor: Colors.light.danger,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emergencyOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelOption: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  cancelOptionText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});