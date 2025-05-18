import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { Battery, BatteryLow, Clock, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Calculate average per day based on battery percentage change and time
const calculateDailyUsage = (
  history: { timestamp: number; percentage: number }[]
): number | null => {
  if (history.length < 2) return null;
  
  // Sort by timestamp to ensure proper calculation
  const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const first = sortedHistory[0];
  const last = sortedHistory[sortedHistory.length - 1];
  
  // Calculate time difference in days
  const timeDiffInDays = (last.timestamp - first.timestamp) / (1000 * 60 * 60 * 24);
  if (timeDiffInDays < 0.1) return null; // Require at least 2.4 hours of data
  
  // Calculate percentage change (always positive)
  const percentageChange = Math.abs(last.percentage - first.percentage);
  
  // Calculate daily usage
  return percentageChange / timeDiffInDays;
};

interface BatteryUsageInfoProps {
  compact?: boolean;
  onAdjustSettings?: () => void;
}

export default function BatteryUsageInfo({ compact = false, onAdjustSettings }: BatteryUsageInfoProps) {
  const { trackingFrequency } = useFamilyStore();
  const [batteryHistory, setBatteryHistory] = useState<{ timestamp: number; percentage: number }[]>([]);
  const [dailyUsage, setDailyUsage] = useState<number | null>(null);
  
  // Simulated battery usage values based on tracking frequency
  // In a real app, these would be calculated from actual usage data
  const estimatedDailyUsage = {
    'high': 3.2,
    'medium': 1.5,
    'low': 0.6,
    'battery-saver': 0.2,
    'ultra-efficient': 0.08
  };
  
  // Store current time and battery level on component mount
  useEffect(() => {
    // In a real app, you'd have a persistent storage mechanism
    // Here we're simulating with a simple useState
    const now = Date.now();
    
    // Simulate a battery percentage (in a real app, you'd get this from device)
    const simulatedBatteryPercentage = 85;
    
    setBatteryHistory(prev => {
      // Keep only the last week of data
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const recentHistory = prev.filter(item => item.timestamp > weekAgo);
      
      // Add the new entry
      const newHistory = [...recentHistory, { timestamp: now, percentage: simulatedBatteryPercentage }];
      
      // Calculate daily usage
      const usage = calculateDailyUsage(newHistory);
      setDailyUsage(usage);
      
      return newHistory;
    });
  }, []);
  
  // Get the appropriate battery icon and color
  const getBatteryInfo = () => {
    const expectedUsage = estimatedDailyUsage[trackingFrequency] || 1.0;
    
    if (expectedUsage < 0.1) {
      return {
        icon: Battery,
        color: Colors.light.success,
        label: 'Ultra Efficient'
      };
    } else if (expectedUsage < 0.3) {
      return {
        icon: Battery,
        color: Colors.light.success,
        label: 'Very Efficient'
      };
    } else if (expectedUsage < 1.0) {
      return {
        icon: Battery,
        color: Colors.light.info,
        label: 'Efficient'
      };
    } else if (expectedUsage < 2.0) {
      return {
        icon: Battery,
        color: Colors.light.warning,
        label: 'Moderate'
      };
    } else {
      return {
        icon: BatteryLow,
        color: Colors.light.danger,
        label: 'High Usage'
      };
    }
  };
  
  const batteryInfo = getBatteryInfo();
  const BatteryIcon = batteryInfo.icon;
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={onAdjustSettings}
      >
        <BatteryIcon size={18} color={batteryInfo.color} />
        <Text style={[styles.usageValueCompact, { color: batteryInfo.color }]}>
          {estimatedDailyUsage[trackingFrequency].toFixed(2)}%/day
        </Text>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BatteryIcon size={24} color={batteryInfo.color} />
        <Text style={styles.title}>Battery Usage</Text>
        {onAdjustSettings && (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={onAdjustSettings}
          >
            <Text style={styles.settingsText}>Adjust</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.usageContainer}>
          <Text style={styles.usageLabel}>Estimated Daily Usage:</Text>
          <Text style={[styles.usageValue, { color: batteryInfo.color }]}>
            {estimatedDailyUsage[trackingFrequency].toFixed(2)}% per day
          </Text>
          <Text style={styles.usageDescription}>
            {batteryInfo.label} - {trackingFrequency.replace('-', ' ')} mode
          </Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Info size={16} color={Colors.light.textSecondary} />
        <Text style={styles.infoText}>
          Your current settings {estimatedDailyUsage[trackingFrequency] < 0.1 ? 'use less than' : 'use approximately'} {estimatedDailyUsage[trackingFrequency].toFixed(2)}% of your battery per day for location tracking.
        </Text>
      </View>
      
      <View style={styles.frequencyRow}>
        <Clock size={16} color={Colors.light.primary} />
        <Text style={styles.frequencyLabel}>Update frequency:</Text>
        <Text style={styles.frequencyValue}>
          {trackingFrequency === 'high' ? 'Every 30 seconds' :
           trackingFrequency === 'medium' ? 'Every 1 minute' :
           trackingFrequency === 'low' ? 'Every 5 minutes' :
           trackingFrequency === 'battery-saver' ? 'Every 15 minutes' :
           'Every 30 minutes'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  settingsButton: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageContainer: {
    flex: 1,
  },
  usageLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  usageValueCompact: {
    fontSize: 12,
    fontWeight: '600',
  },
  usageDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: `${Colors.light.info}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  frequencyValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
}); 