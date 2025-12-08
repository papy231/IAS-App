import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';

export default function QuickModifyScreen({ navigation }) {
  const [allowAI, setAllowAI] = useState(true);

  const Hamburger = () => (
    <View style={styles.hamburger}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </View>
  );

  const Checkbox = ({ checked }) => (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkboxTick}>✓</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.screenPadding}>
        <View style={styles.headerRow}>
          <Hamburger />
          <Text style={styles.quickModifyTitle}>Quick Modify</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <View style={styles.listRow}>
            <Checkbox checked />
            <Text style={styles.listText}>4 Pictures</Text>
          </View>
          <View style={styles.listRow}>
            <Checkbox checked />
            <Text style={styles.listText}>5 Recordings</Text>
          </View>
          <View style={styles.listRow}>
            <Checkbox checked />
            <Text style={styles.listText}>1 Drawing</Text>
          </View>
          <View style={styles.listRow}>
            <Checkbox checked />
            <Text style={styles.listText}>7 Videos</Text>
          </View>
          <View style={styles.listRow}>
            <Checkbox checked />
            <Text style={styles.listText}>2 Texts</Text>
          </View>

          <View style={[styles.listRow, { marginTop: 24 }]}>
            <Text style={[styles.listText, { flex: 1 }]}>Allow AI content</Text>
            <Switch
              value={allowAI}
              onValueChange={setAllowAI}
              thumbColor={allowAI ? '#FFFFFF' : '#F9FAFB'}
              trackColor={{ false: '#E5E7EB', true: '#4B5563' }}
            />
          </View>

          <View style={[styles.fakeInput, { marginTop: 16 }]}>
            <Text style={styles.fakeInputText}>Filter: Text, #, Style…</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 26 }]}
            onPress={() => navigation.navigate('SearchLoading')}
          >
            <Text style={styles.primaryButtonText}>Confirm</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.roundBackButton}
              onPress={() => navigation.navigate('Input')}
            >
              <Text style={styles.backArrowText}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButtonSmall}>
              <Text style={styles.secondaryButtonSmallText}>
                Load more Input
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenPadding: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  hamburger: {
    width: 30,
    marginTop: 4,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#4B5563',
    borderRadius: 999,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickModifyTitle: {
    fontSize: 22,
    color: '#111827',
    marginLeft: 40,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  listText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  checkboxChecked: {
    backgroundColor: '#E5E7EB',
  },
  checkboxTick: {
    fontSize: 18,
    color: '#4B5563',
  },
  fakeInput: {
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fakeInputText: {
    fontSize: 13,
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#4B5563',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    justifyContent: 'space-between',
  },
  roundBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrowText: {
    fontSize: 26,
    color: '#4B5563',
    marginTop: -3,
  },
  secondaryButtonSmall: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonSmallText: {
    fontSize: 13,
    color: '#4B5563',
  },
});
