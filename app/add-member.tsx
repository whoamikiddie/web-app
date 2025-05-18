import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyMember } from '@/types/family';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, UserCircle2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddMemberScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEmergencyContact, setIsEmergencyContact] = useState(true);
  const { addMember } = useFamilyStore();
  const router = useRouter();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddMember = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Add new family member
    const newMember: Omit<FamilyMember, 'id'> = {
      name: name.trim(),
      phone: phone.trim(),
      avatar,
      isEmergencyContact,
      status: 'offline',
    };
    
    addMember(newMember);

    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Family Member</Text>
        <Text style={styles.subtitle}>
          Add a family member to keep track of their location and safety.
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <UserCircle2 size={60} color={Colors.light.textSecondary} />
          </View>
        )}
        <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
          <Camera size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Emergency Contact</Text>
          <TouchableOpacity
            style={[
              styles.switchOption,
              isEmergencyContact && styles.switchOptionActive
            ]}
            onPress={() => setIsEmergencyContact(true)}
          >
            <Text
              style={[
                styles.switchOptionText,
                isEmergencyContact && styles.switchOptionTextActive
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchOption,
              !isEmergencyContact && styles.switchOptionActive
            ]}
            onPress={() => setIsEmergencyContact(false)}
          >
            <Text
              style={[
                styles.switchOptionText,
                !isEmergencyContact && styles.switchOptionTextActive
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
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
            onPress={handleAddMember}
          >
            <Text style={styles.addButtonText}>Add Member</Text>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.light.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.light.background,
  },
  form: {
    gap: 16,
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
  switchContainer: {
    gap: 8,
  },
  switchOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  switchOption: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginTop: 8,
  },
  switchOptionActive: {
    backgroundColor: Colors.light.primary,
  },
  switchOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  switchOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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