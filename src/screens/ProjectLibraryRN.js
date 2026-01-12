import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, FlatList, Animated } from 'react-native';
import { Menu, Search, Folder, FolderPlus, Trash2, ArrowLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLibraryState, setLibraryFolders, setLibraryFilesByFolder } from '../data/libraryStore';
import { palette } from '../theme/colors';
import Button from '../components/Button';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { playTrashFeedback } from '../utils/feedback';

export default function ProjectLibraryRN({ navigation, route }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 16 });
  const saveMode = route?.params?.saveMode || false;
  const fileToSave = route?.params?.fileToSave || null;
  const [folders, setFolders] = useState(() => getLibraryState().folders);
  const [filesByFolder, setFilesByFolder] = useState(() => getLibraryState().filesByFolder);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const normalizeSavedFile = (file) => {
    if (!file) return null;
    const sourceId = file.sourceId ?? file.id ?? Date.now() + Math.random();
    const rawType = (file.type || '').toString().toLowerCase();
    const displayType = rawType === 'mp4'
      ? 'MP4'
      : rawType === 'xlsx'
        ? 'XLSX'
        : rawType === 'jpg' || rawType === 'png'
          ? 'Image'
          : rawType === 'pdf'
            ? 'PDF'
            : rawType === 'doc'
              ? 'DOC'
              : (file.type || 'FILE').toString().toUpperCase();
    return { ...file, sourceId, type: displayType, isNew: true, savedAt: Date.now() };
  };

  const handleFolderPress = (folder) => {
    if (saveMode && fileToSave) {
      const normalized = normalizeSavedFile(fileToSave);
      if (!normalized) return;
      const existing = filesByFolder[folder.id] || [];
      const savedFile = { ...normalized, id: Date.now() + Math.random() };
      const updated = { ...filesByFolder, [folder.id]: [...existing, savedFile] };
      setFilesByFolder(updated);
      setLibraryFilesByFolder(updated);
      navigation.navigate('FolderContentsRN', { folderId: folder.id, folderName: folder.name });
      return;
    }
    navigation.navigate('FolderContentsRN', { folderId: folder.id, folderName: folder.name });
  };

  const addFolder = () => {
    if (!name.trim()) return;
    const newFolder = { id: Date.now(), name: name.trim(), color: '#cbd5e1' };
    setFolders((prev) => {
      const next = [...prev, newFolder];
      setLibraryFolders(next);
      return next;
    });
    setFilesByFolder((prev) => {
      const next = { ...prev, [newFolder.id]: [] };
      setLibraryFilesByFolder(next);
      return next;
    });
    setName('');
    setShowCreate(false);
  };

  const deleteFolder = (id) => {
    playTrashFeedback();
    setFolders((prev) => {
      const next = prev.filter((f) => f.id !== id);
      setLibraryFolders(next);
      return next;
    });
    const copy = { ...filesByFolder };
    delete copy[id];
    setFilesByFolder(copy);
    setLibraryFilesByFolder(copy);
  };

  const renderItem = ({ item }) => {
    const count = filesByFolder[item.id]?.length || 0;
    return (
      <TouchableOpacity style={styles.folderCard} onPress={() => handleFolderPress(item)}>
        <View style={[styles.folderIconWrap, { backgroundColor: item.color || '#e5e7eb' }]}>
          <Folder size={28} color={palette.primaryText} />
        </View>
        <Text style={styles.folderName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.folderCount}>{count} items</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteFolder(item.id)}>
          <Trash2 size={16} color={'#fff'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const goBackSmart = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('QuickModify');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBackSmart}>
          <ArrowLeft size={22} color={palette.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>{saveMode ? 'Save to Project' : 'Project Library'}</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <Button variant="ghost" size="icon">
          <Search size={20} color={palette.foreground} />
        </Button>
        <Button variant="secondary" size="md" style={styles.newFolderButton} onPress={() => setShowCreate(true)}>New Folder</Button>
      </View>

      <Animated.View style={[styles.contentArea, entryStyle]}>
        <FlatList
          data={folders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </Animated.View>

      {menuOpen && (
        <View style={styles.overlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuPanel}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('Welcome'); }}>
              <Text style={styles.menuItemText}>New Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('ProjectLibraryRN'); }}>
              <Text style={styles.menuItemText}>Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('Login'); }}>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(false)}>
              <Ionicons name="close" size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Welcome')}>
          <View style={[styles.navSquare, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('QuickModify')}>
          <View style={[styles.navCircle, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Modify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SearchResultRN')}>
          <View style={[styles.navTriangle, { borderBottomColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Result</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Folder</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Folder name"
              style={styles.input}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => { setShowCreate(false); setName(''); }}>Cancel</Button>
              <Button style={{ flex: 1, marginLeft: 8 }} onPress={addFolder}>Create</Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: { padding: 6 },
  title: { fontSize: 20, fontWeight: '600', color: '#111827' },
  menuButton: { padding: 6 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  newFolderButton: {
    paddingHorizontal: 22,
    paddingVertical: 6,
  },
  contentArea: { flex: 1 },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  folderCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  folderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  folderName: { fontSize: 14, fontWeight: '700', color: palette.foreground },
  folderCount: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: palette.foreground, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', alignItems: 'center' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  navItem: { alignItems: 'center', gap: 6 },
  navLabel: { fontSize: 11, color: '#6B7280' },
  navSquare: { width: 20, height: 20, borderRadius: 3 },
  navCircle: { width: 20, height: 20, borderRadius: 10 },
  navTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#9CA3AF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
    paddingTop: 70,
    paddingRight: 12,
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.12)' },
  menuPanel: {
    width: 220,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  menuItemText: { fontSize: 18, color: '#111827', fontWeight: '600' },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
