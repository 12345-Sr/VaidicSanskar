import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Interactive Mappls Map Component for React Native / Expo
 * Features:
 * - Shows Devotee current GPS location with blue halo
 * - Renders Saffron Pandit Ji pins with live info popups
 * - Bi-directional communication with React Native
 */
export default function MapplsMapView({
  userLocation,
  pandits = [],
  selectedPandit = null,
  onSelectPandit,
  style,
}) {
  const webViewRef = useRef(null);

  const lat = userLocation?.latitude || 28.6280;
  const lng = userLocation?.longitude || 77.3649;

  // Generate Leaflet + Mappls HTML template
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #FAF5EE; }
        .user-marker {
          width: 18px; height: 18px; background: #1E88E5; border: 3px solid #FFFFFF;
          border-radius: 50%; box-shadow: 0 0 10px rgba(30,136,229,0.8);
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0.7); }
          70% { box-shadow: 0 0 0 14px rgba(30, 136, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0); }
        }
        .pandit-pin {
          background: #E65100; color: white; border: 2px solid #FFFFFF;
          border-radius: 50%; width: 34px; height: 34px; display: flex;
          align-items: center; justify-content: center; font-weight: bold;
          font-size: 16px; box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          cursor: pointer; transition: transform 0.2s;
        }
        .pandit-pin.selected {
          background: #B71C1C; transform: scale(1.25); border-color: #FFD54F;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px; background: #FFFDF9; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .popup-title { font-weight: bold; color: #4E180A; font-size: 13px; margin-bottom: 2px; }
        .popup-sub { font-size: 11px; color: #795548; }
        .popup-btn {
          margin-top: 6px; background: #D87A16; color: white; border: none;
          padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 14);

        // Indian Map Tile Layer (High contrast, English + Hindi labels)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© Mappls / OSM'
        }).addTo(map);

        // Devotee GPS Pin
        var userIcon = L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] });
        L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map).bindPopup("<b>आप यहाँ हैं (Your Location)</b>");

        // Accuracy circle
        L.circle([${lat}, ${lng}], {
          color: '#1E88E5',
          fillColor: '#90CAF9',
          fillOpacity: 0.15,
          radius: 600
        }).addTo(map);

        // Pandit Pins
        var panditsData = ${JSON.stringify(pandits)};
        var selectedId = "${selectedPandit?.id || ''}";

        panditsData.forEach(function(p) {
          var isSel = (p.id === selectedId);
          var iconHtml = '<div class="pandit-pin ' + (isSel ? 'selected' : '') + '">🕉️</div>';
          var pIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });

          var marker = L.marker([p.latitude, p.longitude], { icon: pIcon }).addTo(map);

          var popupContent = '<div class="popup-title">' + p.name + '</div>' +
            '<div class="popup-sub">' + p.title + ' • ' + p.distanceText + '</div>' +
            '<button class="popup-btn" onclick="selectPandit(\\'' + p.id + '\\')">पंडित जी चुनें ›</button>';

          marker.bindPopup(popupContent);

          marker.on('click', function() {
            selectPandit(p.id);
          });
        });

        function selectPandit(id) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PANDIT', id: id }));
          }
        }
      </script>
    </body>
    </html>
  `;

  // Update map center when selected pandit changes
  useEffect(() => {
    if (selectedPandit && webViewRef.current) {
      const code = `
        if (typeof map !== 'undefined') {
          map.flyTo([${selectedPandit.latitude}, ${selectedPandit.longitude}], 15, { animate: true, duration: 1 });
        }
      `;
      webViewRef.current.injectJavaScript(code);
    }
  }, [selectedPandit]);

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PANDIT' && onSelectPandit) {
        const found = pandits.find((p) => p.id === data.id);
        if (found) onSelectPandit(found);
      }
    } catch (e) {
      console.log('WebView message error:', e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#D87A16" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#FAF5EE',
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
