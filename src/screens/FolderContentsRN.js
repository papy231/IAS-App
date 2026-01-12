import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FolderOpen, Image as ImageIcon, FileVideo, FileText } from 'lucide-react-native';
import { getLibraryState, setLibraryFilesByFolder } from '../data/libraryStore';
import { palette } from '../theme/colors';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { playTrashFeedback } from '../utils/feedback';

const typeIcon = {
  PDF: FileText,
  MP4: FileVideo,
  XLSX: FileText,
  Image: ImageIcon,
};

export default function FolderContentsRN({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 16 });
  const folderId = route?.params?.folderId;
  const folderName = route?.params?.folderName || 'Folder';
  const [files, setFiles] = useState(() => {
    const filesByFolder = getLibraryState().filesByFolder;
    return filesByFolder[folderId] || [];
  });

  useEffect(() => {
    const filesByFolder = getLibraryState().filesByFolder;
    setFiles(filesByFolder[folderId] || []);
  }, [folderId]);

  const handleDeleteFile = (fileId) => {
    playTrashFeedback();
    const filesByFolder = getLibraryState().filesByFolder;
    const updatedFolderFiles = (filesByFolder[folderId] || []).filter((file) => file.id !== fileId);
    const nextFilesByFolder = { ...filesByFolder, [folderId]: updatedFolderFiles };
    setLibraryFilesByFolder(nextFilesByFolder);
    setFiles(updatedFolderFiles);
  };

  const renderItem = ({ item }) => {
    const IconComp = typeIcon[item.type] || FileText;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SavedFileDetailRN', { file: item, folderName, folderId })}>
        <View style={styles.cardIcon}>
          <IconComp size={28} color={palette.foreground} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.label || item.name}</Text>
        <Text style={styles.cardType}>{item.type}</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFile(item.id)}>
          <Ionicons name="trash" size={16} color="#111827" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={palette.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>{folderName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.contentArea, entryStyle]}>
        {files.length === 0 ? (
          <View style={styles.empty}>
            <FolderOpen size={48} color={palette.muted} />
            <Text style={styles.emptyText}>This folder is empty</Text>
          </View>
        ) : (
          <FlatList
            data={files}
            renderItem={renderItem}
            keyExtractor={(item, idx) => `${item.id || idx}`}
            numColumns={2}
            contentContainerStyle={styles.list}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backButton: { padding: 6 },
  title: { fontSize: 18, fontWeight: '700', color: palette.foreground },
  headerSpacer: { width: 32 },
  contentArea: { flex: 1 },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    position: 'relative',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: palette.foreground },
  cardType: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 8, color: '#6b7280' },
});
