import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import * as Speech from 'expo-speech';
import { progressAPI } from '../services/api';

// Supervisor Color-Coding Logic
const LETTER_COLORS = {
  'A': '#FF3B30', // Red (Vowel)
  'B': '#34C759', // Green (Consonant)
};

export default function Module1({ onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  
  // Animations for the "Pop Out" color effect requested by Supervisor
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const handlePressLetter = (letter, scaleAnim) => {
    setSelectedLetter(letter);
    
    // Play actual audio phonetics when touched
    if (!isMuted) {
      Speech.stop();
      Speech.speak(letter === 'A' ? "Ah" : "Buh", { rate: 0.8, pitch: 1.2 });
    }

    // The "Pop Out" micro-animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true })
    ]).start();
    
    // Reset the other card's scale
    const otherAnim = letter === 'A' ? scaleB : scaleA;
    Animated.spring(otherAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleCheckAnswer = async () => {
    if (!selectedLetter) return;
    if (selectedLetter === 'A') {
      if (!isMuted) Speech.speak("Correct! Fantastic!", { rate: 0.9, pitch: 1.5 });
      alert("Correct! 🎉 +10 Points and 1 Naira Icon!");
      
      // Submit progress to the backend
      try {
        // moduleId: 1, score: 10, attempts: 1, isCompleted: true
        await progressAPI.submitProgress(1, 10, 1, true);
      } catch (err) {
        console.log('Failed to save progress', err);
      }
      
    } else {
      if (!isMuted) Speech.speak("Oops! Try again. Listen carefully. Ah", { rate: 0.8, pitch: 1.2 });
      alert("Oops! Try again. Listen to the sound carefully. 👂");
      
      // We could also record an attempt here with 0 score
      try {
        await progressAPI.submitProgress(1, 0, 1, false);
      } catch (err) {}
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
          <Text style={styles.closeIcon}>✖</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>
        <TouchableOpacity onPress={() => {
          Speech.stop();
          setIsMuted(!isMuted);
        }}>
          <Text style={styles.audioToggle}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* Instruction & Audio Replay */}
      <View style={styles.instructionArea}>
        <Text style={styles.instructionText}>Tap the letter that says: "Ah"</Text>
        <TouchableOpacity 
          style={styles.replayBtn} 
          activeOpacity={0.7} 
          onPress={() => {
            if (!isMuted) {
              Speech.stop();
              Speech.speak("Ah", { rate: 0.7, pitch: 1.2 });
            }
          }}
        >
          <Text style={styles.replayIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Letter Cards */}
      <View style={styles.cardsArea}>
        {/* Letter A */}
        <Animated.View style={{ transform: [{ scale: scaleA }], width: '45%' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => handlePressLetter('A', scaleA)}
            style={[
              styles.letterCard, 
              selectedLetter === 'A' && { backgroundColor: LETTER_COLORS['A'], borderColor: '#D32F2F', elevation: 10 }
            ]}
          >
            <Text style={[styles.letterText, selectedLetter === 'A' && styles.letterTextSelected]}>A</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Letter B */}
        <Animated.View style={{ transform: [{ scale: scaleB }], width: '45%' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => handlePressLetter('B', scaleB)}
            style={[
              styles.letterCard, 
              selectedLetter === 'B' && { backgroundColor: LETTER_COLORS['B'], borderColor: '#2E7D32', elevation: 10 }
            ]}
          >
            <Text style={[styles.letterText, selectedLetter === 'B' && styles.letterTextSelected]}>B</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Check Answer Button */}
      <TouchableOpacity 
        style={[styles.checkBtn, !selectedLetter && styles.checkBtnDisabled]}
        activeOpacity={0.8}
        onPress={handleCheckAnswer}
        disabled={!selectedLetter}
      >
        <Text style={styles.checkBtnText}>CHECK ANSWER ✨</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  closeBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  closeIcon: { fontSize: 16, fontWeight: '900', color: '#FF6B6B' },
  progressBarBg: { flex: 1, height: 14, backgroundColor: '#EAEAEA', borderRadius: 10, marginHorizontal: 15 },
  progressBarFill: { width: '40%', height: '100%', backgroundColor: '#4ECDC4', borderRadius: 10 },
  audioToggle: { fontSize: 24 },
  
  instructionArea: { alignItems: 'center', marginTop: 50 },
  instructionText: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 25, textAlign: 'center' },
  replayBtn: { backgroundColor: '#4ECDC4', width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#4ECDC4', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: {height: 4, width: 0} },
  replayIcon: { fontSize: 40, color: '#FFF' },

  cardsArea: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 70, paddingHorizontal: 10 },
  letterCard: { backgroundColor: '#FFF', height: 200, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#EAEAEA', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: {width:0, height:3} },
  letterText: { fontSize: 80, fontWeight: '900', color: '#444' },
  letterTextSelected: { color: '#FFF' },

  checkBtn: { backgroundColor: '#FF6B6B', position: 'absolute', bottom: 40, left: 20, right: 20, paddingVertical: 20, borderRadius: 100, alignItems: 'center', elevation: 6, shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {width: 0, height: 6} },
  checkBtnDisabled: { backgroundColor: '#FFB8B8', elevation: 0, shadowOpacity: 0 },
  checkBtnText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1.5 }
});
