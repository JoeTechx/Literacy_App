import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback, 
  Keyboard, ActivityIndicator, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthScreen({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async () => {
    if (!identifier || !password) {
      setError("Username/Email and password are required!");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(identifier.trim(), password);
      const { access_token, user } = response.data;
      
      // Save token to encrypted native keychain via Zustand store
      await setAuth(access_token, user);
      
      // Notify App.js to switch screens
      onLoginSuccess(user);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>WELCOME! ✨</Text>
              <Text style={styles.subtitleText}>Let's start our reading adventure.</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputSection}>
              <Text style={styles.label}>USERNAME OR EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John or parent@email.com"
                placeholderTextColor="#999"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>LOG IN 🚀</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  welcomeText: { fontSize: 36, fontWeight: '900', color: '#333', letterSpacing: 1 },
  subtitleText: { fontSize: 16, color: '#666', marginTop: 8, fontWeight: '500' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEA', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', color: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEA', borderRadius: 16 },
  passwordInput: { flex: 1, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', color: '#333' },
  eyeIcon: { padding: 16 },
  primaryButton: { backgroundColor: '#FF6B6B', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, marginTop: 10 },
  primaryButtonDisabled: { backgroundColor: '#FFB8B8', shadowOpacity: 0, elevation: 0 },
  primaryButtonText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 }
});
