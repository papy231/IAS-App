import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

function WebInlineCanvas({ navigation }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const historyRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '60vh';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    function resize() {
      const w = container.clientWidth;
      const h = Math.max(300, window.innerHeight * 0.6);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000';
      ctxRef.current = ctx;
    import React, { useRef, useEffect, useState } from 'react';
    import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

    // Web-only inline canvas with asset/emoji support, eraser, and add-picture flow.
    function WebInlineCanvas({ navigation }) {
      const containerRef = useRef(null);
      const canvasRef = useRef(null);
      const ctxRef = useRef(null);
      const drawingRef = useRef(false);
      const historyRef = useRef([]);
      const fileInputRef = useRef(null);

      const [assets, setAssets] = useState([]); // { id, src }
      const [eraser, setEraser] = useState(false);
      const [penSize, setPenSize] = useState(6);

      useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // create canvas element
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '60vh';
        canvas.style.border = '1px solid #111';
        canvas.style.background = '#fff';
        container.appendChild(canvas);
        canvasRef.current = canvas;

        function resize() {
          const w = container.clientWidth;
          const h = Math.max(300, window.innerHeight * 0.55);
          const ratio = window.devicePixelRatio || 1;
          canvas.width = Math.floor(w * ratio);
          canvas.height = Math.floor(h * ratio);
          canvas.style.width = w + 'px';
          canvas.style.height = h + 'px';
          const ctx = canvas.getContext('2d');
          ctx.scale(ratio, ratio);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = penSize;
          ctx.strokeStyle = '#000';
          ctxRef.current = ctx;
        }

        resize();
        window.addEventListener('resize', resize);

        // create hidden file input (for Add picture)
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.style.display = 'none';
        inp.addEventListener('change', (ev) => {
          const f = ev.target.files && ev.target.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            // add to assets list
            const id = Date.now().toString();
            setAssets((s) => [...s, { id, src }]);
            // draw onto canvas centered
            const img = new Image();
            img.onload = () => {
              const c = canvasRef.current;
              const ctx = ctxRef.current;
              const dw = Math.min(c.clientWidth * 0.5, img.width);
              const dh = (img.height / img.width) * dw;
              const x = (c.clientWidth - dw) / 2;
              const y = (c.clientHeight - dh) / 2;
              ctx.drawImage(img, x, y, dw, dh);
            };
            img.src = src;
          };
          reader.readAsDataURL(f);
          ev.target.value = '';
        });
        document.body.appendChild(inp);
        fileInputRef.current = inp;

        function getLocalPos(e) {
          const rect = canvas.getBoundingClientRect();
          const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
          const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
          return { x, y };
        }

        function saveSnapshot() {
          try {
            const img = ctxRef.current.getImageData(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
            historyRef.current.push(img);
            if (historyRef.current.length > 50) historyRef.current.shift();
          } catch (e) {}
        }

        function pointerDown(e) {
          drawingRef.current = true;
          const p = getLocalPos(e);
          if (!ctxRef.current) return;
          ctxRef.current.beginPath();
          ctxRef.current.moveTo(p.x, p.y);
          saveSnapshot();
          e.preventDefault();
        }

        function pointerMove(e) {
          if (!drawingRef.current || !ctxRef.current) return;
          const p = getLocalPos(e);
          if (eraser) {
            const size = penSize * 2;
            ctxRef.current.clearRect(p.x - size / 2, p.y - size / 2, size, size);
          } else {
            ctxRef.current.lineWidth = penSize;
            ctxRef.current.lineTo(p.x, p.y);
            ctxRef.current.stroke();
          }
          e.preventDefault();
        }

        function pointerUp() { drawingRef.current = false; }

        canvas.addEventListener('pointerdown', pointerDown);
        canvas.addEventListener('pointermove', pointerMove);
        window.addEventListener('pointerup', pointerUp);

        return () => {
          canvas.removeEventListener('pointerdown', pointerDown);
          canvas.removeEventListener('pointermove', pointerMove);
          window.removeEventListener('pointerup', pointerUp);
          window.removeEventListener('resize', resize);
          if (container.contains(canvas)) container.removeChild(canvas);
          if (fileInputRef.current && fileInputRef.current.parentElement) fileInputRef.current.parentElement.removeChild(fileInputRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      useEffect(() => {
        // update pen size on ctx when changed
        if (ctxRef.current) ctxRef.current.lineWidth = penSize;
      }, [penSize]);

      function undo() {
        const img = historyRef.current.pop();
        if (!img || !ctxRef.current) return;
        ctxRef.current.putImageData(img, 0, 0);
      }

      function clearCanvas() {
        if (!ctxRef.current || !canvasRef.current) return;
        try { const img = ctxRef.current.getImageData(0,0,canvasRef.current.width,canvasRef.current.height); historyRef.current.push(img); } catch(e){}
        import React, { useRef, useEffect, useState } from 'react';
        import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

        function WebInlineCanvas({ navigation }) {
          const containerRef = useRef(null);
          const canvasRef = useRef(null);
          const ctxRef = useRef(null);
          const drawingRef = useRef(false);
          const historyRef = useRef([]);
          const fileInputRef = useRef(null);

          const [assets, setAssets] = useState([]); // { id, src }
          const [eraser, setEraser] = useState(false);
          const [penSize, setPenSize] = useState(6);

          useEffect(() => {
            const container = containerRef.current;
            if (!container) return;

            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '55vh';
            canvas.style.border = '1px solid #e5e7eb';
            canvas.style.background = '#fff';
            container.appendChild(canvas);
            canvasRef.current = canvas;

            function resize() {
              const w = container.clientWidth;
              const h = Math.max(260, window.innerHeight * 0.55);
              const ratio = window.devicePixelRatio || 1;
              canvas.width = Math.floor(w * ratio);
              canvas.height = Math.floor(h * ratio);
              canvas.style.width = w + 'px';
              canvas.style.height = h + 'px';
              const ctx = canvas.getContext('2d');
              ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.lineWidth = penSize;
              ctx.strokeStyle = '#000';
              ctxRef.current = ctx;
            }

            resize();
            window.addEventListener('resize', resize);

            // hidden file input for adding images
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = 'image/*';
            inp.style.display = 'none';
            inp.addEventListener('change', (ev) => {
              const f = ev.target.files && ev.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                const src = reader.result;
                const id = Date.now().toString();
                setAssets((s) => [...s, { id, src }]);
                // draw onto canvas centered
                const img = new Image();
                img.onload = () => {
                  const c = canvasRef.current;
                  const ctx = ctxRef.current;
                  const dw = Math.min(c.clientWidth * 0.5, img.width);
                  const dh = (img.height / img.width) * dw;
                  const x = (c.clientWidth - dw) / 2;
                  const y = (c.clientHeight - dh) / 2;
                  ctx.drawImage(img, x, y, dw, dh);
                };
                img.src = src;
              };
              reader.readAsDataURL(f);
              ev.target.value = '';
            });
            document.body.appendChild(inp);
            fileInputRef.current = inp;

            function getLocalPos(e) {
              const rect = canvas.getBoundingClientRect();
              const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
              const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
              return { x, y };
            }

            function saveSnapshot() {
              try {
                const ratio = window.devicePixelRatio || 1;
                const w = canvas.width / ratio;
                const h = canvas.height / ratio;
                const img = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
                historyRef.current.push(img);
                if (historyRef.current.length > 50) historyRef.current.shift();
              } catch (e) {}
            }

            function pointerDown(e) {
              drawingRef.current = true;
              const p = getLocalPos(e);
              if (!ctxRef.current) return;
              ctxRef.current.beginPath();
              ctxRef.current.moveTo(p.x, p.y);
              saveSnapshot();
              e.preventDefault();
            }

            function pointerMove(e) {
              if (!drawingRef.current || !ctxRef.current) return;
              const p = getLocalPos(e);
              if (eraser) {
                const size = penSize * 2;
                ctxRef.current.clearRect(p.x - size / 2, p.y - size / 2, size, size);
              } else {
                ctxRef.current.lineWidth = penSize;
                ctxRef.current.lineTo(p.x, p.y);
                ctxRef.current.stroke();
              }
              e.preventDefault();
            }

            function pointerUp() { drawingRef.current = false; }

            canvas.addEventListener('pointerdown', pointerDown);
            canvas.addEventListener('pointermove', pointerMove);
            window.addEventListener('pointerup', pointerUp);

            return () => {
              canvas.removeEventListener('pointerdown', pointerDown);
              canvas.removeEventListener('pointermove', pointerMove);
              window.removeEventListener('pointerup', pointerUp);
              window.removeEventListener('resize', resize);
              if (container.contains(canvas)) container.removeChild(canvas);
              if (fileInputRef.current && fileInputRef.current.parentElement) fileInputRef.current.parentElement.removeChild(fileInputRef.current);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);

          useEffect(() => { if (ctxRef.current) ctxRef.current.lineWidth = penSize; }, [penSize]);

          function undo() {
            const img = historyRef.current.pop();
            if (!img || !ctxRef.current) return;
            try { ctxRef.current.putImageData(img, 0, 0); } catch (e) {}
          }

          function clearCanvas() {
            if (!ctxRef.current || !canvasRef.current) return;
            try { const img = ctxRef.current.getImageData(0,0,canvasRef.current.width,canvasRef.current.height); historyRef.current.push(img); } catch(e){}
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          function exportPNG() {
            if (!canvasRef.current) return;
            const data = canvasRef.current.toDataURL('image/png');
            navigation.navigate('Input', { drawingData: data });
          }

          function addPictureClick() { if (fileInputRef.current) fileInputRef.current.click(); }

          function addEmojiToCanvas(emoji) {
            const off = document.createElement('canvas');
            const size = 120;
            off.width = size; off.height = size;
            const c = off.getContext('2d');
            c.fillStyle = 'transparent'; c.fillRect(0,0,size,size);
            c.font = '72px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText(emoji, size/2, size/2);
            const src = off.toDataURL('image/png');
            const id = Date.now().toString();
            setAssets((s) => [...s, { id, src }]);

            const img = new Image();
            img.onload = () => {
              const main = canvasRef.current; const ctx = ctxRef.current;
              const dw = Math.min(120, main.clientWidth * 0.25);
              const dh = (img.height / img.width) * dw;
              const x = (main.clientWidth - dw) / 2; const y = (main.clientHeight - dh) / 2;
              ctx.drawImage(img, x, y, dw, dh);
            };
            img.src = src;
          }

          function placeAssetOnCanvas(src) {
            const img = new Image();
            img.onload = () => {
              const main = canvasRef.current; const ctx = ctxRef.current;
              const dw = Math.min(120, main.clientWidth * 0.25);
              const dh = (img.height / img.width) * dw;
              const x = (main.clientWidth - dw) / 2; const y = (main.clientHeight - dh) / 2;
              ctx.drawImage(img, x, y, dw, dh);
            };
            img.src = src;
          }

          return (
            <View style={{ flex: 1, padding: 12 }}>
              <Text style={{ textAlign: 'center', fontSize: 18, color: '#374151', marginBottom: 8 }}>Draw</Text>
              <View ref={containerRef} style={{ flex: 1, marginBottom: 12 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={addPictureClick} style={styles.pill}><Text>Add picture to the canvas</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => {}} style={styles.pill}><Text>Add icon, shapes, styles</Text></TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => setEraser(!eraser)} style={[styles.toolBtn, eraser ? styles.toolActive : null]}><Text>{eraser ? 'Eraser On' : 'Eraser'}</Text></TouchableOpacity>
                  <TouchableOpacity onPress={undo} style={styles.toolBtn}><Text>Undo</Text></TouchableOpacity>
                  <TouchableOpacity onPress={clearCanvas} style={styles.toolBtn}><Text>Clear</Text></TouchableOpacity>
                  <TouchableOpacity onPress={exportPNG} style={styles.doneBtn}><Text style={{ color: '#fff' }}>Done</Text></TouchableOpacity>
                </View>
              </View>

              <View style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 12, minHeight: 140 }}>
                <Text style={{ marginBottom: 8, color: '#6b7280' }}>Assets (click to add to canvas)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['🙂', '🎉', '🏆', '🧶', '⭐'].map((em) => (
                    <TouchableOpacity key={em} onPress={() => addEmojiToCanvas(em)} style={styles.assetThumb}><Text style={{ fontSize: 28 }}>{em}</Text></TouchableOpacity>
                  ))}
                  {assets.map(a => (
                    <TouchableOpacity key={a.id} onPress={() => placeAssetOnCanvas(a.src)} style={styles.assetThumb}>
                      {/* web-only thumbnail */}
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <img src={a.src} style={{ width: 64, height: 64, objectFit: 'contain' }} />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ marginRight: 8 }}>Pen size</Text>
                  {[4,6,10,16].map(s => (
                    <TouchableOpacity key={s} onPress={() => { setPenSize(s); setEraser(false); }} style={[styles.sizeDot, penSize===s ? styles.sizeActive : null]} />
                  ))}
                </View>
              </View>
            </View>
          );
        }

        export default function DrawScreenFixed({ navigation }) {
          const webRef = useRef(null);

          useEffect(() => {
            function handler(e) {
              try {
                const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                if (msg && msg.type === 'export' && msg.data) {
                  navigation.navigate('Input', { drawingData: msg.data });
                }
              } catch (err) {}
            }
            if (Platform.OS === 'web') {
              window.addEventListener('message', handler);
              return () => window.removeEventListener('message', handler);
            }
            return undefined;
          }, [navigation]);

          const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body><div id="root"></div></body></html>';

          return (
            <SafeAreaView style={{ flex: 1 }}>
              {Platform.OS === 'web' ? (
                <WebInlineCanvas navigation={navigation} />
              ) : (
                (() => {
                  let WebViewComp = null;
                  try { WebViewComp = require('react-native-webview').WebView; } catch (e) { WebViewComp = null; }
                  if (!WebViewComp) {
                    return (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'red' }}>WebView is not available on this platform.</Text>
                      </View>
                    );
                  }
                  return (
                    <WebViewComp
                      ref={webRef}
                      originWhitelist={["*"]}
                      source={{ html }}
                      onMessage={(e) => {
                        try { const msg = JSON.parse(e.nativeEvent.data); if (msg.type === 'export' && msg.data) navigation.navigate('Input', { drawingData: msg.data }); } catch (err) {}
                      }}
                      javaScriptEnabled
                      domStorageEnabled
                      style={{ flex: 1 }}
                    />
                  );
                })()
              )}
            </SafeAreaView>
          );
        }

        const styles = StyleSheet.create({
          pill: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 24, marginRight: 8 },
          toolBtn: { padding: 8, borderRadius: 6, backgroundColor: '#f3f4f6', marginRight: 8 },
          toolActive: { backgroundColor: '#fde68a' },
          doneBtn: { padding: 10, borderRadius: 6, backgroundColor: '#4B5563', marginLeft: 6 },
          assetThumb: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ddd' },
          sizeDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#111', marginRight: 8 },
          sizeActive: { borderWidth: 3, borderColor: '#4B5563' },
        });
