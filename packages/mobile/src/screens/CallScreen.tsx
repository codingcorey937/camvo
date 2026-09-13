import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native'

interface Props {
  route: any
  navigation: any
}

export default function CallScreen({ route, navigation }: Props) {
  const { roomUrl, creatorName, bookingId } = route.params

  async function handleJoinCall() {
    const canOpen = await Linking.canOpenURL(roomUrl)
    if (canOpen) {
      await Linking.openURL(roomUrl)
    } else {
      Alert.alert('Error', 'Could not open the call link. Your join link has been sent via SMS.')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📹</Text>
        </View>

        <Text style={styles.title}>Your Call with {creatorName}</Text>
        <Text style={styles.subtitle}>
          This call uses Daily.co video — it will open in your browser.
        </Text>

        <TouchableOpacity style={styles.joinButton} onPress={handleJoinCall}>
          <Text style={styles.joinButtonText}>Join Call Now</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          The join link was also sent to your phone via SMS.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  joinButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 18,
    marginBottom: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  helpText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
  },
})