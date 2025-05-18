import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { EmergencyMessage } from '@/types/family';
import { Check, MapPin, MessageCircle, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EmergencyMessagesScreen() {
  const { emergencyMessages, addEmergencyMessage, updateEmergencyMessage, removeEmergencyMessage } = useFamilyStore();
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    message: '',
    includeLocation: true
  });

  const handleAddMessage = () => {
    if (!newMessage.message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    addEmergencyMessage({
      message: newMessage.message.trim(),
      includeLocation: newMessage.includeLocation
    });

    // Reset form
    setNewMessage({
      message: '',
      includeLocation: true
    });
    setIsAddingMessage(false);
  };

  const handleToggleLocation = (id: string) => {
    const message = emergencyMessages.find(m => m.id === id);
    if (message) {
      updateEmergencyMessage(id, {
        includeLocation: !message.includeLocation
      });
    }
  };

  const handleDeleteMessage = (id: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to remove this emergency message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeEmergencyMessage(id)
        }
      ]
    );
  };

  const renderMessageItem = ({ item }: { item: EmergencyMessage }) => (
    <View style={styles.messageCard}>
      <Text style={styles.messageText}>{item.message}</Text>
      
      <View style={styles.messageFooter}>
        <TouchableOpacity 
          style={styles.locationToggle}
          onPress={() => handleToggleLocation(item.id)}
        >
          <MapPin size={16} color={item.includeLocation ? Colors.light.primary : Colors.light.textSecondary} />
          <Text 
            style={[
              styles.locationToggleText,
              { color: item.includeLocation ? Colors.light.primary : Colors.light.textSecondary }
            ]}
          >
            {item.includeLocation ? 'Include location' : 'No location'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteMessage(item.id)}
        >
          <X size={16} color={Colors.light.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={emergencyMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Emergency Messages</Text>
            <Text style={styles.subtitle}>
              Create quick messages to send during emergencies
            </Text>
          </View>
        }
        ListEmptyComponent={
          !isAddingMessage ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={60} color={Colors.light.textSecondary} />
              <Text style={styles.emptyTitle}>No Emergency Messages</Text>
              <Text style={styles.emptyText}>
                Add quick messages that can be sent with a single tap during emergencies.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
      
      {isAddingMessage ? (
        <View style={styles.addMessageForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add Emergency Message</Text>
            <TouchableOpacity 
              style={styles.cancelFormButton}
              onPress={() => setIsAddingMessage(false)}
            >
              <X size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={styles.textArea}
              value={newMessage.message}
              onChangeText={(text) => setNewMessage({...newMessage, message: text})}
              placeholder="Enter emergency message"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={styles.toggle}
              onPress={() => setNewMessage({
                ...newMessage, 
                includeLocation: !newMessage.includeLocation
              })}
            >
              {newMessage.includeLocation ? (
                <View style={styles.toggleChecked}>
                  <Check size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.toggleUnchecked} />
              )}
              <Text style={styles.toggleText}>Include my location with this message</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddMessage}
          >
            <Text style={styles.saveButtonText}>Save Message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddingMessage(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationToggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.light.danger}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.light.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addMessageForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cancelFormButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
  },
  toggleRow: {
    marginBottom: 20,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleChecked: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});