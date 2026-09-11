import React from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { bookings as bookingsApi } from '../services/api'
import { useState, useEffect } from 'react'

interface Booking {
  id: string
  creator_name: string
  start_time: string
  duration_minutes: number
  price_cents: number
  status: string
  room_url: string
}

export default function MyBookingsScreen() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      const result = await bookingsApi.getMy(token!)
      setBookings(result.bookings || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      pending_payment: '#f59e0b',
      confirmed: '#10b981',
      completed: '#6366f1',
      cancelled: '#ef4444',
      payment_failed: '#ef4444',
    }
    return { color: colors[status] || '#888' }
  }

  if (loading) return <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 40 }} />

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.creatorName}>{item.creator_name}</Text>
              <Text style={[styles.status, { color: statusBadge(item.status).color }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.detail}>
              {new Date(item.start_time).toLocaleDateString()} at{' '}
              {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.detail}>
              {item.duration_minutes} min — ${(item.price_cents / 100).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No bookings yet. Browse creators to book a call!</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 16 },
  card: {
    backgroundColor: '#151515',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  detail: { color: '#888', fontSize: 14, marginTop: 2 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 16 },
})