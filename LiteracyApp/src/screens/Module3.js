import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Animated
} from 'react-native';
import * as Speech from 'expo-speech';

import { Image } from 'react-native';
import { progressAPI } from '../services/api';

// Supervisor color-coding: word letters each colored by vowel/consonant rule
const LETTER_COLORS = {
  A: '#FF3B30', E: '#FF9500', I: '#34C759', O: '#007AFF', U: '#AF52DE', // Vowels (Primary)
};
const CONSONANT_COLOR = '#4ECDC4'; // Secondary/tertiary for consonants

function ColoredWord({ word }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {word.split('').map((ch, i) => (
        <Text key={i} style={[styles.wordLetter, { color: LETTER_COLORS[ch] || CONSONANT_COLOR }]}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

export default function Module3({ moduleData, onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(1)).current;

  // Warm up TTS engine on mount
  React.useEffect(() => {
    Speech.speak(' ', { volume: 0 });
    return () => Speech.stop();
  }, []);

  // Use dynamic content or fallback
  const questions = moduleData?.content && moduleData.content.length > 0 
    ? moduleData.content 
    : [{ word: 'CAT', image_url: '' }];
    
  const q = questions[questionIndex];
  const targetWord = (q.word || 'CAT').toUpperCase();
  
  // Create a wrong option dynamically if not provided
  const wrongWord = q.wrong ? q.wrong.toUpperCase() : (targetWord === 'CAT' ? 'BAT' : 'CAT');
  
  // Ensure options are shuffled
  const [options, setOptions] = useState(() => {
    return Math.random() > 0.5 ? [targetWord, wrongWord] : [wrongWord, targetWord];
  });

  const speak = (text) => {
    if (!isMuted) { Speech.stop(); Speech.speak(text, { rate: 0.8, pitch: 1.2 }); }
  };

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    speak(option.toLowerCase());
  };

  const handleCheck = async () => {
    if (!selected) return;
    setAnswered(true);
    if (selected === targetWord) {
      speak('Correct! Well done!');
      Animated.sequence([
        Animated.spring(successScale, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(successScale, { toValue: 1.0, useNativeDriver: true }),
      ]).start();
      
      try {
        if (moduleData?.id) {
          await progressAPI.submitProgress(moduleData.id, 10, 1, true);
        }
      } catch (err) {
        console.log('Error submitting success progress:', err.response?.data || err.message);
      }
      
    } else {
      speak(`Oops! The answer is ${targetWord.toLowerCase()}`);
      try {
        if (moduleData?.id) {
          await progressAPI.submitProgress(moduleData.id, 0, 1, false);
        }
      } catch (err) {
        console.log('Error submitting failure progress:', err.response?.data || err.message);
      }
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (questionIndex + 1 < questions.length) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      
      const nextQ = questions[nextIndex];
      const nextTarget = (nextQ.word || 'CAT').toUpperCase();
      const nextWrong = nextQ.wrong ? nextQ.wrong.toUpperCase() : (nextTarget === 'CAT' ? 'BAT' : 'CAT');
      setOptions(Math.random() > 0.5 ? [nextTarget, nextWrong] : [nextWrong, nextTarget]);
      
      setSelected(null);
      setAnswered(false);
      successScale.setValue(1);
    } else {
      speak('Amazing! You finished this round!');
      onBack();
    }
  };

  const correctAnswered = answered && selected === targetWord;
  const wrongAnswered   = answered && selected !== targetWord;
  const currentProgress = (questionIndex / questions.length) * 100;
  const targetProgress = ((questionIndex + 1) / questions.length) * 100;
  const progress = correctAnswered ? targetProgress : currentProgress;

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
        <TouchableOpacity onPress={() => { Speech.stop(); setIsMuted(m => !m); }}>
          <Text style={styles.audioToggle}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructionText}>Match the word to the picture</Text>

      {/* Image Focus */}
      <Animated.View style={[styles.imageCard, { transform: [{ scale: successScale }] }]}>
        {q.image_url ? (
          <Image source={{ uri: q.image_url }} style={{ width: 120, height: 120, borderRadius: 20 }} resizeMode="cover" />
        ) : (
          <Text style={styles.imageEmoji}>{q.image || '🖼️'}</Text>
        )}
        <TouchableOpacity onPress={() => speak(targetWord.toLowerCase())}>
          <Text style={styles.speakHint}>🔊 Hear it</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Word Options */}
      <Animated.View style={[styles.optionsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrect  = answered && option === targetWord;
          const isWrong    = answered && isSelected && option !== targetWord;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionCard,
                isSelected && !answered && styles.optionSelected,
                isCorrect  && styles.optionCorrect,
                isWrong    && styles.optionWrong,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.8}
            >
              <ColoredWord word={option} />
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Status message */}
      {correctAnswered && <Text style={styles.feedback}>🎉 Correct! +10 Points!</Text>}
      {wrongAnswered   && <Text style={[styles.feedback, { color: '#FF6B6B' }]}>❌ Try again next time!</Text>}

      {/* Action Button */}
      {!answered ? (
        <TouchableOpacity
          style={[styles.checkBtn, !selected && styles.checkBtnDisabled]}
          onPress={handleCheck} activeOpacity={0.8} disabled={!selected}
        >
          <Text style={styles.checkBtnText}>CHECK ANSWER ✨</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.checkBtn} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.checkBtnText}>
            {questionIndex + 1 < questions.length ? 'NEXT ➡️' : 'FINISH 🏆'}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  closeBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  closeIcon: { fontSize: 16, fontWeight: '900', color: '#FF6B6B' },
  progressBarBg: { flex: 1, height: 14, backgroundColor: '#EAEAEA', borderRadius: 10, marginHorizontal: 15 },
  progressBarFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 10 },
  audioToggle: { fontSize: 24 },

  instructionText: { fontSize: 22, fontWeight: '800', color: '#333', textAlign: 'center', marginTop: 30, marginBottom: 20 },

  imageCard: { alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 40 },
  imageEmoji: { fontSize: 110 },
  speakHint: { color: '#4ECDC4', fontWeight: '700', fontSize: 16, marginTop: 10 },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 20 },
  optionCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 22, paddingVertical: 24, alignItems: 'center', borderWidth: 4, borderColor: '#EAEAEA', elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  optionSelected: { borderColor: '#FF9500', backgroundColor: '#FFF9F0' },
  optionCorrect: { borderColor: '#34C759', backgroundColor: '#F0FFF4' },
  optionWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFF0F0' },
  wordLetter: { fontSize: 36, fontWeight: '900' },

  feedback: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#34C759', marginBottom: 10 },

  checkBtn: { backgroundColor: '#FF6B6B', position: 'absolute', bottom: 40, left: 20, right: 20, paddingVertical: 20, borderRadius: 100, alignItems: 'center', elevation: 6, shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  checkBtnDisabled: { backgroundColor: '#FFB8B8', elevation: 0, shadowOpacity: 0 },
  checkBtnText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1.5 },
});
