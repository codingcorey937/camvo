import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'
import BrowseScreen from '../screens/BrowseScreen'
import CreatorDetailScreen from '../screens/CreatorDetailScreen'
import ProfileScreen from '../screens/ProfileScreen'
import MyBookingsScreen from '../screens/MyBookingsScreen'
import HostBookingsScreen from '../screens/HostBookingsScreen'
import { ActivityIndicator, View } from 'react-native'

type AuthStackParamList = {
  Login: undefined
  Signup: undefined
}

type AppStackParamList = {
  Browse: undefined
  CreatorDetail: { creatorId: string }
  Profile: undefined
  MyBookings: undefined
  HostBookings: undefined
}

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()

function AuthNavigator() {
  const [screen, setScreen] = useState<'Login' | 'Signup'>('Login')

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }}>
      {screen === 'Login' ? (
        <AuthStack.Screen name="Login">
          {() => <LoginScreen onToggle={() => setScreen('Signup')} />}
        </AuthStack.Screen>
      ) : (
        <AuthStack.Screen name="Signup">
          {() => <SignupScreen onToggle={() => setScreen('Login')} />}
        </AuthStack.Screen>
      )}
    </AuthStack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : (
        <AppStack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0a0a0a' },
          }}
        >
          <AppStack.Screen name="Browse" component={BrowseScreen} />
          <AppStack.Screen name="CreatorDetail" component={CreatorDetailScreen} />
          <AppStack.Screen name="Profile" component={ProfileScreen} />
          <AppStack.Screen name="MyBookings" component={MyBookingsScreen} />
          <AppStack.Screen name="HostBookings" component={HostBookingsScreen} />
        </AppStack.Navigator>
      )}
    </NavigationContainer>
  )
}