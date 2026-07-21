import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  PanResponder, Dimensions
} from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { progressAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

// Supervisor color-coding: 'm' is a consonant → secondary/tertiary color (teal)
const LETTER_COLOR = '#4ECDC4';
const LETTER_GUIDE_OPACITY = 0.15;

export default function Module2({ onBack }) {
  const [isMuted, setIsMuted] = useState(false);
  const [tracedPath, setTracedPath] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const svgRef = useRef(null);

  const speak = (text) => {
    if (!isMuted) {
      Speech.stop();
      Speech.speak(text, { rate: 0.8, pitch: 1.2 });
    }
  };

  // Build an SVG path string from an array of {x, y} points
  const buildPathString = (points) => {
    if (points.length < 2) return '';
    const [start, ...rest] = points;
    return `M${start.x},${start.y} ` + rest.map(p => `L${p.x},${p.y}`).join(' ');
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTracedPath([{ x: locationX, y: locationY }]);
        setIsComplete(false);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTracedPath(prev => [...prev, { x: locationX, y: locationY }]);
      },
      onPanResponderRelease: () => {
        setIsComplete(true);
      },
    })
  ).current;

  const handleClear = () => {
    setTracedPath([]);
    setIsComplete(false);
    speak("Let's try again. Trace the letter m.");
  };

  const handleCheck = async () => {
    if (tracedPath.length < 20) {
      speak("Keep tracing! Follow the dotted letter.");
      return;
    }
    speak("Fantastic! You traced the letter m! Plus 10 points!");
    alert("Fantastic! 🎉 +10 Points and 1 Naira Icon!");
    
    // Submit progress to the backend
    try {
      await progressAPI.submitProgress(2, 10, 1, true);
    } catch (err) {
      console.log('Failed to save progress', err);
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
        <TouchableOpacity onPress={() => { Speech.stop(); setIsMuted(m => !m); }}>
          <Text style={styles.audioToggle}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      <View style={styles.instructionArea}>
        <Text style={styles.instructionText}>Trace the letter 'm'</Text>
        <TouchableOpacity onPress={() => speak("m, mmm, m")} style={styles.listenBtn}>
          <Text style={styles.listenIcon}>🔊 Hear Sound</Text>
        </TouchableOpacity>
      </View>

      {/* Tracing Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg height={CANVAS_SIZE} width={CANVAS_SIZE}>
          {/* Guide letter 'm' — faded, child traces over it */}
          <SvgText
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE * 0.75}
            fontSize={CANVAS_SIZE * 0.75}
            fontWeight="900"
            textAnchor="middle"
            fill={LETTER_COLOR}
            fillOpacity={LETTER_GUIDE_OPACITY}
          >
            m
          </SvgText>

          {/* Dotted guide border hint */}
          <SvgText
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE * 0.75}
            fontSize={CANVAS_SIZE * 0.75}
            fontWeight="900"
            textAnchor="middle"
            fill="none"
            stroke={LETTER_COLOR}
            strokeWidth="3"
            strokeOpacity={0.3}
            strokeDasharray="10,8"
          >
            m
          </SvgText>

          {/* The child's drawn trace path */}
          {tracedPath.length > 1 && (
            <Path
              d={buildPathString(tracedPath)}
              stroke={LETTER_COLOR}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.85}
            />
          )}
        </Svg>

        {/* Hint label */}
        <Text style={styles.hintText}>
          {tracedPath.length === 0 ? '☝️ Touch and draw here' : isComplete ? '✅ Looking good!' : '✏️ Keep going...'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.8}>
          <Text style={styles.clearBtnText}>🔄 Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkBtn, tracedPath.length < 5 && styles.checkBtnDisabled]}
          onPress={handleCheck}
          activeOpacity={0.8}
          disabled={tracedPath.length < 5}
        >
          <Text style={styles.checkBtnText}>CHECK ✨</Text>
        </TouchableOpacity>
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
  progressBarFill: { width: '50%', height: '100%', backgroundColor: '#4ECDC4', borderRadius: 10 },
  audioToggle: { fontSize: 24 },

  instructionArea: { alignItems: 'center', marginTop: 30, marginBottom: 15 },
  instructionText: { fontSize: 26, fontWeight: '900', color: '#333', marginBottom: 12 },
  listenBtn: { backgroundColor: '#4ECDC420', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 2, borderColor: '#4ECDC4' },
  listenIcon: { color: '#4ECDC4', fontWeight: '800', fontSize: 16 },

  canvasContainer: {
    alignSelf: 'center',
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  hintText: { position: 'absolute', bottom: 14, alignSelf: 'center', color: '#BBB', fontWeight: '700', fontSize: 14 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  clearBtn: { flex: 1, backgroundColor: '#EAEAEA', paddingVertical: 18, borderRadius: 100, alignItems: 'center' },
  clearBtnText: { fontWeight: '800', color: '#666', fontSize: 18 },
  checkBtn: { flex: 2, backgroundColor: '#FF6B6B', paddingVertical: 18, borderRadius: 100, alignItems: 'center', elevation: 5, shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  checkBtnDisabled: { backgroundColor: '#FFB8B8', elevation: 0, shadowOpacity: 0 },
  checkBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1.2 },
});
