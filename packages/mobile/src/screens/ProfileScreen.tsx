import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { users as usersApi } from '../services/api'

export default function ProfileScreen({ navigation }: any) {
  const { user, token, logout, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [pricePerMinute, setPricePerMinute] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSaveCreator() {
    if (!displayName) {
      Alert.alert('Error', 'Display name is required')
      return
    }
    setSaving(true)
    try {
      await usersApi.saveCreatorProfile(token!, {
        displayName,
        bio,
        pricePerMinute: pricePerMinute ? parseFloat(pricePerMinute) * 100 : null,
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) * 100 : null,
        available: true,
      })
      await refreshUser()
      Alert.alert('Saved', 'Creator profile updated!')
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.phone}>{user?.phone || 'No phone set'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>I want to be a creator</Text>
          <Switch
            value={isCreator}
            onValueChange={setIsCreator}
            trackColor={{ false: '#333', true: '#6C5CE7' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {isCreator && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creator Profile</Text>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your public name"
            placeholderTextColor="#666"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell viewers about yourself..."
            placeholderTextColor="#666"
            value={bio}
            onChangeText={setBio}
            multiline
          />

          <Text style={styles.label}>Price per minute (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2.50"
            placeholderTextColor="#666"
            value={pricePerMinute}
            onChangeText={setPricePerMinute}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Price per hour (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50.00"
            placeholderTextColor="#666"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveCreator}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Creator Profile</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('MyBookings')} style={styles.linkRow}>
        <Text style={styles.linkText}>My Bookings →</Text>
      </TouchableOpacity>

      {isCreator && (
        <TouchableOpacity onPress={() => navigation.navigate('HostBookings')} style={styles.linkRow}>
          <Text style={styles.linkText}>Incoming Bookings →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  logout: {
    color: '#ff4444',
    fontSize: 16,
  },
  email: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  phone: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkRow: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  linkText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
})