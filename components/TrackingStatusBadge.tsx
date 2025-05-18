import Colors from '@/constants/colors';
import useLocationTracking from '@/hooks/useLocationTracking';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { Battery, BatteryCharging, BatteryLow, Circle, MapPin } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrackingStatusBadge() {
  const { trackingFrequency, privacyMode } = useFamilyStore();
  const { isTracking, batteryLevel, isMoving } = useLocationTracking();
  const router = useRouter();
  
  // Helper function to get tracking mode information
  const trackingModeInfo = useMemo(() => {
    if (privacyMode) {
      return {
        title: 'Privacy Mode',
        description: 'Location sharing paused',
        color: Colors.light.warning,
      };
    }
    
    if (!isTracking) {
      return {
        title: 'Not Tracking',
        description: 'Location sharing disabled',
        color: Colors.light.danger,
      };
    }
    
    switch (trackingFrequency) {
      case 'ultra-efficient':
        return {
          title: 'Ultra Efficient',
          description: isMoving ? 'Movement detected' : 'Stationary',
          color: Colors.light.success,
        };
      case 'battery-saver':
        return {
          title: 'Battery Saver',
          description: 'Every 30 minutes',
          color: Colors.light.success,
        };
      case 'low':
        return {
          title: 'Low Frequency',
          description: 'Every 5 minutes',
          color: Colors.light.info,
        };
      case 'medium':
        return {
          title: 'Medium Frequency',
          description: 'Every minute',
          color: Colors.light.primary,
        };
      case 'high':
        return {
          title: 'High Frequency',
          description: 'Every 30 seconds',
          color: Colors.light.danger,
        };
      default:
        return {
          title: 'Standard Tracking',
          description: 'Location sharing active',
          color: Colors.light.primary,
        };
    }
  }, [trackingFrequency, isTracking, privacyMode, isMoving]);
  
  // Helper function to get battery status and icon
  const getBatteryInfo = () => {
    if (!batteryLevel) return null;
    
    let Icon = Battery;
    let color = Colors.light.success;
    
    if (batteryLevel < 15) {
      Icon = BatteryLow;
      color = Colors.light.danger;
    } else if (batteryLevel < 30) {
      Icon = BatteryLow;
      color = Colors.light.warning;
    } else if (trackingFrequency === 'ultra-efficient') {
      Icon = BatteryCharging;
      color = Colors.light.success;
    }
    
    return {
      icon: Icon,
      color,
      level: Math.round(batteryLevel)
    };
  };
  
  const batteryInfo = getBatteryInfo();
  const BatteryIcon = batteryInfo?.icon;
  
  // Navigate to tracking settings
  const goToTrackingSettings = () => {
    router.push('tracking-settings' as any);
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { borderLeftColor: trackingModeInfo.color }
      ]}
      onPress={goToTrackingSettings}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isMoving ? (
            <Circle size={8} color={trackingModeInfo.color} style={styles.pulsingDot} />
          ) : (
            <MapPin size={16} color={trackingModeInfo.color} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{trackingModeInfo.title}</Text>
          <Text style={styles.description}>{trackingModeInfo.description}</Text>
        </View>
        
        {batteryInfo && BatteryIcon && (
          <View style={styles.batteryContainer}>
            <BatteryIcon size={16} color={batteryInfo.color} />
            <Text style={[styles.batteryText, { color: batteryInfo.color }]}>
              {batteryInfo.level}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.tapHint}>Tap to adjust</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.light.text}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pulsingDot: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tapHint: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
}); 