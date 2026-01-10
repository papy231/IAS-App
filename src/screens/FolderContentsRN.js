import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Menu, Search, FolderOpen, ArrowLeft, Image as ImageIcon, FileVideo, FileText } from 'lucide-react-native';
import { folderFiles } from '../data/libraryData';
import { palette } from '../theme/colors';
import Button from '../components/Button';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

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
  const files = folderFiles[folderId] || [];

  const renderItem = ({ item }) => {
    const IconComp = typeIcon[item.type] || FileText;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SavedFileDetailRN', { file: item, folderName })}>
        <View style={styles.cardIcon}>
          <IconComp size={28} color={palette.foreground} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.label || item.name}</Text>
        <Text style={styles.cardType}>{item.type}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={palette.foreground} />
        </Button>
        <Text style={styles.title}>{folderName}</Text>
        <View style={styles.headerActions}>
          <Menu size={20} color={palette.foreground} />
          <View style={{ width: 12 }} />
          <Search size={20} color={palette.foreground} />
        </View>
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
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: palette.foreground },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 8, color: '#6b7280' },
});
