import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { Header } from '../../components/ui';
import bhajanMandaliStore, {
  DEMO_MANDALIS,
  MANDALI_OCCASIONS,
} from '../../services/bhajanMandaliStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';
import { MandaliService } from '../../services/api';
import { useAuth } from '../../context/AppContext';

export default function MandaliBookingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const mandali = route.params?.mandali;

  if (!mandali) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Header title="मंडली बुकिंग" navigation={navigation} />
        <MaterialCommunityIcons name="music" size={60} color={colors.textMuted} />
        <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 12, textAlign: 'center' }}>
          मंडली का विवरण उपलब्ध नहीं है। कृपया सूची से मंडली चुनें।
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialViewStatus = route.params?.viewStatus || false;

  const [booking, setBooking] = useState(bhajanMandaliStore.getBooking());
  const [isViewingStatus, setIsViewingStatus] = useState(initialViewStatus);

  const [selectedPkg, setSelectedPkg] = useState(mandali?.packages?.[0] || null);
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('06:00 PM');
  const [occasion, setOccasion] = useState(MANDALI_OCCASIONS[0]);
  const [venueAddress, setVenueAddress] = useState('');
  const [expectedGuests, setExpectedGuests] = useState('');
  const [farmaishSongs, setFarmaishSongs] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [payFull, setPayFull] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [gayanRating, setGayanRating] = useState(5);
  const [soundRating, setSoundRating] = useState(5);
  const [timeRating, setTimeRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['भाव-विभोर कर दिया', 'समय पर आए', 'अच्छा साउंड']);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const unsub = bhajanMandaliStore.subscribe(() => {
      setBooking(bhajanMandaliStore.getBooking() ? { ...bhajanMandaliStore.getBooking() } : null);
    });
    return unsub;
  }, []);

  const packagePrice = selectedPkg.price;
  const platformFee = 250;
  const gst = Math.round((packagePrice + platformFee) * 0.05);
  const total = packagePrice + platformFee + gst;
  const advanceAmount = Math.round(total * 0.20); // 20% advance authorization

  const { user } = useAuth();

  const handleSendRequest = () => {
    bhajanMandaliStore.createBookingRequest({
      mandali,
      package: selectedPkg,
      eventDate,
      startTime,
      occasion,
      venueAddress,
      expectedGuests,
      farmaishSongs,
      specialNote,
      payFull,
    });
    setIsViewingStatus(true);

    // Sync with backend sequential dispatch (/api/partner/mandali/inquiries)
    const futureDate = new Date(Date.now() + 50 * 3600 * 1000);
    const dateStr = eventDate && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)
      ? eventDate
      : futureDate.toISOString().split('T')[0];
    const timeMatch = String(startTime || '').match(/(\d{1,2}):(\d{2})/);
    const timeStr = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : '18:00';

    MandaliService.enquiry({
      name: user?.name || 'Yajman',
      phone: user?.phone || '9876543210',
      eventType: occasion || 'श्री सुंदरकांड पाठ उत्सव',
      eventDate: dateStr,
      eventTime: timeStr,
      location: venueAddress || 'Varanasi',
      latitude: Number(mandali?.location?.coordinates?.[1] || 25.3176),
      longitude: Number(mandali?.location?.coordinates?.[0] || 82.9739),
      guestCount: Number(expectedGuests) || 50,
      budget: total,
      message: specialNote || '',
    }).catch((err) => {
      console.log('Mandali inquiry backend sync notice:', err?.message);
    });

    Alert.alert(
      'अनुरोध भेजा गया! 🙏',
      `मंडली को 24-घंटे का बुकिंग अनुरोध भेज दिया गया है। 20% अग्रिम राशि (₹${advanceAmount}) सुरक्षित होल्ड पर है।`
    );
  };

  const handleCancelRequest = () => {
    const policy = bhajanMandaliStore.cancelBooking('user', 8);
    Alert.alert('अनुरोध रद्द किया गया', policy?.explanation || 'अनुरोध रद्द हो गया है।');
    setIsViewingStatus(false);
  };

  const handleMaskedCall = () => {
    Alert.alert(
      'सुरक्षित मास्क्ड कॉल (Virtual Call)',
      'वर्चुअल नंबर: +91 11 4084 4892\n\nयजमान व मंडली दोनों का मोबाइल नंबर सुरक्षित व छुपा हुआ है।',
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'कॉल मिलाएं', onPress: () => Linking.openURL('tel:+911140844892') },
      ]
    );
  };

  const handleSubmitReview = () => {
    bhajanMandaliStore.submitUserReview({
      rating,
      subRatings: { gayan: gayanRating, sound: soundRating, samay: timeRating },
      tags: selectedTags,
      comment: reviewComment,
    });
    setShowReviewModal(false);
    Alert.alert('धन्यवाद 🙏', 'आपकी समीक्षा मंडली प्रोफाइल पर प्रकाशित कर दी गई है।');
  };

  const formatTimer = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If viewing active status / live tracking view
  if (isViewingStatus && booking) {
    return (
      <View style={s.container}>
        <Header
          title="मंडली बुकिंग स्थिति"
          subtitle={`स्थिति: ${booking.status}`}
          navigation={navigation}
          right={
            <TouchableOpacity onPress={() => setIsViewingStatus(false)}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                विवरण देखें
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Mandali Summary Card */}
          <View style={s.card}>
            <View style={s.topSummaryRow}>
              <Image source={resolveDevotionalSource(booking.mandali.coverImage, 'bhajan_mandali')} style={s.miniCover} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.summaryTitle}>{booking.mandali.nameHi}</Text>
                <Text style={s.summaryMeta}>
                  मुखिया: {booking.mandali.leaderName} · {booking.package.name}
                </Text>
                <Text style={s.summaryDate}>
                  📅 {booking.eventDate} ({booking.startTime}) · {booking.occasion}
                </Text>
              </View>
            </View>

            {/* In-app Chat & Virtual Call Buttons */}
            {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) && (
              <View style={s.commRow}>
                <TouchableOpacity style={s.commBtn} onPress={handleMaskedCall}>
                  <MaterialCommunityIcons name="phone-lock" size={18} color="#15803D" />
                  <Text style={[s.commBtnText, { color: '#15803D' }]}>मास्क्ड कॉल</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.commBtn}
                  onPress={() => navigation.navigate('Chat', { name: booking.mandali.nameHi })}
                >
                  <MaterialCommunityIcons name="chat-outline" size={18} color="#0284C7" />
                  <Text style={[s.commBtnText, { color: '#0284C7' }]}>मंडली से चैट</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* STATUS 1: REQUESTED (24-Hour SLA Countdown) */}
          {booking.status === 'REQUESTED' && (
            <View style={s.statusCard}>
              <View style={s.statusIconCircle}>
                <MaterialCommunityIcons name="timer-sand" size={32} color={colors.primary} />
              </View>
              <Text style={s.statusHeading}>मंडली के उत्तर की प्रतीक्षा है</Text>
              <Text style={s.statusCountdown}>
                ⏰ {booking.expiresInHours} घंटे शेष (24-घंटे का SLA)
              </Text>
              <Text style={s.statusDesc}>
                मंडली के मुखिया को आपका अनुरोध भेज दिया गया है। 24 घंटे में स्वीकृति न मिलने पर
                अग्रिम राशि का होल्ड स्वतः समाप्त हो जाएगा।
              </Text>


              <TouchableOpacity style={s.cancelLinkBtn} onPress={handleCancelRequest}>
                <Text style={s.cancelLinkText}>अनुरोध रद्द करें (100% फ्री)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STATUS 2: ACCEPTED / ON_THE_WAY / ARRIVED -> START OTP CARD */}
          {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED'].includes(booking.status) && (
            <>
              {/* START OTP CARD */}
              <View style={s.otpCard}>
                <View style={s.otpCardTop}>
                  <MaterialCommunityIcons name="shield-key" size={24} color={colors.primary} />
                  <Text style={s.otpCardTitle}>कार्यक्रम आरंभ कोड (Start OTP)</Text>
                </View>
                <Text style={s.otpCodeText}>{booking.startOtp}</Text>
                <Text style={s.otpNotice}>
                  🔒 यह 4-अंकों का कोड कार्यक्रम स्थल पर मंडली के 500m पास पहुँचने पर मुखिया को बताएं।
                </Text>
              </View>

              {/* Status Tracker */}
              <View style={s.card}>
                <Text style={s.trackerTitle}>आगमन स्थिति (Status Timeline):</Text>
                <View style={s.statusItem}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#15803D" />
                  <Text style={s.statusItemText}>बुकिंग स्वीकृत व स्लॉट लॉक ✓</Text>
                </View>
                <View style={s.statusItem}>
                  <MaterialCommunityIcons
                    name={['ON_THE_WAY', 'ARRIVED'].includes(booking.status) ? 'check-circle' : 'circle-outline'}
                    size={18}
                    color={['ON_THE_WAY', 'ARRIVED'].includes(booking.status) ? '#15803D' : '#8C786E'}
                  />
                  <Text style={s.statusItemText}>वाद्य व साउंड सिस्टम के साथ रवाना</Text>
                </View>
                <View style={s.statusItem}>
                  <MaterialCommunityIcons
                    name={booking.status === 'ARRIVED' ? 'check-circle' : 'circle-outline'}
                    size={18}
                    color={booking.status === 'ARRIVED' ? '#15803D' : '#8C786E'}
                  />
                  <Text style={s.statusItemText}>कार्यक्रम स्थल पर आगमन (500m दायरा)</Text>
                </View>

              </View>
            </>
          )}

          {/* STATUS 3: IN_PROGRESS -> LIVE TIMER & END OTP */}
          {booking.status === 'IN_PROGRESS' && (
            <>
              {/* Live Program Running Card */}
              <View style={s.liveRunningCard}>
                <View style={s.liveRunningLeft}>
                  <MaterialCommunityIcons name="microphone-variant" size={26} color="#FFF" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={s.liveRunningTitle}>संकीर्तन / पाठ जारी है 🪘</Text>
                    <Text style={s.liveRunningSub}>{booking.occasion}</Text>
                  </View>
                </View>
                <Text style={s.liveRunningTimer}>
                  {formatTimer(booking.elapsedSeconds)}
                </Text>
              </View>

              {/* Extra Hours Request Banner (if Mandali requested extension) */}
              {booking.extraHoursRequested?.status === 'PENDING' && (
                <View style={s.extraHourCard}>
                  <MaterialCommunityIcons name="clock-plus" size={24} color="#92400E" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.extraHourTitle}>अतिरिक्त समय का अनुरोध (+1 घंटा)</Text>
                    <Text style={s.extraHourSub}>
                      मंडली ने ₹2,500 अतिरिक्त शुल्क पर 1 घंटा और गायन का प्रस्ताव भेजा है।
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.approveExtraBtn}
                    onPress={() => {
                      bhajanMandaliStore.approveExtraHours();
                      Alert.alert('स्वीकृत', '1 अतिरिक्त घंटा कार्यक्रम में जोड़ दिया गया है।');
                    }}
                  >
                    <Text style={s.approveExtraBtnText}>स्वीकार करें</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* END OTP CARD */}
              <View style={s.otpCard}>
                <View style={s.otpCardTop}>
                  <MaterialCommunityIcons name="flag-checkered" size={24} color="#15803D" />
                  <Text style={[s.otpCardTitle, { color: '#15803D' }]}>
                    कार्यक्रम समापन कोड (End OTP)
                  </Text>
                </View>
                <Text style={[s.otpCodeText, { color: '#15803D' }]}>{booking.completeOtp}</Text>
                <Text style={s.otpNotice}>
                  🔒 सम्पूर्ण संकीर्तन व आरती संपन्न होने के बाद यह कोड मंडली मुखिया को बताएं।
                </Text>
              </View>

            </>
          )}

          {/* STATUS 4: COMPLETED -> REVIEW & INVOICE */}
          {booking.status === 'COMPLETED' && (
            <View style={s.completedCard}>
              <MaterialCommunityIcons name="check-decagram" size={56} color="#15803D" />
              <Text style={s.completedTitle}>कार्यक्रम सफलतापूर्वक संपन्न 🙏</Text>
              <Text style={s.completedSub}>
                {booking.mandali.nameHi} द्वारा {booking.occasion} का आयोजन पूर्ण हुआ।
              </Text>

              <TouchableOpacity
                style={s.reviewBtn}
                onPress={() => setShowReviewModal(true)}
              >
                <MaterialCommunityIcons name="star-outline" size={20} color="#FFF" />
                <Text style={s.reviewBtnText}>मंडली का मूल्यांकन करें (Write Review) ›</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* 2-Way Review Modal */}
        <Modal visible={showReviewModal} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.reviewModalSheet}>
              <View style={s.reviewModalHeader}>
                <Text style={s.reviewModalTitle}>मंडली समीक्षा व रेटिंग</Text>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#3A1208" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={s.reviewScoreLabel}>समग्र अनुभव (Overall Stars):</Text>
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map((st) => (
                    <TouchableOpacity key={st} onPress={() => setRating(st)}>
                      <MaterialCommunityIcons
                        name={st <= rating ? 'star' : 'star-outline'}
                        size={36}
                        color={colors.gold}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sub-ratings */}
                <Text style={[s.reviewScoreLabel, { marginTop: 12 }]}>विस्तृत मूल्यांकन:</Text>
                <View style={s.subRatingRow}>
                  <Text style={s.subRatingKey}>गायन व स्वर:</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setGayanRating(s)}>
                        <MaterialCommunityIcons
                          name={s <= gayanRating ? 'star' : 'star-outline'}
                          size={20}
                          color={colors.gold}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.subRatingRow}>
                  <Text style={s.subRatingKey}>वाद्य व साउंड क्वालिटी:</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setSoundRating(s)}>
                        <MaterialCommunityIcons
                          name={s <= soundRating ? 'star' : 'star-outline'}
                          size={20}
                          color={colors.gold}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.subRatingRow}>
                  <Text style={s.subRatingKey}>समय की पाबंदी:</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setTimeRating(s)}>
                        <MaterialCommunityIcons
                          name={s <= timeRating ? 'star' : 'star-outline'}
                          size={20}
                          color={colors.gold}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* PRD Tags */}
                <Text style={[s.reviewScoreLabel, { marginTop: 12 }]}>अनुभव के टैग चुनें:</Text>
                <View style={s.tagsGrid}>
                  {[
                    'भाव-विभोर कर दिया',
                    'समय पर आए',
                    'अच्छा साउंड सिस्टम',
                    'फरमाइश पूरी की',
                    'विनम्र व्यवहार',
                    'उत्कृष्ट झांकी',
                  ].map((t) => {
                    const act = selectedTags.includes(t);
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[s.tagChip, act && s.tagChipActive]}
                        onPress={() => {
                          if (act) setSelectedTags(selectedTags.filter((x) => x !== t));
                          else setSelectedTags([...selectedTags, t]);
                        }}
                      >
                        <Text style={[s.tagChipText, act && s.tagChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  style={s.reviewInput}
                  multiline
                  placeholder="मंडली के गायन व व्यवस्था पर अपनी टिप्पणी लिखें..."
                  placeholderTextColor="#8C786E"
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />

                <TouchableOpacity
                  style={s.submitReviewBtn}
                  onPress={handleSubmitReview}
                >
                  <Text style={s.submitReviewBtnText}>समीक्षा सबमिट करें ›</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // BOOKING FORM VIEW
  return (
    <View style={s.container}>
      <Header
        title={mandali.nameHi}
        subtitle="पैकेज व बुकिंग अनुरोध"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mandali Hero Profile Card */}
        <View style={s.card}>
          <Image source={resolveDevotionalSource(mandali.coverImage, 'bhajan_mandali')} style={s.heroImg} />
          <View style={s.heroProfileBody}>
            <Text style={s.profileTitle}>{mandali.nameHi}</Text>
            <Text style={s.profileLeader}>मुखिया: {mandali.leaderName}</Text>
            <Text style={s.profileAbout}>{mandali.about}</Text>

            <View style={s.instrumentTags}>
              {mandali.instruments.map((ins, i) => (
                <View key={i} style={s.insChip}>
                  <Text style={s.insText}>🪕 {ins}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 1. SELECT PACKAGE */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>1. मंडली पैकेज चुनें (Select Package):</Text>
          {mandali.packages.map((pkg) => {
            const isSel = selectedPkg.id === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[s.pkgCard, isSel && s.pkgCardActive]}
                onPress={() => setSelectedPkg(pkg)}
                activeOpacity={0.88}
              >
                <View style={s.pkgTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.pkgName}>{pkg.name}</Text>
                    <Text style={s.pkgMeta}>
                      ⏱ {pkg.duration} · {pkg.members} सदस्य
                    </Text>
                  </View>
                  <Text style={s.pkgPrice}>₹{pkg.price.toLocaleString('en-IN')}</Text>
                </View>
                <View style={s.pkgInclusions}>
                  {pkg.includes.map((inc, i) => (
                    <Text key={i} style={s.incText}>✓ {inc}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. EVENT DETAILS */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>2. कार्यक्रम विवरण व स्थान:</Text>

          <Text style={s.inputLabel}>उत्सव / अवसर का प्रकार (Occasion):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {MANDALI_OCCASIONS.map((occ) => (
                <TouchableOpacity
                  key={occ}
                  style={[s.occChip, occasion === occ && s.occChipActive]}
                  onPress={() => setOccasion(occ)}
                >
                  <Text style={[s.occText, occasion === occ && s.occTextActive]}>{occ}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>तारीख (Event Date):</Text>
              <TextInput style={s.input} value={eventDate} onChangeText={setEventDate} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>प्रारंभ समय (Time):</Text>
              <TextInput style={s.input} value={startTime} onChangeText={setStartTime} />
            </View>
          </View>

          <Text style={[s.inputLabel, { marginTop: 10 }]}>कार्यक्रम का पूरा पता (Venue Address):</Text>
          <TextInput
            style={[s.input, { height: 60 }]}
            multiline
            value={venueAddress}
            onChangeText={setVenueAddress}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.inputLabel}>अनुमानित मेहमान (Guests):</Text>
              <TextInput
                style={s.input}
                keyboardType="number-pad"
                value={expectedGuests}
                onChangeText={setExpectedGuests}
              />
            </View>
          </View>

          <Text style={[s.inputLabel, { marginTop: 10 }]}>विशेष भजन फरमाइश (Song Requests):</Text>
          <TextInput
            style={s.input}
            placeholder="उदा. कीर्तन की है रात, लल्ला की सुन के मैं आई..."
            placeholderTextColor="#8C786E"
            value={farmaishSongs}
            onChangeText={setFarmaishSongs}
          />

          <Text style={[s.inputLabel, { marginTop: 10 }]}>विशेष निर्देश (Special Note):</Text>
          <TextInput
            style={s.input}
            placeholder="साउंड या बैठने की व्यवस्था से संबंधित..."
            placeholderTextColor="#8C786E"
            value={specialNote}
            onChangeText={setSpecialNote}
          />
        </View>

        {/* 3. PRICE SUMMARY & ADVANCE PAYMENT */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>3. शुल्क विवरण (Price Summary):</Text>
          <View style={s.priceRow}>
            <Text style={s.priceKey}>पैकेज शुल्क ({selectedPkg.name})</Text>
            <Text style={s.priceVal}>₹{packagePrice.toLocaleString('en-IN')}</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceKey}>यात्रा शुल्क (सेवा दायरे में)</Text>
            <Text style={[s.priceVal, { color: '#15803D' }]}>मुफ़्त</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceKey}>प्लेटफॉर्म सेवा शुल्क + GST (5%)</Text>
            <Text style={s.priceVal}>₹{platformFee + gst}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.priceRowTotal}>
            <Text style={s.totalKey}>कुल देय राशि:</Text>
            <Text style={s.totalVal}>₹{total.toLocaleString('en-IN')}</Text>
          </View>

          {/* 20% Advance Authorization Notice */}
          <View style={s.advanceNoticeBox}>
            <MaterialCommunityIcons name="shield-lock" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.advanceTitle}>
                केवल 20% अग्रिम ऑथराइजेशन (₹{advanceAmount.toLocaleString('en-IN')})
              </Text>
              <Text style={s.advanceDesc}>
                मंडली द्वारा स्वीकार करने पर ही अग्रिम राशि कटेगी। शेष राशि कार्यक्रम के दिन देय होगी।
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Request Button */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>
        <View>
          <Text style={s.footerSub}>अग्रिम देय (20%):</Text>
          <Text style={s.footerAmount}>₹{advanceAmount.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity
          style={s.requestBtn}
          activeOpacity={0.85}
          onPress={handleSendRequest}
        >
          <Text style={s.requestBtnText}>बुकिंग अनुरोध भेजें (Send Request) ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    marginBottom: 14,
    ...shadow,
  },
  heroImg: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    backgroundColor: '#FFF4E8',
  },
  heroProfileBody: {
    marginTop: 12,
  },
  profileTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#3A1208',
  },
  profileLeader: {
    fontSize: 12.5,
    color: '#7A6458',
    marginTop: 2,
  },
  profileAbout: {
    fontSize: 12.5,
    color: '#5C4436',
    lineHeight: 18,
    marginTop: 6,
  },
  instrumentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  insChip: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  insText: {
    fontSize: 11,
    color: '#3A1208',
    fontWeight: '600',
  },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '800',
    color: '#3A1208',
    marginBottom: 10,
  },
  pkgCard: {
    backgroundColor: '#FAF7F0',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ECE3D7',
    marginBottom: 10,
  },
  pkgCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4E8',
  },
  pkgTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  pkgName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A1208',
  },
  pkgMeta: {
    fontSize: 11.5,
    color: '#7A6458',
    marginTop: 2,
  },
  pkgPrice: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  pkgInclusions: {
    marginTop: 8,
    gap: 2,
  },
  incText: {
    fontSize: 11.5,
    color: '#5C4436',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6458',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#3A1208',
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  occChip: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  occChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  occText: {
    fontSize: 11,
    color: '#7A6458',
    fontWeight: '600',
  },
  occTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceKey: {
    fontSize: 13,
    color: '#7A6458',
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EDE4',
    marginVertical: 10,
  },
  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalKey: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A1208',
  },
  totalVal: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  advanceNoticeBox: {
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 12,
  },
  advanceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  advanceDesc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECE3D7',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow,
  },
  footerSub: {
    fontSize: 11,
    color: '#8C786E',
  },
  footerAmount: {
    fontFamily: serif,
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  requestBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    ...shadow,
  },
  requestBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  topSummaryRow: {
    flexDirection: 'row',
  },
  miniCover: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFF4E8',
  },
  summaryTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#3A1208',
  },
  summaryMeta: {
    fontSize: 11.5,
    color: '#7A6458',
    marginTop: 2,
  },
  summaryDate: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  commRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EDE4',
  },
  commBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    gap: 6,
  },
  commBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: 14,
    ...shadow,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusHeading: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#3A1208',
  },
  statusCountdown: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 6,
  },
  statusDesc: {
    fontSize: 12.5,
    color: '#7A6458',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  demoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  demoActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelLinkBtn: {
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: 14,
    alignItems: 'center',
    ...shadow,
  },
  otpCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  otpCodeText: {
    fontFamily: serif,
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 8,
    marginVertical: 8,
  },
  otpNotice: {
    fontSize: 11.5,
    color: '#7A6458',
    textAlign: 'center',
  },
  trackerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#3A1208',
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusItemText: {
    fontSize: 12.5,
    color: '#3A1208',
    fontWeight: '600',
  },
  liveRunningCard: {
    backgroundColor: '#3A1208',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    ...shadow,
  },
  liveRunningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveRunningTitle: {
    color: '#FFF8F0',
    fontSize: 15,
    fontWeight: '800',
  },
  liveRunningSub: {
    color: colors.goldLight,
    fontSize: 11.5,
    marginTop: 2,
  },
  liveRunningTimer: {
    fontFamily: serif,
    fontSize: 24,
    fontWeight: '800',
    color: colors.gold,
  },
  extraHourCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  extraHourTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
  },
  extraHourSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  approveExtraBtn: {
    backgroundColor: '#15803D',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  approveExtraBtnText: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    ...shadow,
  },
  completedTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 10,
    textAlign: 'center',
  },
  completedSub: {
    fontSize: 12.5,
    color: '#7A6458',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 8,
    ...shadow,
  },
  reviewBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 10, 5, 0.75)',
    justifyContent: 'flex-end',
  },
  reviewModalSheet: {
    backgroundColor: '#FAF7F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewModalTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: '#3A1208',
  },
  reviewScoreLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A1208',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  subRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 2,
  },
  subRatingKey: {
    fontSize: 12.5,
    color: '#5C4436',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: '#FFF',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  tagChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: 11,
    color: '#7A6458',
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: '#FFF',
  },
  reviewInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    padding: 12,
    height: 70,
    fontSize: 12.5,
    color: '#3A1208',
    marginBottom: 14,
    textAlignVertical: 'top',
  },
  submitReviewBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
