import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { Trash2, Heart, Download, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { fileResults } from '../data/libraryData';
import { palette } from '../theme/colors';
import Button from '../components/Button';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

export default function FileDetailRN({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 16 });
  const startIndex = route?.params?.index ?? 0;
  const [index, setIndex] = useState(startIndex);
  const [likedMap, setLikedMap] = useState({});
  const file = fileResults[index] || fileResults[0];
  const isLiked = !!likedMap[file.id];

  const renderBadge = () => {
    const label = file.type.toUpperCase();
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={palette.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>{file.label}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.contentArea, entryStyle]}>
        <View style={styles.previewBox}>
          {renderBadge()}
          <Text style={styles.fileName}>{file.label}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => {}} style={styles.iconBtn}><Trash2 size={26} color={palette.foreground} /></TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLikedMap((prev) => ({ ...prev, [file.id]: !prev[file.id] }))}
            style={styles.iconBtn}
          >
            <Heart size={26} color={isLiked ? '#ef4444' : palette.foreground} fill={isLiked ? '#ef4444' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ProjectLibraryRN', { saveMode: true, fileToSave: file })} style={styles.iconBtn}>
            <Download size={26} color={palette.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{file.description}</Text>
        </View>

        <View style={styles.navRow}>
          {index > 0 ? (
            <Button variant="secondary" size="icon" onPress={() => setIndex((i) => i - 1)}>
              <ChevronLeft size={20} color={palette.foreground} />
            </Button>
          ) : <View style={{ width: 44 }} />}

          <Text style={styles.counter}>{index + 1} / {fileResults.length}</Text>

          {index < fileResults.length - 1 ? (
            <Button variant="secondary" size="icon" onPress={() => setIndex((i) => i + 1)}>
              <ChevronRight size={20} color={palette.foreground} />
            </Button>
          ) : <View style={{ width: 44 }} />}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 14,
  },
  backButton: { padding: 6 },
  headerSpacer: { width: 32 },
  title: { fontSize: 18, fontWeight: '600', color: palette.foreground },
  contentArea: { flex: 1 },
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fileName: { marginTop: 8, fontSize: 16, fontWeight: '600', color: palette.foreground },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: palette.foreground },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    minHeight: 120,
  },
  descriptionText: { color: '#4b5563', fontSize: 14 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  counter: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
});
