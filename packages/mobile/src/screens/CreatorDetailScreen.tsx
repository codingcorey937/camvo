import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { users as usersApi, bookings as bookingsApi } from '../services/api'

interface Creator {
  id: string
  display_name: string
  bio: string | null
  tags: string[]
  price_per_minute: number | null
  price_per_hour: number | null
  custom_price: number | null
  currency: string
  users: { full_name: string; avatar_url: string | null }
}

export default function CreatorDetailScreen({ route, navigation }: any) {
  const { creatorId } = route.params
  const { token } = useAuth()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState('30')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    loadCreator()
  }, [])

  async function loadCreator() {
    try {
      const result = await usersApi.getCreator(creatorId, token || undefined)
      setCreator(result)
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load creator')
    } finally {
      setLoading(false)
    }
  }

  function calculatePrice(): number {
    if (!creator) return 0
    const mins = parseInt(duration) || 0
    if (creator.price_per_minute) return creator.price_per_minute * mins
    if (creator.price_per_hour) return creator.price_per_hour * (mins / 60)
    if (creator.custom_price) return creator.custom_price
    return 0
  }

  async function handleBook() {
    if (!phone) {
      Alert.alert('Error', 'Phone number is required for the join link')
      return
    }
    if (!creator) return

    setBooking(true)
    try {
      const startTime = new Date(Date.now() + 60000).toISOString() // 1 min from now
      const priceCents = calculatePrice()

      const result = await bookingsApi.create(token!, {
        creatorId: creator.id,
        startTime,
        durationMinutes: parseInt(duration) || 30,
        priceCents,
        viewerPhone: phone,
      })

      // In a real app, you'd use Stripe Payment Sheet here
      // For now, simulate confirm
      Alert.alert(
        'Booking Created',
        `Payment intent created. Client secret: ${result.clientSecret?.slice(0, 20)}...\nRoom: ${result.roomUrl}\n\nIn production, Stripe Payment Sheet handles the card entry.`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Browse') },
        ]
      )
    } catch (e: any) {
      Alert.alert('Booking failed', e.message || 'Something went wrong')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 40 }} />
      </View>
    )
  }

  if (!creator) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Creator not found</Text>
      </View>
    )
  }

  const price = calculatePrice()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(creator.display_name || creator.users.full_name)[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{creator.display_name || creator.users.full_name}</Text>
        <Text style={styles.bio}>{creator.bio || 'No bio'}</Text>
        <View style={styles.tagRow}>
          {(creator.tags || []).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>Book a Call</Text>

        <Text style={styles.label}>Duration (minutes)</Text>
        <View style={styles.durationRow}>
          {['15', '30', '60'].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[styles.durationBtn, duration === mins && styles.durationBtnActive]}
              onPress={() => setDuration(mins)}
            >
              <Text style={[styles.durationText, duration === mins && styles.durationTextActive]}>
                {mins}m
              </Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={[styles.durationInput, duration === 'custom' && styles.durationBtnActive]}
            placeholder="Custom"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={duration === 'custom' ? '' : undefined}
            onChangeText={(v) => setDuration(v || 'custom')}
          />
        </View>

        <Text style={styles.priceLabel}>
          Total: <Text style={styles.priceValue}>${(price / 100).toFixed(2)}</Text>
        </Text>

        <Text style={styles.label}>Your Phone (for join link)</Text>
        <TextInput
          style={styles.input}
          placeholder="+1234567890"
          placeholderTextColor="#666"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.bookButton, booking && styles.bookButtonDisabled]}
          onPress={handleBook}
          disabled={booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book & Pay ${(price / 100).toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  bio: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#aaa',
    fontSize: 12,
  },
  bookingSection: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  durationBtnActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#2a1f5e',
  },
  durationText: {
    color: '#888',
    fontSize: 16,
  },
  durationTextActive: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
  durationInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    flex: 1,
  },
  priceLabel: {
    color: '#888',
    fontSize: 18,
    marginBottom: 20,
  },
  priceValue: {
    color: '#6C5CE7',
    fontWeight: '800',
    fontSize: 22,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
})