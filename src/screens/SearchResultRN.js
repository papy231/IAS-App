import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Menu, FileVideo, Image as ImageIcon, FileText, File } from 'lucide-react-native';
import { fileResults } from '../data/libraryData';
import { palette } from '../theme/colors';
import Button from '../components/Button';

const iconMap = {
  mp4: FileVideo,
  jpg: ImageIcon,
  png: ImageIcon,
  pdf: FileText,
  xlsx: FileText,
  doc: FileText,
};

export default function SearchResultRN({ navigation }) {
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
        <Button variant="ghost" size="icon" onPress={() => navigation.goBack()}>
          <Menu size={22} color={palette.foreground} />
        </Button>
        <Text style={styles.title}>Search Result</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={fileResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2ff' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: { fontSize: 18, fontWeight: '600', color: palette.foreground },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
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
});
