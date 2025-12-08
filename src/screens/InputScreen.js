import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
// Optional native/web packages (expo-document-picker, expo-file-system, expo-av, react-native-webview)
// are required only on native devices. To avoid bundler errors when those packages
// are not installed (common in web-only dev), we load them dynamically where needed
// and provide web fallbacks.
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function InputScreen({ navigation, route }) {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null); // { uri, type, name }
  const [uploadingMap, setUploadingMap] = useState({});
  const [previewText, setPreviewText] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const videoRef = useRef(null);

  const Hamburger = () => (
    <View style={styles.hamburger}>
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
      <View style={styles.hamburgerLine} />
    </View>
  );

  async function pickFiles() {
    try {
      if (Platform.OS === 'web') {
        // Web fallback: create a hidden file input and use it to pick a file
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const url = URL.createObjectURL(f);
          const item = {
            uri: url,
            name: f.name,
            mimeType: f.type,
            size: f.size,
            id: Date.now() + Math.random(),
            _file: f,
          };
          setFiles((p) => [item, ...p]);
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
        const item = {
          uri: res.uri,
          name: res.name || res.uri.split('/').pop(),
          mimeType: res.mimeType || (res.name && res.name.split('.').pop()),
          size: res.size || 0,
          id: Date.now() + Math.random(),
        };
        setFiles((p) => [item, ...p]);
      }
    } catch (err) {
      console.warn('pick err', err);
    }
  }

  function previewFile(file) {
    setPreview(file);
  }

  function closePreview() {
    setPreview(null);
    setPreviewText(null);
    setPreviewLoading(false);
  }

  async function openExternally(file) {
    if (!file) return;
    if (Platform.OS === 'web') {
      window.open(file.uri, '_blank');
      return;
    }
    try {
      await Linking.openURL(file.uri);
    } catch (e) {
      console.warn('open error', e);
    }
  }

  // Accept drawing result from DrawScreen when navigating back
  useEffect(() => {
    if (route?.params?.drawingData) {
      const data = route.params.drawingData;
      const item = {
        uri: data,
        name: `drawing-${Date.now()}.png`,
        mimeType: 'image/png',
        size: 0,
        id: Date.now() + Math.random(),
      };
      setFiles((p) => [item, ...p]);
      // clear param so repeated navigation doesn't duplicate
      navigation.setParams({ drawingData: undefined });
    }
  }, [route?.params?.drawingData]);

  useEffect(() => {
    // load text content for text files when preview opens
    let mounted = true;
    async function loadText() {
      if (!preview) return;
      const name = preview.name || '';
      if (name.match(/\.(txt|md|json|csv|xml)$/i)) {
        try {
          setPreviewLoading(true);
          if (Platform.OS === 'web' && preview._file) {
            // For files selected on web (created via input), read with FileReader
            const fr = new FileReader();
            fr.onload = () => {
              if (mounted) setPreviewText(fr.result);
            };
            fr.onerror = () => {
              if (mounted) setPreviewText('Unable to load file');
            };
            fr.readAsText(preview._file);
          } else if (Platform.OS === 'web') {
            // remote URL on web: fetch and read as text
            const r = await fetch(preview.uri);
            const text = await r.text();
            if (mounted) setPreviewText(text);
          } else {
            // Native: try to load expo-file-system dynamically
            // eslint-disable-next-line global-require
            const FileSystem = require('expo-file-system');
            const content = await FileSystem.readAsStringAsync(preview.uri, { encoding: FileSystem.EncodingType.UTF8 });
            if (mounted) setPreviewText(content);
          }
        } catch (e) {
          console.warn('read text err', e);
          if (mounted) setPreviewText('Unable to load file');
        } finally {
          if (mounted) setPreviewLoading(false);
        }
      }
    }
    loadText();
    return () => { mounted = false; };
  }, [preview]);

  // Simulated upload progress (frontend-only)
  function simulateUpload(file) {
    setUploadingMap((m) => ({ ...m, [file.id]: { progress: 0, status: 'uploading' } }));
    let p = 0;
    const t = setInterval(() => {
      p += Math.round(Math.random() * 20);
      if (p >= 100) {
        p = 100;
        clearInterval(t);
        setUploadingMap((m) => ({ ...m, [file.id]: { progress: 100, status: 'done' } }));
      } else {
        setUploadingMap((m) => ({ ...m, [file.id]: { progress: p, status: 'uploading' } }));
      }
    }, 400 + Math.random() * 600);
  }

  function removeFile(id) {
    setFiles((p) => p.filter((f) => f.id !== id));
    setUploadingMap((m) => {
      const nm = { ...m };
      delete nm[id];
      return nm;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.screenPadding}>
        <Hamburger />

        <View style={{ marginTop: 24 }}>
          <View style={styles.cardsRow}>
            <View style={styles.cardPlaceholder}>
              <Text style={styles.cardText}>Picture 1</Text>
            </View>
            <View style={[styles.cardPlaceholder, { marginHorizontal: 10 }]}>
              <Text style={styles.cardText}>Picture 2</Text>
            </View>
            <View style={styles.cardPlaceholder}>
              <Text style={styles.cardText}>Picture 3</Text>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <View style={styles.fakeInput}>
              <Text style={styles.fakeInputText}>keywords, #, explanation</Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('QuickModify')}>
              <Text style={styles.secondaryButtonText}>Record your voice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickFiles}>
              <Text style={styles.secondaryButtonText}>Upload your files (MP4, PDF, DOC, XLSX)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Draw')}>
              <Text style={styles.secondaryButtonText}>Draw</Text>
            </TouchableOpacity>
          </View>

          {/* Selected files grid */}
          <View style={{ marginTop: 18 }}>
            <Text style={{ marginLeft: 12, color: '#6B7280', marginBottom: 8 }}>Selected files</Text>
            {files.length === 0 ? (
              <Text style={{ color: '#9CA3AF', marginLeft: 12 }}>No files yet — tap "Upload your files" to pick.</Text>
            ) : (
              <FlatList
                data={files}
                keyExtractor={(i) => String(i.id)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item }) => {
                  const uploading = uploadingMap[item.id];
                  return (
                    <View style={styles.fileCard}>
                      {/* icon */}
                      <View style={styles.fileIconWrap}>
                        {item.name && item.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <Image source={{ uri: item.uri }} style={styles.fileThumb} />
                        ) : item.name && item.name.match(/\.(mp4|mov)$/i) ? (
                          <Ionicons name="videocam" size={36} color="#4B5563" />
                        ) : item.name && item.name.match(/\.(pdf)$/i) ? (
                          <Ionicons name="document" size={36} color="#4B5563" />
                        ) : (
                          <Ionicons name="folder" size={36} color="#4B5563" />
                        )}
                      </View>
                      <Text numberOfLines={1} style={styles.fileName}>{item.name}</Text>

                      <View style={styles.fileActionsRow}>
                        <TouchableOpacity onPress={() => previewFile(item)} style={styles.fileActionBtn}>
                          <Text style={styles.fileActionText}>Preview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => simulateUpload(item)} style={styles.fileActionBtnOutline}>
                          <Text style={styles.fileActionTextOutline}>{uploading && uploading.status === 'done' ? 'Done' : 'Upload'}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ marginTop: 6 }}>
                        {uploading ? (
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#6B7280' }}>{uploading.progress}%</Text>
                          </View>
                        ) : null}
                      </View>

                      <TouchableOpacity onPress={() => removeFile(item.id)} style={styles.removeBtn}>
                        <Ionicons name="close" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      <View style={styles.nextArrowWrapper}>
        <TouchableOpacity
          style={styles.nextArrowButton}
          onPress={() => navigation.navigate('QuickModify')}
        >
          <Text style={styles.nextArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preview modal */}
      <Modal visible={!!preview} animationType="slide" onRequestClose={closePreview}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={closePreview} style={{ padding: 8 }}>
                <Ionicons name="close" size={28} color="#111827" />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>{preview?.name}</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, marginTop: 12 }}>
              {preview && preview.name && preview.name.match(/\.(mp4|mov)$/i) ? (
                // Video: on native use expo-av if available, on web open externally
                Platform.OS === 'web' ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#6B7280', marginBottom: 12 }}>Video preview not inlined on web.</Text>
                    <TouchableOpacity onPress={() => openExternally(preview)} style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Open video</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // eslint-disable-next-line global-require
                  React.createElement(require('expo-av').Video, { ref: videoRef, source: { uri: preview.uri }, style: { flex: 1 }, useNativeControls: true, resizeMode: 'contain' })
                )
              ) : preview && preview.name && preview.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <Image source={{ uri: preview.uri }} style={{ flex: 1, resizeMode: 'contain' }} />
              ) : preview && preview.name && preview.name.match(/\.(pdf)$/i) ? (
                // PDF: on web open externally (WebView may not be installed); on native try to use react-native-webview
                Platform.OS === 'web' ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#6B7280', marginBottom: 12 }}>PDF preview not inlined on web.</Text>
                    <TouchableOpacity onPress={() => openExternally(preview)} style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Open PDF</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // eslint-disable-next-line global-require
                  React.createElement(require('react-native-webview').WebView, { source: { uri: preview.uri }, style: { flex: 1 } })
                )
              ) : preview && preview.name && preview.name.match(/\.(txt|md|json|csv|xml)$/i) ? (
                // Text-like files: show loaded text
                previewLoading ? (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#4B5563" />
                    <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading...</Text>
                  </View>
                ) : (
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                    <Text style={{ color: '#111827', fontSize: 14, lineHeight: 20 }}>{previewText}</Text>
                  </ScrollView>
                )
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#6B7280', marginBottom: 12 }}>Preview not available in-app for this type.</Text>
                  <TouchableOpacity onPress={() => openExternally(preview)} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Open file</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  cardsRow: {
    flexDirection: 'row',
    marginBottom: 26,
  },
  cardPlaceholder: {
    width: 70,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  fakeInput: {
    width: '90%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  fakeInputText: {
    fontSize: 13,
    color: '#6B7280',
  },
  secondaryButton: {
    width: '90%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  nextArrowWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 24,
  },
  nextArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrowText: {
    fontSize: 26,
    color: '#4B5563',
    marginTop: -3,
  },
  bottomSpacing: {
    height: 80,
  },
  /* Files UI */
  fileCard: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fileIconWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fileThumb: { width: 80, height: 80, borderRadius: 8 },
  fileName: { fontSize: 12, color: '#374151', width: '100%', textAlign: 'center' },
  fileActionsRow: { flexDirection: 'row', marginTop: 8 },
  fileActionBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#4B5563', borderRadius: 8, marginRight: 6 },
  fileActionText: { color: '#FFFFFF', fontSize: 12 },
  fileActionBtnOutline: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#4B5563' },
  fileActionTextOutline: { color: '#4B5563', fontSize: 12 },
  removeBtn: { position: 'absolute', top: 6, right: 6 },
  primaryButton: { backgroundColor: '#4B5563', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
