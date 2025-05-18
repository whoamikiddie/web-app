import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus, Users } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FamilyGroupsScreen() {
  const { familyGroups, currentGroupId, setCurrentGroup, currentUserId } = useFamilyStore();
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleJoinGroup = () => {
    router.push('/join-group');
  };

  const handleSelectGroup = (groupId: string) => {
    setCurrentGroup(groupId);
    router.back();
  };

  const handleLeaveGroup = (groupId: string) => {
    if (!currentUserId) return;
    
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this family group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            useFamilyStore.getState().leaveFamilyGroup(groupId, currentUserId);
            
            // If this was the current group, we need to reset
            if (currentGroupId === groupId) {
              // If there are other groups, select the first one
              if (familyGroups.length > 1) {
                const nextGroup = familyGroups.find(g => g.id !== groupId);
                if (nextGroup) {
                  setCurrentGroup(nextGroup.id);
                }
              }
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={familyGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.groupCard,
              currentGroupId === item.id && styles.selectedGroupCard
            ]}
            onPress={() => handleSelectGroup(item.id)}
          >
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupMembers}>
                {item.members.length} {item.members.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
            
            {currentGroupId === item.id && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
            
            {item.createdBy !== currentUserId && (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveGroup(item.id)}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Your Family Groups</Text>
            <Text style={styles.subtitle}>
              Create or join family groups to stay connected
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={60} color={Colors.light.textSecondary} />
            <Text style={styles.emptyTitle}>No Family Groups</Text>
            <Text style={styles.emptyText}>
              Create a new family group or join an existing one with an invite code.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.joinButton]}
          onPress={handleJoinGroup}
        >
          <LogIn size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Join Group</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.createButton]}
          onPress={handleCreateGroup}
        >
          <UserPlus size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
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
  groupCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedGroupCard: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  activeIndicator: {
    backgroundColor: Colors.light.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: Colors.light.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: Colors.light.info,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});