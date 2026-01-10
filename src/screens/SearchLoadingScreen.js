import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

export default function SearchLoadingScreen({ navigation }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 14, duration: 360 });
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SearchResultRN');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, entryStyle]}>
      <Ionicons name="globe-outline" size={80} color="#8B5CF6" />
      <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      <Text style={styles.text}>Searching...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
});