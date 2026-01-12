import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ScrollView, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useEntryAnimation } from '../hooks/useEntryAnimation';
import { playTapFeedback } from '../utils/feedback';

function WebInlineCanvas({ navigation }) {
  const { style: entryStyle } = useEntryAnimation({ offset: 14 });
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const fileInputRef = useRef(null);

  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const elementsRef = useRef([]);

  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const dragRef = useRef({ activeId: null, originX: 0, originY: 0, startX: 0, startY: 0 });
  const lastTapRef = useRef({});

  const [tool, setTool] = useState('pen');
  const [penSize, setPenSize] = useState(6);
  const [penStyle, setPenStyle] = useState('smooth');
  const [penColor, setPenColor] = useState('#000000');

  // Live-Refs halten, damit Canvas-Handler stets aktuelle Werte sehen, ohne den Canvas neu aufzubauen.
  const toolRef = useRef(tool);
  const penSizeRef = useRef(penSize);
  const penStyleRef = useRef(penStyle);
  const penColorRef = useRef(penColor);
  const scaleDragRef = useRef({ activeId: null, startScale: 1, startX: 0 });

  const updateTool = (next) => { toolRef.current = next; setTool(next); };
  const updateSize = (next) => { penSizeRef.current = next; setPenSize(next); };
  const updateStyle = (next) => { penStyleRef.current = next; setPenStyle(next); updateTool('pen'); };
  const updateColor = (next) => { penColorRef.current = next; setPenColor(next); updateTool('pen'); };
  const [showPalette, setShowPalette] = useState(false);

  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(200);

  useEffect(() => {
    if (trackRef.current && trackRef.current.getBoundingClientRect) {
      const w = trackRef.current.getBoundingClientRect().width;
      if (w) setTrackWidth(w);
    }
  }, []);

  const clampPos = (x, y, boxW, boxH) => {
    const w = canvasSize.w || 0;
    const h = canvasSize.h || 0;
    return {
      x: Math.min(Math.max(x, 0), Math.max(w - boxW, 0)),
      y: Math.min(Math.max(y, 0), Math.max(h - boxH, 0)),
    };
  };

  const cycleScale = (current) => {
    const steps = [0.6, 1, 1.4];
    const idx = steps.findIndex((s) => Math.abs(s - current) < 0.05);
    return steps[(idx + 1) % steps.length];
  };

  const syncElements = (next) => {
    elementsRef.current = next;
    setCanvasElements(next);
  };

  const applyStyle = (ctx, { useEraser = false, sizeOverride, colorVal, styleVal } = {}) => {
    if (!ctx) return;
    const width = sizeOverride || penSizeRef.current;
    const style = styleVal || penStyleRef.current;
    const color = colorVal || penColorRef.current;
    ctx.lineWidth = width;
    if (style === 'smooth') { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]); }
    else if (style === 'marker') { ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.setLineDash([]); }
    else { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([12, 8]); }
    ctx.strokeStyle = color;
    ctx.globalCompositeOperation = useEraser ? 'destination-out' : 'source-over';
  };

  useEffect(() => {
    toolRef.current = tool;
    // Im Auswahlmodus bekommt das Overlay die Events, indem Pointer-Events auf dem Canvas deaktiviert werden.
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = tool === 'select' ? 'none' : 'auto';
    }
  }, [tool]);

  useEffect(() => {
    penSizeRef.current = penSize;
  }, [penSize]);

  useEffect(() => {
    penStyleRef.current = penStyle;
  }, [penStyle]);

  useEffect(() => {
    penColorRef.current = penColor;
  }, [penColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.border = '1px solid #e5e7eb';
    canvas.style.background = '#fff';
    canvas.style.pointerEvents = 'auto';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    container.appendChild(canvas);
    canvasRef.current = canvas;

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight || Math.max(260, window.innerHeight * 0.5);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      applyStyle(ctx, { useEraser: false });
      ctxRef.current = ctx;
    }

    resize();
    window.addEventListener('resize', resize);
    // Canvas initial bereit machen, bevor Events registriert werden

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
        const { cw, ch } = getCanvasDims();
        const dw = Math.min(160, cw * 0.5, ch * 0.5);
        const x = Math.max(12, (cw - dw) / 2);
        const y = Math.max(12, ch * 0.06 || 12);
        syncElements([...elementsRef.current, { id, type: 'image', uri: src, x, y, baseWidth: dw, baseHeight: dw, baseSize: dw, scale: 1 }]);

        const img = new Image();
        img.onload = () => {
          const c = canvasRef.current; const ctx = ctxRef.current;
          if (!c || !ctx) return;
          const ratio = img.height / img.width;
          const h = dw * ratio;
          const nx = (c.clientWidth - dw) / 2;
          const ny = Math.max(12, c.clientHeight * 0.06);
          ctx.drawImage(img, nx, ny, dw, h);
          syncElements((prev) => prev.map((el) => el.id === id ? { ...el, x: nx, y: ny, baseWidth: dw, baseHeight: h, baseSize: dw } : el));
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

    function pointerDown(e) {
      const currentTool = toolRef.current;
      if (currentTool === 'select') return;
      drawingRef.current = true;
      const p = getLocalPos(e);
      if (!ctxRef.current) return;
      const size = penSizeRef.current;
      const useEraser = currentTool === 'eraser';
      applyStyle(ctxRef.current, { useEraser, sizeOverride: useEraser ? size * 1.6 : size });
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(p.x, p.y);
      e.preventDefault();
    }

    function pointerMove(e) {
      if (!drawingRef.current || !ctxRef.current) return;
      const p = getLocalPos(e);
      const currentTool = toolRef.current;
      const size = penSizeRef.current;
      const useEraser = currentTool === 'eraser';
      applyStyle(ctxRef.current, { useEraser, sizeOverride: useEraser ? size * 1.6 : size });
      ctxRef.current.lineTo(p.x, p.y);
      ctxRef.current.stroke();
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
  }, []);

  useEffect(() => {
    applyStyle(ctxRef.current, { useEraser: toolRef.current === 'eraser' });
  }, [penSize, penStyle, penColor, tool]);

  function exportPNG() {
    playTapFeedback();
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL('image/png');
    console.log('draw-export', { data, elements: elementsRef.current });
      navigation.navigate('Welcome', { drawingData: data, elements: elementsRef.current });
  }

  function addPictureClick() { if (fileInputRef.current) fileInputRef.current.click(); }

  const getCanvasDims = () => {
    const cw = canvasSize.w || (canvasRef.current ? canvasRef.current.clientWidth : 0) || 320;
    const ch = canvasSize.h || (canvasRef.current ? canvasRef.current.clientHeight : 0) || 320;
    return { cw, ch };
  };

  function addEmojiToCanvas(emoji) {
    const id = Date.now().toString();
    const { cw, ch } = getCanvasDims();
    const dw = Math.min(120, cw * 0.25, ch * 0.25);
    const x = Math.max(12, (cw - dw) / 2);
    const y = Math.max(12, ch * 0.06);
    // Als Text rendern, um Font/Emoji-Probleme mancher Browser zu vermeiden.
    syncElements([...elementsRef.current, { id, type: 'emoji', value: emoji, src: null, x, y, baseWidth: dw, baseHeight: dw, baseSize: dw, scale: 1 }]);
  }

  function addIconToCanvas(sym) {
    const id = Date.now().toString();
    const { cw, ch } = getCanvasDims();
    const dw = Math.min(120, cw * 0.25, ch * 0.25);
    const x = Math.max(12, (cw - dw) / 2);
    const y = Math.max(12, ch * 0.06);
    // Als Text rendern, um ein konsistentes Aussehen ohne dataURL-Laden sicherzustellen.
    syncElements([...elementsRef.current, { id, type: 'icon', value: sym, src: null, x, y, baseWidth: dw, baseHeight: dw, baseSize: dw, scale: 1 }]);
  }

  const selectPalette = ['#1abc4b', '#c31919', '#fa6868', '#c6d8ff', '#a8e6cf', '#000000'];

  const getElementSize = (el) => {
    const scale = el.scale || 1;
    const baseW = el.baseWidth || el.baseSize || 48;
    const baseH = el.baseHeight || el.baseSize || 48;
    return { w: baseW * scale, h: baseH * scale };
  };

  const hitTest = (x, y) => {
    // oberstes Element unter dem Zeiger anhand der echten Breite/Höhe finden
    for (let i = canvasElements.length - 1; i >= 0; i -= 1) {
      const el = canvasElements[i];
      const { w, h } = getElementSize(el);
      if (x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h) {
        return el;
      }
    }
    return null;
  };

  const clampScaleToCanvas = (el, proposed) => {
    const baseW = el.baseWidth || el.baseSize || 48;
    const baseH = el.baseHeight || el.baseSize || 48;
    const wCap = canvasSize.w ? (canvasSize.w - el.x) / Math.max(baseW, 1) : Infinity;
    const hCap = canvasSize.h ? (canvasSize.h - el.y) / Math.max(baseH, 1) : Infinity;
    const maxScale = Math.max(0.3, Math.min(wCap, hCap));
    return Math.max(0.3, Math.min(proposed, maxScale));
  };

  return (
    <Animated.View style={[{ flex: 1, paddingHorizontal: 12 }, entryStyle]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Draw</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={{ flex: 1 }}>
        <View
          ref={containerRef}
          onLayout={(e) => setCanvasSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          style={{ flex: 1, position: 'relative', marginBottom: 12, pointerEvents: 'box-none', overflow: 'hidden', backgroundColor: '#fff' }}
        >
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: tool === 'select' ? 'auto' : 'none', zIndex: 5 }}
            onStartShouldSetResponder={() => false}
            onMoveShouldSetResponder={() => false}
          >
            {canvasElements.map((el) => {
              const { w: elW, h: elH } = getElementSize(el);
              const fontSize = elW;
              const isSelect = tool === 'select';
              const content = el.value || '';
              const source = el.src;
              const canSelect = tool === 'select';
              return (
                <View
                  key={el.id}
                  style={{ position: 'absolute', left: el.x, top: el.y, cursor: canSelect ? 'grab' : 'default', zIndex: selectedId === el.id ? 8 : 1 }}
                  pointerEvents={isSelect ? 'auto' : 'none'}
                  collapsable={false}
                  onStartShouldSetResponder={() => isSelect}
                  onMoveShouldSetResponder={() => isSelect}
                  onStartShouldSetResponderCapture={() => isSelect}
                  onMoveShouldSetResponderCapture={() => isSelect}
                  onResponderGrant={(evt) => {
                    const { pageX, pageY } = evt.nativeEvent;
                    dragRef.current = { activeId: el.id, originX: el.x, originY: el.y, startX: pageX, startY: pageY };
                    setSelectedId(el.id);

                    const now = Date.now();
                    const last = lastTapRef.current[el.id] || 0;
                    if (now - last < 300) {
                      const next = cycleScale(el.scale || 1);
                      syncElements(elementsRef.current.map((it) => it.id === el.id ? { ...it, scale: next } : it));
                    }
                    lastTapRef.current[el.id] = now;
                  }}
                  onResponderMove={(evt) => {
                    if (dragRef.current.activeId !== el.id) return;
                    const { pageX, pageY } = evt.nativeEvent;
                    const dx = pageX - dragRef.current.startX;
                    const dy = pageY - dragRef.current.startY;
                    const newX = dragRef.current.originX + dx;
                    const newY = dragRef.current.originY + dy;
                    const clamped = clampPos(newX, newY, elW, elH);
                    syncElements(elementsRef.current.map((it) => it.id === el.id ? { ...it, x: clamped.x, y: clamped.y } : it));
                  }}
                  onResponderRelease={() => { dragRef.current = { activeId: null, originX: 0, originY: 0, startX: 0, startY: 0 }; }}
                  onResponderTerminate={() => { dragRef.current = { activeId: null, originX: 0, originY: 0, startX: 0, startY: 0 }; }}
                >
                  {source ? (
                    <img
                      src={source}
                      style={{ width: elW, height: elH, objectFit: 'contain', pointerEvents: 'none', cursor: canSelect ? 'grab' : 'default' }}
                      alt=""
                      onError={() => {
                        syncElements(elementsRef.current.map((it) => it.id === el.id ? { ...it, src: null } : it));
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize, transform: [{ scale: el.scale || 1 }], pointerEvents: 'none', userSelect: 'none' }}>{content}</Text>
                  )}

                  {selectedId === el.id && isSelect && (
                    <View pointerEvents="box-none" style={[styles.selectionBox, { width: elW, height: elH }] }>
                      <View
                        style={[styles.selectionHandle, { cursor: 'nwse-resize', touchAction: 'none' }]}
                        pointerEvents="auto"
                        onStartShouldSetResponder={() => true}
                        onMoveShouldSetResponder={() => true}
                        onStartShouldSetResponderCapture={() => true}
                        onMoveShouldSetResponderCapture={() => true}
                        onResponderTerminationRequest={() => false}
                        onResponderGrant={(evt) => {
                          scaleDragRef.current = { activeId: el.id, startScale: el.scale || 1, startX: evt.nativeEvent.pageX };
                          if (evt.preventDefault) evt.preventDefault();
                        }}
                        onResponderMove={(evt) => {
                          if (scaleDragRef.current.activeId !== el.id) return;
                          if (evt.preventDefault) evt.preventDefault();
                          const dx = evt.nativeEvent.pageX - scaleDragRef.current.startX;
                          const factor = 1 + dx / 140;
                          const proposed = (scaleDragRef.current.startScale || 1) * factor;
                          const bounded = clampScaleToCanvas(el, proposed);
                          syncElements(elementsRef.current.map((it) => it.id === el.id ? { ...it, scale: bounded } : it));
                        }}
                        onResponderRelease={() => { scaleDragRef.current = { activeId: null, startScale: 1, startX: 0 }; }}
                        onResponderTerminate={() => { scaleDragRef.current = { activeId: null, startScale: 1, startX: 0 }; }}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <View style={styles.toolbar}>
              <View style={styles.toolbarRow}>
                {[{key:'pen', icon:'pencil', label:'Pen', lib:'ion'}, {key:'eraser', icon:'eraser', label:'Eraser', lib:'mci'}, {key:'select', icon:'hand-pointer', label:'Select', lib:'fa5'}].map((t) => (
                  <TouchableOpacity key={t.key} onPress={() => { updateTool(t.key); }} style={[styles.toolButton, tool===t.key && styles.toolButtonActive]}>
                    {t.lib === 'mci' ? (
                      <MaterialCommunityIcons name={t.icon} size={18} color={tool===t.key ? '#111' : '#374151'} />
                    ) : t.lib === 'fa5' ? (
                      <FontAwesome5 name={t.icon} size={18} solid color={tool===t.key ? '#111' : '#374151'} />
                    ) : (
                      <Ionicons name={t.icon} size={18} color={tool===t.key ? '#111' : '#374151'} />
                    )}
                    <Text style={[styles.toolButtonText, tool===t.key && styles.toolButtonTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={exportPNG} style={[styles.iconBtn, styles.saveBtn, { marginLeft: 8 }]}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={[styles.iconLabel,{color:'#fff'}]}>Save</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toolbarRow}>
                <View style={styles.segmented}>
                  {[{key:'smooth', label:'Smooth'}, {key:'marker', label:'Marker'}, {key:'dashed', label:'Dashed'}].map((opt) => (
                    <TouchableOpacity key={opt.key} onPress={() => { updateStyle(opt.key); }} style={[styles.segment, penStyle===opt.key && styles.segmentActive]}>
                      <Text style={[styles.segmentText, penStyle===opt.key && styles.segmentTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.colorsRow}>
                  {selectPalette.map((c) => (
                    <TouchableOpacity key={c} onPress={() => { updateColor(c); }} style={[styles.colorDot, { backgroundColor: c }, penColor === c ? styles.colorActive : null]} />
                  ))}
                </View>

                <View style={{ flex: 1 }}>
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
                      updateSize(Math.round(size));
                      updateTool('pen');
                    }}
                    onResponderGrant={(e) => {
                      const loc = e.nativeEvent.locationX;
                      const clamped = Math.max(0, Math.min(loc, trackWidth));
                      const min = 2; const max = 24;
                      const size = min + ((max - min) * clamped) / Math.max(trackWidth, 1);
                      updateSize(Math.round(size));
                      updateTool('pen');
                    }}
                    style={styles.sliderTrack}
                  >
                    <View style={[styles.sliderThumb, { left: `${((penSize - 2) / 22) * 100}%` }]} />
                  </View>
                  <View style={styles.sliderMeta}>
                    <Text style={styles.sliderValue}>{penSize}px</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 6 }}>
                      {[4,8,12,18,24].map((s) => (
                        <TouchableOpacity key={s} onPress={() => { updateSize(s); updateTool('pen'); }} style={[styles.sizeDot, penSize === s ? styles.sizeActive : null, { marginRight: 4 }]}>
                          <Text style={{ color: '#fff', fontSize: 10, textAlign: 'center' }}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={addPictureClick} style={styles.pill}><Text>Add picture to the canvas</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPalette(true)} style={styles.pill}><Text>Add icon, shapes, styles</Text></TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>

      {showPalette && (
        <View style={styles.overlay}>
          <View style={[styles.paletteCard, { maxHeight: '82%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: '600', fontSize: 16 }}>Icons & Emojis</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}><Text style={{ fontSize: 16 }}>✕</Text></TouchableOpacity>
            </View>
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>Tap to add to canvas</Text>
            <ScrollView>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[
                  '✅','❌','⭐','🌟','✨','❤️','🧡','💛','💚','💙','💜','🖤',
                  '🔥','🎯','📌','📍','📎','✏️','🖌️','🖍️','✂️','📐','📏',
                  '⬜️','⬛️','◻️','◼️','⚪️','⚫️','🔵','🟢','🟡','🟣','🟤','🟥','🟧','🟨','🟩','🟦','🟪','⬆️','⬇️','⬅️','➡️',
                  '🔺','🔻','🔸','🔶','🔷','🔹','🔺','🔻','🔼','🔽',
                  '✔️','➕','➖','✖️','➗','〰️','➰'
                ].map(sym => (
                  <TouchableOpacity
                    key={sym}
                    onPressIn={() => {
                      addIconToCanvas(sym);
                      updateTool('select');
                      requestAnimationFrame(() => setShowPalette(false));
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.assetThumb}
                  >
                    <Text style={{ fontSize: 24 }}>{sym}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
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
  assetThumb: { width: '25%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd' },
  sizeDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#111', marginRight: 4, alignItems:'center', justifyContent:'center' },
  sizeActive: { borderWidth: 2, borderColor: '#4B5563' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  paletteCard: { width: '90%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  colorDot: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  colorActive: { borderWidth: 3, borderColor: '#4B5563' },
  selectionBox: { position: 'absolute', borderWidth: 1.5, borderColor: '#3B82F6', top: 0, left: 0, right: 0, bottom: 0 },
  selectionHandle: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', bottom: -10, right: -10, borderWidth: 2, borderColor: '#fff' },
  sliderTrack: { height: 10, borderRadius: 5, backgroundColor: '#111', justifyContent: 'center', marginTop: 4 },
  sliderThumb: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', marginTop: -6 },
  toolbar: { marginTop: 12, borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 10 },
  toolbarRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10, gap: 8 },
  toolButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f3f4f6' },
  toolButtonActive: { backgroundColor: '#fde68a' },
  toolButtonText: { marginLeft: 6, color: '#374151', fontWeight: '600' },
  toolButtonTextActive: { color: '#111' },
  iconBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f9fafb' },
  iconLabel: { marginLeft: 4, color: '#111', fontWeight: '600', fontSize: 12 },
  saveBtn: { backgroundColor: '#22c55e' },
  segmented: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4 },
  segment: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, marginRight: 4 },
  segmentActive: { backgroundColor: '#111' },
  segmentText: { color: '#374151', fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  colorsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  sliderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'space-between' },
  sliderValue: { color: '#111', fontWeight: '700', fontSize: 12 },
  headerBar: {
    paddingHorizontal: 4,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  backButton: { padding: 8 },
  headerSpacer: { width: 32 },
});
