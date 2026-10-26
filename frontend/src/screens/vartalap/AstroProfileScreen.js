import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { useLanguage } from '../../context/LanguageContext';
import talkToAstroStore, { RECHARGE_PACKS } from '../../services/talkToAstroStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';
import socket from '../../services/socket';

export default function AstroProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();

  const passedAstro = route.params?.astrologer;
  const astrologerId = route.params?.astrologerId || passedAstro?.id;

  const [astro, setAstro] = useState(
    passedAstro || (astrologerId ? talkToAstroStore.getAstrologerById(astrologerId) : null) || talkToAstroStore.getAstrologers()[0]
  );
  const [wallet, setWallet] = useState(talkToAstroStore.getWallet());
  const [selectedMode, setSelectedMode] = useState('chat'); // 'chat' | 'audio' | 'video'
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const activeChannelRef = useRef(null);
  const timeoutTimerRef = useRef(null);

  useEffect(() => {
    const unsub = talkToAstroStore.subscribe((store) => {
      setWallet({ ...store.getWallet() });
      if (astrologerId) {
        const live = store.getAstrologerById(astrologerId);
        if (live) setAstro({ ...live });
      }
    });
    return unsub;
  }, [astrologerId]);

  useEffect(() => {
    const handleConnected = (payload) => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      setIsRequesting(false);

      const targetRate = Number(astro?.rates?.[selectedMode] || 5);

      // Deduct initial 1 minute (₹5) upon acceptance
      talkToAstroStore.deductMoney(
        targetRate,
        `${astro.name} से ${selectedMode === 'chat' ? 'चैट' : selectedMode === 'audio' ? 'ऑडियो कॉल' : 'वीडियो कॉल'} परामर्श (पहला मिनट)`
      );

      // Initiate single unified "परामर्श" session
      talkToAstroStore.initiateSession({
        astrologerId: astro.id,
        astrologer: astro,
        mode: selectedMode,
        topic: 'परामर्श',
        rate: targetRate,
      });

      if (selectedMode === 'chat') {
        navigation.navigate('AstroChat');
      } else {
        navigation.navigate('Call', {
          astrologer: astro,
          mode: selectedMode,
          channelName: activeChannelRef.current || payload?.channelName,
        });
      }
    };

    const handleDeclined = () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      setIsRequesting(false);
      Alert.alert(
        'अनुरोध अस्वीकार (Request Declined)',
        'ज्योतिषाचार्य वर्तमान में व्यस्त हैं अथवा अनुरोध अस्वीकार कर दिया गया। आपके वॉलेट से कोई शुल्क नहीं काटा गया है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
      );
    };

    socket.on('astro:call:connected', handleConnected);
    socket.on('astro:call:declined', handleDeclined);

    return () => {
      socket.off('astro:call:connected', handleConnected);
      socket.off('astro:call:declined', handleDeclined);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [selectedMode, astro]);

  if (!astro) {
    return (
      <View style={[s.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <MaterialCommunityIcons name="account-search-outline" size={64} color={colors.textMuted} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 16 }}>
          ज्योतिषी विवरण उपलब्ध नहीं है
        </Text>
        <TouchableOpacity
          style={s.backNavBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>वार्तालाप सूची पर लौटें</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rate = Number(astro.rates?.[selectedMode] || astro[`${selectedMode}Rate`] || 5);
  const totalBalance = (wallet.mainBalance || 0) + (wallet.bonusBalance || 0);

  const handleStartConsultation = () => {
    if (!astro.isOnline) {
      Alert.alert(
        'ज्योतिषी ऑफलाइन हैं',
        'यह ज्योतिषाचार्य वर्तमान में ऑफलाइन हैं। कृपया ऑनलाइन ज्योतिषी चुनें अथवा कुछ समय बाद प्रयास करें।'
      );
      return;
    }

    if (totalBalance < rate) {
      setShowRechargeModal(true);
      return;
    }

    const channelName = `astro_${selectedMode}_${Date.now()}`;
    activeChannelRef.current = channelName;
    setIsRequesting(true);

    // Send real-time request to Astrologer Partner App
    socket.emit('astro:call:initiate', {
      channelName,
      recipientId: astro.id,
      caller: {
        id: 'U101',
        name: 'Sratanshu Shukla',
        phone: '+91 63936 20028',
      },
      mode: selectedMode,
      rate,
      topic: 'परामर्श',
    });

    // 45 seconds timeout if astrologer does not answer
    timeoutTimerRef.current = setTimeout(() => {
      setIsRequesting(false);
      socket.emit('astro:call:end', {
        channelName,
        recipientId: astro.id,
      });
      Alert.alert(
        'संपर्क नहीं हो सका',
        'ज्योतिषाचार्य की ओर से उत्तर प्राप्त नहीं हुआ। आपके वॉलेट से कोई शुल्क नहीं काटा गया है। कृपया पुनः प्रयास करें।'
      );
    }, 45000);
  };

  const handleCancelRequest = () => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    setIsRequesting(false);
    if (activeChannelRef.current) {
      socket.emit('astro:call:end', {
        channelName: activeChannelRef.current,
        recipientId: astro.id,
      });
    }
  };

  const handleQuickRecharge = (pack) => {
    talkToAstroStore.rechargeWallet(pack);
    setShowRechargeModal(false);
    Alert.alert(
      'रीचार्ज सफल!',
      `₹${pack.amount} आपके वॉलेट में जुड़ गए हैं (+₹${pack.bonus || 0} बोनस)।\nअब आप परामर्श शुरू कर सकते हैं।`
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Top Navbar */}
      <View style={s.navHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.navTitle} numberOfLines={1}>
          ज्योतिषी विवरण एवं परामर्श
        </Text>
        <TouchableOpacity
          style={s.walletIndicator}
          onPress={() => setShowRechargeModal(true)}
        >
          <MaterialCommunityIcons name="wallet-outline" size={15} color={colors.primary} />
          <Text style={s.walletBalanceText}>₹{totalBalance}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Astrologer Hero Profile Card */}
        <View style={s.heroCard}>
          <View style={s.avatarWrapper}>
            <Image
              source={resolveDevotionalSource(astro.photo, 'jyotish_acharya')}
              style={s.heroAvatar}
            />
            <View
              style={[
                s.presenceBadge,
                { backgroundColor: astro.isOnline ? '#22C55E' : '#9CA3AF' },
              ]}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text style={s.heroName}>{astro.name}</Text>
            <MaterialCommunityIcons name="check-decagram" size={18} color="#2563EB" style={{ marginLeft: 4 }} />
          </View>
          <Text style={s.heroTitle}>{astro.title}</Text>

          {/* Online status pill */}
          <View style={s.statusPill}>
            <View
              style={[
                s.statusDot,
                { backgroundColor: astro.isOnline ? '#16A34A' : '#6B7280' },
              ]}
            />
            <Text style={[s.statusText, { color: astro.isOnline ? '#16A34A' : '#6B7280' }]}>
              {astro.isOnline ? '🟢 ऑनलाइन व परामर्श हेतु उपलब्ध' : '⚪ वर्तमान में ऑफलाइन'}
            </Text>
          </View>

          {/* Quick Metrics */}
          <View style={s.metricsRow}>
            <View style={s.metricItem}>
              <Text style={s.metricVal}>{astro.experienceYears || 10}+ वर्ष</Text>
              <Text style={s.metricLabel}>अनुभव</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metricItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="star" size={15} color="#F59E0B" />
                <Text style={s.metricVal}> {astro.rating || 5.0}</Text>
              </View>
              <Text style={s.metricLabel}>{astro.reviewsCount || 120} समीक्षाएँ</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metricItem}>
              <Text style={s.metricVal}>{astro.ordersCompleted || 350}+</Text>
              <Text style={s.metricLabel}>संतुष्ट यजमान</Text>
            </View>
          </View>
        </View>

        {/* Consultation Mode Selection (Shown BEFORE payment) */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>परामर्श का माध्यम चुनें (Select Mode)</Text>
          <Text style={s.sectionSub}>भुगतान से पूर्व आप जिस माध्यम से बात करना चाहते हैं, उसे चुनें:</Text>

          {/* 3 Modes */}
          <View style={s.modesList}>
            {/* Mode 1: Chat */}
            <TouchableOpacity
              style={[s.modeCard, selectedMode === 'chat' && s.activeModeCard]}
              onPress={() => setSelectedMode('chat')}
              activeOpacity={0.85}
            >
              <View style={s.modeIconCircle}>
                <MaterialCommunityIcons
                  name="chat-processing-outline"
                  size={24}
                  color={selectedMode === 'chat' ? colors.primary : '#4B5563'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modeTitle}>चैट परामर्श (Live Chat)</Text>
                  <Text style={s.modeRate}>₹5 / मिनट</Text>
                </View>
                <Text style={s.modeDesc}>टेक्स्ट मैसेज द्वारा समस्याओं का समाधान व मार्गदर्शन</Text>
              </View>
              <View style={[s.radioCircle, selectedMode === 'chat' && s.activeRadio]}>
                {selectedMode === 'chat' && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Mode 2: Audio Call */}
            <TouchableOpacity
              style={[s.modeCard, selectedMode === 'audio' && s.activeModeCard]}
              onPress={() => setSelectedMode('audio')}
              activeOpacity={0.85}
            >
              <View style={s.modeIconCircle}>
                <MaterialCommunityIcons
                  name="phone-in-talk-outline"
                  size={24}
                  color={selectedMode === 'audio' ? colors.primary : '#4B5563'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modeTitle}>ऑडियो कॉल (Voice Call)</Text>
                  <Text style={s.modeRate}>₹5 / मिनट</Text>
                </View>
                <Text style={s.modeDesc}>डायरेक्ट इन-ऐप वॉयस कॉल द्वारा सीधा वार्तालाप</Text>
              </View>
              <View style={[s.radioCircle, selectedMode === 'audio' && s.activeRadio]}>
                {selectedMode === 'audio' && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>

            {/* Mode 3: Video Call */}
            <TouchableOpacity
              style={[s.modeCard, selectedMode === 'video' && s.activeModeCard]}
              onPress={() => setSelectedMode('video')}
              activeOpacity={0.85}
            >
              <View style={s.modeIconCircle}>
                <MaterialCommunityIcons
                  name="video-outline"
                  size={24}
                  color={selectedMode === 'video' ? colors.primary : '#4B5563'}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.modeTitle}>वीडियो कॉल (Live Video)</Text>
                  <Text style={s.modeRate}>₹5 / मिनट</Text>
                </View>
                <Text style={s.modeDesc}>फेस-टू-फेस वीडियो कॉल द्वारा संपूर्ण कुंडली परामर्श</Text>
              </View>
              <View style={[s.radioCircle, selectedMode === 'video' && s.activeRadio]}>
                {selectedMode === 'video' && <View style={s.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Astrologer Card */}
        <View style={s.sectionCard}>
          <Text style={s.sectionHeader}>ज्योतिषी के बारे में (About Astrologer)</Text>
          <Text style={s.bioText}>
            {astro.bio || astro.about || 'वाराणसी वैदिक गुरुकुल से प्रशिक्षित, वैदिक ज्योतिष, कुंडली मिलान, गृह शांति एवं जीवन मार्गदर्शन के विशेषज्ञ।'}
          </Text>

          <Text style={[s.sectionHeader, { marginTop: 14, fontSize: 14 }]}>विशेषज्ञता (Skills)</Text>
          <View style={s.tagsWrap}>
            {(Array.isArray(astro.skills) ? astro.skills : ['Vedic', 'KP Astrology', 'Kundli']).map((skill) => (
              <View key={skill} style={s.skillPill}>
                <Text style={s.skillPillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={[s.sectionHeader, { marginTop: 14, fontSize: 14 }]}>भाषाएँ (Languages)</Text>
          <Text style={s.bioText}>
            {(Array.isArray(astro.languages) ? astro.languages : ['हिंदी', 'संस्कृत', 'English']).join(', ')}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Payment & Connect Bar */}
      <View style={[s.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={s.walletSummary}>
          <Text style={s.walletBalLabel}>वॉलेट बैलेंस: <Text style={s.walletBalVal}>₹{totalBalance}</Text></Text>
          <Text style={s.rateNotice}>शुल्क: ₹{rate}/मिनट • प्रति मिनट कटौती</Text>
        </View>

        <TouchableOpacity
          style={[
            s.connectBtn,
            !astro.isOnline && s.connectBtnDisabled,
          ]}
          onPress={handleStartConsultation}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons
            name={selectedMode === 'chat' ? 'chat' : selectedMode === 'audio' ? 'phone' : 'video'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={s.connectBtnText}>
            {astro.isOnline ? `परामर्श शुरू करें (₹${rate}/min)` : 'वर्तमान में ऑफलाइन'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Outgoing Request / Calling Modal (Waiting for Astrologer Accept/Reject) */}
      <Modal visible={isRequesting} transparent animationType="fade">
        <View style={s.requestOverlay}>
          <View style={s.requestCard}>
            <View style={s.pulseDisc}>
              <MaterialCommunityIcons
                name={selectedMode === 'chat' ? 'chat-processing' : selectedMode === 'audio' ? 'phone-in-talk' : 'video'}
                size={36}
                color={colors.primary}
              />
            </View>

            <Text style={s.requestTitle}>
              {selectedMode === 'chat'
                ? '💬 चैट परामर्श का अनुरोध भेजा गया है...'
                : selectedMode === 'audio'
                ? '📞 ऑडियो कॉल की जा रही है...'
                : '📹 वीडियो कॉल की जा रही है...'}
            </Text>

            <Text style={s.requestAstroName}>{astro.name}</Text>
            <Text style={s.requestSub}>
              कृपया प्रतीक्षा करें, ज्योतिषाचार्य को सूचना भेज दी गई है। जैसे ही वे स्वीकार करते हैं, सत्र तुरंत प्रारंभ हो जाएगा।
            </Text>

            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 18 }} />

            <TouchableOpacity style={s.cancelRequestBtn} onPress={handleCancelRequest}>
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={s.cancelRequestText}>अनुरोध रद्द करें (Cancel)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quick Recharge Modal */}
      <Modal visible={showRechargeModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="wallet-plus" size={22} color={colors.primary} />
                <Text style={s.modalTitle}>वॉलेट रीचार्ज करें</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRechargeModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalSub}>
              परामर्श शुल्क ₹{rate}/मिनट है। कृपया वॉलेट में राशि जोड़ें:
            </Text>

            <View style={s.packsGrid}>
              {RECHARGE_PACKS.map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={s.packBox}
                  onPress={() => handleQuickRecharge(pack)}
                >
                  <Text style={s.packAmount}>₹{pack.amount}</Text>
                  {pack.bonus > 0 && (
                    <Text style={s.packBonus}>+₹{pack.bonus} बोनस</Text>
                  )}
                  <Text style={s.packMins}>~{Math.floor(pack.amount / rate)} मिनट परामर्श</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
  },
  backBtn: {
    padding: 4,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    flex: 1,
    marginLeft: 8,
  },
  walletIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  walletBalanceText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE9DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  heroAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F3EFE6',
  },
  presenceBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroName: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  heroTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3EFE6',
    width: '100%',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBE5D8',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE9DE',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    marginBottom: 12,
  },
  modesList: {
    gap: 10,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1.5,
    borderColor: '#EFE9DE',
    borderRadius: 14,
    padding: 12,
  },
  activeModeCard: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
  },
  modeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE5D8',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  modeRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  modeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeRadio: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  bioText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 6,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillPillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE5D8',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletSummary: {
    flex: 1,
    marginRight: 12,
  },
  walletBalLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  walletBalVal: {
    fontWeight: '800',
    color: colors.primary,
  },
  rateNotice: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
    marginTop: 2,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  connectBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  backNavBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  requestOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  requestCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  pulseDisc: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  requestAstroName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: serif,
    marginBottom: 8,
  },
  requestSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  cancelRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  cancelRequestText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    marginLeft: 8,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 16,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  packBox: {
    width: '48%',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  packAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  packBonus: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
    marginTop: 2,
  },
  packMins: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
});
