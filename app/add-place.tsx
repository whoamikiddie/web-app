import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Briefcase, Heart, Home, MapPin, School, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PLACE_TYPES = [
  { id: 'home', name: 'Home', icon: Home },
  { id: 'school', name: 'School', icon: School },
  { id: 'work', name: 'Work', icon: Briefcase },
  { id: 'favorite', name: 'Favorite', icon: Heart },
];

export default function AddPlaceScreen() {
  const [name, setName] = useState('');
  const [placeType, setPlaceType] = useState('home');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { addPlace } = useFamilyStore();
  const router = useRouter();

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
        setIsGettingLocation(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleAddPlace = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this place');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Error', 'Please set a location');
      return;
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const parsedRadius = parseInt(radius, 10) || 100;

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      Alert.alert('Error', 'Invalid coordinates');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Add new place
    addPlace({
      name: name.trim(),
      latitude: parsedLat,
      longitude: parsedLng,
      radius: parsedRadius,
    });

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Important Place</Text>
        <Text style={styles.subtitle}>
          Add places like home, school, or work to get notifications when family members arrive or leave.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Place Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter place name"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.placeTypesContainer}>
          <Text style={styles.label}>Place Type</Text>
          <View style={styles.placeTypes}>
            {PLACE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.placeTypeButton,
                    placeType === type.id && styles.placeTypeButtonActive
                  ]}
                  onPress={() => {
                    setPlaceType(type.id);
                    if (!name) setName(type.name);
                  }}
                >
                  <Icon 
                    size={24} 
                    color={placeType === type.id ? '#FFFFFF' : Colors.light.primary} 
                  />
                  <Text 
                    style={[
                      styles.placeTypeText,
                      placeType === type.id && styles.placeTypeTextActive
                    ]}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity 
              style={styles.getCurrentButton}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.getCurrentButtonText}>
                {isGettingLocation ? 'Getting...' : 'Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={setLatitude}
                placeholder="0.000000"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={setLongitude}
                placeholder="0.000000"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Radius (meters)</Text>
          <TextInput
            style={styles.input}
            value={radius}
            onChangeText={setRadius}
            placeholder="100"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <X size={20} color={Colors.light.text} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPlace}
          >
            <Text style={styles.addButtonText}>Add Place</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  placeTypesContainer: {
    gap: 8,
  },
  placeTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  placeTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: '48%',
  },
  placeTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  placeTypeText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  placeTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationContainer: {
    gap: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  getCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  getCurrentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
    gap: 4,
  },
  coordinateLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});