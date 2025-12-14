// src/screens/WelcomeScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let BlurViewComponent = View;
try {
  // Optional blur if expo-blur is available; falls back to plain View
  BlurViewComponent = require('expo-blur').BlurView; // eslint-disable-line global-require
} catch (e) {
  BlurViewComponent = View;
}

export default function WelcomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keywords, setKeywords] = useState('');

  const openFilePicker = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const url = URL.createObjectURL(f);
          navigation.navigate('Input', {
            pickedFile: {
              uri: url,
              name: f.name,
              mimeType: f.type,
              size: f.size,
              id: Date.now() + Math.random(),
              _file: f,
            },
          });
        };
        input.click();
        return;
      }

      // Native path: load expo-document-picker at runtime
      // (use require so bundler doesn't error when package is missing)
      // eslint-disable-next-line global-require
      const DocumentPicker = require('expo-document-picker');
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.type === 'success') {
        navigation.navigate('Input', {
          pickedFile: {
            uri: res.uri,
            name: res.name || res.uri.split('/').pop(),
            mimeType: res.mimeType || (res.name && res.name.split('.').pop()),
            size: res.size || 0,
            id: Date.now() + Math.random(),
          },
        });
      }
    } catch (err) {
      console.warn('file pick error', err);
    }
  };

  const handleNav = (screen) => {
    setMenuOpen(false);
    if (screen) navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerBar}>
        <View style={styles.headerSpacer} />
        <Text style={styles.startTitle}>Start</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainArea}>
        <View style={styles.screenPadding}>
          {/* Scrollable content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Card grid with square, circle, triangle */}
            <View style={styles.cardGrid}>
              {/* Left card tilted */}
              <View style={[styles.card, { backgroundColor: '#D1D5DB', transform: [{ rotate: '-15deg' }] }]}>
                <Text style={styles.cardText}>Picture 1</Text>
              </View>
              {/* Center card */}
              <View style={[styles.card, { backgroundColor: '#D1D5DB' }]}>
                <Text style={styles.cardText}>Picture 2</Text>
              </View>
              {/* Right card tilted */}
              <View style={[styles.card, { backgroundColor: '#D1D5DB', transform: [{ rotate: '15deg' }] }]}>
                <Text style={styles.cardText}>Picture 3</Text>
              </View>
            </View>

            {/* Input field */}
            <TextInput
              style={styles.inputBox}
              placeholder="keywords, #, explanation"
              placeholderTextColor="#9CA3AF"
              value={keywords}
              onChangeText={setKeywords}
            />

            {/* Action buttons */}
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Record')}>
              <Text style={styles.actionButtonText}>Record your voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Draw')}>
              <Text style={styles.actionButtonText}>Draw</Text>
            </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openFilePicker}>
            <Text style={styles.actionButtonText}>Upload your Files</Text>
          </TouchableOpacity>

            <Text style={styles.fileHint}>MP4, PDF, DOC, XLSX</Text>

            {/* Reset button */}
            <TouchableOpacity style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset search</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {menuOpen && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <BlurViewComponent style={styles.menuPanel} tint="light" intensity={30}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Welcome')}>
                <Text style={styles.menuItemText}>New Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('ProjectLibraryRN')}>
                <Text style={styles.menuItemText}>Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Login')}>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </BlurViewComponent>
          </View>
        )}
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Welcome')}>
          <View style={[styles.navSquare, { backgroundColor: '#8B5CF6' }]} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eef2ff' },
  mainArea: { flex: 1, position: 'relative' },
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
  headerSpacer: { width: 32 },
  screenPadding: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  startTitle: { fontSize: 20, fontWeight: '600', color: '#111827' },
  menuButton: { padding: 6 },
  content: { flex: 1 },
  scrollContent: { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  cardGrid: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 20, width: '100%' },
  card: { width: 80, height: 100, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardText: { color: '#6B7280', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    width: '100%',
    fontSize: 14,
    color: '#111827',
  },
  actionButton: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingVertical: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', width: '100%' },
  actionButtonText: { color: '#4B5563', fontSize: 14, fontWeight: '500' },
  fileHint: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 20 },
  resetButton: { backgroundColor: '#4B5563', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 24, width: '100%' },
  resetButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  navItem: { alignItems: 'center', gap: 6 },
  navLabel: { fontSize: 11, color: '#6B7280' },
  navSquare: { width: 20, height: 20, borderRadius: 3 },
  navCircle: { width: 20, height: 20, borderRadius: 10 },
  navTriangle: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 18, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#9CA3AF' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', alignItems: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  menuPanel: {
    width: 220,
    height: '100%',
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: { paddingVertical: 14, marginTop: 10 },
  menuItemText: { fontSize: 18, color: '#111827', textDecorationLine: 'underline' },
});
