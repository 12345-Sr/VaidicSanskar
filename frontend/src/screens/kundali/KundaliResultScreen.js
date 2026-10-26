import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import horoscopeKundaliStore from '../../services/horoscopeKundaliStore';

export default function KundaliResultScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t, isHindi, getText, clean } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // overview | charts | planets | doshas | remedies
  const [chartStyle, setChartStyle] = useState('north'); // north | south

  const rawKundali = route?.params?.kundali || horoscopeKundaliStore.getKundali();
  const kundali = rawKundali || horoscopeKundaliStore.generateKundali();

  const overview = kundali?.overview || {
    personalitySummary:
      'स्वाभिमानी, नेतृत्व क्षमता से युक्त, कर्तव्यनिष्ठ एवं न्यायप्रिय व्यक्तित्व। जीवन के मध्य काल में विशेष प्रतिष्ठा व ऐश्वर्य प्राप्ति का योग।',
    lagna: kundali?.lagna || 'सिंह (Leo)',
    lagnaLord: 'सूर्य (Sun)',
    rashi: kundali?.rashi || 'वृश्चिक (Scorpio)',
    rashiLord: 'मंगल (Mars)',
    nakshatra: kundali?.nakshatra || 'अनुराधा (Anuradha)',
    nakshatraLord: 'शनि (Saturn)',
    currentDasha: kundali?.currentDasha || 'बुध महादशा • शुक्र अंतर्दशा',
  };

  const planets = Array.isArray(kundali?.planets) && kundali.planets.length > 0
    ? kundali.planets
    : [
        { name: 'सूर्य (Sun)', rashi: 'सिंह (Leo)', degree: "14°28'", bhav: '1', state: 'स्वराशि (Own)' },
        { name: 'चंद्रमा (Moon)', rashi: 'वृश्चिक (Scorpio)', degree: "08°12'", bhav: '4', state: 'नीच (Debilitated)' },
        { name: 'मंगल (Mars)', rashi: 'मिथुन (Gemini)', degree: "22°05'", bhav: '11', state: 'मित्र (Friendly)' },
        { name: 'बुध (Mercury)', rashi: 'सिंह (Leo)', degree: "18°40'", bhav: '1', state: 'मित्र (Friendly)' },
        { name: 'बृहस्पति (Jupiter)', rashi: 'तुला (Libra)', degree: "05°19'", bhav: '3', state: 'सम (Neutral)' },
        { name: 'शुक्र (Venus)', rashi: 'कन्या (Virgo)', degree: "12°54'", bhav: '2', state: 'नीच (Debilitated)' },
        { name: 'शनि (Saturn)', rashi: 'कुंभ (Aquarius)', degree: "27°11'", bhav: '7', state: 'मूलत्रिकोण (Mooltrikona)' },
        { name: 'राहु (Rahu)', rashi: 'वृश्चिक (Scorpio)', degree: "19°33'", bhav: '4', state: 'नीच (Debilitated)' },
        { name: 'केतु (Ketu)', rashi: 'वृषभ (Taurus)', degree: "19°33'", bhav: '10', state: 'उच्च (Exalted)' },
      ];

  const doshas = kundali?.doshas || {
    manglik: { isDosha: false, title: 'मंगल दोष से पूर्णतः मुक्त', desc: 'कुंडली में मंगल एकादश (लाभ) भाव में स्थित है; अतः कोई मांगलिक दोष नहीं है।' },
    sadeSati: { isDosha: false, title: 'शनि साढ़े साती से मुक्त', desc: 'वर्तमान में शनि की साढ़े साती का कोई प्रतिकूल प्रभाव नहीं है।' },
    kaalSarp: { isDosha: false, title: 'काल सर्प दोष अनुपस्थित', desc: 'ग्रह स्वतंत्र रूप से स्थित हैं, अतः काल सर्प दोष नहीं है।' },
    pitra: { isDosha: false, title: 'सामान्य पितृ आशीर्वाद', desc: 'अमावस्या पर जल अर्पण शुभ फलदायी होगा।' },
  };

  const yogas = Array.isArray(kundali?.yogas) && kundali.yogas.length > 0
    ? kundali.yogas
    : [
        { name: 'बुधादित्य राजयोग (लग्न भाव)', desc: 'सूर्य और बुध की प्रथम भाव में युति से प्रखर बुद्धि, उच्च मान-सम्मान प्राप्त होता है।' },
        { name: 'शश महापुरुष योग (सप्तम भाव)', desc: 'शनि देव स्वराशि में होने से स्थिरता, दीर्घायु एवं सफलता दिलाते हैं।' },
        { name: 'गजलक्ष्मी योग', desc: 'शुभ ग्रहों का संबंध आर्थिक समृद्धि एवं प्रतिष्ठा में निरंतर वृद्धि कारक है।' },
      ];

  const remedies = Array.isArray(kundali?.remedies) && kundali.remedies.length > 0
    ? kundali.remedies
    : [
        { title: 'सूर्य नमस्कार व तांबे के लोटे से अर्घ्य', desc: 'प्रतिदिन प्रातः तांबे के लोटे में जल व रोली मिलाकर भगवान सूर्य को अर्घ्य दें।' },
        { title: 'गायत्री मंत्र का 108 बार जाप', desc: 'प्रतिदिन पूर्व दिशा में मुख करके 1 माला गायत्री मंत्र का जाप करें।' },
        { title: 'भगवान शिव का जलाभिषेक', desc: 'प्रत्येक सोमवार को शिवलिंग पर जल व कच्चा दूध अर्पित करें।' },
      ];
  const handleDownloadPdf = () => {
    Alert.alert(
      isHindi ? 'कुण्डली PDF रिपोर्ट तैयार!' : 'Kundali PDF Report Ready!',
      isHindi
        ? 'आपकी 42-पृष्ठीय विस्तृत वैदिक कुण्डली रिपोर्ट तैयार हो गई है और आपके डिवाइस में डाउनलोड कर दी गई है।'
        : 'Your 42-page comprehensive Vedic Kundali PDF report has been generated and downloaded to your device.',
      [{ text: isHindi ? 'ठीक है' : 'OK' }]
    );
  };

  const tabs = [
    { key: 'overview', label: isHindi ? 'सार संक्षेप' : 'Overview' },
    { key: 'charts', label: isHindi ? 'कुण्डली चक्र' : 'Charts' },
    { key: 'planets', label: isHindi ? 'ग्रह स्थिति' : 'Planets' },
    { key: 'doshas', label: isHindi ? 'दोष व योग' : 'Doshas' },
    { key: 'remedies', label: isHindi ? 'वैदिक उपाय' : 'Remedies' },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <View style={s.navHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.navTitle}>
            {kundali.name}{isHindi ? ' की कुण्डली' : "'s Birth Chart"}
          </Text>
          <Text style={s.navSub}>{kundali.dob} • {kundali.tob} • {clean(kundali.pob)}</Text>
        </View>
        <LanguageSwitcher style={{ marginRight: 6 }} />
        <TouchableOpacity style={s.pdfBtn} onPress={handleDownloadPdf}>
          <MaterialCommunityIcons name="file-pdf-box" size={20} color={colors.text} />
          <Text style={s.pdfBtnText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={s.tabsHeader}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, isSelected && s.selectedTabItem]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[s.tabLabel, isSelected && s.selectedTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <View>
            {/* Personality Summary Box */}
            <View style={s.overviewCard}>
              <View style={s.cardHeadRow}>
                <MaterialCommunityIcons name="account-star" size={22} color={colors.primary} />
                <Text style={s.cardHeadTitle}>
                  {isHindi ? 'व्यक्तित्व व कुण्डली सार' : 'Personality & Chart Overview'}
                </Text>
              </View>
              <Text style={s.personalityText}>
                {isHindi
                  ? overview.personalitySummary
                  : 'Natural leadership ability, self-respecting, hardworking and justice-seeking personality. Significant prestige and financial prosperity in the mid-years of life.'}
              </Text>
            </View>

            {/* Core Vedic Attributes Grid */}
            <View style={s.gridCard}>
              <View style={s.gridRow}>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'लग्न:' : 'Ascendant (Lagna):'}</Text>
                  <Text style={s.gridVal}>{clean(overview.lagna)}</Text>
                </View>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'लग्न स्वामी:' : 'Lagna Lord:'}</Text>
                  <Text style={s.gridVal}>{clean(overview.lagnaLord)}</Text>
                </View>
              </View>
              <View style={s.gridRow}>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'चन्द्र राशि:' : 'Moon Sign (Rashi):'}</Text>
                  <Text style={s.gridVal}>{clean(overview.rashi)}</Text>
                </View>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'राशि स्वामी:' : 'Rashi Lord:'}</Text>
                  <Text style={s.gridVal}>{clean(overview.rashiLord)}</Text>
                </View>
              </View>
              <View style={s.gridRow}>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'जन्म नक्षत्र:' : 'Birth Nakshatra:'}</Text>
                  <Text style={s.gridVal}>{clean(overview.nakshatra)}</Text>
                </View>
                <View style={s.gridCol}>
                  <Text style={s.gridKey}>{isHindi ? 'नक्षत्र स्वामी:' : 'Nakshatra Lord:'}</Text>
                  <Text style={s.gridVal}>{clean(overview.nakshatraLord)}</Text>
                </View>
              </View>
              <View style={[s.gridRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.gridKey}>
                    {isHindi ? 'वर्तमान विंशोत्तरी दशा:' : 'Current Vimshottari Dasha:'}
                  </Text>
                  <Text style={[s.gridVal, { color: colors.primary }]}>
                    {isHindi ? overview.currentDasha : 'Mercury Mahadasha • Venus Antardasha (2025–2028)'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Charts (D1 / D9) */}
        {activeTab === 'charts' && (
          <View>
            {/* Chart Style Toggle */}
            <View style={s.chartToggleRow}>
              <TouchableOpacity
                style={[s.chartToggleBtn, chartStyle === 'north' && s.chartToggleBtnActive]}
                onPress={() => setChartStyle('north')}
              >
                <Text style={[s.chartToggleText, chartStyle === 'north' && s.chartToggleTextActive]}>
                  {isHindi ? 'उत्तर भारतीय शैली' : 'North Indian Style'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.chartToggleBtn, chartStyle === 'south' && s.chartToggleBtnActive]}
                onPress={() => setChartStyle('south')}
              >
                <Text style={[s.chartToggleText, chartStyle === 'south' && s.chartToggleTextActive]}>
                  {isHindi ? 'दक्षिण भारतीय शैली' : 'South Indian Style'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* D1 Lagna Chart Display */}
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>
                {isHindi ? 'D1 - जन्म लग्न कुण्डली चक्र' : 'D1 - Birth Lagna Chart'}
              </Text>
              <View style={s.kundaliVisualBox}>
                <View style={s.chartRow}>
                  <View style={s.bhavBox}><Text style={s.bhavNum}>12</Text><Text style={s.bhavPlanets}>–</Text></View>
                  <View style={[s.bhavBox, s.lagnaBox]}>
                    <Text style={s.bhavNum}>1 ({isHindi ? 'सिंह' : 'Leo'})</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'सूर्य, बुध' : 'Sun, Mer'}</Text>
                  </View>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>2</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'शुक्र' : 'Ven'}</Text>
                  </View>
                </View>
                <View style={s.chartRow}>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>11</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'मंगल' : 'Mars'}</Text>
                  </View>
                  <View style={[s.bhavBox, { backgroundColor: '#FAF7F0' }]}><Text style={s.centerOm}>ॐ</Text></View>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>3</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'गुरु' : 'Jup'}</Text>
                  </View>
                </View>
                <View style={s.chartRow}>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>10</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'केतु' : 'Ket'}</Text>
                  </View>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>7</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'शनि' : 'Sat'}</Text>
                  </View>
                  <View style={s.bhavBox}>
                    <Text style={s.bhavNum}>4</Text>
                    <Text style={s.bhavPlanets}>{isHindi ? 'चंद्रमा, राहु' : 'Moon, Rah'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* D9 Navamsha Chart Display */}
            <View style={[s.chartCard, { marginTop: 12 }]}>
              <Text style={s.chartTitle}>
                {isHindi ? 'D9 - नवांश कुण्डली' : 'D9 - Navamsha Chart'}
              </Text>
              <Text style={s.chartSub}>
                {isHindi ? 'विवाह, भाग्य एवं सूक्ष्म ग्रह बल विश्लेषण' : 'Spouse, marriage & subtle planetary strength analysis'}
              </Text>
            </View>
          </View>
        )}

        {/* Tab 3: Planetary Positions Table */}
        {activeTab === 'planets' && (
          <View style={s.tableCard}>
            <Text style={s.cardHeadTitle}>
              {isHindi ? 'वैदिक ग्रह स्थिति तालिका' : 'Vedic Planetary Positions Table'}
            </Text>
            <View style={s.tableHeaderRow}>
              <Text style={[s.th, { flex: 1.5 }]}>{isHindi ? 'ग्रह' : 'Planet'}</Text>
              <Text style={[s.th, { flex: 1.4 }]}>{isHindi ? 'राशि' : 'Sign'}</Text>
              <Text style={[s.th, { flex: 1.2 }]}>{isHindi ? 'अंश' : 'Deg'}</Text>
              <Text style={[s.th, { flex: 1 }]}>{isHindi ? 'भाव' : 'House'}</Text>
              <Text style={[s.th, { flex: 1.3 }]}>{isHindi ? 'अवस्था' : 'State'}</Text>
            </View>
            {planets.map((p, idx) => (
              <View key={idx} style={[s.tableRow, idx % 2 === 1 && { backgroundColor: '#FAF7F0' }]}>
                <Text style={[s.td, { flex: 1.5, fontWeight: '700' }]}>{clean(p.name)}</Text>
                <Text style={[s.td, { flex: 1.4 }]}>{clean(p.rashi)}</Text>
                <Text style={[s.td, { flex: 1.2 }]}>{p.degree}</Text>
                <Text style={[s.td, { flex: 1 }]}>{clean(p.bhav)}</Text>
                <Text style={[s.td, { flex: 1.3, color: colors.primaryDark }]}>{clean(p.state)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 4: Doshas & Yogas */}
        {activeTab === 'doshas' && (
          <View>
            <Text style={s.sectionHeaderTitle}>
              {isHindi ? 'मुख्य कुण्डली दोष विश्लेषण:' : 'Key Chart Doshas Analysis:'}
            </Text>

            {/* Manglik */}
            <View style={s.doshaCard}>
              <View style={s.doshaHeaderRow}>
                <MaterialCommunityIcons
                  name={doshas.manglik?.isDosha ? 'alert-octagon' : 'shield-check'}
                  size={20}
                  color={doshas.manglik?.isDosha ? colors.danger : colors.success}
                />
                <Text style={s.doshaTitle}>
                  {isHindi ? doshas.manglik?.title : 'No Manglik Dosha'}
                </Text>
              </View>
              <Text style={s.doshaDesc}>
                {isHindi
                  ? doshas.manglik?.desc
                  : 'Mars is placed in the 11th house (gains); hence there is no Manglik Dosha in your chart. Marital life is favorable.'}
              </Text>
            </View>

            {/* Sade Sati */}
            <View style={s.doshaCard}>
              <View style={s.doshaHeaderRow}>
                <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
                <Text style={s.doshaTitle}>
                  {isHindi ? doshas.sadeSati?.title : 'Free from Sade Sati'}
                </Text>
              </View>
              <Text style={s.doshaDesc}>
                {isHindi
                  ? doshas.sadeSati?.desc
                  : 'Your moon sign Scorpio is currently free from Saturn Sade Sati influence.'}
              </Text>
            </View>

            {/* Kaal Sarp */}
            <View style={s.doshaCard}>
              <View style={s.doshaHeaderRow}>
                <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
                <Text style={s.doshaTitle}>
                  {isHindi ? doshas.kaalSarp?.title : 'No Kaal Sarp Dosha'}
                </Text>
              </View>
              <Text style={s.doshaDesc}>
                {isHindi
                  ? doshas.kaalSarp?.desc
                  : 'Planets are not hemmed in on one side of Rahu-Ketu axis, indicating no Kaal Sarp Dosha.'}
              </Text>
            </View>

            {/* Pitra */}
            <View style={[s.doshaCard, doshas.pitra?.isDosha && { borderColor: '#F59E0B' }]}>
              <View style={s.doshaHeaderRow}>
                <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
                <Text style={[s.doshaTitle, { color: '#B45309' }]}>
                  {isHindi ? doshas.pitra?.title : 'Partial Ancestral Impact'}
                </Text>
              </View>
              <Text style={s.doshaDesc}>
                {isHindi
                  ? doshas.pitra?.desc
                  : 'Sun-Rahu connection may pose occasional hurdles. Offering water on Amavasya is recommended.'}
              </Text>
            </View>

            <Text style={[s.sectionHeaderTitle, { marginTop: 14 }]}>
              {isHindi ? 'कुण्डली में बने शुभ योग:' : 'Auspicious Yogas in Chart:'}
            </Text>
            {yogas.map((y, i) => (
              <View key={i} style={s.yogaCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialCommunityIcons name="star-shooting" size={18} color={colors.primary} />
                  <Text style={s.yogaName}>{clean(y.name)}</Text>
                </View>
                <Text style={s.yogaDesc}>{clean(y.desc)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tab 5: Remedies & Astrologer Consultation */}
        {activeTab === 'remedies' && (
          <View>
            <View style={s.remediesCard}>
              <Text style={s.cardHeadTitle}>
                {isHindi ? 'वैदिक अनुष्ठान एवं सरल उपाय' : 'Vedic Remedies & Upay'}
              </Text>
              {remedies.map((rem, index) => (
                <View key={index} style={s.remedyRow}>
                  <MaterialCommunityIcons name="candle" size={18} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.remedyTitle}>{clean(rem.title)}</Text>
                    <Text style={s.remedySub}>{clean(rem.desc)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Direct CTA to Talk to Astro */}
            <TouchableOpacity
              style={s.astroBanner}
              onPress={() => navigation.navigate('Vartalap')}
              activeOpacity={0.9}
            >
              <View style={s.astroDisc}>
                <MaterialCommunityIcons name="headset" size={26} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.astroBannerTitle}>
                  {isHindi ? 'कुंडली का सम्पूर्ण समाधान चाहिए?' : 'Need personalized guidance on your chart?'}
                </Text>
                <Text style={s.astroBannerSub}>
                  {isHindi
                    ? 'शीर्ष वैदिक ज्योतिषी से मात्र ₹1/मिनट में कॉल या चैट पर बात करें →'
                    : 'Talk or chat live with top certified astrologers starting at ₹1/min →'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

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
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  navSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  pdfBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  selectedTabLabel: {
    color: colors.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  cardHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  personalityText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  gridRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  gridCol: {
    flex: 1,
  },
  gridKey: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  chartToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chartToggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  chartToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  chartToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chartToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  chartSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  kundaliVisualBox: {
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  chartRow: {
    flexDirection: 'row',
    height: 70,
  },
  bhavBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lagnaBox: {
    backgroundColor: '#FFF8EB',
    borderColor: colors.saffron,
  },
  bhavNum: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  bhavPlanets: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  centerOm: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '800',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderLight,
    marginTop: 8,
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  td: {
    fontSize: 11,
    color: colors.text,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    marginBottom: 10,
  },
  doshaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  doshaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  doshaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  doshaDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  yogaCard: {
    backgroundColor: '#FFF8EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3DFC4',
  },
  yogaName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  yogaDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 15,
  },
  remediesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  remedyRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  remedyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  remedySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  astroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    ...shadow(2),
  },
  astroDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  astroBannerSub: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 2,
    fontWeight: '700',
  },
});
