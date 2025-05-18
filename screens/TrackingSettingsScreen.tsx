import BatteryUsageInfo from '@/components/BatteryUsageInfo';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { Battery, BatteryCharging, Bolt, Clock, MapPin, Power, Shield } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type TrackingFrequency = 'high' | 'medium' | 'low' | 'battery-saver' | 'ultra-efficient';

interface FrequencyOption {
  value: TrackingFrequency;
  label: string;
  description: string;
  batteryImpact: string;
  icon: React.FC<any>;
  color: string;
}

export default function TrackingSettingsScreen() {
  const { 
    trackingFrequency, 
    setTrackingFrequency,
    setPauseTrackingWhenStationary,
    pauseTrackingWhenStationary,
    reducedAccuracyWhenBackground,
    setReducedAccuracyWhenBackground
  } = useFamilyStore();
  
  const frequencyOptions: FrequencyOption[] = [
    {
      value: 'ultra-efficient',
      label: 'Ultra Efficient',
      description: 'Maximum battery saving with significant location change detection only',
      batteryImpact: '~0.08% per day',
      icon: BatteryCharging,
      color: Colors.light.success
    },
    {
      value: 'battery-saver',
      label: 'Battery Saver',
      description: 'Very low battery usage with updates every 30 minutes',
      batteryImpact: '~0.2% per day',
      icon: Battery,
      color: Colors.light.success
    },
    {
      value: 'low',
      label: 'Low',
      description: 'Low battery usage with updates every 5 minutes when active',
      batteryImpact: '~0.6% per day',
      icon: Battery,
      color: Colors.light.info
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Moderate battery usage with updates every minute when active',
      batteryImpact: '~1.5% per day',
      icon: Bolt,
      color: Colors.light.warning
    },
    {
      value: 'high',
      label: 'High',
      description: 'Frequent updates every 30 seconds for precise location tracking',
      batteryImpact: '~3.2% per day',
      icon: Power,
      color: Colors.light.danger
    }
  ];
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Location Tracking Settings</Text>
      <Text style={styles.subtitle}>
        Customize how often your location is updated and shared with family members
      </Text>
      
      <BatteryUsageInfo />
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Update Frequency</Text>
        </View>
        
        {frequencyOptions.map((option) => {
          const isSelected = trackingFrequency === option.value;
          const OptionIcon = option.icon;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.frequencyOption,
                isSelected && styles.selectedOption
              ]}
              onPress={() => setTrackingFrequency(option.value)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                <OptionIcon size={20} color={option.color} />
              </View>
              
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={[styles.batteryImpact, { color: option.color }]}>
                    {option.batteryImpact}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              
              <View style={[
                styles.radioOuter,
                isSelected && { borderColor: Colors.light.primary }
              ]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={18} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Additional Battery Optimizations</Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pause when stationary</Text>
            <Text style={styles.settingDescription}>
              Reduce updates when you're not moving to save battery
            </Text>
          </View>
          <Switch
            value={pauseTrackingWhenStationary}
            onValueChange={setPauseTrackingWhenStationary}
            trackColor={{ false: "#767577", true: `${Colors.light.primary}80` }}
            thumbColor={pauseTrackingWhenStationary ? Colors.light.primary : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Reduce accuracy in background</Text>
            <Text style={styles.settingDescription}>
              Use less precise location when app is in background
            </Text>
          </View>
          <Switch
            value={reducedAccuracyWhenBackground}
            onValueChange={setReducedAccuracyWhenBackground}
            trackColor={{ false: "#767577", true: `${Colors.light.primary}80` }}
            thumbColor={reducedAccuracyWhenBackground ? Colors.light.primary : "#f4f3f4"}
          />
        </View>
      </View>
      
      <View style={styles.infoCard}>
        <MapPin size={16} color={Colors.light.textSecondary} />
        <Text style={styles.infoText}>
          Lower tracking frequencies will help conserve battery but may result in less accurate location data. The Ultra Efficient mode will activate GPS only when significant movement is detected.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
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
    marginBottom: 20,
  },
  section: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: `${Colors.light.primary}10`,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  batteryImpact: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.light.info}10`,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
}); 