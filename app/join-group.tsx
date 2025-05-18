import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { LogIn, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const { currentUserId, joinFamilyGroup } = useFamilyStore();
  const router = useRouter();

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'You need to set up your profile first');
      return;
    }

    // Try to join the family group
    const joined = joinFamilyGroup(inviteCode.trim().toUpperCase(), currentUserId);
    
    if (joined) {
      Alert.alert(
        'Joined Successfully',
        'You have joined the family group successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/family-group')
          }
        ]
      );
    } else {
      Alert.alert(
        'Invalid Code',
        'The invite code you entered is invalid. Please check and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Family Group</Text>
        <Text style={styles.subtitle}>
          Enter the invite code shared by your family member
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <LogIn size={60} color={Colors.light.info} />
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Invite Code</Text>
          <TextInput
            style={styles.input}
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            placeholder="Enter 6-digit code"
            placeholderTextColor={Colors.light.textSecondary}
            autoCapitalize="characters"
            maxLength={6}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>After joining a group:</Text>
          <Text style={styles.infoText}>
            • You'll be able to see family members' locations
          </Text>
          <Text style={styles.infoText}>
            • They'll be able to see your location
          </Text>
          <Text style={styles.infoText}>
            • You'll receive notifications about their safety
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
            style={styles.joinButton}
            onPress={handleJoinGroup}
          >
            <Text style={styles.joinButtonText}>Join Group</Text>
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
    backgroundColor: `${Colors.light.info}15`,
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
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
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
  joinButton: {
    flex: 1,
    backgroundColor: Colors.light.info,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});