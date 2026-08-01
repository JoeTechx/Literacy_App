import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import * as Speech from 'expo-speech';
import { progressAPI } from '../services/api';

// Supervisor Color-Coding Logic
const LETTER_COLORS = {
  'A': '#FF3B30', // Red (Vowel)
  'B': '#34C759', // Green (Consonant)
};

export default function Module1({ moduleData, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = moduleData?.content?.[currentIndex] || { target: 'A', wrong: 'B' };
  const targetLetter = currentItem.target?.toUpperCase() || 'A';
  const wrongLetter = currentItem.wrong?.toUpperCase() || 'B';

  const [isMuted, setIsMuted] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const totalItems = moduleData?.content?.length || 1;
  const currentProgress = (currentIndex / totalItems) * 100;
  const targetProgress = ((currentIndex + 1) / totalItems) * 100;
  const [answered, setAnswered] = useState(false);
  const progress = answered && selectedLetter === targetLetter ? targetProgress : currentProgress;

  // Warm up TTS engine on mount
  React.useEffect(() => {
    Speech.speak(' ', { volume: 0 });
    return () => Speech.stop();
  }, []);
  
  // Animations for the "Pop Out" color effect requested by Supervisor
  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const handlePressLetter = (letter, scaleAnim) => {
    setSelectedLetter(letter);
    
    // Play actual audio phonetics when touched (simplistic phonetic simulation)
    if (!isMuted) {
      Speech.stop();
      Speech.speak(letter === targetLetter ? `The sound is ${targetLetter}` : `The sound is ${wrongLetter}`, { rate: 0.8, pitch: 1.2 });
    }

    // The "Pop Out" micro-animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true })
    ]).start();
    
    // Reset the other card's scale
    const otherAnim = letter === targetLetter ? scaleB : scaleA;
    Animated.spring(otherAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleCheckAnswer = async () => {
    if (!selectedLetter) return;
    setAnswered(true);
    
    if (selectedLetter === targetLetter) {
      if (!isMuted) Speech.speak("Correct! Fantastic!", { rate: 0.9, pitch: 1.5 });
      
      // Submit progress to the backend
      try {
        if (moduleData?.id) {
          await progressAPI.submitProgress(moduleData.id, 10, 1, true);
        }
      } catch (err) {
        console.log('Failed to save success progress', err.response?.data || err.message);
      }
      
      // Move to next item if available
      if (moduleData?.content && currentIndex < moduleData.content.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedLetter(null);
          setAnswered(false);
        }, 1500);
      } else {
        setTimeout(() => onBack(), 1500);
      }
      
    } else {
      if (!isMuted) Speech.speak(`Oops! Try again. Listen carefully. ${targetLetter}`, { rate: 0.8, pitch: 1.2 });
      
      try {
        if (moduleData?.id) {
          await progressAPI.submitProgress(moduleData.id, 0, 1, false);
        }
      } catch (err) {
        console.log('Failed to save failure progress', err.response?.data || err.message);
      }
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
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
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
        <Text style={styles.instructionText}>Tap the letter that says: "{targetLetter}"</Text>
        <TouchableOpacity 
          style={styles.replayBtn} 
          activeOpacity={0.7} 
          onPress={() => {
            if (!isMuted) {
              Speech.stop();
              Speech.speak(`The sound is ${targetLetter}`, { rate: 0.7, pitch: 1.2 });
            }
          }}
        >
          <Text style={styles.replayIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Letter Cards */}
      <View style={styles.cardsArea}>
        {/* Target Letter */}
        <Animated.View style={{ transform: [{ scale: scaleA }], width: '45%' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => handlePressLetter(targetLetter, scaleA)}
            style={[
              styles.letterCard, 
              selectedLetter === targetLetter && { backgroundColor: LETTER_COLORS['A'], borderColor: '#D32F2F', elevation: 10 }
            ]}
          >
            <Text style={[styles.letterText, selectedLetter === targetLetter && styles.letterTextSelected]}>{targetLetter}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Wrong Letter */}
        <Animated.View style={{ transform: [{ scale: scaleB }], width: '45%' }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => handlePressLetter(wrongLetter, scaleB)}
            style={[
              styles.letterCard, 
              selectedLetter === wrongLetter && { backgroundColor: LETTER_COLORS['B'], borderColor: '#2E7D32', elevation: 10 }
            ]}
          >
            <Text style={[styles.letterText, selectedLetter === wrongLetter && styles.letterTextSelected]}>{wrongLetter}</Text>
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
  progressBarFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 10 },
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
