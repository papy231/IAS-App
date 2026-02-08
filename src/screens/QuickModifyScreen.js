import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { getDrawCount, getRecordCount, getUploadCount, setHasSearched } from '../data/searchState';

let BlurViewComponent = View;
try {
  // Optionaler Blur, falls expo-blur verfügbar ist; fällt sonst auf eine einfache View zurück
  BlurViewComponent = require('expo-blur').BlurView; // eslint-disable-line global-require
} catch (e) {
  BlurViewComponent = View;
}

export default function QuickModifyScreen({ navigation, route }) {
  const currentRoute = route?.name || 'QuickModify';
  const { style: entryStyle } = useEntryAnimation({ offset: 18 });
  const [filter, setFilter] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [checklistItems, setChecklistItems] = useState([
    { id: 'recordings', label: 'Recordings', count: getRecordCount() },
    { id: 'drawing', label: 'Drawing', count: getDrawCount() },
    { id: 'files', label: 'Files', count: getUploadCount() },
  ]);
  const [selectedMap, setSelectedMap] = useState(() =>
    checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: item.count >= 1 }), {}),
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const nextItems = [
        { id: 'recordings', label: 'Recordings', count: getRecordCount() },
        { id: 'drawing', label: 'Drawing', count: getDrawCount() },
        { id: 'files', label: 'Files', count: getUploadCount() },
      ];
      setChecklistItems(nextItems);
      setSelectedMap((prev) => ({
        ...prev,
        ...nextItems.reduce((acc, item) => ({ ...acc, [item.id]: item.count >= 1 }), {}),
      }));
    });
    return unsubscribe;
  }, [navigation]);

  const toggleItem = (id) => {
    setSelectedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleAiToggle = (next) => {
    if (next) {
      setAiEnabled(true);
      setShowAiInfo(true);
    } else {
      setAiEnabled(false);
      setShowAiInfo(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.headerBar}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Quick Modify</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.mainArea, entryStyle]}>
        <View style={styles.screenPadding}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.checklist}>
              {checklistItems.map((item) => {
                const isChecked = !!selectedMap[item.id];
                return (
                  <TouchableOpacity key={item.id} style={styles.checkRow} onPress={() => toggleItem(item.id)}>
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkText}>{`${item.count} ${item.label}`}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.inputBox}
              color="FFFFFF"
              placeholder="Filter: Text, #, Style..."
              placeholderTextColor="#9CA3AF"
              value={filter}
              onChangeText={setFilter}
            />

            <TouchableOpacity style={styles.inputButton} onPress={() => navigation.navigate('InputOverview')}>
              <Text style={styles.inputButtonText}>Input Files</Text>
            </TouchableOpacity>
            <Text style={styles.inputTooltip}>Prioritise and delete your input files.</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Allow AI content</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleAiToggle(!aiEnabled)}
                style={[styles.switchTrack, aiEnabled && styles.switchTrackOn]}
              >
                <View style={[styles.switchThumb, aiEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                setHasSearched(true);
                navigation.navigate('SearchLoading');
              }}
            >
              <Text style={styles.primaryButtonText}>Start Searching</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {menuOpen && (
          <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <BlurViewComponent style={styles.menuPanel} tint="light" intensity={30}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setHasSearched(false);
                    setMenuOpen(false);
                    navigation.navigate('Welcome');
                  }}
                >
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
      </Animated.View>

      <Modal
        visible={showAiInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAiInfo(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalText}>
              AI content may add related inspiration beyond your inputs.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setAiEnabled(false);
                  setShowAiInfo(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalOk]}
                onPress={() => setShowAiInfo(false)}
              >
                <Text style={styles.modalOkText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Welcome')}>
          <View
            style={[
              styles.navSquare,
              { backgroundColor: currentRoute === 'Welcome' ? '#8B5CF6' : '#9CA3AF' },
            ]}
          />
          <Text style={styles.navLabel}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('QuickModify')}>
          <View
            style={[
              styles.navCircle,
              { backgroundColor: currentRoute === 'QuickModify' ? '#8B5CF6' : '#9CA3AF' },
            ]}
          />
          <Text style={styles.navLabel}>Modify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SearchResultRN')}>
          <View
            style={[
              styles.navTriangle,
              { borderBottomColor: currentRoute === 'SearchResultRN' ? '#2563EB' : '#9CA3AF' },
            ]}
          />
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
  headerSpacer: { width: 32 },
  mainArea: { flex: 1, position: 'relative' },
  screenPadding: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 20, fontWeight: '600', color: '#111827' },
  menuButton: { padding: 6 },
  scrollContent: { paddingBottom: 28 },
  checklist: { gap: 16, marginBottom: 24 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  checkboxActive: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
  },
  checkText: { fontSize: 16, color: '#4B5563' },
  filterInput: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 18,
  },
  inputButton: {
    backgroundColor: '#6B7280',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  inputButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  inputTooltip: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: -10, marginBottom: 16 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  switchLabel: { fontSize: 14, color: '#6B7280' },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D1D5DB',
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackOn: { backgroundColor: '#8B5CF6' },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  switchThumbOn: { transform: [{ translateX: 20 }] },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalText: { fontSize: 14, color: '#111827', lineHeight: 20, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  modalCancel: { backgroundColor: '#F3F4F6' },
  modalOk: { backgroundColor: '#111827' },
  modalCancelText: { color: '#111827', fontWeight: '600' },
  modalOkText: { color: '#FFFFFF', fontWeight: '600' },
});
