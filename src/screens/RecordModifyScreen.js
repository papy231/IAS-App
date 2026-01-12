import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { playTapFeedback } from '../utils/feedback';

export default function QuickModifyScreen({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 16 });
  const initialRecordings = useMemo(() => route?.params?.recordings || [
    { id: 'r1', name: 'Voice1.WAV', duration: 12 },
    { id: 'r2', name: 'Voice2.WAV', duration: 10 },
    { id: 'r3', name: 'Voice3.WAV', duration: 14 },
    { id: 'r4', name: 'Voice4.WAV', duration: 9 },
    { id: 'r5', name: 'Voice5.WAV', duration: 11 },
  ], [route?.params?.recordings]);

  const [recordings, setRecordings] = useState(initialRecordings);
  const [selectedId, setSelectedId] = useState(initialRecordings[0]?.id || null);
  const [checked, setChecked] = useState(() => new Set());
  const [playState, setPlayState] = useState('idle'); // Leerlauf | Wiedergabe | pausiert
  const [progress, setProgress] = useState(0); // Sekunden
  const [showTrim, setShowTrim] = useState(false);
  const [trimStart, setTrimStart] = useState('0.0');
  const [trimEnd, setTrimEnd] = useState('5.0');
  const [waveform, setWaveform] = useState(() => Array.from({ length: 48 }, () => 20 + Math.random() * 60));

  const toggleCheck = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSelectedId(id);
    regenerateWaveform();
  };

  const handlePlayPause = () => {
    if (playState === 'playing') setPlayState('paused');
    else setPlayState('playing');
  };

  const handleStop = () => setPlayState('idle');

  const regenerateWaveform = () => {
    setWaveform(Array.from({ length: 48 }, () => 20 + Math.random() * 60));
  };

  const selectedRecording = recordings.find((r) => r.id === selectedId);
  const duration = selectedRecording?.duration || 10;

  useEffect(() => {
    if (progress > duration) setProgress(duration);
  }, [duration, progress]);

  useEffect(() => {
    if (playState !== 'playing') return;
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.2;
        if (next >= duration) {
          setPlayState('idle');
          return duration;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playState, duration]);

  const applyTrim = () => {
    const start = Math.max(0, Math.min(duration, parseFloat(trimStart) || 0));
    const end = Math.max(start, Math.min(duration, parseFloat(trimEnd) || duration));
    setTrimStart(start.toFixed(1));
    setTrimEnd(end.toFixed(1));
    setShowTrim(false);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setRecordings((prev) => prev.filter((r) => r.id !== selectedId));
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(selectedId);
      return next;
    });
    setSelectedId((prev) => {
      const remaining = recordings.filter((r) => r.id !== prev);
      return remaining[0]?.id || null;
    });
  };

  const trimStartPct = Math.min(1, Math.max(0, (parseFloat(trimStart) || 0) / duration));
  const trimEndPct = Math.min(1, Math.max(trimStartPct, (parseFloat(trimEnd) || duration) / duration));
  const progressPct = Math.min(1, progress / duration);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modify Takes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView style={[styles.screenPadding, entryStyle]}>

        <View style={styles.contentRow}>
          <View style={styles.folderBox}>
            <Ionicons name="folder" size={72} color="#111" />
            <Ionicons name="mic" size={40} color="#111" />
          </View>

          <View style={styles.divider} />

          <View style={{ flex: 1, paddingLeft: 18 }}>
            {recordings.map((rec) => {
              const isChecked = checked.has(rec.id);
              const isSelected = selectedId === rec.id;
              return (
                <TouchableOpacity
                  key={rec.id}
                  style={[styles.recordRow, isSelected && styles.recordRowActive]}
                  onPress={() => toggleCheck(rec.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Ionicons name="document-outline" size={20} color="#4B5563" style={{ marginHorizontal: 8 }} />
                  <Text style={styles.recordText}>{rec.name}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Eingebettete Mock-Steuerung */}
            <View style={styles.controlsArea}>
              <View style={styles.transportRow}>
                <TouchableOpacity style={styles.iconButton} onPress={handleStop}>
                  <Ionicons name="stop" size={18} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handlePlayPause}>
                  <Ionicons name={playState === 'playing' ? 'pause' : 'play'} size={18} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setPlayState('playing')}>
                  <Ionicons name="play-forward" size={18} color="#4B5563" />
                </TouchableOpacity>
                  <Text style={styles.playStateLabel}>{playState === 'idle' ? 'Ready' : playState === 'playing' ? 'Playing' : 'Pause'}</Text>
              </View>
                <View style={styles.waveformBlock}>
                  <View style={styles.waveformRow}>
                    {waveform.map((h, idx) => (
                      <View key={idx} style={[styles.waveBar, { height: h, opacity: idx / waveform.length < progressPct ? 0.9 : 0.45 }]} />
                    ))}
                  </View>
                  <View style={styles.trimTrack}>
                    <View style={[styles.trimRange, { left: `${trimStartPct * 100}%`, right: `${(1 - trimEndPct) * 100}%` }]} />
                    <View style={[styles.progressDot, { left: `${progressPct * 100}%` }]} />
                  </View>
                  <View style={styles.trimRow}>
                    <TouchableOpacity style={styles.trimBox} onPress={() => setShowTrim(true)}>
                      <Text style={styles.trimText}>Trim {trimStart}s - {trimEnd}s</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { marginRight: 0 }]} onPress={deleteSelected}>
                      <Ionicons name="trash" size={18} color="#4B5563" />
                    </TouchableOpacity>
                  </View>
                </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#22c55e' }]}
              onPress={() => {
                playTapFeedback();
                navigation.navigate('Record', { status: 'finished' });
              }}
            >
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <Modal visible={showTrim} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set trim</Text>
            <View style={styles.trimInputsRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start (s)</Text>
                <TextInput
                  value={trimStart}
                  onChangeText={setTrimStart}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End (s)</Text>
                <TextInput
                  value={trimEnd}
                  onChangeText={setTrimEnd}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.secondaryButton, styles.compactButton]} onPress={() => setShowTrim(false)}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, styles.compactPrimary, { marginTop: 0, backgroundColor: '#22c55e', marginLeft: 10 }]} onPress={applyTrim}>
                <Text style={styles.primaryButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSpacer: { width: 32 },
  screenPadding: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
  folderBox: { width: 110, height: 140, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: '100%', backgroundColor: '#9CA3AF' },
  recordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 8 },
  recordRowActive: { backgroundColor: 'rgba(79,70,229,0.08)' },
  recordText: { fontSize: 15, color: '#374151' },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  controlsArea: { marginTop: 6 },
  transportRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  playStateLabel: { fontSize: 13, color: '#4B5563', marginLeft: 6 },
  waveformBlock: { width: '100%', marginTop: 2 },
  waveformRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 120, marginBottom: 8 },
  waveBar: { width: 5, backgroundColor: '#4B5563', borderRadius: 2 },
  trimTrack: { position: 'relative', height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  trimRange: { position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(34,197,94,0.3)' },
  progressDot: { position: 'absolute', top: -6, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', marginLeft: -7 },
  trimRow: { flexDirection: 'row', alignItems: 'center' },
  trimBox: { flex: 1, height: 36, borderWidth: 1, borderColor: '#9CA3AF', marginRight: 8, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 10 },
  trimText: { fontSize: 13, color: '#374151' },
  primaryButton: { backgroundColor: '#4B5563', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  trimInputsRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#111827' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 },
});
