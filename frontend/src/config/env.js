import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

/**
 * Backend URL auto-detection:
 * In Expo Go on physical device: Constants.expoConfig?.hostUri has the host LAN IP (e.g. 192.168.1.33)
 * On web or local emulator: localhost or 10.0.2.2
 */
const expoHost =
  Constants?.expoConfig?.hostUri?.split(':')[0] ||
  Constants?.manifest2?.extra?.expoGo?.debuggerHost?.split(':')[0] ||
  Constants?.manifest?.debuggerHost?.split(':')[0];

const scriptURL = NativeModules?.SourceCode?.scriptURL;
const devHost = scriptURL ? scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0] : null;

const LAN_IP = '192.168.1.36';

// Determine active LAN / localhost
const host = expoHost || devHost || (Platform.OS === 'web' ? 'localhost' : (Platform.OS === 'android' ? (expoHost || '10.0.2.2') : (expoHost || LAN_IP)));

export const RENDER_BACKEND_URL = `http://${LAN_IP}:4000/api/partner/`;

function normalizeApiUrl(url) {
  if (!url) return RENDER_BACKEND_URL;
  let clean = url.trim().replace(/\/+$/, '');
  clean = clean.replace(/\/health\/?$/, '');
  if (clean.endsWith('/api/partner')) return `${clean}/`;
  if (clean.endsWith('/api')) return `${clean}/partner/`;
  if (!clean.includes('/api')) return `${clean}/api/partner/`;
  return `${clean}/`;
}

// Priority: process.env.EXPO_PUBLIC_API_URL -> RENDER_BACKEND_URL
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || RENDER_BACKEND_URL;

export const API_URL = normalizeApiUrl(rawApiUrl);
export const LIVE_BACKEND_URL = API_URL;
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_URL.replace(/\/api\/partner\/?$/, '').replace(/\/api\/?$/, '');

