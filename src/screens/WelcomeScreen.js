import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Platform, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

let BlurViewComponent = View;
try {
  // Optionaler Blur, falls expo-blur verfügbar ist; ansonsten einfache View
  BlurViewComponent = require('expo-blur').BlurView; // eslint-disable-line global-require
} catch (e) {
  BlurViewComponent = View;
}

export default function WelcomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const cardAnimations = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const { style: screenEntryStyle } = useEntryAnimation({ offset: 12, duration: 360 });

  const withFeedback = (fn) => (...args) => {
    if (fn) fn(...args);
  };

  useEffect(() => {
    Animated.stagger(
      120,
      cardAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [cardAnimations]);

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

      // Native-Pfad: expo-document-picker zur Laufzeit laden
      // (per require, damit der Bundler nicht fehlschlägt, falls das Paket fehlt)
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
        <TouchableOpacity style={styles.menuButton} onPress={withFeedback(() => setMenuOpen((prev) => !prev))}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.mainArea, screenEntryStyle]}>
        <View style={styles.screenPadding}>
          {/* Scrollbarer Inhalt */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Kartenraster mit Feature-Bildern */}
            <View style={styles.cardGrid}>
              <Animated.View style={[styles.card, styles.cardTiltLeft, styles.cardAnim, {
                opacity: cardAnimations[0],
                transform: [
                  { translateY: cardAnimations[0].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: cardAnimations[0].interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  { rotate: '-12deg' },
                ],
              }]}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1192333/pexels-photo-1192333.jpeg?auto=compress&cs=tinysrgb&w=400&h=520&dpr=1' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardImageOverlay} />
                <Text style={styles.cardText}>Search</Text>
              </Animated.View>
              <Animated.View style={[styles.card, styles.cardAnim, {
                opacity: cardAnimations[1],
                transform: [
                  { translateY: cardAnimations[1].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: cardAnimations[1].interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                ],
              }]}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/2228579/pexels-photo-2228579.jpeg?auto=compress&cs=tinysrgb&w=400&h=520&dpr=1' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardImageOverlay} />
                <Text style={styles.cardText}>Publish</Text>
              </Animated.View>
              <Animated.View style={[styles.card, styles.cardTiltRight, styles.cardAnim, {
                opacity: cardAnimations[2],
                transform: [
                  { translateY: cardAnimations[2].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: cardAnimations[2].interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  { rotate: '12deg' },
                ],
              }]}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/542619/pexels-photo-542619.jpeg?auto=compress&cs=tinysrgb&w=400&h=520&dpr=1' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardImageOverlay} />
                <Text style={styles.cardText}>Inspire</Text>
              </Animated.View>
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
            <TouchableOpacity style={styles.actionButton} onPress={withFeedback(() => navigation.navigate('Record'))}>
              <Text style={styles.actionButtonText}>Record your voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={withFeedback(() => navigation.navigate('Draw'))}>
              <Text style={styles.actionButtonText}>Draw</Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={withFeedback(async () => {
              try {
                const picker = await import('expo-document-picker');
                const result = await picker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
                if (result && result.type !== 'cancel') {
                  navigation.navigate('Welcome');
                }
              } catch (e) {
                console.warn('file-pick-error', e);
              }
            })}
          >
            <Text style={styles.actionButtonText}>Upload your Files</Text>
          </TouchableOpacity>

            <Text style={styles.fileHint}>MP4, PDF, DOC, XLSX</Text>

            {/* Reset button */}
            <TouchableOpacity style={styles.resetButton} onPress={withFeedback(() => {})}>
              <Text style={styles.resetButtonText}>Reset search</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {menuOpen && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={withFeedback(() => setMenuOpen(false))} />
            <BlurViewComponent style={styles.menuPanel} tint="light" intensity={30}>
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={withFeedback(() => handleNav('Welcome'))}>
                  <Text style={styles.menuItemText}>New Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={withFeedback(() => handleNav('ProjectLibraryRN'))}>
                  <Text style={styles.menuItemText}>Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={withFeedback(() => handleNav('Login'))}>
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={withFeedback(() => setMenuOpen(false))}>
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
            </BlurViewComponent>
          </View>
        )}
      </Animated.View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={withFeedback(() => navigation.navigate('Welcome'))}>
          <View style={[styles.navSquare, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.navLabel}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={withFeedback(() => navigation.navigate('QuickModify'))}>
          <View style={[styles.navCircle, { backgroundColor: '#9CA3AF' }]} />
          <Text style={styles.navLabel}>Modify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={withFeedback(() => navigation.navigate('SearchResultRN'))}>
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
  card: { width: 110, height: 150, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#D1D5DB' },
  cardTiltLeft: {},
  cardTiltRight: {},
  cardAnim: { shadowColor: '#0f172a', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  cardImage: { position: 'absolute', width: '125%', height: '125%' },
  cardImageOverlay: { position: 'absolute', width: '125%', height: '125%', backgroundColor: 'rgba(0,0,0,0.28)' },
  cardText: { color: '#F9FAFB', fontSize: 14, fontWeight: '800', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
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
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  menuItems: { flex: 1, justifyContent: 'flex-end', gap: 12 },
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
