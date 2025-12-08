// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.screenPadding}>
        <View style={styles.hamburger}>
          <View style={styles.hLine} />
          <View style={styles.hLine} />
          <View style={styles.hLine} />
        </View>

        <View style={[styles.centerScreen, { justifyContent: 'center' }]}>
          <Text style={styles.welcomeTitle}>Welcome</Text>

          <View style={styles.avatarCircleSmall}>
            <Ionicons name="person" size={36} color="#8B5CF6" />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Input')}
          >
            <Text style={styles.primaryButtonText}>Let’s Start Boosting Inspiration</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  screenPadding: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  hamburger: { width: 30, marginTop: 4, marginBottom: 12 },
  hLine: { height: 3, backgroundColor: '#4B5563', borderRadius: 999, marginBottom: 4 },
  centerScreen: { flex: 1, alignItems: 'center' },
  welcomeTitle: { fontSize: 24, color: '#4B5563', marginBottom: 20 },
  avatarCircleSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#4B5563',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
