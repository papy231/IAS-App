import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';

export default function SearchResultScreen({ navigation }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 18 });
  const results = [
    { id: 1, title: 'Result 1', description: 'Matching your search criteria' },
    { id: 2, title: 'Result 2', description: 'Highly relevant content' },
    { id: 3, title: 'Result 3', description: 'Additional information' },
    { id: 4, title: 'Result 4', description: 'Related content' },
    { id: 5, title: 'Result 5', description: 'More suggestions' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView style={[styles.screenPadding, entryStyle]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>Search Results</Text>
          <View style={styles.headerSpacer} />
        </View>

        {results.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.resultCard}
            onPress={() => {
              // Ergebnis-Auswahl behandeln
            }}
          >
            <View style={styles.resultIcon}>
              <Ionicons name="document-outline" size={32} color="#8B5CF6" />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Input')}
        >
          <Text style={styles.primaryButtonText}>Add More Content</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 14,
    marginBottom: 24,
  },
  backButton: { padding: 6 },
  headerSpacer: { width: 32 },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#4B5563',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
