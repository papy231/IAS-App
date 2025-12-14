import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuickModifyScreen({ navigation, route }) {
  const recordings = useMemo(() => route?.params?.recordings || [
    { id: 'r1', name: 'Voice1.WAV' },
    { id: 'r2', name: 'Voice2.WAV' },
    { id: 'r3', name: 'Voice3.WAV' },
    { id: 'r4', name: 'Voice4.WAV' },
  ], [route?.params?.recordings]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.screenPadding}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.folderBox}>
            <Ionicons name="folder" size={72} color="#111" />
            <Ionicons name="mic" size={40} color="#111" />
          </View>

          <View style={styles.divider} />

          <View style={{ flex: 1, paddingLeft: 18 }}>
            {recordings.map((rec) => (
              <View key={rec.id} style={styles.recordRow}>
                <View style={styles.checkbox} />
                <Ionicons name="document-outline" size={20} color="#9CA3AF" style={{ marginHorizontal: 8 }} />
                <Text style={styles.recordText}>{rec.name}</Text>
              </View>
            ))}

            {/* Inline mock controls */}
            <View style={styles.controlsArea}>
              <View style={styles.volumeTrack}>
                <View style={styles.volumeThumb} />
              </View>
              <View style={styles.transportRow}>
                {['play-back', 'play-back-circle', 'pause', 'play-circle', 'play-forward', 'play-forward-circle'].map((icon, idx) => (
                  <TouchableOpacity key={idx} style={styles.iconButton}>
                    <Ionicons name={icon} size={20} color="#4B5563" />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.trimRow}>
                <View style={styles.trimBox} />
                <Ionicons name="return-down-back" size={20} color="#4B5563" />
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Record', { status: 'finished' })}>
            <Text style={styles.primaryButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  screenPadding: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 30 },
  folderBox: { width: 120, height: 160, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 1, height: '100%', backgroundColor: '#9CA3AF' },
  recordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  recordText: { fontSize: 15, color: '#374151' },
  checkbox: { width: 18, height: 18, borderRadius: 3, borderWidth: 1, borderColor: '#9CA3AF' },
  controlsArea: { marginTop: 16 },
  volumeTrack: { width: 6, height: 120, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 12 },
  volumeThumb: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6B7280', alignSelf: 'center', marginTop: 40 },
  transportRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  trimRow: { flexDirection: 'row', alignItems: 'center' },
  trimBox: { flex: 1, height: 24, borderWidth: 1, borderColor: '#9CA3AF', marginRight: 8 },
  primaryButton: { backgroundColor: '#4B5563', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15 },
});
