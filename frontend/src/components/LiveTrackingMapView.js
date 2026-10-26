import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Uber/Rapido-Style Live Tracking Map for VaidicSanskar
 * - Pandit GPS Location marker with saffron halo
 * - Devotee destination address pin
 * - Dynamic route polyline connecting both
 * - Live bounds fitting & road distance display
 */
export default function LiveTrackingMapView({
  userLocation = { latitude: 28.5355, longitude: 77.3910 },
  panditLocation = { latitude: 28.5520, longitude: 77.3780 },
  distanceKm = '2.4',
  etaMinutes = '12',
  style,
}) {
  const webViewRef = useRef(null);

  const uLat = userLocation?.latitude || 28.5355;
  const uLng = userLocation?.longitude || 77.3910;
  const pLat = panditLocation?.latitude || 28.5520;
  const pLng = panditLocation?.longitude || 77.3780;

  // Push updated location coordinates to WebView without reloading page
  useEffect(() => {
    if (webViewRef.current) {
      const script = `
        if (window.updatePanditPosition) {
          window.updatePanditPosition(${pLat}, ${pLng}, "${distanceKm}", "${etaMinutes}");
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [pLat, pLng, distanceKm, etaMinutes]);

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
        
        /* Yajman Destination Pin */
        .home-marker {
          background: #67101F; color: white; border: 2.5px solid #FFFFFF;
          border-radius: 50%; width: 36px; height: 36px; display: flex;
          align-items: center; justify-content: center; font-size: 17px;
          box-shadow: 0 4px 12px rgba(103, 16, 31, 0.45);
        }

        /* Pandit Live Vehicle Pin */
        .pandit-vehicle-marker {
          background: #D48B28; color: white; border: 2.5px solid #FFFFFF;
          border-radius: 50%; width: 42px; height: 42px; display: flex;
          align-items: center; justify-content: center; font-size: 20px;
          box-shadow: 0 4px 14px rgba(212, 139, 40, 0.55);
          animation: pulseHalo 2s infinite;
        }

        @keyframes pulseHalo {
          0% { box-shadow: 0 0 0 0 rgba(212, 139, 40, 0.7); }
          70% { box-shadow: 0 0 0 16px rgba(212, 139, 40, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 139, 40, 0); }
        }

        .eta-pill {
          background: #67101F; color: white; font-family: -apple-system, sans-serif;
          font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;
          border: 1.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          white-space: nowrap; text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© VaidicSanskar / OSM'
        }).addTo(map);

        // Yajman Home Pin
        var homeIcon = L.divIcon({
          className: '',
          html: '<div class="home-marker">🏠</div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        var homeMarker = L.marker([${uLat}, ${uLng}], { icon: homeIcon }).addTo(map);

        // Pandit Live Pin
        var panditIcon = L.divIcon({
          className: '',
          html: '<div class="pandit-vehicle-marker">🕉️</div>',
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });
        var panditMarker = L.marker([${pLat}, ${pLng}], { icon: panditIcon }).addTo(map);

        // Route Polyline
        var routeLine = L.polyline([
          [${pLat}, ${pLng}],
          [(${pLat} + ${uLat}) / 2 + 0.003, (${pLng} + ${uLng}) / 2 - 0.002],
          [${uLat}, ${uLng}]
        ], {
          color: '#67101F',
          weight: 4.5,
          opacity: 0.85,
          dashArray: '6, 8',
          lineCap: 'round'
        }).addTo(map);

        // Fit Bounds
        var group = new L.featureGroup([homeMarker, panditMarker]);
        map.fitBounds(group.getBounds().pad(0.35));

        // Dynamic update function called from React Native
        window.updatePanditPosition = function(newLat, newLng, dist, eta) {
          panditMarker.setLatLng([newLat, newLng]);
          routeLine.setLatLngs([
            [newLat, newLng],
            [(newLat + ${uLat}) / 2 + 0.002, (newLng + ${uLng}) / 2 - 0.001],
            [${uLat}, ${uLng}]
          ]);
          var updatedGroup = new L.featureGroup([homeMarker, panditMarker]);
          map.fitBounds(updatedGroup.getBounds().pad(0.35));
        };
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#67101F" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FAF5EE',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
  },
});
