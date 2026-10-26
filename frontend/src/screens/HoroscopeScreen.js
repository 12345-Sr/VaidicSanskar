import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import styles, { serif, radius, shadow } from '../theme/styles';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';
import horoscopeKundaliStore, {
  RASHIS,
  TODAY_PANCHANG,
} from '../services/horoscopeKundaliStore';

export default function HoroscopeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, isHindi, getText, clean } = useLanguage();
  const [selectedRashiId, setSelectedRashiId] = useState('leo');
  const [timeframe, setTimeframe] = useState('daily'); // daily | weekly | monthly | yearly
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showWhyTransit, setShowWhyTransit] = useState(false);
  const [remoteHoroscope, setRemoteHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedRashi = RASHIS.find((r) => r.id === selectedRashiId) || RASHIS[4];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    import('../services/api').then(({ AstroService }) => {
      AstroService.horoscope({
        zodiacSign: selectedRashiId,
        period: timeframe,
        date: new Date().toISOString().slice(0, 10),
      })
        .then((res) => {
          if (!isMounted) return;
          const data = res?.horoscope || res?.data || res;
          const text = data?.content?.overall || data?.summary || data?.prediction || data?.overview || '';
          if (data && text) {
            setRemoteHoroscope({
              oneLiner: data.oneLiner || data.title || 'आज का दिन विशेष फलदायी एवं ऊर्जावान रहेगा।',
              oneLiner_en: data.oneLiner_en || data.title || 'Today brings positive auspicious energy.',
              summary: text,
              summary_en: text,
              whyTransit: data.transitAnalysis || data.planetaryTransit || 'वर्तमान गोचर व नक्षत्र स्थिति अनुकूल है।',
              whyTransit_en: data.transitAnalysis_en || 'Current planetary transit is favorable.',
              scores: data.scores || { career: 4, finance: 4, love: 4, family: 4, health: 4 },
              luckyColor: data.luckyColor || 'केसरिया (Saffron)',
              luckyColor_en: data.luckyColor_en || 'Saffron',
              luckyNumber: String(data.luckyNumber || '7'),
              luckyNumber_en: String(data.luckyNumber || '7'),
              luckyTime: data.luckyTime || '09:00 - 11:30 AM',
              luckyTime_en: data.luckyTime || '09:00 - 11:30 AM',
              remedy: data.remedy || 'भगवान सूर्य को जल अर्पित करें व गायत्री मंत्र का जप करें।',
              remedy_en: data.remedy_en || 'Offer water to Lord Surya and chant the Gayatri Mantra.',
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    });
    return () => {
      isMounted = false;
    };
  }, [selectedRashiId, timeframe]);

  const horoscope = remoteHoroscope || {
    oneLiner: isHindi ? `${selectedRashi.name} राशि हेतु आज का दिन अनुकूल व प्रगतिशील रहेगा।` : `Favorable and progressive period for ${selectedRashi.en}.`,
    oneLiner_en: `Favorable and progressive period for ${selectedRashi.en}.`,
    summary: isHindi ? `वैदिक गोचर के अनुसार ${selectedRashi.lord} का प्रभाव आपके पुरुषार्थ और आत्मविश्वास में वृद्धि करेगा। सोचे हुए कार्यों में सफलता मिलेगी।` : `Planetary transit of ${selectedRashi.lord} enhances determination and auspicious progress in your key endeavors.`,
    summary_en: `Planetary transit of ${selectedRashi.lord} enhances determination and auspicious progress in your key endeavors.`,
    whyTransit: isHindi ? `चंद्रमा एवं लग्नेश का गोचर अनुकूल भावों में होने से कार्यक्षेत्र में प्रतिष्ठा बढ़ेगी।` : 'Moon and lagna lord transiting favorable houses brings dignity and productivity.',
    whyTransit_en: 'Moon and lagna lord transiting favorable houses brings dignity and productivity.',
    scores: { career: 4, finance: 4, love: 4, family: 4, health: 4 },
    luckyColor: isHindi ? 'पीला व केसरिया' : 'Yellow & Saffron',
    luckyColor_en: 'Yellow & Saffron',
    luckyNumber: '7',
    luckyNumber_en: '7',
    luckyTime: '08:30 - 10:45 AM',
    luckyTime_en: '08:30 - 10:45 AM',
    remedy: isHindi ? 'भगवान सूर्य को तांबे के लोटे से अर्घ्य दें एवं ॐ सूर्याय नमः का जप करें।' : 'Offer water to Lord Surya with copper vessel and chant Om Suryaya Namah.',
    remedy_en: 'Offer water to Lord Surya with copper vessel and chant Om Suryaya Namah.',
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      Alert.alert(
        isHindi ? 'ऑडियो राशिफल चालू 🎙️' : 'Audio Horoscope Active 🎙️',
        isHindi
          ? `${selectedRashi.name} राशि का दैनिक वैदिक राशिफल ऑडियो में सुनाया जा रहा है (अवधि: 65 सेकंड)...`
          : `Daily Vedic Horoscope audio playing for ${selectedRashi.en} (duration: 65s)...`,
        [{ text: isHindi ? 'ठीक है' : 'OK' }]
      );
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <View style={s.navHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10, marginRight: 6 }}>
          <Text style={s.navTitle} numberOfLines={1}>{t('dailyHoroscope')}</Text>
          <Text style={s.navSub} numberOfLines={1}>
            {isHindi ? 'वैदिक गोचर एवं नक्षत्र आधारित गणना' : 'Vedic transit & planetary insights'}
          </Text>
        </View>
        <LanguageSwitcher style={{ marginRight: 6 }} />
        <TouchableOpacity
          style={s.kundaliBtn}
          onPress={() => navigation.navigate('Kundali')}
        >
          <MaterialCommunityIcons name="star-four-points" size={15} color={colors.text} />
          <Text style={s.kundaliBtnText} numberOfLines={1}>{t('kundali') || (isHindi ? 'कुण्डली' : 'Kundali')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Panchang Strip */}
        <View style={s.panchangCard}>
          <View style={s.panchangHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={colors.primary} />
              <Text style={s.panchangTitle}>
                {t('dailyPanchang')} • {isHindi ? TODAY_PANCHANG.date : TODAY_PANCHANG.date_en}
              </Text>
            </View>
            <Text style={s.panchangDay}>
              {isHindi ? TODAY_PANCHANG.day : TODAY_PANCHANG.day_en}
            </Text>
          </View>
          <Text style={s.panchangDetails} numberOfLines={1}>
            {t('tithi')}: {isHindi ? TODAY_PANCHANG.tithi : TODAY_PANCHANG.tithi_en} • {t('nakshatra')}: {isHindi ? TODAY_PANCHANG.nakshatra : TODAY_PANCHANG.nakshatra_en}
          </Text>
          <View style={s.muhuratRow}>
            <View style={s.muhuratPillGood}>
              <MaterialCommunityIcons name="check-circle-outline" size={12} color="#16A34A" />
              <Text style={s.muhuratGoodText}>
                {isHindi ? 'अभिजीत' : 'Abhijit'}: 11:42 AM - 12:28 PM
              </Text>
            </View>
            <View style={s.muhuratPillBad}>
              <MaterialCommunityIcons name="alert-circle-outline" size={12} color="#DC2626" />
              <Text style={s.muhuratBadText}>
                {isHindi ? 'राहुकाल' : 'Rahu Kaal'}: 09:12 - 10:39 AM
              </Text>
            </View>
          </View>
        </View>

        {/* Timeframe Selector (Daily / Weekly / Monthly / Yearly) */}
        <View style={s.timeframeRow}>
          {[
            { key: 'daily', label: t('today', 'Today') },
            { key: 'weekly', label: t('thisWeek', 'This Week') },
            { key: 'monthly', label: t('thisMonth', 'This Month') },
            { key: 'yearly', label: t('yearly', 'Year 2026') },
          ].map((tf) => (
            <TouchableOpacity
              key={tf.key}
              style={[s.timeframeBtn, timeframe === tf.key && s.timeframeBtnActive]}
              onPress={() => setTimeframe(tf.key)}
            >
              <Text style={[s.timeframeText, timeframe === tf.key && s.timeframeTextActive]}>
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 12 Rashis Horizontal Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.rashisScroll}
        >
          {RASHIS.map((rashi) => {
            const isSelected = selectedRashiId === rashi.id;
            return (
              <TouchableOpacity
                key={rashi.id}
                style={[s.rashiChip, isSelected && s.selectedRashiChip]}
                onPress={() => setSelectedRashiId(rashi.id)}
              >
                <Text style={s.rashiSymbol}>{rashi.symbol}</Text>
                <Text style={[s.rashiName, isSelected && s.selectedRashiName]}>
                  {isHindi ? rashi.name : rashi.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Personalised Horoscope Card */}
        <View style={s.horoscopeMainCard}>
          <View style={s.cardHeadRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.signHeading}>
                  {isHindi ? `${selectedRashi.name} राशि` : `${selectedRashi.en} Horoscope`}
                </Text>
                <View style={s.elementBadge}>
                  <Text style={s.elementBadgeText}>
                    {clean(selectedRashi.element)} {isHindi ? 'तत्व' : 'Element'}
                  </Text>
                </View>
              </View>
              <Text style={s.rashiLordText}>
                {t('rashiLord')}: {clean(selectedRashi.lord)}
              </Text>
            </View>

            {/* Audio Listen Button */}
            <TouchableOpacity
              style={[s.audioBtn, isPlayingAudio && s.audioBtnPlaying]}
              onPress={toggleAudio}
            >
              <MaterialCommunityIcons
                name={isPlayingAudio ? 'pause' : 'volume-high'}
                size={16}
                color={isPlayingAudio ? '#FFFFFF' : colors.primary}
              />
              <Text style={[s.audioBtnText, isPlayingAudio && { color: '#FFFFFF' }]}>
                {isPlayingAudio ? (isHindi ? 'रुकें' : 'Pause') : (isHindi ? 'सुनिए' : 'Listen')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* One-Liner Headline */}
          <View style={s.headlineBox}>
            <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.primary} />
            <Text style={s.headlineText}>{getText(horoscope.oneLiner, horoscope.oneLiner_en)}</Text>
          </View>

          {/* Full Summary */}
          <Text style={s.summaryParagraph}>{getText(horoscope.summary, horoscope.summary_en)}</Text>

          {/* Why Transit Button */}
          <TouchableOpacity
            style={s.whyTransitBtn}
            onPress={() => setShowWhyTransit(!showWhyTransit)}
          >
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
            <Text style={s.whyTransitBtnText}>
              {isHindi ? 'यह फल क्यों? (ग्रह गोचर आधार देखें)' : 'Why today? Planetary transit insights'}
            </Text>
            <MaterialCommunityIcons
              name={showWhyTransit ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>

          {showWhyTransit && (
            <View style={s.whyTransitBox}>
              <Text style={s.whyTransitText}>{getText(horoscope.whyTransit, horoscope.whyTransit_en)}</Text>
            </View>
          )}

          {/* 5 Area Scores (Love, Career, Finance, Health, Family) */}
          <View style={s.scoresCard}>
            <Text style={s.scoresTitle}>
              {isHindi ? 'जीवन के 5 क्षेत्रों में आज का प्रभाव:' : "Today's forecast across 5 life areas:"}
            </Text>
            {[
              { key: 'career', label: t('career'), score: horoscope.scores.career, icon: 'briefcase-outline' },
              { key: 'finance', label: t('finance'), score: horoscope.scores.finance, icon: 'cash' },
              { key: 'love', label: t('love'), score: horoscope.scores.love, icon: 'heart-outline' },
              { key: 'family', label: t('family'), score: horoscope.scores.family, icon: 'home-heart' },
              { key: 'health', label: t('health'), score: horoscope.scores.health, icon: 'heart-pulse' },
            ].map((item) => (
              <View key={item.key} style={s.scoreRow}>
                <View style={s.scoreLabelCol}>
                  <MaterialCommunityIcons name={item.icon} size={15} color={colors.primary} />
                  <Text style={s.scoreLabelText}>{item.label}</Text>
                </View>
                <View style={s.starsCol}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name={star <= item.score ? 'star' : 'star-outline'}
                      size={16}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Lucky Factors Grid */}
          <View style={s.luckyGrid}>
            <View style={s.luckyBox}>
              <Text style={s.luckyLabel}>{t('luckyColor')}</Text>
              <Text style={s.luckyVal}>{getText(horoscope.luckyColor, horoscope.luckyColor_en)}</Text>
            </View>
            <View style={s.luckyBox}>
              <Text style={s.luckyLabel}>{t('luckyNumber')}</Text>
              <Text style={s.luckyVal}>{getText(horoscope.luckyNumber, horoscope.luckyNumber_en)}</Text>
            </View>
            <View style={s.luckyBox}>
              <Text style={s.luckyLabel}>{t('auspiciousTime')}</Text>
              <Text style={s.luckyVal}>{getText(horoscope.luckyTime, horoscope.luckyTime_en)}</Text>
            </View>
            <View style={s.luckyBox}>
              <Text style={s.luckyLabel}>{t('rahuKaal')}</Text>
              <Text style={[s.luckyVal, { color: colors.danger }]}>
                {getText(horoscope.unfavorableTime, horoscope.unfavorableTime_en)}
              </Text>
            </View>
          </View>

          {/* Do's & Don'ts */}
          <View style={s.dosDontsRow}>
            {/* Do's */}
            <View style={s.dosCol}>
              <View style={s.dosHead}>
                <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                <Text style={s.dosHeadTitle}>{isHindi ? 'आज क्या करें' : "Today's Do's"}</Text>
              </View>
              {(isHindi ? horoscope.dos : (horoscope.dos_en || horoscope.dos)).map((dItem, idx) => (
                <Text key={idx} style={s.doItem}>• {dItem}</Text>
              ))}
            </View>

            {/* Don'ts */}
            <View style={s.dontsCol}>
              <View style={s.dontsHead}>
                <MaterialCommunityIcons name="close-circle" size={16} color={colors.danger} />
                <Text style={s.dontsHeadTitle}>{isHindi ? 'क्या न करें' : "Today's Don'ts"}</Text>
              </View>
              {(isHindi ? horoscope.donts : (horoscope.donts_en || horoscope.donts)).map((dItem, idx) => (
                <Text key={idx} style={s.dontItem}>• {dItem}</Text>
              ))}
            </View>
          </View>

          {/* Daily Simple Remedy (Upay) */}
          <View style={s.remedyBox}>
            <View style={s.remedyHead}>
              <MaterialCommunityIcons name="hands-pray" size={18} color={colors.primary} />
              <Text style={s.remedyHeadTitle}>{t('dailyRemedy')}:</Text>
            </View>
            <Text style={s.remedyText}>{getText(horoscope.remedy, horoscope.remedy_en)}</Text>
          </View>
        </View>

        {/* Talk to Astro Direct CTA */}
        <TouchableOpacity
          style={s.astroCtaBanner}
          onPress={() => navigation.navigate('Vartalap')}
          activeOpacity={0.9}
        >
          <View style={s.ctaDisc}>
            <MaterialCommunityIcons name="comment-text-multiple-outline" size={24} color={colors.text} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.ctaTitle}>
              {isHindi ? 'अपनी कुंडली के अनुसार विस्तृत समाधान चाहिए?' : 'Need personalized guidance based on your Kundali?'}
            </Text>
            <Text style={s.ctaSub}>
              {isHindi
                ? 'शीर्ष वैदिक ज्योतिषाचार्यों से मात्र ₹1/मिनट में लाइव बात करें →'
                : 'Talk live to top Vedic Astrologers starting at ₹1/min →'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  navHeader: {
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
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  navSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  kundaliBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  kundaliBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  panchangCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  panchangHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panchangTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  panchangDay: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  panchangDetails: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  muhuratRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  muhuratPillGood: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  muhuratGoodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  muhuratPillBad: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  muhuratBadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeBtnActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rashisScroll: {
    gap: 8,
    paddingBottom: 12,
  },
  rashiChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 64,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedRashiChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rashiSymbol: {
    fontSize: 18,
    color: colors.primary,
  },
  rashiName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  selectedRashiName: {
    color: '#FFFFFF',
  },
  rashiEn: {
    fontSize: 9,
    color: colors.textMuted,
  },
  selectedRashiEn: {
    color: 'rgba(255,255,255,0.8)',
  },
  horoscopeMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
    ...shadow(2),
  },
  cardHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  signHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  elementBadge: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  elementBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  rashiLordText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  audioBtnPlaying: {
    backgroundColor: colors.primary,
  },
  audioBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  headlineBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8EB',
    borderRadius: 10,
    padding: 10,
    marginVertical: 12,
    gap: 6,
  },
  headlineText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 17,
  },
  summaryParagraph: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  whyTransitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  whyTransitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  whyTransitBox: {
    backgroundColor: '#FAF7F0',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  whyTransitText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  scoresCard: {
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  scoresTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  scoreLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabelText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  starsCol: {
    flexDirection: 'row',
    gap: 2,
  },
  luckyGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  luckyBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  luckyLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  luckyVal: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
    textAlign: 'center',
  },
  dosDontsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  dosCol: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
  },
  dosHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  dosHeadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.success,
  },
  doItem: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 15,
    marginBottom: 2,
  },
  dontsCol: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 10,
  },
  dontsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  dontsHeadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
  },
  dontItem: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 15,
    marginBottom: 2,
  },
  remedyBox: {
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3DFC4',
  },
  remedyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remedyHeadTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  remedyText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    lineHeight: 17,
  },
  astroCtaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    ...shadow(2),
  },
  ctaDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  ctaSub: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 2,
    fontWeight: '700',
  },
});
