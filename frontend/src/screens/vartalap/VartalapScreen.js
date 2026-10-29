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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { useLanguage } from '../../context/LanguageContext';
import talkToAstroStore, { RECHARGE_PACKS } from '../../services/talkToAstroStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';
import socket from '../../services/socket';
import { SOCKET_URL, API_URL } from '../../config/env';

export default function VartalapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();
  const [astrologers, setAstrologers] = useState(talkToAstroStore.getAstrologers());
  const [wallet, setWallet] = useState(talkToAstroStore.getWallet());
  const [filterMode, setFilterMode] = useState('online'); // 'online' | 'all'
  const [loading, setLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const fetchLiveAstrologers = async () => {
    try {
      setLoading(true);
      const targetHost = (SOCKET_URL || API_URL || 'https://vaidic-sanskar-admin-suite.onrender.com').replace(/\/api\/partner\/?$/, '').replace(/\/api\/?$/, '');
      let rawList = [];

      // 1. Fetch from primary REST API (Panditji backend)
      try {
        const { AstroService } = await import('../../services/api');
        const res = await AstroService.astrologers();
        rawList = Array.isArray(res) ? res : (res?.vendors || res?.astrologers || res?.data || []);
      } catch (_) {
        // 2. Fallback to admin suite backend
        try {
          const fetchRes = await fetch(`${targetHost}/api/partner/discovery/role/astrologer`);
          const json = await fetchRes.json();
          rawList = json?.vendors || json?.astrologers || json?.data || [];
        } catch (_) {}
      }

      if (rawList.length) {
        const mapped = rawList.map((a) => ({
          id: String(a._id || a.id),
          name: a.name || 'पंडित जी',
          nameHi: a.nameHi || a.name || 'पंडित जी',
          title: a.title || 'वरिष्ठ वैदिक ज्योतिषाचार्य व कुंडली विशेषज्ञ',
          photo: a.profileImage || a.photo || 'jyotish_acharya',
          rating: Number(a.rating || a.averageRating || 5.0),
          reviewsCount: Number(a.totalReviews || a.reviewsCount || 120),
          experienceYears: Number(a.experienceYears || a.experience || 10),
          skills: Array.isArray(a.skills) && a.skills.length ? a.skills : ['Vedic', 'KP Astrology', 'Kundli'],
          languages: Array.isArray(a.languages) && a.languages.length ? a.languages : ['हिंदी', 'संस्कृत', 'English'],
          chatRate: 5,
          audioRate: 5,
          videoRate: 5,
          rates: { chat: 5, audio: 5, video: 5 },
          isOnline: a.isOnline !== false,
          ordersCompleted: Number(a.ordersCompleted || 350),
          totalMinutes: Number(a.totalMinutes || 5000),
          bio: a.bio || a.about || 'वैदिक ज्योतिष, कुंडली मिलान, गृह शांति व जीवन मार्गदर्शन विशेषज्ञ।',
          about: a.bio || a.about || 'वैदिक ज्योतिष, कुंडली मिलान, गृह शांति व जीवन मार्गदर्शन विशेषज्ञ।',
        }));

        talkToAstroStore.setAstrologers(mapped);
      }
    } catch (e) {
      console.log('Fetch live astrologers note:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAstrologers();

    // Query live socket for active partners
    socket.emit('astro:get:online');

    const unsub = talkToAstroStore.subscribe((store) => {
      setAstrologers([...store.getAstrologers()]);
      setWallet({ ...store.getWallet() });
    });
    return unsub;
  }, []);

  const totalBalance = (wallet.mainBalance || 0) + (wallet.bonusBalance || 0);

  // Filter list: only online or all
  const filteredAstrologers = astrologers.filter((a) => {
    if (filterMode === 'online') {
      return a.isOnline === true;
    }
    return true;
  });

  const onlineCount = astrologers.filter((a) => a.isOnline).length;

  const handleQuickRecharge = (pack) => {
    talkToAstroStore.rechargeWallet(pack);
    setShowRechargeModal(false);
    Alert.alert(
      'रीचार्ज सफल!',
      `₹${pack.amount} आपके वॉलेट में जुड़ गए हैं (+₹${pack.bonus || 0} बोनस)।`
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.headerTitle}>Astro Talk (वार्तालाप)</Text>
          <View style={s.liveStatusRow}>
            <View style={[s.liveDot, { backgroundColor: onlineCount > 0 ? '#22C55E' : '#9CA3AF' }]} />
            <Text style={s.liveStatusText}>
              {onlineCount > 0 ? `${onlineCount} ज्योतिषी ऑनलाइन` : 'ज्योतिषी की प्रतीक्षा है...'}
            </Text>
          </View>
        </View>

        {/* Wallet Balance Pill */}
        <TouchableOpacity
          style={s.walletPill}
          onPress={() => setShowRechargeModal(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="wallet-outline" size={16} color={colors.primary} />
          <Text style={s.walletText}>₹{totalBalance}</Text>
          <View style={s.addPlus}>
            <MaterialCommunityIcons name="plus" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Clean Filter Tabs (ऑनलाइन ज्योतिषी / सभी ज्योतिषी) */}
      <View style={s.filterRow}>
        <TouchableOpacity
          style={[s.filterTab, filterMode === 'online' && s.activeFilterTab]}
          onPress={() => setFilterMode('online')}
        >
          <View style={[s.filterDot, { backgroundColor: '#22C55E' }]} />
          <Text style={[s.filterTabText, filterMode === 'online' && s.activeFilterTabText]}>
            {isHindi ? 'ऑनलाइन ज्योतिषी' : 'Online Astrologers'} ({onlineCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.filterTab, filterMode === 'all' && s.activeFilterTab]}
          onPress={() => setFilterMode('all')}
        >
          <MaterialCommunityIcons
            name="account-group-outline"
            size={16}
            color={filterMode === 'all' ? colors.primary : colors.textMuted}
          />
          <Text style={[s.filterTabText, filterMode === 'all' && s.activeFilterTabText]}>
            {isHindi ? 'सभी ज्योतिषी' : 'All Astrologers'} ({astrologers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Astrologers List */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchLiveAstrologers}
            colors={[colors.primary]}
          />
        }
      >
        {filteredAstrologers.length === 0 ? (
          <View style={s.emptyState}>
            <MaterialCommunityIcons name="broadcast" size={54} color={colors.primary} />
            <Text style={s.emptyTitle}>
              {filterMode === 'online'
                ? 'वर्तमान में कोई ज्योतिषी ऑनलाइन नहीं हैं'
                : 'कोई ज्योतिषी उपलब्ध नहीं हैं'}
            </Text>
            <Text style={s.emptySub}>
              जैसे ही पार्टनर ऐप से ज्योतिषाचार्य ऑनलाइन आते हैं, वे यहाँ तुरंत रियल-टाइम में दिखाई देंगे।
            </Text>
            <TouchableOpacity style={s.refreshBtn} onPress={fetchLiveAstrologers}>
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
              <Text style={s.refreshBtnText}>रीफ्रेश करें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAstrologers.map((astro) => (
            <TouchableOpacity
              key={astro.id}
              style={s.astroCard}
              onPress={() => navigation.navigate('AstroProfile', { astrologer: astro, astrologerId: astro.id })}
              activeOpacity={0.92}
            >
              <View style={s.cardTopRow}>
                {/* Photo & Presence Dot */}
                <View style={s.avatarContainer}>
                  <Image
                    source={resolveDevotionalSource(astro.photo, 'jyotish_acharya')}
                    style={s.avatarImage}
                  />
                  <View
                    style={[
                      s.presenceDot,
                      { backgroundColor: astro.isOnline ? '#22C55E' : '#9CA3AF' },
                    ]}
                  />
                </View>

                {/* Details */}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={s.astroName} numberOfLines={1}>
                      {astro.name}
                    </Text>
                    {astro.isOnline ? (
                      <View style={s.onlineBadge}>
                        <View style={s.greenBlink} />
                        <Text style={s.onlineBadgeText}>ऑनलाइन</Text>
                      </View>
                    ) : (
                      <View style={s.offlineBadge}>
                        <Text style={s.offlineBadgeText}>ऑफलाइन</Text>
                      </View>
                    )}
                  </View>

                  <Text style={s.astroTitle} numberOfLines={1}>
                    {astro.title}
                  </Text>

                  {/* Skills */}
                  <Text style={s.astroSkills} numberOfLines={1}>
                    {Array.isArray(astro.skills) ? astro.skills.join(' • ') : 'Vedic • Kundli'}
                  </Text>

                  {/* Stats Row */}
                  <View style={s.statsRow}>
                    <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                    <Text style={s.ratingText}>{astro.rating || 5.0}</Text>
                    <Text style={s.reviewsText}>({astro.reviewsCount || 120})</Text>
                    <Text style={s.bullet}>•</Text>
                    <Text style={s.expText}>{astro.experienceYears || 10} वर्ष अनुभव</Text>
                  </View>
                </View>
              </View>

              {/* Consultation Modes & Rate Bar */}
              <View style={s.rateBar}>
                <View style={s.modesSummary}>
                  <View style={s.modeIconTag}>
                    <MaterialCommunityIcons name="chat-outline" size={14} color={colors.primary} />
                    <Text style={s.modeIconTagText}>चैट</Text>
                  </View>
                  <View style={s.modeIconTag}>
                    <MaterialCommunityIcons name="phone-outline" size={14} color={colors.primary} />
                    <Text style={s.modeIconTagText}>कॉल</Text>
                  </View>
                  <View style={s.modeIconTag}>
                    <MaterialCommunityIcons name="video-outline" size={14} color={colors.primary} />
                    <Text style={s.modeIconTagText}>वीडियो</Text>
                  </View>
                </View>

                <View style={s.ratePriceTag}>
                  <Text style={s.rateValue}>₹5</Text>
                  <Text style={s.ratePerMin}>/मिनट</Text>
                </View>
              </View>

              {/* Connect CTA Button */}
              <TouchableOpacity
                style={s.connectCtaBtn}
                onPress={() => navigation.navigate('AstroProfile', { astrologer: astro, astrologerId: astro.id })}
              >
                <MaterialCommunityIcons name="account-eye-outline" size={18} color="#FFFFFF" />
                <Text style={s.connectCtaText}>विवरण देखें व परामर्श लें (View & Connect)</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

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
              वर्तमान बैलेंस: ₹{totalBalance} • परामर्श दर: ₹5/मिनट
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
                  <Text style={s.packMins}>~{Math.floor(pack.amount / 5)} मिनट परामर्श</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
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
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveStatusText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  walletText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 4,
    marginRight: 6,
  },
  addPlus: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE5D8',
    gap: 10,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3EFE6',
  },
  activeFilterTab: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginLeft: 4,
  },
  activeFilterTabText: {
    color: colors.primary,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 14,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  astroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE9DE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3EFE6',
  },
  presenceDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  astroName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    flex: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  greenBlink: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  offlineBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  astroTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  astroSkills: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 3,
  },
  reviewsText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  bullet: {
    marginHorizontal: 6,
    color: '#D1D5DB',
  },
  expText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  modesSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  modeIconTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  modeIconTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  ratePriceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  ratePerMin: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 2,
  },
  connectCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  connectCtaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
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
