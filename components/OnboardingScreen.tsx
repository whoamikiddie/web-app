import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyMember } from '@/types/family';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, UserCircle2, UserPlus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [step, setStep] = useState<'profile' | 'family' | 'join'>('profile');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createFamily, setCreateFamily] = useState(true);
  
  const { addMember, setCurrentUser, createFamilyGroup, joinFamilyGroup } = useFamilyStore();
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

  const handleNextStep = () => {
    if (step === 'profile') {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      setStep('family');
    } else if (step === 'family') {
      if (createFamily && !familyName.trim()) {
        Alert.alert('Error', 'Please enter a family group name');
        return;
      } else if (!createFamily && !inviteCode.trim()) {
        Alert.alert('Error', 'Please enter an invite code');
        return;
      }
      
      completeSetup();
    }
  };

  const completeSetup = () => {
    // Create new family member (current user)
    const newMember: Omit<FamilyMember, 'id'> = {
      name: name.trim(),
      phone: phone.trim(),
      avatar,
      isEmergencyContact: true,
      status: 'online',
    };

    const memberId = addMember(newMember);
    setCurrentUser(memberId);
    
    // Create or join family group
    if (createFamily) {
      createFamilyGroup(familyName.trim(), memberId);
    } else {
      const joined = joinFamilyGroup(inviteCode.trim().toUpperCase(), memberId);
      if (!joined) {
        Alert.alert(
          'Invalid Code', 
          'The invite code you entered is invalid. Please check and try again.',
          [
            { 
              text: 'OK', 
              onPress: () => setStep('family')
            }
          ]
        );
        return;
      }
    }
    
    router.replace('/(tabs)');
  };

  const renderProfileStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Family Safety</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile to help keep your family connected and safe.
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
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.light.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleNextStep}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderFamilyStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Connect with Family</Text>
        <Text style={styles.subtitle}>
          Create a new family group or join an existing one with an invite code.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionCard, createFamily && styles.optionCardSelected]}
          onPress={() => setCreateFamily(true)}
        >
          <UserPlus size={40} color={createFamily ? Colors.light.primary : Colors.light.textSecondary} />
          <Text style={[styles.optionTitle, createFamily && styles.optionTitleSelected]}>
            Create Family Group
          </Text>
          <Text style={styles.optionDescription}>
            Start a new family group and invite others to join
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionCard, !createFamily && styles.optionCardSelected]}
          onPress={() => setCreateFamily(false)}
        >
          <Users size={40} color={!createFamily ? Colors.light.primary : Colors.light.textSecondary} />
          <Text style={[styles.optionTitle, !createFamily && styles.optionTitleSelected]}>
            Join Existing Group
          </Text>
          <Text style={styles.optionDescription}>
            Join a family group with an invite code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {createFamily ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Family Group Name</Text>
            <TextInput
              style={styles.input}
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Enter family group name"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>
        ) : (
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
        )}

        <TouchableOpacity 
          style={styles.button}
          onPress={handleNextStep}
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 'profile' && renderProfileStep()}
      {step === 'family' && renderFamilyStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 8,
  },
  optionTitleSelected: {
    color: Colors.light.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});