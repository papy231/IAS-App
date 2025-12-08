import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchLoadingScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('SearchResult');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="globe-outline" size={80} color="#8B5CF6" />
      <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      <Text style={styles.text}>Searching...</Text>
    </View>
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