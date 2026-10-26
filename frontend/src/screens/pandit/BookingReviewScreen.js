import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { serif, shadow } from '../../theme/styles';
import { panditBookingStore } from '../../services/panditBookingStore';
import { useAuth } from '../../context/AppContext';
import { BookingService } from '../../services/api';

export default function BookingReviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const draft = route?.params?.bookingDraft || route?.params || {};
  const pooja = draft.pooja || route?.params?.pooja || {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    hindi: 'श्री सत्यनारायण महापूजा',
    price: 2500,
    samagri: 600,
    duration: '2 - 2.5 hrs',
  };

  const scheduledDate = draft.scheduledDate || 'Tomorrow';
  const scheduledTime = draft.scheduledTime || '09:00 AM - 11:30 AM';
  const serviceAddress = draft.serviceAddress || user?.address || 'वर्तमान स्थान (Live Location)';
  const serviceArea = draft.serviceArea || user?.city || 'निकटतम क्षेत्र';
  const landmark = draft.landmark || '';
  const specialInstructions = draft.specialInstructions || '';
  const participantsCount = draft.participantsCount || 4;
  const preferredLanguage = draft.preferredLanguage || 'Hindi & Sanskrit';
  const yajmanName = draft.yajmanName || user?.name || 'यजमान';
  const gotra = draft.gotra || 'काश्यप';

  // Samagri preference: 'PANDIT_BRINGS' vs 'USER_ARRANGES'
  const isPanditSamagri = draft.samagriPreference !== 'USER_ARRANGES';
  const samagriFee = isPanditSamagri ? (draft.samagriFee || pooja.samagri || 600) : 0;
  const samagriChecklist = draft.samagriChecklist || [
    'हल्दी, कुमकुम, अबीर, गुलाल',
    'चंदन पावडर व अष्टगंध',
    'कपूर व अगरबत्ती',
    'सुपारी (11 नग) व लौंग-इलायची',
    'मौली / कलावा (2 रील)',
    'शुद्ध गाय का घी (250 ग्राम)',
    'हवन सामग्री (500 ग्राम)',
    'पंचामृत (दूध, दही, घी, शहद, गंगाजल)',
    'ताजे पीले व लाल पुष्प, दूर्वा, तुलसी दल',
  ];

  // Pricing calculations
  const serviceCharge = pooja.price || 2500;
  const travelFee = 0; // Included complimentary for nearby pandits
  const platformFee = 50;
  const taxes = Math.round((serviceCharge + samagriFee + platformFee) * 0.05); // 5% GST
  const totalPayable = serviceCharge + samagriFee + travelFee + platformFee + taxes;

  // Payment method selection
  const [paymentOption, setPaymentOption] = useState('UPI_ADVANCE'); // 'UPI_ADVANCE' | 'PAY_AFTER'
  const [submitting, setSubmitting] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Debounced Confirm and Find Pandit
  const handleConfirmAndFindPandit = async () => {
    if (submitting) return; // Prevent duplicate taps
    setSubmitting(true);

    try {
      // 1. Prepare booking creation payload
      const bookingPayload = {
        ritualId: pooja.id,
        ritualName: pooja.name,
        pooja,
        scheduledDate,
        scheduledTime,
        serviceAddress,
        serviceArea,
        landmark,
        latitude: draft.latitude || 28.5355,
        longitude: draft.longitude || 77.3910,
        participantsCount,
        preferredLanguage,
        specialInstructions,
        yajmanName,
        gotra,
        samagriPreference: isPanditSamagri ? 'PANDIT_BRINGS' : 'USER_ARRANGES',
        samagriFee,
        serviceCharge,
        travelFee,
        platformFee,
        taxes,
        totalAmount: totalPayable,
        paymentOption,
        withSamagri: isPanditSamagri,
      };

      // 2. Initialize local reactive booking store for instant UX
      const createdBooking = panditBookingStore.createBooking({
        pooja,
        type: 'scheduled',
        scheduledAt: `${scheduledDate}, ${scheduledTime}`,
        address: serviceAddress,
        area: serviceArea,
        landmark,
        language: preferredLanguage,
        yajmanName,
        gotra,
        specialNote: specialInstructions,
        withSamagri: isPanditSamagri,
        samagriFee,
        serviceCharge,
        platformFee,
        total: totalPayable,
        advancePaid: paymentOption === 'UPI_ADVANCE' ? totalPayable : 0,
      });

      // 3. Real-time sync with backend API (/api/partner/bookings)
      let targetBookingId = createdBooking.id;
      try {
        const res = await BookingService.create(bookingPayload);
        const serverBooking = res?.booking || res;
        if (serverBooking?._id || serverBooking?.id) {
          targetBookingId = String(serverBooking._id || serverBooking.id);
          createdBooking.id = targetBookingId;
        }
      } catch (netErr) {
        console.log('Backend booking sync notice:', netErr?.message);
      }

      // 4. Transition immediately to Screen 5: Finding a Pandit
      navigation.replace('Searching', {
        bookingId: targetBookingId,
        booking: createdBooking,
      });
    } catch (e) {
      Alert.alert('Error', 'Unable to initiate pandit search. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF5EE" translucent={false} />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#67101F" />
        </TouchableOpacity>
        <View style={s.headerTitleBox}>
          <Text style={s.headerTitle}>Booking Summary</Text>
          <Text style={s.headerSubTitle}>Review before finding pandit</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. POOJA HERO CARD */}
        <View style={s.card}>
          <View style={s.poojaHeaderRow}>
            <View style={s.omBadge}>
              <Text style={s.omText}>🕉</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.poojaName}>{pooja.name}</Text>
              {pooja.hindi && <Text style={s.poojaHindi}>{pooja.hindi}</Text>}
              <View style={s.metaRow}>
                <Ionicons name="time-outline" size={14} color="#A05E0A" />
                <Text style={s.metaText}>{pooja.duration || '2 - 2.5 hrs'}</Text>
                <Text style={s.dot}>•</Text>
                <Ionicons name="people-outline" size={14} color="#A05E0A" />
                <Text style={s.metaText}>{participantsCount} Participants</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. DATE & SERVICE ADDRESS */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Schedule & Location</Text>

          <View style={s.infoRow}>
            <View style={s.iconCircle}>
              <Ionicons name="calendar-outline" size={18} color="#67101F" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Date & Muhurat</Text>
              <Text style={s.infoValue}>{scheduledDate}  •  {scheduledTime}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.infoRow}>
            <View style={s.iconCircle}>
              <Ionicons name="location-outline" size={18} color="#67101F" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Service Destination (GPS Confirmed)</Text>
              <Text style={s.infoValue} numberOfLines={2}>{serviceAddress}</Text>
              {landmark ? <Text style={s.landmarkText}>Landmark: {landmark}</Text> : null}
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.infoRow}>
            <View style={s.iconCircle}>
              <MaterialCommunityIcons name="account-heart-outline" size={18} color="#67101F" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.infoLabel}>Yajman & Gotra</Text>
              <Text style={s.infoValue}>{yajmanName}  •  Gotra: {gotra}</Text>
            </View>
          </View>
        </View>

        {/* 3. SAMAGRI ARRANGEMENT */}
        <View style={s.card}>
          <View style={s.samagriHeader}>
            <Text style={s.sectionTitle}>Samagri Arrangement</Text>
            {isPanditSamagri ? (
              <View style={s.badgePandit}>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                <Text style={s.badgePanditText}>Pandit Brings Samagri</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={s.badgeUser}
                onPress={() => setShowChecklistModal(true)}
              >
                <Ionicons name="list" size={14} color="#A05E0A" />
                <Text style={s.badgeUserText}>View Checklist</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.samagriDesc}>
            {isPanditSamagri
              ? 'Complete certified pure Vedic samagri kit (Havan samagri, pure desi cow ghee, dhoop, agarbatti, kalash, roli, etc.) will be brought by the pandit.'
              : 'You have chosen to arrange the samagri. Tap "View Checklist" to ensure all 9 essential Vedic materials are prepared before ritual commencement.'}
          </Text>

          {specialInstructions ? (
            <View style={s.instructionsBox}>
              <Text style={s.instructionsTitle}>Special Instructions:</Text>
              <Text style={s.instructionsText}>{specialInstructions}</Text>
            </View>
          ) : null}
        </View>

        {/* 4. PAYMENT & DAKSHINA BREAKDOWN */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Bill Details & Dakshina</Text>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Pooja Dakshina (Ritual Fee)</Text>
            <Text style={s.billValue}>₹ {serviceCharge.toLocaleString('en-IN')}</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>
              {isPanditSamagri ? 'Samagri Package (Pure Combo)' : 'Samagri (Arranged by Yajman)'}
            </Text>
            <Text style={[s.billValue, !isPanditSamagri && { color: '#15803D' }]}>
              {isPanditSamagri ? `₹ ${samagriFee.toLocaleString('en-IN')}` : 'FREE (Self)'}
            </Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Pandit Travel Allowance</Text>
            <Text style={[s.billValue, { color: '#15803D' }]}>FREE (Complimentary)</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Platform & Verification Fee</Text>
            <Text style={s.billValue}>₹ {platformFee}</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Taxes (5% GST)</Text>
            <Text style={s.billValue}>₹ {taxes}</Text>
          </View>

          <View style={s.totalDivider} />

          <View style={s.totalRow}>
            <View>
              <Text style={s.totalLabel}>Total Payable Amount</Text>
              <Text style={s.totalSub}>Inclusive of all Vedic dakshina & taxes</Text>
            </View>
            <Text style={s.totalAmount}>₹ {totalPayable.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* 5. PAYMENT POLICY CHOICE */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Payment Preference</Text>
          <TouchableOpacity
            style={[s.paymentOptionCard, paymentOption === 'UPI_ADVANCE' && s.paymentOptionActive]}
            onPress={() => setPaymentOption('UPI_ADVANCE')}
            activeOpacity={0.8}
          >
            <View style={s.radioCircle}>
              {paymentOption === 'UPI_ADVANCE' && <View style={s.radioInner} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.paymentTitle}>Pay Advance via UPI / Card (Recommended)</Text>
              <Text style={s.paymentSub}>Guaranteed assignment · 100% Instant Refund if pandit unavailable</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.paymentOptionCard, paymentOption === 'PAY_AFTER' && s.paymentOptionActive, { marginTop: 10 }]}
            onPress={() => setPaymentOption('PAY_AFTER')}
            activeOpacity={0.8}
          >
            <View style={s.radioCircle}>
              {paymentOption === 'PAY_AFTER' && <View style={s.radioInner} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.paymentTitle}>Pay Cash / UPI after Pooja Completion</Text>
              <Text style={s.paymentSub}>Settle directly with verified pandit upon final OTP verification</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. UBER-STYLE DISPATCH PROMISE */}
        <View style={s.guaranteeBox}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#A05E0A" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.guaranteeTitle}>VaidicSanskar Matching Guarantee</Text>
            <Text style={s.guaranteeText}>
              Your request will be dispatched to certified local Pandits matching your ritual requirements. Pandit personal details will be revealed immediately upon acceptance.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.bottomPriceCol}>
          <Text style={s.bottomPriceLabel}>TOTAL DAKSHINA</Text>
          <Text style={s.bottomPriceVal}>₹ {totalPayable.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          style={[s.confirmBtn, submitting && s.btnDisabled]}
          activeOpacity={0.85}
          onPress={handleConfirmAndFindPandit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={s.confirmBtnText}>Confirm and Find Pandit</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* SAMAGRI CHECKLIST MODAL (Option B) */}
      <Modal visible={showChecklistModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <MaterialCommunityIcons name="clipboard-check" size={24} color="#67101F" />
              <Text style={s.modalTitle}>Required Samagri Checklist</Text>
              <TouchableOpacity onPress={() => setShowChecklistModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#67101F" />
              </TouchableOpacity>
            </View>
            <Text style={s.modalSubtitle}>
              Please ensure you keep these items ready before the pandit arrives at your premises:
            </Text>

            <ScrollView style={{ maxHeight: 320, marginVertical: 12 }}>
              {samagriChecklist.map((item, idx) => (
                <View key={idx} style={s.checkItemRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#15803D" style={{ marginRight: 10 }} />
                  <Text style={s.checkItemText}>{item}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={s.modalDoneBtn}
              onPress={() => setShowChecklistModal(false)}
            >
              <Text style={s.modalDoneBtnText}>I Will Keep These Ready</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FAF5EE',
    borderBottomWidth: 1,
    borderBottomColor: '#EADBCE',
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
    ...shadow,
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#67101F',
  },
  headerSubTitle: {
    fontSize: 11,
    color: '#8A6E58',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    ...shadow,
  },
  poojaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  omBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF5E6',
    borderWidth: 1.5,
    borderColor: '#D48B28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omText: {
    fontSize: 26,
  },
  poojaName: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '800',
    color: '#3A1208',
  },
  poojaHindi: {
    fontSize: 13,
    color: '#A05E0A',
    fontWeight: '600',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#755848',
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: '#C4B5A5',
  },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 14,
    fontWeight: '800',
    color: '#67101F',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#8A6E58',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    marginTop: 2,
  },
  landmarkText: {
    fontSize: 11,
    color: '#A05E0A',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F4ECE1',
    marginVertical: 12,
  },
  samagriHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePandit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgePanditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgeUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeUserText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A05E0A',
  },
  samagriDesc: {
    fontSize: 12,
    color: '#755848',
    lineHeight: 18,
    marginTop: 6,
  },
  instructionsBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D48B28',
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#67101F',
  },
  instructionsText: {
    fontSize: 12,
    color: '#3A1208',
    marginTop: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  billLabel: {
    fontSize: 13,
    color: '#755848',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
  },
  totalDivider: {
    height: 1.5,
    backgroundColor: '#EADCCE',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '800',
    color: '#67101F',
  },
  totalSub: {
    fontSize: 11,
    color: '#8A6E58',
    marginTop: 2,
  },
  totalAmount: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: '900',
    color: '#67101F',
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EFE4D6',
  },
  paymentOptionActive: {
    borderColor: '#67101F',
    backgroundColor: '#FFF9F6',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#67101F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#67101F',
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
  },
  paymentSub: {
    fontSize: 11,
    color: '#755848',
    marginTop: 2,
  },
  guaranteeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8EC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3DAB5',
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A05E0A',
  },
  guaranteeText: {
    fontSize: 11,
    color: '#755848',
    lineHeight: 16,
    marginTop: 3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EADBCE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    ...shadow,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A6E58',
    letterSpacing: 0.5,
  },
  bottomPriceVal: {
    fontFamily: serif,
    fontSize: 19,
    fontWeight: '900',
    color: '#67101F',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67101F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    minWidth: 210,
    ...shadow,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '800',
    color: '#67101F',
    flex: 1,
    marginLeft: 10,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#755848',
    marginTop: 8,
    lineHeight: 17,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EEE6',
  },
  checkItemText: {
    fontSize: 13,
    color: '#3A1208',
    flex: 1,
  },
  modalDoneBtn: {
    backgroundColor: '#67101F',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
