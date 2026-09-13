import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { users as usersApi, bookings as bookingsApi, payments as paymentsApi } from '../services/api'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'

const PLATFORM_FEE_RATE = 0.125

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
      const startTime = new Date(Date.now() + 60000).toISOString()
      const priceCents = calculatePrice()

      // Step 1: Create booking → gets PaymentIntent client_secret + bookingId
      const bookingResult = await bookingsApi.create(token!, {
        creatorId: creator.id,
        startTime,
        durationMinutes: parseInt(duration) || 30,
        priceCents,
        viewerPhone: phone,
      })

      // Step 2: Get PaymentSheet params (ephemeral key, customer)
      const sheetResult = await paymentsApi.getPaymentSheet(token!, bookingResult.bookingId)

      // Step 3: Initialise Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: bookingResult.clientSecret,
        customerId: sheetResult.customer,
        customerEphemeralKeySecret: sheetResult.ephemeralKey,
        merchantDisplayName: 'Camvo',
        returnURL: 'camvo://stripe-redirect',
      })

      if (initError) {
        Alert.alert('Error', 'Failed to initialise payment: ' + initError.message)
        return
      }

      // Step 4: Present the native Payment Sheet
      const { error: presentError } = await presentPaymentSheet()

      if (presentError) {
        Alert.alert('Payment failed', presentError.message)
        return
      }

      // Step 5: Payment succeeded — confirm the booking
      await bookingsApi.confirm(token!, bookingResult.bookingId, sheetResult.paymentIntentId)

      Alert.alert(
        'Booked!',
        `Your call with ${creator.display_name || creator.users.full_name} is confirmed. Check your phone for the join link.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Browse') }]
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
  const platformFee = Math.ceil(price * PLATFORM_FEE_RATE)
  const total = price + platformFee

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
          {(creator.tags || []).map((tag: string) => (
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
        </View>

        <View style={styles.priceBreakdown}>
          <Text style={styles.priceRow}>
            Creator price: <Text style={styles.priceValue}>${(price / 100).toFixed(2)}</Text>
          </Text>
          <Text style={styles.priceRow}>
            Platform fee (12.5%): <Text style={styles.feeValue}>${(platformFee / 100).toFixed(2)}</Text>
          </Text>
          <Text style={styles.totalRow}>
            Total: <Text style={styles.totalValue}>${(total / 100).toFixed(2)}</Text>
          </Text>
        </View>

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
            <Text style={styles.bookButtonText}>Book & Pay ${(total / 100).toFixed(2)}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          You'll be charged ${(price / 100).toFixed(2)}. Your card is processed securely by Stripe.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  profileHeader: { alignItems: 'center', padding: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  bio: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  tagRow: { flexDirection: 'row', marginTop: 12, gap: 6 },
  tag: { backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#aaa', fontSize: 12 },
  bookingSection: { padding: 24, borderTopWidth: 1, borderTopColor: '#222' },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  durationRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  durationBtn: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: '#333',
  },
  durationBtnActive: { borderColor: '#6C5CE7', backgroundColor: '#2a1f5e' },
  durationText: { color: '#888', fontSize: 16 },
  durationTextActive: { color: '#6C5CE7', fontWeight: '700' },
  priceLabel: { color: '#888', fontSize: 18, marginBottom: 20 },
  priceValue: { color: '#6C5CE7', fontWeight: '800', fontSize: 22 },
  priceBreakdown: { backgroundColor: '#151515', borderRadius: 12, padding: 14, marginBottom: 16 },
  priceRow: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  feeValue: { color: '#f59e0b', fontWeight: '600' },
  totalRow: { color: '#fff', fontSize: 16, marginTop: 6, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 6 },
  totalValue: { color: '#6C5CE7', fontWeight: '800', fontSize: 20 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    fontSize: 16, color: '#fff', borderWidth: 1, borderColor: '#333', marginBottom: 20,
  },
  bookButton: { backgroundColor: '#6C5CE7', borderRadius: 12, padding: 18, alignItems: 'center' },
  bookButtonDisabled: { opacity: 0.6 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  errorText: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 16 },
  disclaimer: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 12 },
})