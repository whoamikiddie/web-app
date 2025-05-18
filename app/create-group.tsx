import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const { currentUserId, createFamilyGroup } = useFamilyStore();
  const router = useRouter();

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'You need to set up your profile first');
      return;
    }

    // Create the family group
    createFamilyGroup(groupName.trim(), currentUserId);
    
    Alert.alert(
      'Group Created',
      'Your family group has been created successfully. You can now invite others to join.',
      [
        { 
          text: 'OK', 
          onPress: () => router.push('/family-group')
        }
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Family Group</Text>
        <Text style={styles.subtitle}>
          Create a new family group to connect with your loved ones
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Users size={60} color={Colors.light.primary} />
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter family group name"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>After creating your group:</Text>
          <Text style={styles.infoText}>
            • You'll get a unique invite code to share with family members
          </Text>
          <Text style={styles.infoText}>
            • Family members can join using the code
          </Text>
          <Text style={styles.infoText}>
            • You'll be able to see each other's locations
          </Text>
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
            style={styles.createButton}
            onPress={handleCreateGroup}
          >
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 24,
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
  infoContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
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
  createButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});