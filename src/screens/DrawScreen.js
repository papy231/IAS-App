import React, { useRef, useEffect } from 'react';
// Removed stray code fence
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

// Web inline canvas component (pure frontend, matches the app design)
function WebInlineCanvas({ navigation }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const historyRef = useRef([]);
  const colorRef = useRef('#000');
  const sizeRef = useRef(4);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '60vh';
    canvas.style.border = '1px solid #111';
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
      ctx.lineWidth = sizeRef.current;
      ctx.strokeStyle = colorRef.current;
      ctxRef.current = ctx;
    }

    resize();
    window.addEventListener('resize', resize);

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
      } catch (e) {
        // ignore
      }
    }

    function pointerDown(e) {
      drawingRef.current = true;
      const p = getLocalPos(e);
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(p.x, p.y);
      saveSnapshot();
      e.preventDefault();
    }
    function pointerMove(e) {
      if (!drawingRef.current) return;
      const p = getLocalPos(e);
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
    };
  }, []);

  function setColor(c) {
    colorRef.current = c;
    if (ctxRef.current) ctxRef.current.strokeStyle = c;
  }
  function setSize(s) {
    sizeRef.current = s;
    if (ctxRef.current) ctxRef.current.lineWidth = s;
  }
  function undo() {
    const img = historyRef.current.pop();
    if (!img || !ctxRef.current) return;
    ctxRef.current.putImageData(img, 0, 0);
  }
  function clear() {
    if (!ctxRef.current || !canvasRef.current) return;
    try { const img = ctxRef.current.getImageData(0,0,canvasRef.current.width,canvasRef.current.height); historyRef.current.push(img); } catch(e){}
    const c = canvasRef.current;
    ctxRef.current.clearRect(0, 0, c.width, c.height);
  }
  function exportPNG() {
    if (!canvasRef.current) return;
    const data = canvasRef.current.toDataURL('image/png');
    navigation.navigate('Input', { drawingData: data });
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ textAlign: 'center', fontSize: 18, color: '#374151', marginBottom: 8 }}>Draw</Text>
      <View ref={containerRef} style={{ flex: 1, marginBottom: 12 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          {['#fbbf24', '#34d399', '#ef4444', '#fb7185', '#bfdbfe', '#bbf7d0', '#000000'].map((c) => (
            <TouchableOpacity key={c} onPress={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, borderWidth: 1, borderColor: '#ddd', marginRight: 8 }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={undo} style={{ padding: 8, borderRadius: 6, backgroundColor: '#f3f4f6', marginRight: 8 }}><Text>Undo</Text></TouchableOpacity>
          <TouchableOpacity onPress={clear} style={{ padding: 8, borderRadius: 6, backgroundColor: '#f3f4f6', marginRight: 8 }}><Text>Eraser</Text></TouchableOpacity>
          <TouchableOpacity onPress={exportPNG} style={{ padding: 10, borderRadius: 6, backgroundColor: '#4B5563' }}><Text style={{ color: '#fff' }}>Done</Text></TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 8 }} />
    </View>
  );
}

export default function DrawScreen({ navigation }) {
  const web = useRef(null);

  useEffect(() => {
    function handler(e) {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg && msg.type === 'export' && msg.data) {
          navigation.navigate('Input', { drawingData: msg.data });
        }
      } catch (err) {
        // ignore
      }
    }
    if (Platform.OS === 'web') {
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
    return undefined;
  }, [navigation]);

  const html = `
  <!doctype html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    html,body,canvas{height:100%;margin:0;background:#fff}
    .toolbar{position:fixed;left:0;right:0;top:0;height:56px;background:#111827;color:#fff;display:flex;align-items:center;padding:6px;gap:8px}
    .btn{background:#fff;color:#111827;border-radius:6px;padding:6px 8px;font-size:14px}
    .colors{display:flex;gap:6px}
    .emoji{font-size:20px;padding:6px}
    canvas{touch-action:none;display:block;margin-top:56px}
  </style>
  </head>
  <body>
    <div class="toolbar">
      <button class="btn" id="undo">Undo</button>
      <button class="btn" id="clear">Clear</button>
      <div class="colors">
        <button class="btn" data-color="#000000" style="background:#000;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#ff0000" style="background:#f87171;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#10b981" style="background:#34d399;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#f59e0b" style="background:#fbbf24;width:28px;height:28px;border-radius:14px"></button>
      </div>
      <button class="btn" id="emoji">Emoji</button>
      <button class="btn" id="export">Done</button>
    </div>
    <canvas id="c"></canvas>
    <script>
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let width = window.innerWidth;
      let height = window.innerHeight - 56;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000';

      const history = [];

      function saveSnapshot(){
        history.push(ctx.getImageData(0,0,canvas.width/devicePixelRatio,canvas.height/devicePixelRatio));
        if(history.length>50) history.shift();
      }

      function restoreSnapshot(){
        if(history.length===0) return;
        const img = history.pop();
        ctx.putImageData(img,0,0);
      }

      function clear(){
        saveSnapshot();
        ctx.clearRect(0,0,canvas.width/devicePixelRatio,canvas.height/devicePixelRatio);
      }

      function pointerDown(x,y){
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(x,y);
        saveSnapshot();
      }
      function pointerMove(x,y){
        if(!drawing) return;
        ctx.lineTo(x,y);
        ctx.stroke();
      }
      function pointerUp(){ drawing = false; }

      canvas.addEventListener('pointerdown',(e)=>{ pointerDown(e.clientX, e.clientY-56); });
      canvas.addEventListener('pointermove',(e)=>{ pointerMove(e.clientX, e.clientY-56); });
      canvas.addEventListener('pointerup',pointerUp);
      canvas.addEventListener('pointercancel',pointerUp);

      window.addEventListener('resize',()=>{
        const w = window.innerWidth;
        const h = window.innerHeight - 56;
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width; tmp.height = canvas.height;
        tmp.getContext('2d').drawImage(canvas,0,0);
        canvas.width = w*devicePixelRatio; canvas.height = h*devicePixelRatio;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.drawImage(tmp,0,0, w, h);
      });

      document.getElementById('clear').addEventListener('click',()=>{ clear(); });
      document.getElementById('undo').addEventListener('click',()=>{ restoreSnapshot(); });
      document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{ ctx.strokeStyle = b.getAttribute('data-color'); }));

      document.getElementById('emoji').addEventListener('click',()=>{
        const emoji = prompt('Add emoji or short text:','🙂');
        if(!emoji) return;
        saveSnapshot();
        ctx.font = '48px serif';
        ctx.fillText(emoji, 20, 80);
      });

      document.getElementById('export').addEventListener('click',()=>{
        const data = canvas.toDataURL('image/png');
        const msg = JSON.stringify({ type: 'export', data });
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
          window.ReactNativeWebView.postMessage(msg);
        } else if (window.opener && window.opener.postMessage) {
          window.opener.postMessage(msg, '*');
        } else {
          console.log('export', data.substring(0,40));
        }
      });
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <WebInlineCanvas navigation={navigation} />
      ) : (
        (() => {
          let WebViewComp = null;
          try {
            // eslint-disable-next-line global-require
            WebViewComp = require('react-native-webview').WebView;
          } catch (e) {
            WebViewComp = null;
          }
          if (!WebViewComp) {
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'red' }}>WebView is not available on this platform.</Text>
              </View>
            );
          }
          return (
            <WebViewComp
              ref={web}
              originWhitelist={["*"]}
              source={{ html }}
              onMessage={(e) => {
                try {
                  const msg = JSON.parse(e.nativeEvent.data);
                  if (msg.type === 'export' && msg.data) navigation.navigate('Input', { drawingData: msg.data });
                } catch (err) { }
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

const styles = StyleSheet.create({});

export default function DrawScreen({ navigation }) {
  const web = useRef(null);

  useEffect(() => {
    function handler(e) {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg && msg.type === 'export' && msg.data) {
          navigation.navigate('Input', { drawingData: msg.data });
        }
      } catch (err) {
        // ignore
      }
    }
    if (Platform.OS === 'web') {
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
    return undefined;
  }, [navigation]);

  const html = `
  <!doctype html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    html,body,canvas{height:100%;margin:0;background:#fff}
    .toolbar{position:fixed;left:0;right:0;top:0;height:56px;background:#111827;color:#fff;display:flex;align-items:center;padding:6px;gap:8px}
    .btn{background:#fff;color:#111827;border-radius:6px;padding:6px 8px;font-size:14px}
    .colors{display:flex;gap:6px}
    .emoji{font-size:20px;padding:6px}
    canvas{touch-action:none;display:block;margin-top:56px}
  </style>
  </head>
  <body>
    <div class="toolbar">
      <button class="btn" id="undo">Undo</button>
      <button class="btn" id="clear">Clear</button>
      <div class="colors">
        <button class="btn" data-color="#000000" style="background:#000;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#ff0000" style="background:#f87171;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#10b981" style="background:#34d399;width:28px;height:28px;border-radius:14px"></button>
        <button class="btn" data-color="#f59e0b" style="background:#fbbf24;width:28px;height:28px;border-radius:14px"></button>
      </div>
      <button class="btn" id="emoji">Emoji</button>
      <button class="btn" id="export">Done</button>
    </div>
    <canvas id="c"></canvas>
    <script>
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let width = window.innerWidth;
      let height = window.innerHeight - 56;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000';

      const history = [];

      function saveSnapshot(){
        history.push(ctx.getImageData(0,0,canvas.width/devicePixelRatio,canvas.height/devicePixelRatio));
        if(history.length>50) history.shift();
      }

      function restoreSnapshot(){
        if(history.length===0) return;
        const img = history.pop();
        ctx.putImageData(img,0,0);
      }

      function clear(){
        saveSnapshot();
        ctx.clearRect(0,0,canvas.width/devicePixelRatio,canvas.height/devicePixelRatio);
      }

      function pointerDown(x,y){
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(x,y);
        saveSnapshot();
      }
      function pointerMove(x,y){
        if(!drawing) return;
        ctx.lineTo(x,y);
        ctx.stroke();
      }
      function pointerUp(){ drawing = false; }

      canvas.addEventListener('pointerdown',(e)=>{ pointerDown(e.clientX, e.clientY-56); });
      canvas.addEventListener('pointermove',(e)=>{ pointerMove(e.clientX, e.clientY-56); });
      canvas.addEventListener('pointerup',pointerUp);
      canvas.addEventListener('pointercancel',pointerUp);

      window.addEventListener('resize',()=>{
        // simple resize: keep content by drawing to temp canvas
        const w = window.innerWidth;
        const h = window.innerHeight - 56;
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width; tmp.height = canvas.height;
        tmp.getContext('2d').drawImage(canvas,0,0);
        canvas.width = w*devicePixelRatio; canvas.height = h*devicePixelRatio;
        canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.drawImage(tmp,0,0, w, h);
      });

      document.getElementById('clear').addEventListener('click',()=>{ clear(); });
      document.getElementById('undo').addEventListener('click',()=>{ restoreSnapshot(); });
      document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{ ctx.strokeStyle = b.getAttribute('data-color'); }));

      document.getElementById('emoji').addEventListener('click',()=>{
        const emoji = prompt('Add emoji or short text:','🙂');
        if(!emoji) return;
        saveSnapshot();
        ctx.font = '48px serif';
        ctx.fillText(emoji, 20, 80);
      });

      document.getElementById('export').addEventListener('click',()=>{
        const data = canvas.toDataURL('image/png');
        const msg = JSON.stringify({ type: 'export', data });
        if(window.ReactNativeWebView && window.ReactNativeWebView.postMessage){
          window.ReactNativeWebView.postMessage(msg);
        } else if (window.opener && window.opener.postMessage) {
          // when opened from web parent window
          window.opener.postMessage(msg, '*');
        } else {
          console.log('export', data.substring(0,40));
        }
      });
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <WebInlineCanvas navigation={navigation} />
      ) : (
        (() => {
          let WebViewComp = null;
          try {
            // eslint-disable-next-line global-require
            WebViewComp = require('react-native-webview').WebView;
          } catch (e) {
            WebViewComp = null;
          }
          if (!WebViewComp) {
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'red' }}>WebView is not available on this platform.</Text>
              </View>
            );
          }
          return (
            <WebViewComp
              ref={web}
              originWhitelist={["*"]}
              source={{ html }}
              onMessage={(e) => {
                try {
                  const msg = JSON.parse(e.nativeEvent.data);
                  if (msg.type === 'export' && msg.data) navigation.navigate('Input', { drawingData: msg.data });
                } catch (err) { }
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

const styles = StyleSheet.create({});
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

export default function DrawScreen({ navigation }) {
  const web = useRef(null);

  useEffect(() => {
    function handler(e) {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg && msg.type === 'export' && msg.data) {
        // Web inline canvas component (pure frontend, matches the app design)
        function WebInlineCanvas({ navigation }) {
          const containerRef = useRef(null);
          const canvasRef = useRef(null);
          const ctxRef = useRef(null);
          const drawingRef = useRef(false);
          const historyRef = useRef([]);
          const colorRef = useRef('#000');
          const sizeRef = useRef(4);

          useEffect(() => {
            const container = containerRef.current;
            if (!container) return;

            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '60vh';
            canvas.style.border = '1px solid #111';
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
              ctx.lineWidth = sizeRef.current;
              ctx.strokeStyle = colorRef.current;
              ctxRef.current = ctx;
            }

            resize();
            window.addEventListener('resize', resize);

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
              } catch (e) {
                // ignore
              }
            }

            function pointerDown(e) {
              drawingRef.current = true;
              const p = getLocalPos(e);
              ctxRef.current.beginPath();
              ctxRef.current.moveTo(p.x, p.y);
              saveSnapshot();
              e.preventDefault();
            }
            function pointerMove(e) {
              if (!drawingRef.current) return;
              const p = getLocalPos(e);
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
            };
          }, []);

          function setColor(c) {
            colorRef.current = c;
            if (ctxRef.current) ctxRef.current.strokeStyle = c;
          }
          function setSize(s) {
            sizeRef.current = s;
            if (ctxRef.current) ctxRef.current.lineWidth = s;
          }
          function undo() {
            const img = historyRef.current.pop();
            if (!img || !ctxRef.current) return;
            ctxRef.current.putImageData(img, 0, 0);
          }
          function clear() {
            if (!ctxRef.current || !canvasRef.current) return;
            saveLocal();
            const c = canvasRef.current;
            ctxRef.current.clearRect(0, 0, c.width, c.height);
          }
          function saveLocal() {
            try {
              saveSnapshot();
            } catch (e) {}
          }
          function exportPNG() {
            if (!canvasRef.current) return;
            const data = canvasRef.current.toDataURL('image/png');
            navigation.navigate('Input', { drawingData: data });
          }

          return (
            <View style={{ flex: 1, padding: 16 }}>
              <Text style={{ textAlign: 'center', fontSize: 18, color: '#374151', marginBottom: 8 }}>Draw</Text>
              <View ref={containerRef} style={{ flex: 1, marginBottom: 12 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['#fbbf24', '#34d399', '#ef4444', '#fb7185', '#bfdbfe', '#bbf7d0', '#000000'].map((c) => (
                    <TouchableOpacity key={c} onPress={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, borderWidth: 1, borderColor: '#ddd' }} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={undo} style={{ padding: 8, borderRadius: 6, backgroundColor: '#f3f4f6' }}><Text>Undo</Text></TouchableOpacity>
                  <TouchableOpacity onPress={clear} style={{ padding: 8, borderRadius: 6, backgroundColor: '#f3f4f6' }}><Text>Eraser</Text></TouchableOpacity>
                  <TouchableOpacity onPress={exportPNG} style={{ padding: 10, borderRadius: 6, backgroundColor: '#4B5563' }}><Text style={{ color: '#fff' }}>Done</Text></TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 8 }} />
            </View>
          );
        }
      });
    </script>
  </body>
  </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <WebInlineCanvas navigation={navigation} html={html} />
      ) : (
        (() => {
          let WebViewComp = null;
          try {
            // eslint-disable-next-line global-require
            WebViewComp = require('react-native-webview').WebView;
          } catch (e) {
            WebViewComp = null;
          }
          if (!WebViewComp) {
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'red' }}>WebView is not available on this platform.</Text>
              </View>
            );
          }
          return (
            <WebViewComp
              ref={web}
              originWhitelist={["*"]}
              source={{ html }}
              onMessage={onMessage}
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

const styles = StyleSheet.create({});
