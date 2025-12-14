import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileVideo, Image as ImageIcon, FileText, File } from 'lucide-react-native';
import { fileResults } from '../data/libraryData';
import { palette } from '../theme/colors';

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
  doc: FileText,
};

export default function SearchResultRN({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderItem = ({ item, index }) => {
    const IconComp = iconMap[item.type] || File;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('FileDetailRN', { index })}>
        <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
          <IconComp size={28} color={palette.foreground} strokeWidth={2} />
        </View>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Search Result</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainArea}>
        <FlatList
          data={fileResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.list}
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
          <View style={[styles.navTriangle, { borderBottomColor: '#8B5CF6' }]} />
          <Text style={styles.navLabel}>Result</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  mainArea: { flex: 1, position: 'relative' },
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
  title: { fontSize: 20, fontWeight: '600', color: palette.foreground },
  headerSpacer: { width: 32 },
  menuButton: { padding: 6 },
  list: { paddingHorizontal: 12, paddingBottom: 24, paddingTop: 6 },
  card: {
    flex: 1,
    margin: 6,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  type: { fontSize: 12, fontWeight: '700', color: palette.foreground, marginTop: 6 },
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
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
