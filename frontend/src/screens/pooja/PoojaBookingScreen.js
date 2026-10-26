import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { panditBookingStore } from '../../services/panditBookingStore';

const TIME_SLOTS = [
  '08:00 AM',
  '10:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
];

const WEEK_DAYS = [
  { day: 'Sun', date: 12 },
  { day: 'Mon', date: 13 },
  { day: 'Tue', date: 14 },
  { day: 'Wed', date: 15 },
  { day: 'Thu', date: 16 },
  { day: 'Fri', date: 17 },
  { day: 'Sat', date: 18 },
];

export default function PoojaBookingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const pooja = route?.params?.pooja || {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    price: 2500,
    samagri: 600,
  };
  const withSamagri = route?.params?.withSamagri !== false;
  const totalAmount = route?.params?.totalPrice || (withSamagri ? 2500 : 1900);

  const [selectedDay, setSelectedDay] = useState(16);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  const handleProceed = () => {
    // Initiate booking in store (status: SEARCHING / Pending)
    const booking = panditBookingStore.createBooking({
      pooja: {
        id: pooja.id,
        name: pooja.name,
        price: totalAmount,
        samagriFee: withSamagri ? 600 : 0,
      },
      scheduledAt: `${selectedDay} Oct 2025 | ${selectedTime}`,
      withSamagri,
      type: 'scheduled',
    });

    // Navigate to Screen 9 (Booking Details / Pending Acceptance)
    navigation.navigate('BookingReview', {
      bookingDraft: {
        pooja,
        scheduledDate: `${selectedDay} Oct 2025`,
        scheduledTime: selectedTime,
        samagriPreference: withSamagri ? 'PANDIT_BRINGS' : 'USER_ARRANGES',
        samagriFee: withSamagri ? 600 : 0,
        totalAmount,
      },
      bookingId: booking?.id || '#VS102456',
      pooja,
      selectedDate: `${selectedDay} Oct 2025`,
      selectedTime,
      withSamagri,
      totalAmount,
    });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#6A141D" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Book Your Pooja</Text>
          <Text style={s.headerSubtitle}>{pooja.name}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: SELECT DATE */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>Select Date</Text>

          {/* Month Navigation */}
          <View style={s.monthRow}>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={18} color="#6A141D" />
            </TouchableOpacity>
            <Text style={s.monthText}>Oct 2025</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-forward" size={18} color="#6A141D" />
            </TouchableOpacity>
          </View>

          {/* Calendar Day Row (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
          <View style={s.calendarRow}>
            {WEEK_DAYS.map((item) => {
              const isSelected = selectedDay === item.date;
              return (
                <TouchableOpacity
                  key={item.date}
                  style={s.dayCol}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDay(item.date)}
                >
                  <Text style={[s.dayName, isSelected && s.dayNameActive]}>
                    {item.day}
                  </Text>
                  <View
                    style={[
                      s.dateCircle,
                      isSelected && s.dateCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.dateNumber,
                        isSelected && s.dateNumberActive,
                      ]}
                    >
                      {item.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION 2: SELECT TIME */}
        <View style={[s.sectionCard, { marginTop: 16 }]}>
          <Text style={s.sectionTitle}>Select Time</Text>

          <View style={s.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[s.timeSlotBtn, isSelected && s.timeSlotBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text
                    style={[
                      s.timeSlotText,
                      isSelected && s.timeSlotTextActive,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* NOTICE: User specifically requested:
            "on booking screen remove pandit detail i donot want ot show when pandit is booked then it shows there"
            Hence, NO pandit preference is shown on this screen!
        */}
      </ScrollView>

      {/* BOTTOM STICKY BAR (MATCHING SCREEN 7) */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.priceBox}>
          <Text style={s.totalLabel}>Total Amount</Text>
          <Text style={s.totalValue}>
            ₹ {totalAmount.toLocaleString('en-IN')}
          </Text>
          <Text style={s.totalSub}>
            {withSamagri ? '(with Samagri + Pandit)' : '(Pandit Dakshina)'}
          </Text>
        </View>

        <TouchableOpacity
          style={s.proceedBtn}
          activeOpacity={0.88}
          onPress={handleProceed}
        >
          <Text style={s.proceedBtnText}>Proceed to Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FAF4E8',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE3D5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E1308',
    fontFamily: serif,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7C6C5E',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EADBCE',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E1308',
    marginBottom: 12,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E1308',
    marginHorizontal: 16,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    color: '#7C6C5E',
    marginBottom: 6,
  },
  dayNameActive: {
    color: '#6A141D',
    fontWeight: '700',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {
    backgroundColor: '#6A141D',
  },
  dateNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E1308',
  },
  dateNumberActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotBtn: {
    width: '31%',
    backgroundColor: '#FAF4E8',
    borderWidth: 1,
    borderColor: '#EADBCE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlotBtnActive: {
    backgroundColor: '#6A141D',
    borderColor: '#6A141D',
  },
  timeSlotText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2E1308',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EADBCE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  priceBox: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 11,
    color: '#7C6C5E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E1308',
    marginTop: 1,
  },
  totalSub: {
    fontSize: 10.5,
    color: '#7C6C5E',
  },
  proceedBtn: {
    backgroundColor: '#6A141D',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
