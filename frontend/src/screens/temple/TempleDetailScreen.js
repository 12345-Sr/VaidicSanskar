import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif, shadow } from '../../theme/styles';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import templeStore from '../../services/templeStore';

export default function TempleDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t, isHindi, getText, clean } = useLanguage();
  const initialTemple = route.params?.temple || templeStore.getTemples()[0];
  const [temple, setTemple] = useState(
    templeStore.getTempleById(initialTemple.id) || initialTemple
  );
  const [isFollowed, setIsFollowed] = useState(temple.isFollowed);
  const [liveStreamPlaying, setLiveStreamPlaying] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleToggleFollow = () => {
    templeStore.toggleFollowTemple(temple.id);
    setIsFollowed(!isFollowed);
    Alert.alert(
      !isFollowed ? '‘मेरा मंदिर’ में जोड़ा गया' : '‘मेरा मंदिर’ से हटाया गया',
      !isFollowed
        ? `${temple.name} की आरती व त्योहारों की सूचना अब आपको प्राप्त होगी।`
        : 'अब आपको दैनिक सूचनाएं नहीं मिलेंगी।'
    );
  };

  const openGoogleMaps = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${temple.lat},${temple.lng}`;
    const label = encodeURIComponent(temple.name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${temple.lat},${temple.lng}`);
    });
  };

  const handleCall = () => {
    if (temple.phone) {
      Linking.openURL(`tel:${temple.phone}`);
    } else {
      Alert.alert('फ़ोन नंबर', 'इस मंदिर का सार्वजनिक फ़ोन नंबर उपलब्ध नहीं है।');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🛕 ${temple.name} (${temple.city})\n⏰ दर्शन समय: ${temple.timings}\n✨ आरती: ${temple.nextAartiText || 'नित्य आरती'}\nवैदिक संस्कार ऐप पर दर्शन स्लॉट बुक करें व लाइव दर्शन देखें: https://vaidicsanskar.in/temple/${temple.id}`,
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (e) {
      console.log(e);
    }
  };

  const submitReview = () => {
    if (!reviewText.trim()) {
      Alert.alert('समीक्षा आवश्यक', 'कृपया अपना अनुभव लिखें।');
      return;
    }
    templeStore.addReview(temple.id, {
      user: 'आप (श्रद्धालु)',
      rating: userRating,
      comment: reviewText.trim(),
    });
    setReviewText('');
    setReviewModalVisible(false);
    setTemple(templeStore.getTempleById(temple.id));
    Alert.alert('धन्यवाद!', 'आपकी समीक्षा सफलता से दर्ज कर ली गई है।');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top Hero Media Banner */}
        <View style={s.heroContainer}>
          <LinearGradient
            colors={temple.is_verified ? ['#4A1208', '#2D0A04'] : ['#334155', '#0F172A']}
            style={s.heroBanner}
          >
            {/* Spiritual Pattern / Emblem */}
            <View style={s.heroEmblemContainer}>
              <MaterialCommunityIcons
                name={temple.is_verified ? 'temple-hindu' : 'map-marker-radius'}
                size={84}
                color="rgba(255,255,255,0.15)"
              />
            </View>

            {/* Live Darshan Video Overlay Simulation */}
            {temple.hasLiveStream && (
              <TouchableOpacity
                style={s.liveStreamBadge}
                activeOpacity={0.8}
                onPress={() => setLiveStreamPlaying(!liveStreamPlaying)}
              >
                <View style={s.liveRedDot} />
                <Text style={s.liveText}>
                  {liveStreamPlaying ? 'लाइव दर्शन चल रहा है (Tap to Pause)' : 'लाइव दर्शन देखें (Live Stream)'}
                </Text>
                <MaterialCommunityIcons
                  name={liveStreamPlaying ? 'pause' : 'play-circle'}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </LinearGradient>

          {/* Top Floating Navigation Header */}
          <View style={[s.topNav, { paddingTop: insets.top + 6 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.roundBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LanguageSwitcher />
              <TouchableOpacity
                onPress={handleToggleFollow}
                style={[s.roundBtn, isFollowed && s.roundBtnActive]}
              >
                <MaterialCommunityIcons
                  name={isFollowed ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFollowed ? colors.primary : '#fff'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={s.roundBtn}>
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content Sheet */}
        <View style={s.sheetContent}>
          {/* Header Badges & Title */}
          <View style={s.badgeRow}>
            {temple.is_verified ? (
              <View style={s.verifiedTag}>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#C26A00" />
                <Text style={s.verifiedTagText}>{t('verifiedTemple')}</Text>
              </View>
            ) : (
              <View style={s.googleTag}>
                <MaterialCommunityIcons name="google-maps" size={14} color="#64748B" />
                <Text style={s.googleTagText}>{t('googleListing')}</Text>
              </View>
            )}
            <View style={[s.statusTag, !temple.open && s.statusTagClosed]}>
              <Text style={[s.statusTagText, !temple.open && s.statusTagClosedText]}>
                {temple.open ? t('open') : t('closed')}
              </Text>
            </View>
          </View>

          <Text style={s.templeTitle}>{getText(temple.name, temple.name_en)}</Text>
          <Text style={s.templeSubtitle}>
            {clean(getText(temple.deity_hi, temple.deity_en))} • {clean(temple.sampraday)}
          </Text>

          {/* Location & Rating Strip */}
          <View style={s.locRatingRow}>
            <View style={s.locItem}>
              <Ionicons name="location-sharp" size={15} color={colors.primary} />
              <Text style={s.locAddressText}>{clean(temple.address || temple.city)}</Text>
            </View>
            <View style={s.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={s.ratingScore}>{temple.rating}</Text>
              <Text style={s.ratingReviewsCount}>({temple.reviewsCount})</Text>
            </View>
          </View>

          {/* Current Live Notice Banner */}
          <View style={s.liveNoticeStrip}>
            <MaterialCommunityIcons name="clock-check-outline" size={16} color={colors.maroon} />
            <Text style={s.liveNoticeText}>{clean(temple.statusText)}</Text>
          </View>
          {temple.nextAartiText && (
            <View style={s.aartiNoticeStrip}>
              <MaterialCommunityIcons name="bell-ring" size={15} color="#92400E" />
              <Text style={s.aartiNoticeText}>{clean(temple.nextAartiText)}</Text>
            </View>
          )}

          {/* Action Buttons Matrix */}
          <View style={s.actionGrid}>
            {temple.hasDarshanBooking && (
              <TouchableOpacity
                style={s.primaryActionBtn}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('DarshanBooking', { temple })}
              >
                <LinearGradient
                  colors={['#C87A14', '#A86208']}
                  style={s.primaryActionGradient}
                >
                  <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#fff" />
                  <Text style={s.primaryActionText}>{t('bookDarshan')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={s.secondaryActionRow}>
              <TouchableOpacity style={s.actionSquare} onPress={openGoogleMaps}>
                <MaterialCommunityIcons name="navigation-variant" size={22} color={colors.maroon} />
                <Text style={s.actionSquareLabel}>{t('getDirections')}</Text>
              </TouchableOpacity>

              {temple.hasDonation && (
                <TouchableOpacity
                  style={s.actionSquare}
                  onPress={() => navigation.navigate('Donation', { temple })}
                >
                  <MaterialCommunityIcons name="hand-coin-outline" size={22} color={colors.primary} />
                  <Text style={s.actionSquareLabel}>{t('templeDonation')}</Text>
                </TouchableOpacity>
              )}

              {temple.hasPoojaBooking && (
                <TouchableOpacity
                  style={s.actionSquare}
                  onPress={() => navigation.navigate('PoojaBooking', { title: `मंदिर पूजा • ${getText(temple.name, temple.name_en)}` })}
                >
                  <MaterialCommunityIcons name="fire" size={22} color="#DC2626" />
                  <Text style={s.actionSquareLabel}>{t('bookTemplePooja')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={s.actionSquare} onPress={handleCall}>
                <Ionicons name="call-outline" size={20} color={colors.text} />
                <Text style={s.actionSquareLabel}>{t('call')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.actionSquare} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color={colors.text} />
                <Text style={s.actionSquareLabel}>{t('share')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* If Google temple, show claim banner */}
          {!temple.is_verified && (
            <View style={s.claimPromptCard}>
              <MaterialCommunityIcons name="shield-alert-outline" size={24} color="#D97706" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.claimPromptTitle}>
                  {isHindi ? 'क्या आप इस मंदिर के पुजारी या ट्रस्टी हैं?' : 'Are you a priest or trustee of this temple?'}
                </Text>
                <Text style={s.claimPromptSub}>
                  {isHindi
                    ? 'आरती समय, दर्शन स्लॉट व प्रामाणिक जानकारी जोड़ने हेतु मंदिर का दावा करें।'
                    : 'Claim this temple listing to manage darshan slots, aarti timings and sacred updates.'}
                </Text>
                <TouchableOpacity
                  style={s.claimPromptBtn}
                  onPress={() => navigation.navigate('TempleClaim', { temple })}
                >
                  <Text style={s.claimPromptBtnText}>
                    {t('claimTemple')} ›
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Darshan Timings Card */}
          <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.maroon} />
              <Text style={s.sectionTitle}>{t('darshanHours')}</Text>
            </View>
            <Text style={s.timingsMain}>{clean(temple.timings)}</Text>
            {temple.darshanTimings && temple.darshanTimings.map((ds, idx) => (
              <View key={idx} style={s.timingRow}>
                <Text style={s.timingSession}>{clean(ds.session)}</Text>
                <Text style={s.timingTime}>{clean(ds.time)}</Text>
              </View>
            ))}
          </View>

          {/* Aarti Schedule Card */}
          {temple.aartis && temple.aartis.length > 0 && (
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={colors.maroon} />
                <Text style={s.sectionTitle}>{t('aartiSchedule')}</Text>
              </View>
              {temple.aartis.map((a, idx) => (
                <View key={idx} style={s.aartiItem}>
                  <View style={s.aartiIconBullet}>
                    <MaterialCommunityIcons name="fire" size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.aartiName}>{clean(a.name)}</Text>
                    {a.desc && <Text style={s.aartiDesc}>{clean(a.desc)}</Text>}
                  </View>
                  <View style={s.aartiTimeTag}>
                    <Text style={s.aartiTimeText}>{a.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* History & Religious Significance */}
          <View style={s.sectionCard}>
            <View style={s.sectionHeader}>
              <MaterialCommunityIcons name="book-open-page-variant-outline" size={20} color={colors.maroon} />
              <Text style={s.sectionTitle}>{t('historySignificance')}</Text>
            </View>
            <Text style={s.historyParagraph}>{temple.about}</Text>
            {temple.dressCode && (
              <View style={s.dressCodeBox}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={16} color={colors.maroon} />
                <Text style={s.dressCodeText}>
                  <Text style={{ fontWeight: '700' }}>{t('dressCode')}: </Text>
                  {clean(temple.dressCode)}
                </Text>
              </View>
            )}
          </View>

          {/* Facilities Checklist */}
          {temple.facilities && temple.facilities.length > 0 && (
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="check-all" size={20} color={colors.maroon} />
                <Text style={s.sectionTitle}>{t('facilities')}</Text>
              </View>
              <View style={s.facilitiesGrid}>
                {temple.facilities.map((fc) => (
                  <View key={fc.key} style={s.facilityCard}>
                    <MaterialCommunityIcons
                      name={fc.icon}
                      size={20}
                      color={fc.available ? colors.primary : colors.textMuted}
                    />
                    <Text style={[s.facilityCardLabel, !fc.available && { color: colors.textMuted }]}>
                      {fc.label}
                    </Text>
                    <Ionicons
                      name={fc.available ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={fc.available ? colors.success : colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Nearby Suggestions: Mandir, Dharmashala, Prasad Shop */}
          {temple.nearbyPlaces && (
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <MaterialCommunityIcons name="compass-outline" size={20} color={colors.maroon} />
                <Text style={s.sectionTitle}>आस-पास के स्थान व सुविधाएं</Text>
              </View>
              <View style={s.nearbyCategory}>
                <Text style={s.nearbyCategoryTitle}>पास के अन्य मंदिर:</Text>
                {temple.nearbyPlaces.temples.map((nm, idx) => (
                  <Text key={idx} style={s.nearbyItemText}>• {nm}</Text>
                ))}
              </View>
              <View style={s.nearbyCategory}>
                <Text style={s.nearbyCategoryTitle}>धर्मशाला व विश्राम गृह:</Text>
                {temple.nearbyPlaces.dharamshala.map((dh, idx) => (
                  <Text key={idx} style={s.nearbyItemText}>• {dh}</Text>
                ))}
              </View>
              {temple.nearbyPlaces.prasadStore && (
                <TouchableOpacity
                  style={s.eStoreBanner}
                  onPress={() => navigation.navigate('EStore')}
                >
                  <MaterialCommunityIcons name="shopping" size={20} color="#fff" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.eStoreBannerTitle}>पूजन व प्रसाद सामग्री (E-Store)</Text>
                    <Text style={s.eStoreBannerSub}>{temple.nearbyPlaces.prasadStore}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Devotee Reviews Section */}
          <View style={s.sectionCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={s.sectionHeader}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={s.sectionTitle}>भक्त समीक्षाएं (Reviews)</Text>
              </View>
              <TouchableOpacity
                style={s.addReviewBtn}
                onPress={() => setReviewModalVisible(true)}
              >
                <Text style={s.addReviewBtnText}>+ समीक्षा लिखें</Text>
              </TouchableOpacity>
            </View>

            {temple.googleAttribution && (
              <View style={s.googleAttributionBadge}>
                <MaterialCommunityIcons name="google" size={13} color="#64748B" />
                <Text style={s.googleAttributionText}>{temple.googleAttribution}</Text>
              </View>
            )}

            {temple.reviews && temple.reviews.map((rv, idx) => (
              <View key={idx} style={s.reviewCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.reviewUser}>{rv.user}</Text>
                  <Text style={s.reviewDate}>{rv.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginVertical: 3 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={12}
                      color={star <= rv.rating ? '#F59E0B' : '#CBD5E1'}
                    />
                  ))}
                </View>
                <Text style={s.reviewComment}>{rv.comment}</Text>
              </View>
            ))}
          </View>

          {/* Contribution & Suggestion Link */}
          <View style={s.contributionFooter}>
            <TouchableOpacity
              style={s.suggestBtn}
              onPress={() => navigation.navigate('TempleClaim', { temple, mode: 'suggest' })}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.maroon} />
              <Text style={s.suggestBtnText}>गलत समय या जानकारी में सुधार भेजें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>समीक्षा लिखें</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
              {temple.name} के दर्शन अनुभव को अन्य श्रद्धालुओं के साथ साझा करें।
            </Text>

            {/* Star Rating Select */}
            <View style={s.starSelectRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons
                    name="star"
                    size={32}
                    color={star <= userRating ? '#F59E0B' : '#E2E8F0'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={s.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="दर्शन व्यवस्था, स्वच्छता और अपने आध्यात्मिक अनुभव के विषय में लिखें..."
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={s.submitReviewBtn} onPress={submitReview}>
              <Text style={s.submitReviewBtnText}>समीक्षा प्रकाशित करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  heroContainer: {
    position: 'relative',
    height: 240,
  },
  heroBanner: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveStreamBadge: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveRedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnActive: {
    backgroundColor: '#fff',
  },
  sheetContent: {
    backgroundColor: colors.cream,
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  googleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  googleTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  statusTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  statusTagClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusTagClosedText: {
    color: '#B91C1C',
  },
  templeTitle: {
    fontFamily: serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.maroon,
    marginTop: 8,
  },
  templeSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  locRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D6',
  },
  locItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  locAddressText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 3,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  ratingReviewsCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  liveNoticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  liveNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.maroon,
  },
  aartiNoticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  aartiNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  actionGrid: {
    marginTop: 16,
  },
  primaryActionBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    ...shadow,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionSquare: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    ...shadow,
  },
  actionSquareLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  claimPromptCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  claimPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  claimPromptSub: {
    fontSize: 11.5,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  claimPromptBtn: {
    marginTop: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  claimPromptBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '700',
    color: colors.maroon,
  },
  timingsMain: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F6F0E6',
  },
  timingSession: {
    fontSize: 12,
    color: colors.textMuted,
  },
  timingTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  aartiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F6F0E6',
  },
  aartiIconBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aartiName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  aartiDesc: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  aartiTimeTag: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aartiTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.maroon,
  },
  historyParagraph: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.text,
  },
  dressCodeBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5EE',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  dressCodeText: {
    fontSize: 11.5,
    color: colors.maroon,
    flex: 1,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  facilityCardLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  nearbyCategory: {
    marginBottom: 8,
  },
  nearbyCategoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  nearbyItemText: {
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 18,
  },
  eStoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.maroon,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  eStoreBannerTitle: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  eStoreBannerSub: {
    color: '#F4D9B6',
    fontSize: 10.5,
    marginTop: 2,
  },
  addReviewBtn: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.maroon,
  },
  googleAttributionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  googleAttributionText: {
    fontSize: 10,
    color: '#64748B',
  },
  reviewCard: {
    backgroundColor: '#FAF7F0',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  reviewUser: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
  reviewComment: {
    fontSize: 11.5,
    color: colors.text,
    marginTop: 2,
  },
  contributionFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  suggestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  suggestBtnText: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: colors.maroon,
  },
  starSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  reviewInput: {
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
    height: 90,
  },
  submitReviewBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  submitReviewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
