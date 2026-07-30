import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
  const [currentScreen, setCurrentScreen] = useState('dashboard');

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
    setCurrentScreen('dashboard');
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

  // Render modules based on currentScreen state
  if (currentScreen === 'module_1') return <Module1 onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'module_2') return <Module2 onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'module_3') return <Module3 onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'module_4') return <Module4 onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'module_5') return <Module5 onBack={() => setCurrentScreen('dashboard')} />;
  if (currentScreen === 'module_6') return <Module6 onBack={() => setCurrentScreen('dashboard')} />;

  // Default to Dashboard
  return (
    <>
      <StatusBar style="dark" />
      <Dashboard 
        user={user}
        onLogout={handleLogout}
        onSelectModule={(id) => {
          if (id >= 1 && id <= 6) {
            setCurrentScreen(`module_${id}`);
          } else {
            alert(`Module ${id} is under construction! Check back soon.`);
          }
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
