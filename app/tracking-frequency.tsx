import Colors from '@/constants/colors';
import useLocationTracking from '@/hooks/useLocationTracking';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { Battery, BatteryLow, Clock, Zap } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrackingFrequencyScreen() {
  const { trackingFrequency, setTrackingFrequency } = useFamilyStore();
  const { stopTracking, startTracking } = useLocationTracking();
  const router = useRouter();

  const handleSelectFrequency = (frequency: 'high' | 'medium' | 'low' | 'battery-saver') => {
    setTrackingFrequency(frequency);
    
    // Restart tracking with new settings
    stopTracking();
    startTracking();
    
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location Update Frequency</Text>
        <Text style={styles.subtitle}>
          Choose how often your location is updated. Higher frequency uses more battery.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[
            styles.optionCard,
            trackingFrequency === 'high' && styles.selectedOptionCard
          ]}
          onPress={() => handleSelectFrequency('high')}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.danger}20` }]}>
            <Zap size={24} color={Colors.light.danger} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>High Frequency</Text>
            <Text style={styles.optionDescription}>
              Updates every 30 seconds. Best for emergency situations.
            </Text>
          </View>
          <View style={styles.batteryImpact}>
            <Text style={[styles.batteryText, { color: Colors.light.danger }]}>High Battery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            trackingFrequency === 'medium' && styles.selectedOptionCard
          ]}
          onPress={() => handleSelectFrequency('medium')}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.primary}20` }]}>
            <Clock size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Medium Frequency</Text>
            <Text style={styles.optionDescription}>
              Updates every 1 minute. Good balance of accuracy and battery life.
            </Text>
          </View>
          <View style={styles.batteryImpact}>
            <Text style={[styles.batteryText, { color: Colors.light.primary }]}>Medium Battery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            trackingFrequency === 'low' && styles.selectedOptionCard
          ]}
          onPress={() => handleSelectFrequency('low')}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.info}20` }]}>
            <Battery size={24} color={Colors.light.info} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Low Frequency</Text>
            <Text style={styles.optionDescription}>
              Updates every 5 minutes. Good for daily use to save battery.
            </Text>
          </View>
          <View style={styles.batteryImpact}>
            <Text style={[styles.batteryText, { color: Colors.light.info }]}>Low Battery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionCard,
            trackingFrequency === 'battery-saver' && styles.selectedOptionCard
          ]}
          onPress={() => handleSelectFrequency('battery-saver')}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${Colors.light.success}20` }]}>
            <BatteryLow size={24} color={Colors.light.success} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Battery Saver</Text>
            <Text style={styles.optionDescription}>
              Updates every 15 minutes. Minimal battery impact, less accurate.
            </Text>
          </View>
          <View style={styles.batteryImpact}>
            <Text style={[styles.batteryText, { color: Colors.light.success }]}>Minimal Battery</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  batteryImpact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});