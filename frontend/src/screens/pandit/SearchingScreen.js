import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Alert,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { serif, shadow } from '../../theme/styles';
import { panditBookingStore } from '../../services/panditBookingStore';
import socket from '../../services/socket';
import { API_URL } from '../../config/env';
import { BookingService, InstantService, getAuthToken } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';

export default function SearchingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useApp() || {};
  const { showNotification } = useNotification();
  const [booking, setBooking] = useState(
    () => panditBookingStore.getBooking() || route?.params?.booking || null
  );

  // Concentric radar waves animation
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!panditBookingStore.getBooking() && route?.params?.booking) {
      panditBookingStore.setBooking(route.params.booking);
    }

    showNotification({
      title: 'पंडित जी की खोज जारी है... 🔍',
      message: 'निकटतम योग्य आचार्य / पंडित जी को पूजा अनुरोध भेजा जा रहा है।',
      type: 'pandit',
    });

    // 1. Radar wave animation loop
    const createPulse = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPulse(pulse1, 0);
    createPulse(pulse2, 850);
    createPulse(pulse3, 1700);

    // 2. Local reactive store subscription
    const unsub = panditBookingStore.subscribe((b) => {
      setBooking(b ? { ...b } : null);
      if (b && (b.status === 'ACCEPTED' || b.status === 'ON_THE_WAY' || b.status === 'ARRIVED')) {
        setTimeout(() => {
          navigation.replace('BookingStatus', { bookingId: b.id });
        }, 500);
      }
    });

    // 3. Real-time Socket.IO room subscription for live backend server
    const bookingId = booking?.id || route?.params?.bookingId;

    if (bookingId) {
      socket.join(bookingId);

      const searchPayload = {
        id: bookingId,
        bookingId,
        requestId: bookingId,
        pooja: booking?.pooja || { name: 'श्री सत्यनारायण महापूजा', duration: '2 - 2.5 hrs', price: 2500 },
        name: booking?.pooja?.name || 'श्री सत्यनारायण महापूजा',
        yajmanName: booking?.yajmanName || user?.name || 'Devotee',
        yajmanPhone: booking?.yajmanPhone || user?.phone || user?.email || '',
        gotra: booking?.gotra || 'काश्यप',
        sankalpName: booking?.sankalpName || `${booking?.yajmanName || user?.name || 'Devotee'} एवं सपरिवार`,
        specialNote: booking?.specialNote || 'कृपया शुद्ध गाय का घी व तुलसी दल साथ रखें।',
        address: booking?.address || user?.address || 'Current Location (GPS)',
        area: booking?.area || user?.city || 'Current Location',
        landmark: booking?.landmark || '',
        language: booking?.language || 'Hindi & Sanskrit',
        dakshina: booking?.dakshina || 2500,
        withSamagri: booking?.withSamagri !== false,
        samagriFee: booking?.samagriFee || 600,
        wave: booking?.wave || 1,
        startOtp: booking?.startOtp,
        completeOtp: booking?.completeOtp,
        coords: {
          latitude: 28.6280,
          longitude: 77.3649,
        },
      };

      // Broadcast to nearest pandits across all canonical channels
      socket.emit('booking:request', searchPayload);
      socket.emit('job:broadcast', searchPayload);
      socket.emit('job:new', searchPayload);
      socket.emit('instant:request', searchPayload);
    }

    const handleAccepted = (data) => {
      if (data && (data.assignedVendor || data.assignedVendorId || data.vendor || data.id || data.requestId)) {
        showNotification({
          title: 'पंडित जी मिल गए! 🙏',
          message: `${data?.assignedVendor?.name || data?.vendor?.name || 'आचार्य जी'} ने आपकी पूजा स्वीकार कर ली है।`,
          type: 'pandit',
        });
        panditBookingStore.acceptBooking(data.assignedVendor || data.vendor || { name: 'Verified Pandit' });
        navigation.replace('BookingStatus', { bookingId: data.id || data.requestId || bookingId });
      }
    };

    const unsubAccepted = socket.on('booking:accepted', handleAccepted);
    const unsubUpdate = socket.on('instant:update', (data) => {
      if (data && (data.status === 'accepted' || data.status === 'ACCEPTED')) {
        handleAccepted(data);
      }
    });

    // 4. Resilient polling fallback every 2.5s via typed backend services
    const pollInterval = setInterval(async () => {
      const bId = booking?.id || route?.params?.bookingId;
      if (!bId) return;
      try {
        let b = null;
        try {
          const res = await BookingService.detail(bId);
          b = res?.booking || res?.data || res;
        } catch (_) {
          try {
            const instRes = await InstantService.get(bId);
            b = instRes?.request || instRes?.data || instRes;
          } catch (_) {}
        }
        if (b) {
          const sUpper = String(b.status || '').toUpperCase();
          if (['ACCEPTED', 'ARRIVED', 'IN_PROGRESS', 'ON_THE_WAY'].includes(sUpper)) {
            clearInterval(pollInterval);
            panditBookingStore.acceptBooking(b.assignedVendor || b.vendor || { name: 'Verified Pandit' });
            navigation.replace('BookingStatus', { bookingId: b._id || b.id || bId });
          }
        }
      } catch (e) {}
    }, 2500);

    return () => {
      unsub();
      clearInterval(pollInterval);
      if (socket && bookingId) socket.leave(bookingId);
    };
  }, [navigation, booking?.id]);

  const handleCancelSearch = () => {
    Alert.alert(
      'Cancel Pandit Search?',
      'You are entitled to a 100% Instant Refund if you cancel while searching. Would you like to proceed?',
      [
        { text: 'Keep Searching', style: 'cancel' },
        {
          text: 'Yes, Cancel (100% Refund)',
          style: 'destructive',
          onPress: () => {
            panditBookingStore.cancelBooking('yajman', 'User cancelled while searching');
            navigation.replace('PujaBrowse');
          },
        },
      ]
    );
  };

  if (!booking) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={s.subText}>No active pooja search in progress.</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('PujaBrowse')}>
          <Text style={s.backBtnText}>Browse Poojas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // NO PANDIT FOUND TIMEOUT STATE
  if (booking.status === 'NO_PANDIT_FOUND') {
    return (
      <View style={[s.container, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <View style={s.timeoutCard}>
          <View style={s.timeoutIconCircle}>
            <MaterialCommunityIcons name="account-search-outline" size={54} color="#D48B28" />
          </View>
          <Text style={s.timeoutTitle}>No Pandit Available Right Now</Text>
          <Text style={s.timeoutSub}>
            All certified Vedic pandits within {booking.waveRadiusKm || 20} km of {booking.area || 'your area'} are currently performing rituals or reserved.
          </Text>

          <View style={s.refundBox}>
            <Ionicons name="checkmark-circle" size={20} color="#15803D" />
            <Text style={s.refundText}>
              100% Instant Refund of ₹{booking.advancePaid || booking.total} has been credited back to your original payment method.
            </Text>
          </View>

          <TouchableOpacity
            style={s.scheduleBtn}
            onPress={() => {
              panditBookingStore.reset();
              navigation.replace('PujaBrowse');
            }}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color="#FFFFFF" />
            <Text style={s.scheduleBtnText}>Schedule for Another Muhurat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.homeBtn}
            onPress={() => {
              panditBookingStore.reset();
              navigation.replace('Main');
            }}
          >
            <Text style={s.homeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top + 12 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF5EE" translucent={false} />

      {/* HEADER WITH CANCEL OPTION */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeCircle} onPress={handleCancelSearch} hitSlop={10}>
          <Ionicons name="close" size={22} color="#67101F" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Finding Your Pandit</Text>
          <Text style={s.headerSub}>Searching verified Vedic scholars</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* SCROLLABLE BODY (Prevents overlapping on smaller phone screens) */}
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MATCHING WAVE PILL */}
        <View style={s.waveContainer}>
          <View style={s.wavePill}>
            <View style={s.blinkingDot} />
            <Text style={s.waveText}>
              SEARCH WAVE {booking.wave || 1} ({booking.waveRadiusKm || 5} km Radius) · {booking.waveRemainingSec || 30}s
            </Text>
          </View>
        </View>

        {/* RADAR PULSE VISUALIZER */}
        <View style={s.radarBox}>
          {[pulse1, pulse2, pulse3].map((anim, idx) => {
            const scale = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.65, 2.5],
            });
            const opacity = anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.55, 0.22, 0],
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  s.ripple,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              />
            );
          })}

          {/* Sacred Diya Center Emblem */}
          <View style={s.centerCircle}>
            <MaterialCommunityIcons name="fire" size={44} color="#D48B28" />
          </View>
        </View>

        {/* LIVE SEARCHING CARD (SCREEN 5 MANDATORY FIELDS) */}
        <View style={s.card}>
          <View style={s.cardTopRow}>
            <View style={s.statusPill}>
              <View style={s.statusDot} />
              <Text style={s.statusPillText}>SEARCHING FOR PANDIT</Text>
            </View>
            <Text style={s.refId}>REF #{booking.id}</Text>
          </View>

          {/* Selected Pooja */}
          <Text style={s.poojaTitle}>{booking.pooja?.name || 'Vaidic Pooja'}</Text>
          {booking.pooja?.hindi ? <Text style={s.poojaSub}>{booking.pooja.hindi}</Text> : null}

          {/* Confirmed Schedule & Address */}
          <View style={s.detailRow}>
            <Ionicons name="calendar-outline" size={15} color="#67101F" />
            <Text style={s.detailText}>
              {booking.scheduledAt || 'Confirmed Muhurat'}
            </Text>
          </View>

          <View style={s.detailRow}>
            <Ionicons name="location-outline" size={15} color="#67101F" />
            <Text style={s.detailText} numberOfLines={1}>
              {booking.address || booking.area || 'Service Address'}
            </Text>
          </View>

          {/* Samagri Preference */}
          <View style={s.samagriPillRow}>
            <View style={s.samagriPill}>
              <MaterialCommunityIcons
                name={booking.withSamagri ? 'package-variant-closed' : 'account-check'}
                size={14}
                color="#A05E0A"
              />
              <Text style={s.samagriPillText}>
                Samagri: {booking.withSamagri ? 'Pandit will bring (Pure combo)' : 'Arranged by Yajman'}
              </Text>
            </View>
          </View>

          {/* Dakshina Snapshot */}
          <View style={s.dakshinaRow}>
            <Text style={s.dakshinaLabel}>Total Dakshina</Text>
            <Text style={s.dakshinaAmount}>₹ {(booking.total || 2500).toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View style={[s.bottomActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={s.cancelBtn}
          onPress={handleCancelSearch}
          activeOpacity={0.85}
        >
          <Ionicons name="close-circle-outline" size={18} color="#B91C1C" />
          <Text style={s.cancelBtnText}>Cancel Request (100% Refund)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#67101F',
  },
  headerSub: {
    fontSize: 11,
    color: '#8A6E58',
    marginTop: 1,
  },
  waveContainer: {
    marginTop: 6,
  },
  wavePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#F3DAB5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
  },
  blinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D48B28',
  },
  waveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A05E0A',
    letterSpacing: 0.5,
  },
  radarBox: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#D48B28',
    backgroundColor: 'rgba(212, 139, 40, 0.08)',
  },
  centerCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#D48B28',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  card: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    ...shadow,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EC',
    borderWidth: 1,
    borderColor: '#EADCCE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D48B28',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A05E0A',
    letterSpacing: 0.5,
  },
  refId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6E58',
  },
  poojaTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '800',
    color: '#3A1208',
  },
  poojaSub: {
    fontSize: 12,
    color: '#A05E0A',
    fontWeight: '600',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#755848',
    fontWeight: '600',
    flex: 1,
  },
  samagriPillRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EEE6',
  },
  samagriPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  samagriPillText: {
    fontSize: 11,
    color: '#755848',
    fontWeight: '600',
  },
  dakshinaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: '#EADBCE',
  },
  dakshinaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6E58',
  },
  dakshinaAmount: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '900',
    color: '#67101F',
  },
  bottomActions: {
    width: '92%',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 20,
    paddingVertical: 12,
    width: '100%',
    gap: 6,
    ...shadow,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  demoBtn: {
    paddingVertical: 6,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A05E0A',
    textDecorationLine: 'underline',
  },
  timeoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    ...shadow,
  },
  timeoutIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    borderWidth: 2,
    borderColor: '#D48B28',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeoutTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#67101F',
    textAlign: 'center',
  },
  timeoutSub: {
    fontSize: 13,
    color: '#755848',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },
  refundBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  refundText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67101F',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    gap: 8,
    ...shadow,
  },
  scheduleBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  homeBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6E58',
  },
  subText: {
    fontSize: 14,
    color: '#755848',
  },
  backBtn: {
    marginTop: 14,
    backgroundColor: '#67101F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
