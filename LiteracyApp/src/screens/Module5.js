import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Animated, ScrollView
} from 'react-native';
import * as Speech from 'expo-speech';

// --- STATIC DATA (will be replaced by backend API call) ---
const WORDS = [
  { id: 1, image: '🐱', word: 'CAT', hint: 'A furry pet that meows' },
  { id: 2, image: '🐶', word: 'DOG', hint: 'A loyal pet that barks' },
  { id: 3, image: '🌞', word: 'SUN', hint: 'It shines in the sky' },
  { id: 4, image: '🐠', word: 'FISH', hint: 'It swims in water' },
  { id: 5, image: '🍎', word: 'APPLE', hint: 'A red or green fruit' },
];

// Supervisor color-coding: Vowels get primary colors, consonants get secondary/tertiary colors
const LETTER_COLORS = {
  A: '#FF3B30', // Red  – Vowel
  E: '#FF9500', // Orange – Vowel
  I: '#34C759', // Green – Vowel
  O: '#007AFF', // Blue – Vowel
  U: '#AF52DE', // Purple – Vowel
};
const CONSONANT_COLOR = '#4ECDC4'; // Teal – all consonants

function getLetterColor(ch) {
  return LETTER_COLORS[ch.toUpperCase()] || CONSONANT_COLOR;
}

// Shuffles array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build shuffled tiles with unique IDs
function buildTiles(word) {
  return shuffle(word.split('').map((ch, i) => ({ id: `${ch}-${i}`, letter: ch })));
}

export default function Module5({ onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [tiles, setTiles] = useState(() => buildTiles(WORDS[0].word));
  const [placed, setPlaced] = useState([]); // array of tile objects in the answer slots
  const [checked, setChecked] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const celebrateAnim = useRef(new Animated.Value(1)).current;

  const current = WORDS[wordIndex];
  const progress = ((wordIndex + 1) / WORDS.length) * 100;

  const speak = (text) => {
    if (!isMuted) { Speech.stop(); Speech.speak(text, { rate: 0.8, pitch: 1.1 }); }
  };

  // Tap a tile from the scramble bank → move it to the answer row
  const placeTile = (tile) => {
    if (checked) return;
    if (placed.find(p => p.id === tile.id)) return; // already placed
    const newPlaced = [...placed, tile];
    setPlaced(newPlaced);
    speak(tile.letter.toLowerCase());

    // Auto-check when all letters placed
    if (newPlaced.length === current.word.length) {
      const built = newPlaced.map(t => t.letter).join('');
      setTimeout(() => {
        setChecked(true);
        if (built === current.word) {
          speak(`Correct! The word is ${current.word.toLowerCase()}!`);
          Animated.sequence([
            Animated.spring(celebrateAnim, { toValue: 1.15, useNativeDriver: true }),
            Animated.spring(celebrateAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
          ]).start();
        } else {
          speak(`Oops! Try again. The word is ${current.word.toLowerCase()}`);
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]).start();
        }
      }, 300);
    }
  };

  // Remove last placed tile back to bank
  const removeLast = () => {
    if (checked || placed.length === 0) return;
    setPlaced(p => p.slice(0, -1));
  };

  const handleClear = () => {
    if (checked) return;
    setPlaced([]);
  };

  const handleNext = () => {
    const nextIndex = wordIndex + 1;
    if (nextIndex < WORDS.length) {
      setWordIndex(nextIndex);
      setTiles(buildTiles(WORDS[nextIndex].word));
      setPlaced([]);
      setChecked(false);
      shakeAnim.setValue(0);
      celebrateAnim.setValue(1);
    } else {
      speak('Amazing! You have completed the spelling module!');
      onBack();
    }
  };

  const builtWord = placed.map(t => t.letter).join('');
  const isCorrect = checked && builtWord === current.word;
  const isWrong   = checked && builtWord !== current.word;

  // Tiles still available in bank (not yet placed)
  const bankTiles = tiles.filter(t => !placed.find(p => p.id === t.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
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

      <Text style={styles.instruction}>Spell the word! Tap the letters in order.</Text>

      {/* ── Word Image Card ── */}
      <View style={styles.imageCard}>
        <Text style={styles.imageEmoji}>{current.image}</Text>
        <Text style={styles.hintText}>{current.hint}</Text>
        <TouchableOpacity onPress={() => speak(current.word.toLowerCase())}>
          <Text style={styles.speakHint}>🔊 Hear the word</Text>
        </TouchableOpacity>
      </View>

      {/* ── Answer Slots ── */}
      <Animated.View style={[
        styles.answerRow,
        { transform: [{ translateX: shakeAnim }, { scale: celebrateAnim }] },
        isCorrect && styles.answerRowCorrect,
        isWrong   && styles.answerRowWrong,
      ]}>
        {Array.from({ length: current.word.length }).map((_, i) => {
          const tile = placed[i];
          return (
            <TouchableOpacity
              key={i}
              style={[styles.slot, tile && styles.slotFilled]}
              onPress={() => {
                if (!checked && tile && i === placed.length - 1) removeLast();
              }}
              activeOpacity={0.7}
            >
              {tile ? (
                <Text style={[styles.slotLetter, { color: getLetterColor(tile.letter) }]}>
                  {tile.letter}
                </Text>
              ) : (
                <Text style={styles.slotBlank}>_</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* ── Feedback ── */}
      {isCorrect && <Text style={styles.feedbackCorrect}>🎉 Correct! +10 Points!</Text>}
      {isWrong   && (
        <Text style={styles.feedbackWrong}>
          ❌ The answer is:{' '}
          {current.word.split('').map((ch, i) => (
            <Text key={i} style={{ color: getLetterColor(ch), fontWeight: '900' }}>{ch}</Text>
          ))}
        </Text>
      )}

      {/* ── Letter Bank ── */}
      <Text style={styles.bankLabel}>TAP A LETTER TO PLACE IT:</Text>
      <View style={styles.bankRow}>
        {tiles.map((tile) => {
          const isPlaced = placed.find(p => p.id === tile.id);
          return (
            <TouchableOpacity
              key={tile.id}
              style={[styles.bankTile, isPlaced && styles.bankTileUsed, checked && styles.bankTileDisabled]}
              onPress={() => !isPlaced && placeTile(tile)}
              activeOpacity={isPlaced ? 1 : 0.7}
              disabled={!!isPlaced || checked}
            >
              <Text style={[styles.bankTileLetter, { color: isPlaced ? '#CCC' : getLetterColor(tile.letter) }]}>
                {tile.letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        {!checked && (
          <>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.8}>
              <Text style={styles.clearBtnText}>🔄 Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={removeLast}
              activeOpacity={0.8}
              disabled={placed.length === 0}
            >
              <Text style={styles.clearBtnText}>⬅ Undo</Text>
            </TouchableOpacity>
          </>
        )}
        {checked && (
          <TouchableOpacity style={[styles.nextBtn, { flex: 1 }]} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>
              {wordIndex + 1 < WORDS.length ? 'NEXT WORD ➡️' : 'FINISH 🏆'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  closeBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  closeIcon: { fontSize: 16, fontWeight: '900', color: '#FF6B6B' },
  progressBarBg: { flex: 1, height: 14, backgroundColor: '#EAEAEA', borderRadius: 10, marginHorizontal: 15 },
  progressBarFill: { height: '100%', backgroundColor: '#FF9500', borderRadius: 10 },
  audioToggle: { fontSize: 24 },

  instruction: { fontSize: 20, fontWeight: '800', color: '#333', textAlign: 'center', marginTop: 20, marginBottom: 12 },

  imageCard: { alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 26, padding: 16, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, marginBottom: 16 },
  imageEmoji: { fontSize: 72 },
  hintText: { fontSize: 14, color: '#888', marginTop: 6, fontWeight: '500', textAlign: 'center' },
  speakHint: { color: '#FF9500', fontWeight: '700', fontSize: 14, marginTop: 6 },

  answerRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8, padding: 10, borderRadius: 20 },
  answerRowCorrect: { backgroundColor: '#F0FFF4' },
  answerRowWrong:   { backgroundColor: '#FFF0F0' },

  slot: { width: 52, height: 62, backgroundColor: '#F5F5F5', borderWidth: 3, borderColor: '#DCDCDC', borderStyle: 'dashed', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  slotFilled: { borderStyle: 'solid', borderColor: '#FF9500', backgroundColor: '#FFF9F0' },
  slotLetter: { fontSize: 28, fontWeight: '900' },
  slotBlank:  { fontSize: 22, color: '#DCDCDC', fontWeight: '900' },

  feedbackCorrect: { textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#34C759', marginBottom: 6 },
  feedbackWrong:   { textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#FF6B6B', marginBottom: 6 },

  bankLabel: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#AAA', letterSpacing: 1, marginBottom: 10 },
  bankRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 12 },
  bankTile: { width: 58, height: 64, backgroundColor: '#FFF', borderWidth: 4, borderColor: '#FF9500', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF9500', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  bankTileUsed:     { borderColor: '#E0E0E0', backgroundColor: '#F5F5F5', elevation: 0, shadowOpacity: 0 },
  bankTileDisabled: { opacity: 0.6 },
  bankTileLetter: { fontSize: 28, fontWeight: '900' },

  actionRow: { flexDirection: 'row', gap: 12, position: 'absolute', bottom: 30, left: 20, right: 20 },
  clearBtn: { flex: 1, backgroundColor: '#EAEAEA', paddingVertical: 18, borderRadius: 100, alignItems: 'center' },
  clearBtnText: { fontWeight: '800', color: '#666', fontSize: 17 },
  nextBtn: { backgroundColor: '#FF9500', paddingVertical: 18, borderRadius: 100, alignItems: 'center', elevation: 5, shadowColor: '#FF9500', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  nextBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1.2 },
});
