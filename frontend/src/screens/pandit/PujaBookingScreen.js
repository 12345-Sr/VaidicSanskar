import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { getCurrentUserLocation } from '../../services/mapplsService';

const TIME_SLOTS = [
  '06:30 AM - 08:30 AM',
  '08:30 AM - 10:30 AM',
  '10:30 AM - 12:30 PM',
  '03:00 PM - 05:00 PM',
  '05:30 PM - 07:30 PM',
  '07:30 PM - 09:30 PM',
];

const STANDARD_SAMAGRI_CHECKLIST = [
  { item: 'Gangajal & Panchamrit (Milk, Curd, Ghee, Honey, Sugar)', qty: '1 set' },
  { item: 'Roli, Chandan, Kumkum & Akshat (Rice)', qty: '50g each' },
  { item: 'Mouli (Kalava), Janeu & Betel Nuts (Supari)', qty: '5 pieces' },
  { item: 'Coconuts (Nariyal with water & dry)', qty: '2 pieces' },
  { item: 'Fresh Flowers, Tulsi Patra, Bel Patra & Durva grass', qty: 'Fresh' },
  { item: 'Brass Kalash, Copper Plate, Diya & Cow Ghee', qty: '1 setup' },
  { item: 'Dhoop, Agarbatti, Camphor (Kapur) & Matchbox', qty: '1 pack' },
  { item: 'Seasonal Fresh Fruits & Sweets for Bhog', qty: '5 varieties' },
  { item: 'Dry Havan Samidha Wood & Havan Samagri Herbs', qty: '1 kg (For Havan)' },
];

export default function PujaBookingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const { isHindi } = useLanguage();

  const passedPuja = route?.params?.puja || {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    price: 2500,
    samagri: 600,
    duration: '1.5 - 2 hrs',
    tagline: 'For family harmony, peace & prosperity',
  };

  // Calendar dates (next 7 days)
  const availableDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return {
        formatted: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dateNum: d.getDate(),
      };
    });
  }, []);

  // Form states
  const [selectedDate, setSelectedDate] = useState(availableDates[0]?.formatted || '');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [address, setAddress] = useState(user?.address || 'वर्तमान स्थान (Live Location)');
  const [area, setArea] = useState(user?.city || 'निकटतम क्षेत्र');
  const [landmark, setLandmark] = useState('');
  const [pinCoordinates, setPinCoordinates] = useState({ lat: 28.5355, lng: 77.3910 });
  const [fetchingGps, setFetchingGps] = useState(false);

  // Requirements
  const [participants, setParticipants] = useState('4');
  const [language, setLanguage] = useState('Hindi & Sanskrit');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [yajmanName, setYajmanName] = useState(user?.name || 'यजमान');
  const [gotra, setGotra] = useState(user?.gotra || 'काश्यप');

  // Samagri Option (Explicit Option A vs Option B)
  // 'PANDIT_BRINGS' (Option A) or 'USER_ARRANGES' (Option B)
  const [samagriOption, setSamagriOption] = useState('PANDIT_BRINGS');
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);

  // Auto-fetch GPS location on mount
  useEffect(() => {
    (async () => {
      try {
        setFetchingGps(true);
        const res = await getCurrentUserLocation();
        if (res?.coords) {
          if (res.coords.formattedAddress) {
            setAddress(res.coords.formattedAddress);
          }
          if (res.coords.locality || res.coords.subLocality) {
            setArea(`${res.coords.subLocality || ''}, ${res.coords.locality || ''}`.replace(/^, /, ''));
          }
          setPinCoordinates({
            lat: res.coords.latitude || 28.5355,
            lng: res.coords.longitude || 77.3910,
          });
        }
      } catch (e) {
        console.log('GPS notice:', e);
      } finally {
        setFetchingGps(false);
      }
    })();
  }, []);

  const handleProceedToSummary = () => {
    if (!yajmanName.trim()) {
      return Alert.alert('Required', 'Please enter Yajman full name.');
    }
    if (!address.trim()) {
      return Alert.alert('Required', 'Please enter service address.');
    }

    const bookingDraft = {
      ritualId: passedPuja.id,
      ritualName: passedPuja.name,
      serviceCharge: passedPuja.price,
      duration: passedPuja.duration,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      serviceAddress: address.trim(),
      serviceArea: area.trim(),
      landmark: landmark.trim(),
      latitude: pinCoordinates.lat,
      longitude: pinCoordinates.lng,
      participantsCount: Number(participants) || 1,
      preferredLanguage: language,
      specialInstructions: specialInstructions.trim(),
      yajmanName: yajmanName.trim(),
      gotra: gotra.trim(),
      samagriPreference: samagriOption,
      samagriFee: samagriOption === 'PANDIT_BRINGS' ? passedPuja.samagri : 0,
      samagriChecklist: STANDARD_SAMAGRI_CHECKLIST,
    };

    // Navigate to Screen 4: Booking Summary and Confirmation
    navigation.navigate('BookingReview', { bookingDraft });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF5EE" translucent={false} />

      {/* Header */}
      <View style={[s.topHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#67101F" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Confirm Requirements</Text>
          <Text style={s.headerSubtitle}>{passedPuja.name}</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Ritual Preview */}
        <View style={s.ritualPreviewCard}>
          <View style={s.ritualIconWrap}>
            <MaterialCommunityIcons name="fire" size={28} color="#D48B28" />
          </View>
          <View style={s.ritualInfo}>
            <Text style={s.ritualName}>{passedPuja.name}</Text>
            <Text style={s.ritualMeta}>
              Duration: {passedPuja.duration} • Base Dakshina: ₹ {passedPuja.price.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* 1. Date Selection */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.dateScroll}>
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.formatted;
              return (
                <TouchableOpacity
                  key={item.formatted}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDate(item.formatted)}
                  style={[s.datePill, isSelected && s.datePillActive]}
                >
                  <Text style={[s.dateDayName, isSelected && s.dateTextActive]}>{item.dayName}</Text>
                  <Text style={[s.dateNum, isSelected && s.dateTextActive]}>{item.dateNum}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 2. Preferred Start Time Slot */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Preferred Time Slot</Text>
          <View style={s.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTime(slot)}
                  style={[s.timeSlotCard, isSelected && s.timeSlotCardActive]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? '#FFFFFF' : '#67101F'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[s.timeSlotText, isSelected && s.timeSlotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Service Address & Map Pin */}
        <View style={s.section}>
          <View style={s.sectionLabelRow}>
            <Text style={s.sectionLabel}>Service Address & Map Pin</Text>
            {fetchingGps && <Text style={s.gpsNotice}>Fetching GPS...</Text>}
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="location-sharp" size={20} color="#67101F" style={{ marginRight: 8, marginTop: 4 }} />
            <TextInput
              style={s.textInputMulti}
              value={address}
              onChangeText={setAddress}
              placeholder="House/Flat No., Building, Street Name"
              placeholderTextColor="#A08E90"
              multiline
            />
          </View>

          <View style={s.twoColRow}>
            <View style={[s.inputWrap, { flex: 1 }]}>
              <TextInput
                style={s.textInput}
                value={area}
                onChangeText={setArea}
                placeholder="Locality / Area"
                placeholderTextColor="#A08E90"
              />
            </View>
            <View style={[s.inputWrap, { flex: 1 }]}>
              <TextInput
                style={s.textInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Nearby Landmark"
                placeholderTextColor="#A08E90"
              />
            </View>
          </View>

          <View style={s.mapPinBadge}>
            <Ionicons name="navigate-circle" size={16} color="#1E8E4A" />
            <Text style={s.mapPinText}>
              Exact Map Pin Locked ({pinCoordinates.lat.toFixed(4)}, {pinCoordinates.lng.toFixed(4)})
            </Text>
          </View>
        </View>

        {/* 4. Samagri Selection (Explicit Option A vs Option B) */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Samagri (Ritual Materials) Selection</Text>

          {/* Option A */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSamagriOption('PANDIT_BRINGS')}
            style={[s.samagriOptionCard, samagriOption === 'PANDIT_BRINGS' && s.samagriCardActive]}
          >
            <View style={s.radioCircle}>
              {samagriOption === 'PANDIT_BRINGS' && <View style={s.radioDot} />}
            </View>
            <View style={s.samagriTextWrap}>
              <View style={s.optionHeaderRow}>
                <Text style={s.optionTitle}>Option A: Pandit will bring samagri</Text>
                <Text style={s.optionPriceTag}>+ ₹ {passedPuja.samagri}</Text>
              </View>
              <Text style={s.optionSub}>
                Pandit ji will bring 100% pure, authentic Vedic samagri, havan wood, pure cow ghee, and sacred ingredients.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option B */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSamagriOption('USER_ARRANGES')}
            style={[s.samagriOptionCard, samagriOption === 'USER_ARRANGES' && s.samagriCardActive]}
          >
            <View style={s.radioCircle}>
              {samagriOption === 'USER_ARRANGES' && <View style={s.radioDot} />}
            </View>
            <View style={s.samagriTextWrap}>
              <View style={s.optionHeaderRow}>
                <Text style={s.optionTitle}>Option B: I will arrange samagri</Text>
                <Text style={[s.optionPriceTag, { color: '#1E8E4A' }]}>₹ 0 (Self)</Text>
              </View>
              <Text style={s.optionSub}>
                You will arrange all items as per the sacred checklist before Pandit ji arrives.
              </Text>
              <TouchableOpacity
                onPress={() => setChecklistModalVisible(true)}
                style={s.viewChecklistBtn}
              >
                <Ionicons name="list" size={14} color="#67101F" style={{ marginRight: 4 }} />
                <Text style={s.viewChecklistText}>Review Samagri Checklist (9 Items)</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. Yajman Details & Special Instructions */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Yajman & Sankalpa Details</Text>
          <View style={s.twoColRow}>
            <View style={[s.inputWrap, { flex: 1.2 }]}>
              <TextInput
                style={s.textInput}
                value={yajmanName}
                onChangeText={setYajmanName}
                placeholder="Yajman Name"
                placeholderTextColor="#A08E90"
              />
            </View>
            <View style={[s.inputWrap, { flex: 0.8 }]}>
              <TextInput
                style={s.textInput}
                value={gotra}
                onChangeText={setGotra}
                placeholder="Gotra"
                placeholderTextColor="#A08E90"
              />
            </View>
          </View>

          <View style={s.twoColRow}>
            <View style={[s.inputWrap, { flex: 1 }]}>
              <TextInput
                style={s.textInput}
                value={participants}
                onChangeText={setParticipants}
                placeholder="Participants (e.g. 4)"
                placeholderTextColor="#A08E90"
                keyboardType="numeric"
              />
            </View>
            <View style={[s.inputWrap, { flex: 1 }]}>
              <TextInput
                style={s.textInput}
                value={language}
                onChangeText={setLanguage}
                placeholder="Language"
                placeholderTextColor="#A08E90"
              />
            </View>
          </View>

          <View style={s.inputWrap}>
            <TextInput
              style={s.textInput}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Special instructions (e.g. Please bring small Havan Kund)"
              placeholderTextColor="#A08E90"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.priceSummaryCol}>
          <Text style={s.priceLabel}>Estimated Total</Text>
          <Text style={s.priceValue}>
            ₹ {(passedPuja.price + (samagriOption === 'PANDIT_BRINGS' ? passedPuja.samagri : 0) + 50).toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleProceedToSummary}
          style={s.proceedBtn}
        >
          <Text style={s.proceedBtnText}>Review Booking  →</Text>
        </TouchableOpacity>
      </View>

      {/* Samagri Checklist Modal */}
      <Modal
        visible={checklistModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChecklistModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Required Samagri Checklist</Text>
            <Text style={s.modalSub}>
              Please ensure you have these sacred items ready before the Pandit arrives:
            </Text>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {STANDARD_SAMAGRI_CHECKLIST.map((item, idx) => (
                <View key={idx} style={s.checklistItemRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#1E8E4A" style={{ marginRight: 10, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.checklistItemName}>{item.item}</Text>
                    <Text style={s.checklistItemQty}>Quantity: {item.qty}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setChecklistModalVisible(false)}
              style={s.checklistDoneBtn}
            >
              <Text style={s.checklistDoneBtnText}>I Will Keep Materials Ready</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FAF5EE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontWeight: '800',
    color: '#2E1418',
    fontFamily: serif,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7D686B',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 18,
  },
  ritualPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE4DA',
  },
  ritualIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ritualInfo: {
    flex: 1,
  },
  ritualName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E1418',
  },
  ritualMeta: {
    fontSize: 12,
    color: '#7D686B',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE4DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E1418',
    marginBottom: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gpsNotice: {
    fontSize: 11.5,
    color: '#D48B28',
    fontWeight: '600',
  },
  dateScroll: {
    marginHorizontal: -4,
  },
  datePill: {
    width: 58,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F7EFE6',
    borderWidth: 1,
    borderColor: '#E8DCD0',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  datePillActive: {
    backgroundColor: '#67101F',
    borderColor: '#67101F',
  },
  dateDayName: {
    fontSize: 11,
    color: '#7D686B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E1418',
    marginTop: 2,
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FDF8F2',
    borderWidth: 1,
    borderColor: '#EDE4DA',
  },
  timeSlotCardActive: {
    backgroundColor: '#67101F',
    borderColor: '#67101F',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E1418',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    backgroundColor: '#FDFBFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDE4DA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#2E1418',
    paddingVertical: 4,
  },
  textInputMulti: {
    flex: 1,
    fontSize: 13.5,
    color: '#2E1418',
    minHeight: 44,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapPinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
    marginTop: 2,
  },
  mapPinText: {
    fontSize: 11.5,
    color: '#137338',
    fontWeight: '600',
  },
  samagriOptionCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDE4DA',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  samagriCardActive: {
    borderColor: '#67101F',
    backgroundColor: '#FFFDFB',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#67101F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#67101F',
  },
  samagriTextWrap: {
    flex: 1,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2E1418',
  },
  optionPriceTag: {
    fontSize: 13,
    fontWeight: '800',
    color: '#67101F',
  },
  optionSub: {
    fontSize: 12,
    color: '#7D686B',
    lineHeight: 16,
  },
  viewChecklistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  viewChecklistText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#67101F',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDE4DA',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  priceSummaryCol: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11.5,
    color: '#7D686B',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E1418',
  },
  proceedBtn: {
    backgroundColor: '#67101F',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D4C8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E1418',
    fontFamily: serif,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12.5,
    color: '#7D686B',
    marginBottom: 16,
    lineHeight: 17,
  },
  checklistItemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE7',
  },
  checklistItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E1418',
  },
  checklistItemQty: {
    fontSize: 11.5,
    color: '#7D686B',
    marginTop: 2,
  },
  checklistDoneBtn: {
    height: 48,
    backgroundColor: '#67101F',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  checklistDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
