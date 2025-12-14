import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecordScreen({ navigation, route }) {
  const [status, setStatus] = useState(route?.params?.status || 'idle'); // idle | recording | finished
  const [bars, setBars] = useState(() => Array.from({ length: 18 }, () => 4));
  const timerRef = useRef(null);

  // Mock recordings list for the modify screen
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

  function stopRecording() {
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
    navigation.navigate('Welcome');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="globe-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
          <Ionicons name="search" size={22} color="#4B5563" />
        </View>
      </View>

      <View style={styles.centerArea}>
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
            <Text style={styles.primaryText}>Start</Text>
          </TouchableOpacity>
        )}

        {status === 'recording' && (
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#EF4444' }]} onPress={stopRecording}>
            <Text style={styles.primaryText}>Stop / Validate</Text>
          </TouchableOpacity>
        )}

        {status === 'finished' && (
          <View style={{ width: '100%' }}>
            <TouchableOpacity style={styles.secondaryButton} onPress={goModify}>
              <Text style={styles.secondaryText}>Modify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { marginTop: 12 }]} onPress={resetRecording}>
              <Text style={styles.secondaryText}>New Recording</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { marginTop: 16, backgroundColor: '#6B7280' }]} onPress={confirmAndExit}>
              <Text style={styles.primaryText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
  primaryText: { color: '#fff', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  secondaryText: { color: '#111', fontSize: 15 },
});
