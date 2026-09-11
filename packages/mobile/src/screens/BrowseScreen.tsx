import React, { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { users as usersApi } from '../services/api'

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

export default function BrowseScreen({ navigation }: any) {
  const { token } = useAuth()
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCreators()
  }, [])

  async function fetchCreators() {
    setLoading(true)
    try {
      const result = await usersApi.getCreators(token || undefined, search ? { search } : undefined)
      setCreators(result.creators || [])
    } catch (e) {
      console.error('Failed to fetch creators:', e)
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(creator: Creator): string {
    if (creator.price_per_minute) return `$${(creator.price_per_minute / 100).toFixed(2)}/min`
    if (creator.price_per_hour) return `$${(creator.price_per_hour / 100).toFixed(2)}/hr`
    if (creator.custom_price) return `$${(creator.custom_price / 100).toFixed(2)}`
    return 'Free'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Camvo</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileLink}>Profile</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search creators..."
        placeholderTextColor="#666"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchCreators}
        returnKeyType="search"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={creators}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CreatorDetail', { creatorId: item.id })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.display_name || item.users.full_name)[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.creatorName}>{item.display_name || item.users.full_name}</Text>
                <Text style={styles.creatorBio} numberOfLines={2}>
                  {item.bio || 'No bio yet'}
                </Text>
                <View style={styles.tags}>
                  {(item.tags || []).slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.price}>{formatPrice(item)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileLink: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  card: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  creatorName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  creatorBio: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: '#aaa',
    fontSize: 11,
  },
  price: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
})