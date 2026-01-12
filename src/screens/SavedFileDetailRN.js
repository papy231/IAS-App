import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { ArrowLeft, Share2, Trash2 } from 'lucide-react-native';
import { palette } from '../theme/colors';
import Button from '../components/Button';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { getLibraryState, setLibraryFilesByFolder } from '../data/libraryStore';
import { playTrashFeedback } from '../utils/feedback';

export default function SavedFileDetailRN({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 14 });
  const file = route?.params?.file;
  const folderName = route?.params?.folderName || 'Folder';
  const folderId = route?.params?.folderId;

  const handleDelete = () => {
    playTrashFeedback();
    if (folderId == null || !file?.id) {
      navigation.goBack();
      return;
    }
    const filesByFolder = getLibraryState().filesByFolder;
    const updatedFolderFiles = (filesByFolder[folderId] || []).filter((entry) => entry.id !== file.id);
    const nextFilesByFolder = { ...filesByFolder, [folderId]: updatedFolderFiles };
    setLibraryFilesByFolder(nextFilesByFolder);
    navigation.goBack();
  };

  if (!file) {
    return (
      <SafeAreaView style={styles.container}> 
        <Animated.View style={[styles.empty, entryStyle]}> 
          <Text style={styles.emptyText}>No file selected</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.contentArea, entryStyle]}>
        <View style={styles.header}>
          <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={palette.foreground} />
          </Button>
          <View>
            <Text style={styles.title}>{folderName}</Text>
            <Text style={styles.subtitle}>{file.label || file.name}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewType}>{(file.type || '').toUpperCase()}</Text>
        </View>

        <View style={styles.actions}>
          <Button variant="secondary" style={{ flex: 1 }}>Modify</Button>
          <Button variant="destructive" style={{ flex: 1, marginLeft: 10 }} onPress={handleDelete}>
            Delete
          </Button>
        </View>

        <View style={styles.abstract}>
          <Text style={styles.abstractLabel}>Abstract</Text>
          <Text style={styles.abstractText}>{file.description}</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={'#fff'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBtnLight}>
            <Share2 size={18} color={palette.foreground} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4ff', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  title: { fontSize: 16, fontWeight: '700', color: palette.foreground },
  subtitle: { fontSize: 12, color: '#6b7280' },
  preview: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  previewType: { fontSize: 32, fontWeight: '800', color: palette.foreground },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  abstract: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    minHeight: 120,
  },
  abstractLabel: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  abstractText: { fontSize: 14, color: palette.foreground },
  bottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnLight: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6b7280' },
  contentArea: { flex: 1 },
});
