import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from './src/store/useAuthStore';

import AuthScreen from './src/screens/AuthScreen';
import Dashboard from './src/screens/Dashboard';
import Module1 from './src/screens/Module1';
import Module2 from './src/screens/Module2';
import Module3 from './src/screens/Module3';
import Module4 from './src/screens/Module4';
import Module5 from './src/screens/Module5';
import Module6 from './src/screens/Module6';
import { userAPI } from './src/services/api';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const { rehydrate, setAuth, logout } = useAuthStore();

  useEffect(() => {
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      // Rehydrate token from encrypted SecureStore on app boot
      const token = await rehydrate();
      if (token) {
        // Token exists in secure storage — set it in memory and verify with backend
        useAuthStore.setState({ token });
        const response = await userAPI.getProfile();
        setUser(response.data);
      }
    } catch (e) {
      console.log('Token invalid or expired', e);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setSelectedModule(null);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  // If no user is logged in, show AuthScreen
  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // Render modules based on selectedModule state
  if (selectedModule) {
    if (selectedModule.type === 'tap_the_sound') {
      return <Module1 moduleData={selectedModule} onBack={() => setSelectedModule(null)} />;
    }
    if (selectedModule.type === 'tracing') {
      return <Module2 moduleData={selectedModule} onBack={() => setSelectedModule(null)} />;
    }
    if (selectedModule.type === 'match') {
      return <Module3 moduleData={selectedModule} onBack={() => setSelectedModule(null)} />;
    }

    // Fallback for unimplemented types
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, color: '#333', marginBottom: 20 }}>
          Module type "{selectedModule.type?.replace(/_/g, ' ')}" is under construction!
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#FF6B6B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          onPress={() => setSelectedModule(null)}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Default to Dashboard
  return (
    <>
      <StatusBar style="dark" />
      <Dashboard 
        user={user}
        onLogout={handleLogout}
        onSelectModule={(mod) => {
          setSelectedModule(mod);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7'
  }
});
