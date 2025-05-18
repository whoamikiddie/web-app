import FamilyMemberItem from '@/components/FamilyMemberItem';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyMember } from '@/types/family';
import { useRouter } from 'expo-router';
import { Share2, UserPlus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FamilyScreen() {
  const { members, familyGroups, currentGroupId } = useFamilyStore();
  const [showInviteCode, setShowInviteCode] = useState(false);
  const router = useRouter();

  const currentGroup = familyGroups.find(group => group.id === currentGroupId);
  
  // Filter members based on current group if one is selected
  const filteredMembers = currentGroupId 
    ? members.filter(member => currentGroup?.members.includes(member.id))
    : members;

  const handleMemberPress = (member: FamilyMember) => {
    router.push({
      pathname: '/member-detail',
      params: { id: member.id }
    });
  };

  const handleAddMember = () => {
    router.push('/add-member');
  };

  const handleShareInviteCode = () => {
    setShowInviteCode(!showInviteCode);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FamilyMemberItem 
            member={item} 
            onPress={handleMemberPress} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {currentGroup ? (
              <>
                <View style={styles.groupHeader}>
                  <Text style={styles.title}>{currentGroup.name}</Text>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={handleShareInviteCode}
                  >
                    <Share2 size={16} color={Colors.light.primary} />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity>
                </View>
                
                {showInviteCode && (
                  <View style={styles.inviteCodeContainer}>
                    <Text style={styles.inviteCodeLabel}>Family Invite Code:</Text>
                    <Text style={styles.inviteCode}>{currentGroup.inviteCode}</Text>
                    <Text style={styles.inviteCodeHelp}>
                      Share this code with family members so they can join your group
                    </Text>
                  </View>
                )}
                
                <Text style={styles.subtitle}>
                  {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>Your Family</Text>
                <Text style={styles.subtitle}>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </Text>
              </>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No family members yet</Text>
            <Text style={styles.emptyText}>
              Add your family members to start tracking and keeping them safe.
            </Text>
          </View>
        }
      />
      
      <View style={styles.buttonContainer}>
        {currentGroup && (
          <TouchableOpacity 
            style={styles.groupButton}
            onPress={() => router.push('/family-groups')}
          >
            <Users size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMember}
        >
          <UserPlus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    position: 'relative',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.light.primary}15`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  inviteCodeContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: `${Colors.light.primary}30`,
    borderStyle: 'dashed',
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 8,
  },
  inviteCodeHelp: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
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
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    backgroundColor: Colors.light.info,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButton: {
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
});