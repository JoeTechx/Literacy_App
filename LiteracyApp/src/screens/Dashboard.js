import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { progressAPI, modulesAPI } from '../services/api';

const MODULES = [
  { id: 1, title: 'SOUNDS', subtitle: 'TAP SOUND', icon: '👂', color: '#FF9F43' },
  { id: 2, title: 'TRACING', subtitle: 'TRACE LETTER', icon: '✍️', color: '#FF6B6B' },
  { id: 3, title: 'MATCH', subtitle: 'WORD-IMAGE', icon: '🖼️', color: '#4ECDC4' },
  { id: 4, title: 'PUZZLES', subtitle: 'PHONICS', icon: '🧩', color: '#45B7D1' },
  { id: 5, title: 'STORIES', subtitle: 'READ-ALONG', icon: '📚', color: '#9B59B6' },
  { id: 6, title: 'COLORS', subtitle: 'ALPHABET', icon: '🎨', color: '#F1C40F' },
];

const AVATARS = [
  { id: 'lion', icon: '🦁', label: 'Lion' },
  { id: 'panda', icon: '🐼', label: 'Panda' },
  { id: 'owl', icon: '🦉', label: 'Owl' },
];

export default function Dashboard({ user, onSelectModule, onLogout }) {
  const [totalPoints, setTotalPoints] = useState(user?.totalPoints || 0);
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Warm up TTS engine
    Speech.speak(' ', { volume: 0 });
    
    // Fetch real progress and modules from backend when dashboard mounts
    const fetchData = async () => {
      try {
        const res = await progressAPI.getProgress();
        // Calculate total score from all completed modules
        const score = res.data.reduce((sum, item) => sum + (item.score || 0), 0);
        setTotalPoints(score);

        const modulesRes = await modulesAPI.getMyModules();
        if (modulesRes.data && modulesRes.data.length > 0) {
          const dynamicModules = modulesRes.data.map((mod, index) => ({
             ...mod,
             title: mod.title.toUpperCase(),
             subtitle: mod.type ? mod.type.replace(/_/g, ' ').toUpperCase() : 'MODULE',
             icon: MODULES[index % MODULES.length].icon,
             color: MODULES[index % MODULES.length].color,
          }));
          setModules(dynamicModules);
        } else {
          setModules([]);
        }
      } catch (e) {
        console.log('Failed to fetch data:', e);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    return () => Speech.stop();
  }, []);

  const handleLogoutPress = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to exit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: onLogout, style: "destructive" }
      ]
    );
  };

  const handleAudioPress = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const greeting = `Welcome back, ${user?.name || 'Student'}! You have ${totalPoints} points! Let's choose a learning task.`;
    Speech.speak(greeting, {
      rate: 0.9,
      pitch: 1.1,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false)
    });
  };

  const userAvatar = AVATARS.find(a => a.id === user?.avatar) || AVATARS[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.profileBtn} onPress={handleLogoutPress}>
           <Text style={styles.profileIcon}>{userAvatar.icon}</Text>
        </TouchableOpacity>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {totalPoints} pts</Text>
        </View>
        <TouchableOpacity style={styles.audioBtn} onPress={handleAudioPress}>
           <Text style={styles.audioIcon}>{isSpeaking ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome Back,</Text>
          <Text style={styles.nameText}>{user?.name || 'Student'}! 👋</Text>
        </View>

        <View style={styles.grid}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading your tasks...</Text>
            </View>
          ) : modules && modules.length > 0 ? (
            modules.map((mod) => (
              <TouchableOpacity 
                key={mod.id} 
                style={[styles.moduleCard, { borderBottomColor: mod.color }]}
                activeOpacity={0.8}
                onPress={() => onSelectModule(mod)}
              >
                <View style={[styles.iconContainer, { backgroundColor: mod.color + '20' }]}>
                  <Text style={styles.moduleIcon}>{mod.icon}</Text>
                </View>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleSubtitle}>{mod.subtitle}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No tasks assigned yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  profileBtn: { backgroundColor: '#FFF', padding: 10, borderRadius: 25, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  profileIcon: { fontSize: 24 },
  pointsBadge: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  pointsText: { fontSize: 16, fontWeight: '800', color: '#FFB347' },
  audioBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 25, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  audioIcon: { fontSize: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  welcomeSection: { marginBottom: 30, alignItems: 'center' },
  welcomeText: { fontSize: 22, color: '#888', fontWeight: '600' },
  nameText: { fontSize: 36, fontWeight: '900', color: '#333', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moduleCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderBottomWidth: 6 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  moduleIcon: { fontSize: 30 },
  moduleTitle: { fontSize: 16, fontWeight: '800', color: '#444', marginBottom: 4 },
  moduleSubtitle: { fontSize: 12, fontWeight: '700', color: '#999', letterSpacing: 0.5 },
  loadingContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#888', fontWeight: '600' },
  emptyContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 18, color: '#888', fontWeight: '600' }
});
