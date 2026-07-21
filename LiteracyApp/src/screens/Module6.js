import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, Animated, FlatList
} from 'react-native';
import * as Speech from 'expo-speech';

// ── Supervisor Color-Coding System ──────────────────────────────────────────
// Vowels → Primary colors (pop with energy!)
// Consonants → Secondary/tertiary palette (harmonious variety)
const ALPHABET_DATA = [
  { letter: 'A', color: '#FF3B30', type: 'vowel',     sound: 'Ah, like in APPLE' },
  { letter: 'B', color: '#34C759', type: 'consonant', sound: 'Buh, like in BAT' },
  { letter: 'C', color: '#FF6B35', type: 'consonant', sound: 'Kuh, like in CAT' },
  { letter: 'D', color: '#4ECDC4', type: 'consonant', sound: 'Duh, like in DOG' },
  { letter: 'E', color: '#FF9500', type: 'vowel',     sound: 'Eh, like in EGG' },
  { letter: 'F', color: '#9B59B6', type: 'consonant', sound: 'Fff, like in FISH' },
  { letter: 'G', color: '#F39C12', type: 'consonant', sound: 'Guh, like in GOAT' },
  { letter: 'H', color: '#1ABC9C', type: 'consonant', sound: 'Huh, like in HAT' },
  { letter: 'I', color: '#34C759', type: 'vowel',     sound: 'Ih, like in ICE' },
  { letter: 'J', color: '#E67E22', type: 'consonant', sound: 'Juh, like in JAM' },
  { letter: 'K', color: '#2980B9', type: 'consonant', sound: 'Kuh, like in KING' },
  { letter: 'L', color: '#8E44AD', type: 'consonant', sound: 'Lll, like in LION' },
  { letter: 'M', color: '#D35400', type: 'consonant', sound: 'Mmm, like in MUM' },
  { letter: 'N', color: '#16A085', type: 'consonant', sound: 'Nnn, like in NET' },
  { letter: 'O', color: '#007AFF', type: 'vowel',     sound: 'Oh, like in OX' },
  { letter: 'P', color: '#C0392B', type: 'consonant', sound: 'Puh, like in PIG' },
  { letter: 'Q', color: '#7F8C8D', type: 'consonant', sound: 'Kwuh, like in QUEEN' },
  { letter: 'R', color: '#27AE60', type: 'consonant', sound: 'Rrr, like in RAT' },
  { letter: 'S', color: '#2C3E50', type: 'consonant', sound: 'Sss, like in SUN' },
  { letter: 'T', color: '#E74C3C', type: 'consonant', sound: 'Tuh, like in TOP' },
  { letter: 'U', color: '#AF52DE', type: 'vowel',     sound: 'Uh, like in UP' },
  { letter: 'V', color: '#6C5CE7', type: 'consonant', sound: 'Vvv, like in VAN' },
  { letter: 'W', color: '#A29BFE', type: 'consonant', sound: 'Wuh, like in WEB' },
  { letter: 'X', color: '#FD79A8', type: 'consonant', sound: 'Ks, like in FOX' },
  { letter: 'Y', color: '#FDCB6E', type: 'consonant', sound: 'Yuh, like in YAK' },
  { letter: 'Z', color: '#55EFC4', type: 'consonant', sound: 'Zzz, like in ZAP' },
];

export default function Module6({ onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'vowels' | 'consonants'

  const popAnim = useRef(new Animated.Value(1)).current;
  const detailFade = useRef(new Animated.Value(0)).current;

  const speak = (text) => {
    if (!isMuted) { Speech.stop(); Speech.speak(text, { rate: 0.75, pitch: 1.15 }); }
  };

  const handlePress = (item) => {
    // Pop animation
    Animated.sequence([
      Animated.spring(popAnim, { toValue: 1.3, useNativeDriver: true, speed: 40 }),
      Animated.spring(popAnim, { toValue: 1.0, useNativeDriver: true, friction: 4 }),
    ]).start();

    // Detail panel fade in
    detailFade.setValue(0);
    Animated.timing(detailFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setSelected(item);
    speak(item.sound);
  };

  const filtered = ALPHABET_DATA.filter(item => {
    if (filter === 'vowels')     return item.type === 'vowel';
    if (filter === 'consonants') return item.type === 'consonant';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
          <Text style={styles.closeIcon}>✖</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌈 ALPHABET COLORS</Text>
        <TouchableOpacity onPress={() => { Speech.stop(); setIsMuted(m => !m); }}>
          <Text style={styles.audioToggle}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Instruction ── */}
      <Text style={styles.instruction}>
        Tap a letter to hear its sound and see its color! ✨
      </Text>

      {/* ── Selected Letter Detail Panel ── */}
      {selected ? (
        <Animated.View
          style={[
            styles.detailCard,
            { borderColor: selected.color, opacity: detailFade },
          ]}
        >
          <Animated.Text
            style={[styles.detailLetter, { color: selected.color, transform: [{ scale: popAnim }] }]}
          >
            {selected.letter}
          </Animated.Text>
          <View style={styles.detailInfo}>
            <Text style={[styles.detailBadge, { backgroundColor: selected.color }]}>
              {selected.type.toUpperCase()}
            </Text>
            <Text style={styles.detailSound}>{selected.sound}</Text>
            <TouchableOpacity
              style={[styles.speakBtn, { backgroundColor: selected.color }]}
              onPress={() => speak(selected.sound)}
            >
              <Text style={styles.speakBtnText}>🔊 Hear Again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>👆 Tap any letter below to start!</Text>
        </View>
      )}

      {/* ── Filter Tabs ── */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: '🔡 All 26' },
          { id: 'vowels', label: '🔴 Vowels' },
          { id: 'consonants', label: '🟢 Consonants' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.filterTab, filter === tab.id && styles.filterTabActive]}
            onPress={() => setFilter(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, filter === tab.id && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Alphabet Grid ── */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.letter}
            style={[
              styles.letterCard,
              { borderColor: item.color },
              selected?.letter === item.letter && {
                backgroundColor: item.color,
                transform: [{ scale: 1.08 }],
              },
            ]}
            onPress={() => handlePress(item)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.letterCardText,
                {
                  color: selected?.letter === item.letter ? '#FFF' : item.color,
                },
              ]}
            >
              {item.letter}
            </Text>
            {item.type === 'vowel' && (
              <View style={[styles.vowelDot, { backgroundColor: item.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Color Legend ── */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Vowels = Primary Colors</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>Consonants = Secondary Colors</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 16 },
  closeBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  closeIcon: { fontSize: 16, fontWeight: '900', color: '#FF6B6B' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#333', letterSpacing: 1 },
  audioToggle: { fontSize: 24 },

  instruction: { fontSize: 14, fontWeight: '600', color: '#888', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  // Detail card
  detailCard: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#FFF',
    borderRadius: 24, padding: 16, borderWidth: 4, flexDirection: 'row',
    alignItems: 'center', gap: 16,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  detailLetter: { fontSize: 72, fontWeight: '900', width: 90, textAlign: 'center' },
  detailInfo: { flex: 1, gap: 6 },
  detailBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  detailSound: { fontSize: 16, fontWeight: '700', color: '#444', lineHeight: 22 },
  speakBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 2 },
  speakBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  placeholderCard: {
    marginHorizontal: 16, marginTop: 12, backgroundColor: '#F5F5F5',
    borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'center', height: 110,
    borderWidth: 3, borderColor: '#E0E0E0', borderStyle: 'dashed',
  },
  placeholderText: { fontSize: 16, color: '#AAA', fontWeight: '700' },

  // Filter
  filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12, marginBottom: 8, paddingHorizontal: 16 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EAEAEA', alignItems: 'center' },
  filterTabActive: { backgroundColor: '#333' },
  filterTabText: { fontSize: 12, fontWeight: '700', color: '#888' },
  filterTabTextActive: { color: '#FFF' },

  // Alphabet grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 80 },
  letterCard: {
    width: 54, height: 60, backgroundColor: '#FFF', borderWidth: 3,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  letterCardText: { fontSize: 26, fontWeight: '900' },
  vowelDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', bottom: 5 },

  // Legend
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EAEAEA', backgroundColor: '#FFF', position: 'absolute', bottom: 0, left: 0, right: 0 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 11, fontWeight: '600', color: '#888' },
});
