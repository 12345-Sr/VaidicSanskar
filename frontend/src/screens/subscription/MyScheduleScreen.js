import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import dailyPanditStore from '../../services/dailyPanditStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';

export default function MyScheduleScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState(dailyPanditStore.getSubscription());

  // Modals
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackGiven, setFeedbackGiven] = useState(sub?.todayVisit?.feedbackGiven || false);

  useEffect(() => {
    const unsub = dailyPanditStore.subscribe((s) => {
      setSub(s ? { ...s } : null);
      if (s?.todayVisit?.feedbackGiven) {
        setFeedbackGiven(true);
      }
    });
    return unsub;
  }, []);

  if (!sub) {
    return (
      <View style={[s.centerContainer, { paddingTop: insets.top }]}>
        <MaterialCommunityIcons name="calendar-remove" size={48} color={colors.textMuted} />
        <Text style={s.emptyTitle}>कोई सक्रिय दैनिक पूजा सब्सक्रिप्शन नहीं</Text>
        <TouchableOpacity
          style={s.createSubBtn}
          onPress={() => navigation.navigate('DailyPandit')}
        >
          <Text style={s.createSubBtnText}>नया सब्सक्रिप्शन बनाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const today = sub.todayVisit || {};
  const isRequested = sub.status === 'REQUESTED';

  const handleFeedback = (stars) => {
    setFeedbackRating(stars);
    dailyPanditStore.submitDailyFeedback(stars, ['समय की पाबंदी', 'मधुर आरती']);
    setFeedbackGiven(true);
    Alert.alert('धन्यवाद!', 'आज की पूजा की समीक्षा दर्ज हो गई है।');
  };

  const handleSkipTomorrow = () => {
    Alert.alert(
      'कल की पूजा छोड़ें?',
      'यदि कल दुकान/घर बंद है तो आप 12 घंटे पूर्व पूजा स्थगित कर सकते हैं। इस विज़िट का क्रेडिट अगले बिल में स्वतः घट जाएगा। (महीने में 4 दिन तक निःशुल्क)',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हाँ, स्थगित करें',
          onPress: () => {
            const res = dailyPanditStore.skipVisit('कल');
            setShowManageModal(false);
            Alert.alert(
              'पूजा स्थगित',
              `कल की पूजा स्थगित कर दी गई है। ₹${res.creditAmount} का क्रेडिट आपके अगले बिल में जोड़ दिया गया है।`
            );
          },
        },
      ]
    );
  };

  const handlePause = () => {
    Alert.alert(
      'सब्सक्रिप्शन रोकें (Pause)',
      'यात्रा अथवा लंबी अनुपस्थिति हेतु आप 7 से 30 दिनों के लिए सेवा रोक सकते हैं। आपकी अंतिम तिथि उतने दिन आगे बढ़ जाएगी।',
      [
        { text: 'वापस', style: 'cancel' },
        {
          text: '14 दिन रोकें',
          onPress: () => {
            dailyPanditStore.pauseSubscription(14);
            setShowManageModal(false);
            Alert.alert('सब्सक्रिप्शन रोका गया', 'सेवा 14 दिनों के लिए रोक दी गई है।');
          },
        },
      ]
    );
  };

  const handleCancelSub = () => {
    Alert.alert(
      'सब्सक्रिप्शन रद्द करें?',
      'चालू माह के बचे हुए दिनों का आनुपातिक रिफंड (प्रक्रिया शुल्क ₹199 घटाकर) आपके बैंक खाते में 3-5 कार्यदिवसों में भेज दिया जाएगा।',
      [
        { text: 'नहीं', style: 'cancel' },
        {
          text: 'हाँ, रद्द करें',
          style: 'destructive',
          onPress: () => {
            const res = dailyPanditStore.cancelSubscription('उपभोक्ता अनुरोध');
            setShowManageModal(false);
            Alert.alert(
              'सब्सक्रिप्शन रद्द',
              `रिफंड राशि ₹${res.refundAmount} (बचे दिन: ₹${res.proRataAmount} - शुल्क: ₹${res.processingFee}) आपके स्रोत खाते में भेजी जा रही है।`
            );
          },
        },
      ]
    );
  };

  const handleCallPandit = () => {
    Alert.alert(
      'मास्क्ड कॉल (सुरक्षित संपर्क)',
      `${sub.assignedPandit?.name} से संपर्क किया जा रहा है...\nनंबर: ${sub.assignedPandit?.phoneMasked}`,
      [{ text: 'कॉल करें', onPress: () => Linking.openURL('tel:919400000000') }, { text: 'रद्द' }]
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={s.headerBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.headerTitle}>{sub.siteName}</Text>
          <Text style={s.headerSub}>{sub.slot} • {sub.siteTypeName}</Text>
        </View>
        <TouchableOpacity
          style={s.moreBtn}
          onPress={() => setShowManageModal(true)}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status: REQUESTED (48-hr SLA) */}
        {isRequested && (
          <View style={s.slaPendingCard}>
            <View style={s.slaPendingTop}>
              <View style={s.slaClockIcon}>
                <MaterialCommunityIcons name="account-search" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.slaPendingTitle}>पंडित जी आवंटन प्रगति पर है</Text>
                <Text style={s.slaPendingTimer}>शेष SLA समय: ~42 घंटे 15 मिनट</Text>
              </View>
            </View>
            <Text style={s.slaPendingDesc}>
              हमारी टीम आपके क्षेत्र ({sub.address}) के सर्वोत्तम सत्यापित वैदिक पंडित जी का मार्ग निर्धारित कर रही है।
            </Text>
          </View>
        )}

        {/* Assigned Pandit Card */}
        {sub.assignedPandit && (
          <View style={s.panditCard}>
            <View style={s.panditRow}>
              <Image source={resolveDevotionalSource(sub.assignedPandit.photo, 'vedic_pandit')} style={s.panditAvatar} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={s.panditName}>{sub.assignedPandit.name}</Text>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                </View>
                <Text style={s.panditGurukul}>{sub.assignedPandit.gurukul}</Text>
                <View style={s.panditStatsRow}>
                  <View style={s.panditStatPill}>
                    <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                    <Text style={s.panditStatText}>{sub.assignedPandit.rating} ({sub.assignedPandit.ratingCount})</Text>
                  </View>
                  <View style={s.panditStatPill}>
                    <MaterialCommunityIcons name="clock-check" size={12} color={colors.success} />
                    <Text style={s.panditStatText}>{sub.assignedPandit.onTimeRate} समयबद्ध</Text>
                  </View>
                  <View style={s.panditStatPill}>
                    <Text style={s.panditStatText}>{sub.assignedPandit.expYears} वर्ष अनुभव</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Backup Pandit & Call Actions */}
            <View style={s.panditCardBottom}>
              <View style={{ flex: 1 }}>
                <Text style={s.backupText}>
                  बैकअप पंडित: <Text style={{ fontWeight: '700', color: colors.text }}>{sub.backupPandit?.name || 'पं. अमित जोशी'}</Text>
                </Text>
                <Text style={s.backupSub}>अवकाश पर स्वतः प्रतिस्थापन</Text>
              </View>
              <TouchableOpacity style={s.callBtn} onPress={handleCallPandit}>
                <MaterialCommunityIcons name="phone" size={16} color={colors.primary} />
                <Text style={s.callBtnText}>कॉल (मास्क्ड)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Today's Live Pooja Card */}
        <View style={s.todayCard}>
          <View style={s.todayHeader}>
            <View>
              <Text style={s.todayTitle}>आज की पूजा (Today's Puja)</Text>
              <Text style={s.todayDate}>{today.date} • {today.slotTime}</Text>
            </View>
            <View style={[
              s.statusBadge,
              today.status === 'COMPLETED' && { backgroundColor: '#E8F5E9', borderColor: colors.success },
              today.status === 'IN_PROGRESS' && { backgroundColor: '#FFF3E0', borderColor: colors.warning },
              today.status === 'CHECKED_IN' && { backgroundColor: '#E3F2FD', borderColor: '#2196F3' },
              today.status === 'ON_THE_WAY' && { backgroundColor: '#EDE7F6', borderColor: '#7E57C2' },
              today.status === 'SKIPPED_BY_USER' && { backgroundColor: '#ECEFF1', borderColor: '#90A4AE' },
            ]}>
              <Text style={[
                s.statusBadgeText,
                today.status === 'COMPLETED' && { color: colors.success },
                today.status === 'IN_PROGRESS' && { color: colors.warning },
                today.status === 'CHECKED_IN' && { color: '#1976D2' },
                today.status === 'ON_THE_WAY' && { color: '#5E35B1' },
                today.status === 'SKIPPED_BY_USER' && { color: '#546E7A' },
              ]}>
                {today.status === 'COMPLETED' ? 'पूजा संपन्न ✓' :
                 today.status === 'IN_PROGRESS' ? 'पूजा जारी है • ' + today.durationMinutes + ' min' :
                 today.status === 'CHECKED_IN' ? 'पहुंच गए (QR सत्यापित)' :
                 today.status === 'ON_THE_WAY' ? 'रास्ते में हैं (0.9 km)' :
                 today.status === 'SKIPPED_BY_USER' ? 'आज स्थगित' : 'निर्धारित'}
              </Text>
            </View>
          </View>

          {/* If Completed, show Photo Proof with Watermark */}
          {today.status === 'COMPLETED' && (
            <View style={s.proofContainer}>
              <TouchableOpacity
                style={s.proofImageWrap}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.9}
              >
                <Image
                  source={resolveDevotionalSource(today.photoProofUrl, 'pooja_kit')}
                  style={s.proofImage}
                />
                <View style={s.watermarkOverlay}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#22C55E" />
                  <Text style={s.watermarkText}>{today.photoWatermark}</Text>
                </View>
              </TouchableOpacity>

              <View style={s.proofMetaRow}>
                <View style={s.proofMetaItem}>
                  <Text style={s.proofMetaLabel}>चेक-इन समय</Text>
                  <Text style={s.proofMetaVal}>{today.checkinAt}</Text>
                </View>
                <View style={s.proofMetaItem}>
                  <Text style={s.proofMetaLabel}>पूजा संपन्न</Text>
                  <Text style={s.proofMetaVal}>{today.completedAt}</Text>
                </View>
                <View style={s.proofMetaItem}>
                  <Text style={s.proofMetaLabel}>अवधि</Text>
                  <Text style={s.proofMetaVal}>{today.durationMinutes} मिनट</Text>
                </View>
                <View style={s.proofMetaItem}>
                  <Text style={s.proofMetaLabel}>GPS / QR</Text>
                  <Text style={[s.proofMetaVal, { color: colors.success }]}>सत्यापित ✓</Text>
                </View>
              </View>

              {/* 1-Tap Daily Feedback */}
              <View style={s.feedbackBox}>
                <Text style={s.feedbackPrompt}>आज की पूजा कैसी रही?</Text>
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleFeedback(star)}
                      style={{ padding: 4 }}
                    >
                      <MaterialCommunityIcons
                        name={star <= feedbackRating ? 'star' : 'star-outline'}
                        size={26}
                        color="#F59E0B"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {feedbackGiven && (
                  <Text style={s.feedbackThanks}>समीक्षा दर्ज: उत्कृष्ट उच्चारण व समय की पाबंदी ✓</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Attendance Calendar (हाजिरी कैलेंडर) */}
        <View style={s.calendarCard}>
          <View style={s.calHeader}>
            <View>
              <Text style={s.calTitle}>मासिक उपस्थिति कैलेंडर (अक्टूबर 2026)</Text>
              <Text style={s.calSub}>विज़िट विवरण देखने के लिए किसी भी दिन पर टैप करें</Text>
            </View>
            <View style={s.onTimeBadge}>
              <Text style={s.onTimeText}>98% ऑन-टाइम</Text>
            </View>
          </View>

          {/* Color legend from PRD */}
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#1FA463' }]} />
              <Text style={s.legendLabel}>संपन्न</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#E8A317' }]} />
              <Text style={s.legendLabel}>बैकअप पंडित</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#2563EB' }]} />
              <Text style={s.legendLabel}>उपभोक्ता स्थगित</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#D14343' }]} />
              <Text style={s.legendLabel}>छूटी (क्रेडिट)</Text>
            </View>
          </View>

          {/* Calendar Grid (30 days) */}
          <View style={s.calGrid}>
            {(sub.attendanceCalendar || []).map((dayItem) => {
              const isDone = dayItem.status === 'COMPLETED';
              const isBackup = dayItem.status === 'COMPLETED_BY_BACKUP';
              const isSkipped = dayItem.status === 'SKIPPED_BY_USER';
              const isMissed = dayItem.status === 'MISSED';
              const isToday = dayItem.isToday;

              return (
                <TouchableOpacity
                  key={`day-${dayItem.day}`}
                  style={[
                    s.calDayBox,
                    isToday && s.calTodayBox,
                    isDone && { backgroundColor: '#E8F5E9' },
                    isBackup && { backgroundColor: '#FFF8E1' },
                    isSkipped && { backgroundColor: '#E3F2FD' },
                    isMissed && { backgroundColor: '#FFEBEE' },
                  ]}
                  onPress={() => setSelectedDayDetail(dayItem)}
                >
                  <Text style={[s.calDayNum, isToday && { fontWeight: '900', color: colors.primary }]}>
                    {dayItem.day}
                  </Text>
                  <View style={[
                    s.calDayDot,
                    isDone && { backgroundColor: '#1FA463' },
                    isBackup && { backgroundColor: '#E8A317' },
                    isSkipped && { backgroundColor: '#2563EB' },
                    isMissed && { backgroundColor: '#D14343' },
                    dayItem.status === 'SCHEDULED' && { backgroundColor: '#D1C7BD' },
                  ]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Monthly Attendance summary pills */}
          <View style={s.calSummaryRow}>
            <View style={s.calSummaryCol}>
              <Text style={s.calSummaryNum}>9 / 10</Text>
              <Text style={s.calSummaryLabel}>विज़िट्स पूर्ण</Text>
            </View>
            <View style={s.calSummaryCol}>
              <Text style={s.calSummaryNum}>1 दिन</Text>
              <Text style={s.calSummaryLabel}>बैकअप द्वारा</Text>
            </View>
            <View style={s.calSummaryCol}>
              <Text style={s.calSummaryNum}>1 दिन</Text>
              <Text style={s.calSummaryLabel}>स्थगित (क्रेडिट)</Text>
            </View>
            <View style={s.calSummaryCol}>
              <Text style={[s.calSummaryNum, { color: colors.success }]}>₹0</Text>
              <Text style={s.calSummaryLabel}>छूटी विज़िट्स</Text>
            </View>
          </View>
        </View>

        {/* Quick Management Shortcuts */}
        <View style={s.actionsCard}>
          <Text style={s.actionsCardTitle}>सब्सक्रिप्शन प्रबंधन</Text>
          <View style={s.actionGrid}>
            <TouchableOpacity style={s.actionBtn} onPress={handleSkipTomorrow}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={20} color={colors.primary} />
              <Text style={s.actionBtnTitle}>कल की पूजा छोड़ें</Text>
              <Text style={s.actionBtnSub}>12 घंटे पूर्व • क्रेडिट बचत</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.actionBtn} onPress={handlePause}>
              <MaterialCommunityIcons name="pause-circle-outline" size={20} color={colors.primary} />
              <Text style={s.actionBtnTitle}>सेवा रोकें (Pause)</Text>
              <Text style={s.actionBtnSub}>7-30 दिन यात्रा हेतु</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => {
                Alert.alert(
                  'मासिक डिजिटल उपस्थिति रिपोर्ट व GST बिल',
                  `कंपनी: ${sub.companyName || sub.siteName}\nGSTIN: ${sub.gstin || 'N/A'}\n\nअक्टूबर माह की PDF उपस्थिति रिपोर्ट व GST इनवॉइस आपके ईमेल पर भेज दी गई है।`
                );
              }}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={20} color={colors.primary} />
              <Text style={s.actionBtnTitle}>मासिक रिपोर्ट व बिल</Text>
              <Text style={s.actionBtnSub}>PDF उपस्थिति + GST</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => {
                Alert.alert(
                  'पंडित बदलने का अनुरोध',
                  'क्या आप अपने क्षेत्र के लिए नया पंडित जी आवंटित करवाना चाहते हैं?',
                  [
                    { text: 'रद्द' },
                    {
                      text: 'अनुरोध भेजें',
                      onPress: () => {
                        dailyPanditStore.requestPanditChange();
                        Alert.alert('अनुरोध दर्ज', 'प्रशासक 48 घंटे के भीतर नया आवंटन करेंगे।');
                      },
                    },
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="account-switch-outline" size={20} color={colors.primary} />
              <Text style={s.actionBtnTitle}>पंडित बदलें</Text>
              <Text style={s.actionBtnSub}>समय या भाषा समन्वय</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal visible={!!selectedDayDetail} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>{selectedDayDetail?.date} 2026 विज़िट विवरण</Text>
              <TouchableOpacity onPress={() => setSelectedDayDetail(null)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedDayDetail && (
              <View style={{ marginTop: 12 }}>
                <View style={s.modalStatusRow}>
                  <Text style={s.modalLabel}>स्थिति:</Text>
                  <Text style={s.modalVal}>
                    {selectedDayDetail.status === 'COMPLETED' ? 'सफलतापूर्वक संपन्न ✓' :
                     selectedDayDetail.status === 'COMPLETED_BY_BACKUP' ? 'बैकअप पंडित द्वारा संपन्न' :
                     selectedDayDetail.status === 'SKIPPED_BY_USER' ? 'उपभोक्ता द्वारा स्थगित' : 'निर्धारित'}
                  </Text>
                </View>
                <View style={s.modalStatusRow}>
                  <Text style={s.modalLabel}>पंडित:</Text>
                  <Text style={s.modalVal}>{selectedDayDetail.pandit}</Text>
                </View>
                <View style={s.modalStatusRow}>
                  <Text style={s.modalLabel}>समय व अवधि:</Text>
                  <Text style={s.modalVal}>{selectedDayDetail.time} • {selectedDayDetail.dur}</Text>
                </View>

                {selectedDayDetail.photo && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[s.modalLabel, { marginBottom: 6 }]}>इन-ऐप सत्यापित फोटो प्रमाण:</Text>
                    <Image source={resolveDevotionalSource(selectedDayDetail.photo, 'pooja_kit')} style={s.modalImage} />
                    <Text style={s.modalWatermark}>
                      GPS Geofence + Site QR Verified • {sub.siteName}
                    </Text>
                  </View>
                )}

                {selectedDayDetail.note && (
                  <View style={s.modalNoteBox}>
                    <Text style={s.modalNoteText}>टिप्पणी: {selectedDayDetail.note}</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setSelectedDayDetail(null)}>
              <Text style={s.modalCloseBtnText}>बंद करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Proof Full Modal */}
      <Modal visible={showPhotoModal} transparent animationType="fade">
        <View style={s.fullPhotoOverlay}>
          <TouchableOpacity style={s.photoCloseBtn} onPress={() => setShowPhotoModal(false)}>
            <MaterialCommunityIcons name="close-circle" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Image source={resolveDevotionalSource(today.photoProofUrl, 'pooja_kit')} style={s.fullPhotoImage} resizeMode="contain" />
          <View style={s.fullPhotoWatermark}>
            <Text style={s.fullPhotoWatermarkText}>{today.photoWatermark}</Text>
          </View>
        </View>
      </Modal>

      {/* Subscription Settings Modal */}
      <Modal visible={showManageModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalTop}>
              <Text style={s.modalTitle}>सब्सक्रिप्शन सेटिंग्स</Text>
              <TouchableOpacity onPress={() => setShowManageModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 14 }}>
              <TouchableOpacity style={s.settingRow} onPress={handleSkipTomorrow}>
                <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.settingRowTitle}>आगामी दिन स्थगित करें (Skip Puja)</Text>
                  <Text style={s.settingRowSub}>12 घंटे पूर्व • क्रेडिट अगले बिल में जुड़ेगा</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={s.settingRow} onPress={handlePause}>
                <MaterialCommunityIcons name="pause-circle-outline" size={22} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.settingRowTitle}>सब्सक्रिप्शन रोकें (Pause 7-30 दिन)</Text>
                  <Text style={s.settingRowSub}>यात्रा / नवीनीकरण विस्तार</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={s.settingRow} onPress={handleCancelSub}>
                <MaterialCommunityIcons name="cancel" size={22} color={colors.danger} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.settingRowTitle, { color: colors.danger }]}>सब्सक्रिप्शन रद्द करें</Text>
                  <Text style={s.settingRowSub}>आनुपातिक रिफंड (प्रक्रिया शुल्क ₹199 कटकर)</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setShowManageModal(false)}>
              <Text style={s.modalCloseBtnText}>वापस जाएं</Text>
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
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  createSubBtn: {
    backgroundColor: colors.saffron,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  createSubBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  moreBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  slaPendingCard: {
    backgroundColor: '#FFF7EB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    marginBottom: 16,
    ...shadow(2),
  },
  slaPendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slaClockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE9C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slaPendingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  slaPendingTimer: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 2,
  },
  slaPendingDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 16,
  },
  demoSimulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },
  demoSimulateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  panditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(2),
  },
  panditRow: {
    flexDirection: 'row',
  },
  panditAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.saffron,
  },
  panditName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  panditGurukul: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  panditStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  panditStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  panditStatText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  panditCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  backupText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  backupSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(2),
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  todayDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  proofContainer: {
    marginTop: 4,
  },
  proofImageWrap: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  proofImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proofMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  proofMetaItem: {
    alignItems: 'center',
  },
  proofMetaLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  proofMetaVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  feedbackBox: {
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  feedbackPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  feedbackThanks: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    marginTop: 4,
  },
  simulationToolbar: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  simLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  simButtonsRow: {
    gap: 6,
  },
  simBtn: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(2),
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  calTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  calSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  onTimeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  onTimeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  calDayBox: {
    width: '12.5%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE8DE',
  },
  calTodayBox: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calDayNum: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  calDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  calSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  calSummaryCol: {
    alignItems: 'center',
  },
  calSummaryNum: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  calSummaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  actionsCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    fontFamily: serif,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FAF7F0',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  actionBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
  },
  actionBtnSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    ...shadow(4),
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  modalLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  modalImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
  },
  modalWatermark: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalNoteBox: {
    backgroundColor: '#FFF7EB',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  modalNoteText: {
    fontSize: 11,
    color: colors.text,
  },
  modalCloseBtn: {
    backgroundColor: colors.goldSoft,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  fullPhotoOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullPhotoImage: {
    width: '94%',
    height: '75%',
  },
  fullPhotoWatermark: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullPhotoWatermarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingRowTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  settingRowSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
