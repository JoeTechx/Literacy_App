import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  Animated, PanResponder, Dimensions
} from 'react-native';
import * as Speech from 'expo-speech';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- STATIC DATA (will be replaced by backend API call) ---
const PUZZLES = [
  { id: 1, image: '🐸', fullWord: 'FROG', dropSlot: 'FR', ending: 'OG',  tiles: ['FR', 'ST', 'BL'] },
  { id: 2, image: '🐌', fullWord: 'SNAIL', dropSlot: 'SN', ending: 'AIL', tiles: ['SN', 'TR', 'PL'] },
  { id: 3, image: '🦋', fullWord: 'FLIES', dropSlot: 'FL', ending: 'IES', tiles: ['CH', 'FL', 'BR'] },
];

// Supervisor color-coding for letters
const LETTER_COLORS = {
  A: '#FF3B30', E: '#FF9500', I: '#34C759', O: '#007AFF', U: '#AF52DE',
};
const CONSONANT_COLOR = '#4ECDC4';

function ColoredWord({ word, fontSize = 28 }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      {word.split('').map((ch, i) => (
        <Text key={i} style={{ fontSize, fontWeight: '900', color: LETTER_COLORS[ch] || CONSONANT_COLOR }}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

// ─── Draggable Tile Component ──────────────────────────────────────────────
function DraggableTile({ label, onDropped, dropZoneLayout, disabled }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const tileRef = useRef(null);
  const isOverZone = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();

        // Get current tile screen position by measuring
        tileRef.current && tileRef.current.measure((fx, fy, w, h, px, py) => {
          const tileCenterX = px + w / 2;
          const tileCenterY = py + h / 2;

          const dz = dropZoneLayout.current;
          if (
            dz &&
            tileCenterX > dz.x &&
            tileCenterX < dz.x + dz.width &&
            tileCenterY > dz.y &&
            tileCenterY < dz.y + dz.height
          ) {
            // Dropped in zone! Snap back and register
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
            onDropped(label);
          } else {
            // Snap back to origin
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
          }
        });
      },
    })
  ).current;

  return (
    <Animated.View
      ref={tileRef}
      style={[styles.tile, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <ColoredWord word={label} fontSize={26} />
      <Text style={styles.tileDragHint}>drag me</Text>
    </Animated.View>
  );
}

// ─── Main Module 4 Screen ──────────────────────────────────────────────────
export default function Module4({ onBack }) {
  const [isMuted, setIsMuted]       = useState(false);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [droppedTile, setDroppedTile] = useState(null);
  const [answered, setAnswered]       = useState(false);

  const dropZoneLayout = useRef(null);
  const shakeAnim      = useRef(new Animated.Value(0)).current;
  const dropScale      = useRef(new Animated.Value(1)).current;

  const p        = PUZZLES[puzzleIndex];
  const progress = ((puzzleIndex + 1) / PUZZLES.length) * 100;
  const isCorrect = answered && droppedTile === p.dropSlot;
  const isWrong   = answered && droppedTile !== p.dropSlot;

  const speak = (text) => {
    if (!isMuted) { Speech.stop(); Speech.speak(text, { rate: 0.8, pitch: 1.1 }); }
  };

  const handleDropped = (tile) => {
    if (answered) return;
    setDroppedTile(tile);
    speak(tile.toLowerCase());
    Animated.sequence([
      Animated.spring(dropScale, { toValue: 1.2, useNativeDriver: false }),
      Animated.spring(dropScale, { toValue: 1.0, useNativeDriver: false }),
    ]).start();
  };

  const handleCheck = () => {
    if (!droppedTile) { speak('Drag a tile into the box first!'); return; }
    setAnswered(true);
    if (droppedTile === p.dropSlot) {
      speak(`Correct! The word is ${p.fullWord.toLowerCase()}!`);
    } else {
      speak(`Oops! The answer is ${p.dropSlot.toLowerCase()}`);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 14, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: -14, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: false }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (puzzleIndex + 1 < PUZZLES.length) {
      setPuzzleIndex(i => i + 1);
      setDroppedTile(null);
      setAnswered(false);
      dropScale.setValue(1);
    } else {
      speak('Amazing! You finished all puzzles!');
      onBack();
    }
  };

  const handleClear = () => {
    if (answered) return;
    setDroppedTile(null);
    speak('Try again! Drag a tile into the box.');
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
        <TouchableOpacity onPress={() => { Speech.stop(); setIsMuted(m => !m); }}>
          <Text style={styles.audioToggle}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructionText}>Drag tiles to finish the word</Text>

      {/* Image */}
      <View style={styles.imageCard}>
        <Text style={styles.imageEmoji}>{p.image}</Text>
        <TouchableOpacity onPress={() => speak(p.fullWord.toLowerCase())}>
          <Text style={styles.speakHint}>🔊 Hear word</Text>
        </TouchableOpacity>
      </View>

      {/* Word Assembly Row */}
      <Animated.View style={[styles.wordRow, { transform: [{ translateX: shakeAnim }] }]}>

        {/* Drop Zone — child drags tile here */}
        <Animated.View
          onLayout={(e) => {
            // Capture absolute position for collision detection
            e.target.measure((fx, fy, w, h, px, py) => {
              dropZoneLayout.current = { x: px, y: py, width: w, height: h };
            });
          }}
          style={[
            styles.dropZone,
            droppedTile && styles.dropZoneFilled,
            isCorrect   && styles.dropZoneCorrect,
            isWrong     && styles.dropZoneWrong,
            { transform: [{ scale: dropScale }] },
          ]}
        >
          {droppedTile
            ? <ColoredWord word={droppedTile} fontSize={30} />
            : <Text style={styles.dropZonePlaceholder}>Drop{'\n'}Here</Text>
          }
        </Animated.View>

        <Text style={styles.connector}>+</Text>

        {/* Fixed Ending */}
        <View style={styles.endingBox}>
          <ColoredWord word={p.ending} fontSize={30} />
        </View>

        {droppedTile && (
          <>
            <Text style={styles.connector}>=</Text>
            <View style={styles.resultBox}>
              <ColoredWord word={p.fullWord} fontSize={22} />
            </View>
          </>
        )}
      </Animated.View>

      {/* Feedback */}
      {isCorrect && <Text style={styles.feedback}>🎉 Correct! +10 Points!</Text>}
      {isWrong   && <Text style={[styles.feedback, { color: '#FF6B6B' }]}>❌ The answer was "{p.dropSlot}"</Text>}

      {/* Draggable Tile Options */}
      <Text style={styles.tilesLabel}>DRAG A TILE INTO THE BOX:</Text>
      <View style={styles.tilesRow}>
        {p.tiles.map((tile) => (
          <DraggableTile
            key={`${puzzleIndex}-${tile}`}
            label={tile}
            onDropped={handleDropped}
            dropZoneLayout={dropZoneLayout}
            disabled={answered}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.actionRow}>
        {!answered && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.8}>
            <Text style={styles.clearBtnText}>🔄 Clear</Text>
          </TouchableOpacity>
        )}
        {!answered ? (
          <TouchableOpacity
            style={[styles.checkBtn, !droppedTile && styles.checkBtnDisabled]}
            onPress={handleCheck} activeOpacity={0.8} disabled={!droppedTile}
          >
            <Text style={styles.checkBtnText}>CHECK ✨</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.checkBtn, { flex: 1 }]} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.checkBtnText}>
              {puzzleIndex + 1 < PUZZLES.length ? 'NEXT ➡️' : 'FINISH 🏆'}
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
  progressBarFill: { height: '100%', backgroundColor: '#45B7D1', borderRadius: 10 },
  audioToggle: { fontSize: 24 },

  instructionText: { fontSize: 22, fontWeight: '800', color: '#333', textAlign: 'center', marginTop: 20, marginBottom: 12 },

  imageCard: { alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 26, padding: 18, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, marginBottom: 20 },
  imageEmoji: { fontSize: 80 },
  speakHint: { color: '#45B7D1', fontWeight: '700', fontSize: 14, marginTop: 6 },

  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 8 },
  dropZone: { minWidth: 90, height: 80, backgroundColor: '#F0F8FF', borderWidth: 4, borderColor: '#B0DFF0', borderRadius: 20, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  dropZoneFilled: { borderColor: '#45B7D1', borderStyle: 'solid', backgroundColor: '#E0F4FF' },
  dropZoneCorrect: { borderColor: '#34C759', backgroundColor: '#F0FFF4' },
  dropZoneWrong: { borderColor: '#FF6B6B', backgroundColor: '#FFF0F0' },
  dropZonePlaceholder: { fontSize: 14, color: '#B0DFF0', fontWeight: '900', textAlign: 'center', lineHeight: 18 },
  connector: { fontSize: 28, fontWeight: '900', color: '#CCC' },
  endingBox: { minWidth: 90, height: 80, backgroundColor: '#FFF', borderWidth: 4, borderColor: '#45B7D1', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  resultBox: { minWidth: 100, height: 80, backgroundColor: '#FFF3E0', borderWidth: 3, borderColor: '#FF9500', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },

  feedback: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#34C759', marginBottom: 4 },

  tilesLabel: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#AAA', letterSpacing: 1, marginBottom: 10, marginTop: 6 },
  tilesRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8, minHeight: 100 },
  tile: { backgroundColor: '#FFF', paddingVertical: 20, paddingHorizontal: 22, borderRadius: 20, borderWidth: 4, borderColor: '#45B7D1', elevation: 6, shadowColor: '#45B7D1', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, alignItems: 'center', zIndex: 999 },
  tileDragHint: { fontSize: 10, color: '#AAA', fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },

  actionRow: { flexDirection: 'row', gap: 12, position: 'absolute', bottom: 30, left: 20, right: 20 },
  clearBtn: { flex: 1, backgroundColor: '#EAEAEA', paddingVertical: 18, borderRadius: 100, alignItems: 'center' },
  clearBtnText: { fontWeight: '800', color: '#666', fontSize: 18 },
  checkBtn: { flex: 2, backgroundColor: '#45B7D1', paddingVertical: 18, borderRadius: 100, alignItems: 'center', elevation: 5, shadowColor: '#45B7D1', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  checkBtnDisabled: { backgroundColor: '#B0DFF0', elevation: 0, shadowOpacity: 0 },
  checkBtnText: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 1.2 },
});
