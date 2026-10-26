import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';

export default function OrderSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const {
    title = 'Pooja Service',
    bookingId = ('#VS' + Math.floor(100000 + Math.random() * 900000)),
    date = 'Scheduled Date',
    time = 'Scheduled Slot',
  } = route?.params || {};

  return (
    <View style={[s.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* TOP SACRED GLOWING OM ARTWORK (MATCHING SCREEN 10) */}
      <View style={s.auraWrapper}>
        <View style={s.outerAura}>
          <View style={s.innerAura}>
            <MaterialCommunityIcons name="om" size={48} color="#D48817" />
          </View>
        </View>
      </View>

      {/* TITLE & CONFIRMATION SUBTITLE */}
      <Text style={s.confirmedTitle}>Booking Confirmed!</Text>
      <Text style={s.confirmedSub}>
        Your {title} has been{'\n'}successfully booked.
      </Text>

      {/* BOOKING ID CARD (MATCHING SCREEN 10) */}
      <View style={s.bookingCard}>
        <Text style={s.bookingIdLabel}>Booking ID</Text>
        <Text style={s.bookingIdValue}>{bookingId}</Text>
        <View style={s.cardDivider} />
        <Text style={s.dateTimeValue}>
          {date}  |  {time}
        </Text>
      </View>

      {/* ACTION BUTTONS */}
      <View style={s.actionsWrap}>
        {/* Button 1: View Booking Details (Deep Maroon) */}
        <TouchableOpacity
          style={s.viewDetailsBtn}
          activeOpacity={0.88}
          onPress={() => {
            if (bookingId && !bookingId.startsWith('#VS')) {
              navigation.replace('BookingStatus', { bookingId });
            } else {
              navigation.navigate('Main', { screen: 'Bookings' });
            }
          }}
        >
          <Text style={s.viewDetailsBtnText}>View Booking Details</Text>
        </TouchableOpacity>

        {/* Button 2: Back to Home (Outline / Cream) */}
        <TouchableOpacity
          style={s.backHomeBtn}
          activeOpacity={0.88}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
        >
          <Text style={s.backHomeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER BLESSING TEXT (MATCHING SCREEN 10) */}
      <View style={s.blessingWrap}>
        <Text style={s.blessingText}>
          May your prayers be always heard{'\n'}and your home be filled with peace.
        </Text>
        <Text style={s.diyaIcon}>🪔</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  auraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  outerAura: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FCEFD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerAura: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FDE0A4',
    borderWidth: 1.5,
    borderColor: '#D48817',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E1308',
    fontFamily: serif,
    textAlign: 'center',
  },
  confirmedSub: {
    fontSize: 14,
    color: '#7C6C5E',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bookingCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EADBCE',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 26,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#7C6C5E',
  },
  bookingIdValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E1308',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cardDivider: {
    width: '80%',
    height: 1,
    backgroundColor: '#EADBCE',
    marginVertical: 12,
  },
  dateTimeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6A141D',
  },
  actionsWrap: {
    width: '100%',
    marginTop: 30,
  },
  viewDetailsBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
  backHomeBtn: {
    height: 50,
    backgroundColor: '#FAF4E8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EADBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHomeBtnText: {
    color: '#2E1308',
    fontSize: 15,
    fontWeight: '700',
  },
  blessingWrap: {
    alignItems: 'center',
    marginTop: 26,
  },
  blessingText: {
    fontSize: 12,
    color: '#8C7A68',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  diyaIcon: {
    fontSize: 16,
    marginTop: 6,
  },
});
