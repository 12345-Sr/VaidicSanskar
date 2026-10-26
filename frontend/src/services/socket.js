import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config/env';
import { getAuthToken } from './api';

/**
 * Socket.IO service — real-time updates connected to unified backend:
 *   - Live Astrologer Presence (astro:online, astro:presence, astro:offline, astro:list)
 *   - Instant & scheduled booking lifecycle (instant:update, booking:accepted, booking:request, etc.)
 *   - Real-time GPS location tracking (tracking:update, booking:location)
 *   - 1-on-1 chat messages (chat:message, chat:user-typing, chat:message-read)
 *   - WebRTC / Agora signaling for audio/video consultations
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {}; // { event: [cb, ...] }
    this.connected = false;
    this.emitQueue = [];
    this.registeredServerEvents = new Set();
    this.autoConnect();
  }

  autoConnect() {
    this.connect();
  }

  connect(token) {
    if (this.socket && this.connected) return;
    try {
      const authToken = token || getAuthToken();
      const targetHost = SOCKET_URL || API_URL;
      const socketHost = targetHost.replace(/\/api\/partner\/?$/, '').replace(/\/api\/?$/, '');

      this.socket = io(socketHost, {
        auth: { token: authToken },
        query: { role: 'user' },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 25,
        reconnectionDelay: 1500,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`🔌 [User App] Live Socket Connected: ${this.socket.id}`);
        this.emitLocal('open', { socketId: this.socket.id });

        // Bind any listeners registered before connection
        this.attachAllListenersToServer();

        // Flush any queued emits
        while (this.emitQueue.length > 0) {
          const { event, data, cb } = this.emitQueue.shift();
          this.socket.emit(event, data, cb);
        }

        // Query server for latest live astrologer list
        this.socket.emit('astro:get:online');
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        console.log(`🔌 [User App] Live Socket Disconnected: ${reason}`);
        this.emitLocal('close', { reason });
      });

      this.socket.on('connect_error', (err) => {
        this.connected = false;
        this.emitLocal('error', err);
      });

      // Wildcard forward all known backend events
      const knownEvents = [
        'instant:update',
        'tracking:update',
        'booking:location',
        'booking:request',
        'booking:accepted',
        'booking:en_route',
        'booking:arrived',
        'booking:pooja_started',
        'booking:completed',
        'booking:cancelled',
        'chat:message',
        'chat:user-typing',
        'chat:message-read',
        'chat:message-delivered',
        'astrochat:started',
        'astrochat:message',
        'astrochat:typing',
        'astrochat:billing',
        'astrochat:low-balance',
        'astrochat:ended',
        'astro:online',
        'astro:presence',
        'astro:list',
        'astro:offline',
        'astro:call:incoming',
        'astro:call:connected',
        'astro:call:declined',
        'astro:call:ended',
        'astro:chat:message',
      ];

      knownEvents.forEach((ev) => this.bindServerEvent(ev));
    } catch (e) {
      console.log('Socket connect note:', e?.message);
    }
  }

  bindServerEvent(event) {
    if (!this.socket || this.registeredServerEvents.has(event)) return;
    this.registeredServerEvents.add(event);
    this.socket.on(event, (data) => {
      this.emitLocal(event, data);
    });
  }

  attachAllListenersToServer() {
    if (!this.socket) return;
    Object.keys(this.listeners).forEach((ev) => {
      this.bindServerEvent(ev);
    });
  }

  on(event, cb) {
    (this.listeners[event] ||= []).push(cb);
    if (this.socket) {
      this.bindServerEvent(event);
    }
    return () => {
      this.listeners[event] = (this.listeners[event] || []).filter((f) => f !== cb);
    };
  }

  off(event, cb) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((f) => f !== cb);
    }
  }

  emitLocal(event, data) {
    (this.listeners[event] || []).forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in socket listener for ${event}:`, err);
      }
    });
  }

  emit(event, data, callback) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data, callback);
    } else {
      this.emitQueue.push({ event, data, cb: callback });
      if (!this.socket) this.autoConnect();
    }
  }

  send(event, data, callback) {
    this.emit(event, data, callback);
  }

  join(bookingId) {
    if (bookingId) {
      this.emit('subscribe:booking', { bookingId });
      this.emit('booking:join', { bookingId });
    }
  }

  leave(bookingId) {
    if (bookingId) {
      this.emit('booking:leave', { bookingId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  simulate(steps) {
    const timers = steps.map(({ event, data, after }) =>
      setTimeout(() => this.emitLocal(event, data), after)
    );
    return () => timers.forEach(clearTimeout);
  }
}

const socket = new SocketService();
export default socket;
