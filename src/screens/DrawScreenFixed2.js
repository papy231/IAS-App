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
  const [penStyle, setPenStyle] = useState('smooth'); // smooth | marker | dashed
  const [showPalette, setShowPalette] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(200);

  useEffect(() => {
    // fallback to measure track width on web if onLayout didn't run yet
    if (trackRef.current && trackRef.current.getBoundingClientRect) {
      const w = trackRef.current.getBoundingClientRect().width;
      if (w) setTrackWidth(w);
    }
  }, []);

  // helper to sync ctx with current pen style
  const applyStyle = (ctx, useEraser = false, sizeOverride) => {
    if (!ctx) return;
    const w = sizeOverride || penSize;
    ctx.lineWidth = w;
    if (penStyle === 'smooth') { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]); }
    else if (penStyle === 'marker') { ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); }
    else { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([12, 8]); }
    ctx.strokeStyle = penColor;
    ctx.globalCompositeOperation = useEraser ? 'destination-out' : 'source-over';
  };

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
      applyStyle(ctx, false);
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
      const y = (e.touches ? e.touches[0].clientY : e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x, y };
    }

    function saveSnapshot() {
      try {
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

      if (eraser) {
        const size = penSize * 2;
        ctxRef.current.clearRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }

    function pointerMove(e) {
      if (!drawingRef.current || !ctxRef.current) return;
      const p = getLocalPos(e);
      if (eraser) {
        const size = penSize * 2;
        ctxRef.current.clearRect(p.x - size / 2, p.y - size / 2, size, size);
      } else {
        ctxRef.current.globalCompositeOperation = 'source-over';
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
    applyStyle(ctxRef.current, eraser);
  }, [penSize, penStyle, penColor, eraser]);

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
      const x = (main.clientWidth - dw) / 2; const y = Math.max(12, main.clientHeight * 0.06);
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
      const x = (main.clientWidth - dw) / 2; const y = Math.max(12, main.clientHeight * 0.06);
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
          <TouchableOpacity onPress={() => setShowPalette(true)} style={styles.pill}><Text>Add icon, shapes, styles</Text></TouchableOpacity>
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

      </View>

      {/* Pen style, color, eraser, size slider */}
      <View style={{ paddingHorizontal: 8, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ marginRight: 8 }}>Pen</Text>
          {[
            { key: 'smooth', label: 'Smooth' },
            { key: 'marker', label: 'Marker' },
            { key: 'dashed', label: 'Dashed' },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => { setPenStyle(opt.key); setEraser(false); }}
              style={[styles.toolBtn, penStyle === opt.key ? styles.toolActive : null, { marginRight: 6 }]}
            >
              <Text>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>✏️</Text>
          {['#1abc4b', '#c31919', '#fa6868', '#c6d8ff', '#a8e6cf', '#000000'].map((c) => (
            <TouchableOpacity key={c} onPress={() => { setPenColor(c); setEraser(false); }} style={[styles.colorDot, { backgroundColor: c }, penColor === c ? styles.colorActive : null]} />
          ))}
          <TouchableOpacity onPress={() => { setEraser((v) => !v); }} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 22 }}>{eraser ? '🧽✅' : '🧽'}</Text>
          </TouchableOpacity>
        </View>

        <View
          ref={trackRef}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderMove={(e) => {
            const loc = e.nativeEvent.locationX;
            const clamped = Math.max(0, Math.min(loc, trackWidth));
            const min = 2; const max = 24;
            const size = min + ((max - min) * clamped) / Math.max(trackWidth, 1);
            setPenSize(Math.round(size));
            setEraser(false);
          }}
          onResponderGrant={(e) => {
            const loc = e.nativeEvent.locationX;
            const clamped = Math.max(0, Math.min(loc, trackWidth));
            const min = 2; const max = 24;
            const size = min + ((max - min) * clamped) / Math.max(trackWidth, 1);
            setPenSize(Math.round(size));
            setEraser(false);
          }}
          style={styles.sliderTrack}
        >
          <View style={[styles.sliderThumb, { left: `${((penSize - 2) / 22) * 100}%` }]} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          {[4,8,12,18,24].map((s) => (
            <TouchableOpacity key={s} onPress={() => { setPenSize(s); setEraser(false); }} style={[styles.sizeDot, penSize === s ? styles.sizeActive : null, { marginRight: 6 }]}>
              <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showPalette && (
        <View style={styles.overlay}>
          <View style={styles.paletteCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: '600', fontSize: 16 }}>Icons & Emojis</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}><Text style={{ fontSize: 16 }}>✕</Text></TouchableOpacity>
            </View>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Tap to add to canvas</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['✅','❌','⭐','❤️','🔥','🎯','📌','⬜️','⬛️','🔺','🔻','🔵','🟢','🟡','🟣','🔶'].map(sym => (
                <TouchableOpacity key={sym} onPress={() => { addEmojiToCanvas(sym); setShowPalette(false); }} style={styles.assetThumb}>
                  <Text style={{ fontSize: 24 }}>{sym}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default function DrawScreenFixed({ navigation }) {
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <WebInlineCanvas navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#111' }}>Drawing is available on web only for now.</Text>
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  paletteCard: { width: '90%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  colorDot: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  colorActive: { borderWidth: 3, borderColor: '#4B5563' },
  sliderTrack: { height: 18, borderRadius: 9, backgroundColor: '#e5e7eb', justifyContent: 'center' },
  sliderThumb: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: '#000', borderWidth: 2, borderColor: '#fff', marginTop: -7 },
});
