import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { Menu, Search, Folder, FolderPlus, Trash2, ArrowLeft } from 'lucide-react-native';
import { folders as defaultFolders, folderFiles as defaultFolderFiles } from '../data/libraryData';
import { palette } from '../theme/colors';
import Button from '../components/Button';

export default function ProjectLibraryRN({ navigation, route }) {
  const saveMode = route?.params?.saveMode || false;
  const [folders, setFolders] = useState(defaultFolders);
  const [filesByFolder, setFilesByFolder] = useState(defaultFolderFiles);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const addFolder = () => {
    if (!name.trim()) return;
    const newFolder = { id: Date.now(), name: name.trim(), color: '#cbd5e1' };
    setFolders((prev) => [...prev, newFolder]);
    setFilesByFolder((prev) => ({ ...prev, [newFolder.id]: [] }));
    setName('');
    setShowCreate(false);
  };

  const deleteFolder = (id) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    const copy = { ...filesByFolder };
    delete copy[id];
    setFilesByFolder(copy);
  };

  const renderItem = ({ item }) => {
    const count = filesByFolder[item.id]?.length || 0;
    return (
      <TouchableOpacity style={styles.folderCard} onPress={() => navigation.navigate('FolderContentsRN', { folderId: item.id, folderName: item.name })}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={palette.foreground} />
        </Button>
        <Text style={styles.title}>{saveMode ? 'Save to Project' : 'Project Library'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.actionsRow}>
        <Button variant="ghost" size="icon" onPress={() => navigation.navigate('SideMenu') /* placeholder */}>
          <Menu size={20} color={palette.foreground} />
        </Button>
        <Button variant="ghost" size="icon">
          <Search size={20} color={palette.foreground} />
        </Button>
        <Button variant="secondary" size="md" onPress={() => setShowCreate(true)}>New Folder</Button>
      </View>

      <FlatList
        data={folders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
      />

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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: '700', color: palette.foreground },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
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
});
