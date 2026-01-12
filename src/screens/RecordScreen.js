import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { playTapFeedback } from '../utils/feedback';

export default function RecordScreen({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 16 });
  const [status, setStatus] = useState(route?.params?.status || 'idle'); // Leerlauf | Aufnahme | abgeschlossen
  const [bars, setBars] = useState(() => Array.from({ length: 18 }, () => 4));
  const timerRef = useRef(null);

  // Mock-Aufnahmeliste für den Bearbeitungs-Screen
  const recordings = [
    { id: 'r1', name: 'Voice1.WAV' },
    { id: 'r2', name: 'Voice2.WAV' },
    { id: 'r3', name: 'Voice3.WAV' },
    { id: 'r4', name: 'Voice4.WAV' },
    { id: 'r5', name: 'Voice5.WAV' },
  ];

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setBars((prev) => prev.map(() => 8 + Math.random() * 60));
      }, 120);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  function startRecording() {
    setStatus('recording');
  }

  function togglePauseResume() {
    setStatus((prev) => (prev === 'recording' ? 'paused' : 'recording'));
  }

  function validateRecording() {
    playTapFeedback();
    setStatus('finished');
  }

  function resetRecording() {
    setBars(Array.from({ length: 18 }, () => 4));
    setStatus('idle');
  }

  function goModify() {
    navigation.navigate('RecordModify', { recordings });
  }

  function confirmAndExit() {
    playTapFeedback();
    navigation.navigate('Welcome');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.centerArea, entryStyle]}>
        <View style={styles.iconRow}>
          <Ionicons name="mic-outline" size={52} color="#111" />
          <Ionicons name="folder-outline" size={52} color="#111" style={{ marginLeft: 32 }} />
          {status === 'finished' && <Ionicons name="checkmark" size={46} color="#111" style={{ marginLeft: 32 }} />}
        </View>

        <View style={styles.waveWrapper}>
          {bars.map((h, idx) => (
            <View
              key={idx}
              style={[styles.waveBar, { height: status === 'recording' || status === 'finished' ? h : 6 }]}
            />
          ))}
        </View>

        {status === 'idle' && (
          <TouchableOpacity style={styles.primaryButton} onPress={startRecording}>
            <Text style={styles.primaryText}>Start Recording</Text>
          </TouchableOpacity>
        )}

        {(status === 'recording' || status === 'paused') && (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: status === 'recording' ? '#EF4444' : '#10B981' },
              ]}
              onPress={togglePauseResume}
            >
              <Text style={styles.primaryText}>{status === 'recording' ? 'Stop' : 'Continue'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 12, backgroundColor: '#22c55e' }]}
              onPress={validateRecording}
            >
              <Text style={styles.primaryText}>Validate</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'finished' && (
          <View style={{ width: '100%' }}>
            <TouchableOpacity style={[styles.secondaryButton, styles.compactButton]} onPress={goModify}>
              <Text style={styles.secondaryText}>Modify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, styles.compactButton, { marginTop: 10 }]} onPress={resetRecording}>
              <Text style={styles.secondaryText}>New Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, styles.compactPrimary, { marginTop: 14, backgroundColor: '#22c55e' }]}
              onPress={confirmAndExit}
            >
              <Text style={styles.primaryText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 18 },
  headerBar: {
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 32 },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  waveWrapper: { flexDirection: 'row', alignItems: 'center', height: 120, marginBottom: 24 },
  waveBar: { width: 6, borderRadius: 3, backgroundColor: '#111', marginHorizontal: 4 },
  primaryButton: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
    alignSelf: 'center',
  },
  compactPrimary: { minWidth: 140, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  primaryText: { color: '#fff', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
  },
  compactButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, minWidth: 180, alignSelf: 'center' },
  secondaryText: { color: '#111', fontSize: 15 },
});
