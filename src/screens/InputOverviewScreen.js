import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileVideo, Image as ImageIcon, FileText, File } from 'lucide-react-native';

let BlurViewComponent = View;
try {
  // Optional blur if expo-blur is available; falls back to plain View
  BlurViewComponent = require('expo-blur').BlurView; // eslint-disable-line global-require
} catch (e) {
  BlurViewComponent = View;
}

const iconMap = {
  mp4: FileVideo,
  jpg: ImageIcon,
  png: ImageIcon,
  pdf: FileText,
  xlsx: FileText,
};

const initialFiles = [
  { id: 'f1', type: 'pdf' },
  { id: 'f2', type: 'jpg' },
  { id: 'f3', type: 'xlsx' },
  { id: 'f4', type: 'pdf' },
  { id: 'f5', type: 'jpg' },
  { id: 'f6', type: 'xlsx' },
  { id: 'f7', type: 'xlsx' },
  { id: 'f8', type: 'pdf' },
  { id: 'f9', type: 'xlsx' },
  { id: 'f10', type: 'mp4' },
];

export default function InputOverviewScreen({ navigation, route }) {
  const currentRoute = route?.name || 'InputOverview';
  const [menuOpen, setMenuOpen] = useState(false);
  const [files, setFiles] = useState(initialFiles);

  const removeItem = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const renderItem = ({ item }) => {
    const IconComp = iconMap[item.type] || File;
    return (
      <View style={styles.listItem}>
        <View style={styles.iconWrap}>
          <IconComp size={28} color="#111827" strokeWidth={2.2} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.fileName}>{`File ${item.id.toUpperCase()}`}</Text>
          <Text style={styles.fileType}>{item.type.toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => removeItem(item.id)}>
          <Ionicons name="remove-circle" size={22} color="#111827" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('QuickModify')}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Input File Overview</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainArea}>
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />

        {menuOpen && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <BlurViewComponent style={styles.menuPanel} tint="light" intensity={30}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('Welcome'); }}>
                  <Text style={styles.menuItemText}>New Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('ProjectLibraryRN'); }}>
                  <Text style={styles.menuItemText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); navigation.navigate('Login'); }}>
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
            </BlurViewComponent>
          </View>
        )}
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Welcome')}>
          <View style={[styles.navSquare, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('QuickModify')}>
          <View style={[styles.navCircle, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.navLabel}>Modify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SearchResultRN')}>
          <View style={[styles.navTriangle, { borderBottomColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Result</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eef2ff' },
  headerBar: {
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
  mainArea: { flex: 1, position: 'relative', paddingHorizontal: 16, paddingTop: 12 },
  list: { paddingTop: 12, paddingBottom: 24 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meta: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  fileType: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 2 },
  deleteBtn: { padding: 6 },
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
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  menuPanel: {
    width: 220,
    flex: 1,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  closeBtn: {
    marginTop: 'auto',
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  menuItemText: { fontSize: 18, color: '#111827', fontWeight: '600' },
});
