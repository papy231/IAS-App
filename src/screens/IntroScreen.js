import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

export default function IntroScreen({ navigation }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 26, duration: 520 });

  const handleStart = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.bgBlobLarge} />
      <View style={styles.bgBlobSmall} />
      <Animated.View style={[styles.container, entryStyle]}>
        <View style={styles.heroOrb}>
          <View style={styles.heroIconWrap}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 5.5C4 4.12 5.12 3 6.5 3h4.75c.4 0 .75.34.75.75V18c0-.55-.45-1-1-1H6.5A2.5 2.5 0 0 0 4 19.5v-14Z"
                fill="#0b1224"
                opacity={0.82}
              />
              <Path
                d="M20 5.5C20 4.12 18.88 3 17.5 3h-4.75c-.4 0-.75.34-.75.75V18c0-.55.45-1 1-1h3.5A2.5 2.5 0 0 1 20 19.5v-14Z"
                fill="#0b1224"
                opacity={0.78}
              />
              <Path
                d="M12.75 6.25c0-.41-.34-.75-.75-.75H7c-.83 0-1.5.67-1.5 1.5v8.5c.34-.2.73-.33 1.15-.33h4.1c.53 0 1.05.15 1.5.41V6.25Z"
                fill="#cbd5e1"
              />
              <Path
                d="M11.25 6.25c0-.41.34-.75.75-.75H17c.83 0 1.5.67 1.5 1.5v8.5c-.34-.2-.73-.33-1.15-.33h-4.1a2.9 2.9 0 0 0-1.5.41V6.25Z"
                fill="#e2e8f0"
              />
              <Path d="M8.5 8.25h2.25" stroke="#0f172a" strokeWidth={0.9} strokeLinecap="round" />
              <Path d="M8.5 10.25h2.25" stroke="#0f172a" strokeWidth={0.9} strokeLinecap="round" />
              <Path d="M13.25 8.25H15.5" stroke="#0f172a" strokeWidth={0.9} strokeLinecap="round" />
              <Path d="M13.25 10.25H15.5" stroke="#0f172a" strokeWidth={0.9} strokeLinecap="round" />
            </Svg>
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.kicker}>Welcome to</Text>
          <Text style={styles.title}>InspoSearch</Text>
          <Text style={styles.subtitle}>Search, publish, und inspire yourself.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
            <Text style={styles.primaryText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1224' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  bgBlobLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    top: -80,
    left: -60,
    transform: [{ rotate: '-8deg' }],
  },
  bgBlobSmall: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    bottom: -60,
    right: -20,
    transform: [{ rotate: '12deg' }],
  },
  heroOrb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  heroRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.28)',
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  heroImage: { width: '100%', height: '100%', borderRadius: 36 },
  textBlock: { marginTop: 32, alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  kicker: { color: '#cbd5e1', fontSize: 16, letterSpacing: 1 },
  title: { color: '#f8fafc', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#a5b4c5', fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: 6 },
  actions: { width: '100%', marginTop: 40 },
  primaryBtn: {
    backgroundColor: '#9bdcf5',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryText: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  secondaryText: { color: '#e2e8f0', fontSize: 15, fontWeight: '700' },
});
