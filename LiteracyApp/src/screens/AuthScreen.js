import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, SafeAreaView, TouchableWithoutFeedback, 
  Keyboard, ActivityIndicator, ScrollView
} from 'react-native';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATARS = [
  { id: 'lion', icon: '🦁', label: 'Lion' },
  { id: 'panda', icon: '🐼', label: 'Panda' },
  { id: 'owl', icon: '🦉', label: 'Owl' },
];

export default function AuthScreen({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }
    if (!isLogin && !name) {
       setError("Please tell us your name!");
       return;
    }
    if (!isLogin && !age) {
       setError("Please tell us your age!");
       return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email.trim(), password);
      } else {
        response = await authAPI.register({
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: 'student', // Default to student for the literacy app
          avatar: selectedAvatar,
          age: parseInt(age) || null
        });
      }

      const { access_token, user } = response.data;
      
      // Save token to device storage
      await AsyncStorage.setItem('userToken', access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
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

            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
                onPress={() => { setIsLogin(true); setError(''); }}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
                onPress={() => { setIsLogin(false); setError(''); }}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {!isLogin && (
              <>
                <View style={styles.inputSection}>
                  <Text style={styles.label}>WHAT IS YOUR NAME?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. John"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.inputSection}>
                  <Text style={styles.label}>HOW OLD ARE YOU?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    placeholderTextColor="#999"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. parent@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.avatarSection}>
                <Text style={styles.label}>CHOOSE A BUDDY:</Text>
                <View style={styles.avatarRow}>
                  {AVATARS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedAvatar(avatar.id)}
                      style={[
                        styles.avatarCard,
                        selectedAvatar === avatar.id && styles.avatarCardSelected
                      ]}
                    >
                      <Text style={styles.avatarIcon}>{avatar.icon}</Text>
                      <Text style={[
                        styles.avatarLabel,
                        selectedAvatar === avatar.id && styles.avatarLabelSelected
                      ]}>{avatar.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{isLogin ? "LOG IN 🚀" : "LET'S GO! 🚀"}</Text>
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
  toggleContainer: { flexDirection: 'row', backgroundColor: '#EAEAEA', borderRadius: 20, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 16, fontWeight: '700', color: '#888' },
  toggleTextActive: { color: '#FF6B6B' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#EAEAEA', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', color: '#333' },
  avatarSection: { marginBottom: 25 },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  avatarCard: { backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 16, alignItems: 'center', width: '31%', borderWidth: 2, borderColor: '#EAEAEA' },
  avatarCardSelected: { borderColor: '#4ECDC4', backgroundColor: '#F0FBFB' },
  avatarIcon: { fontSize: 30, marginBottom: 4 },
  avatarLabel: { fontSize: 12, fontWeight: '600', color: '#888' },
  avatarLabelSelected: { color: '#4ECDC4', fontWeight: '800' },
  primaryButton: { backgroundColor: '#FF6B6B', borderRadius: 100, paddingVertical: 18, alignItems: 'center', shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6, marginTop: 10 },
  primaryButtonDisabled: { backgroundColor: '#FFB8B8', shadowOpacity: 0, elevation: 0 },
  primaryButtonText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1 }
});
