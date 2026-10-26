import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { Header } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';
import dailyPanditStore, {
  POOJA_VIDHIS,
  FREQUENCIES,
  TIME_SLOTS,
  DURATION_PLANS,
  SITE_TYPES,
} from '../../services/dailyPanditStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';

export default function DailyPanditScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();
  const currentSub = dailyPanditStore.getSubscription();

  // Form states
  const [selectedVidhi, setSelectedVidhi] = useState(POOJA_VIDHIS[1].id);
  const [selectedFreq, setSelectedFreq] = useState(FREQUENCIES[0].id);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [selectedAltSlot, setSelectedAltSlot] = useState(TIME_SLOTS[2]);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [samagriByUs, setSamagriByUs] = useState(false);

  // Site details
  const [siteType, setSiteType] = useState('shop');
  const [siteName, setSiteName] = useState('');
  const [address, setAddress] = useState('');
  const [floorNote, setFloorNote] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [specialNote, setSpecialNote] = useState('');

  // B2B & Autopay
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [autoPay, setAutoPay] = useState(true);

  // Quote calculation
  const quote = dailyPanditStore.calculateQuote({
    vidhiId: selectedVidhi,
    frequencyId: selectedFreq,
    durationMonths: selectedDuration,
    samagriByUs,
    isB2B,
  });

  const handleSubscribe = () => {
    if (!siteName.trim() || !address.trim() || !contactPerson.trim() || !contactMobile.trim()) {
      Alert.alert('अपूर्ण जानकारी', 'कृपया स्थल का नाम, पता व संपर्क व्यक्ति का विवरण भरें।');
      return;
    }

    dailyPanditStore.createSubscription({
      siteType,
      siteName,
      address,
      floorNote,
      contactPerson,
      contactMobile,
      vidhiId: selectedVidhi,
      frequencyId: selectedFreq,
      slot: selectedSlot,
      altSlot: selectedAltSlot,
      durationMonths: selectedDuration,
      samagriByUs,
      isB2B,
      companyName,
      gstin,
      autoPayEnabled: autoPay,
      specialNote,
    });

    Alert.alert(
      'सब्सक्रिप्शन अनुरोध दर्ज!',
      'आपका दैनिक पूजा अनुरोध दर्ज हो गया है। 48 घंटे के भीतर आपके क्षेत्र के समर्पित पंडित जी आवंटित कर दिए जाएंगे।',
      [{ text: 'शेड्यूल देखें', onPress: () => navigation.navigate('MySchedule') }]
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.navHeader}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
          <Text style={s.navTitle} numberOfLines={1}>
            {isHindi ? 'दैनिक पंडित' : 'Daily Pandit'}
          </Text>
          <Text style={s.navSub} numberOfLines={1}>
            {isHindi ? 'नित्य वैदिक पूजा सब्सक्रिप्शन' : 'Daily Vedic Pooja Subscription'}
          </Text>
        </View>
        <TouchableOpacity
          style={s.scheduleIconBtn}
          onPress={() => navigation.navigate('MySchedule')}
        >
          <MaterialCommunityIcons name="calendar-check" size={20} color={colors.text} />
          <Text style={s.scheduleBtnText}>
            {isHindi ? 'शेड्यूल' : 'Schedule'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active subscription shortcut if exists */}
        {currentSub && (
          <TouchableOpacity
            style={s.activeSubBanner}
            onPress={() => navigation.navigate('MySchedule')}
          >
            <View style={s.activeSubIcon}>
              <MaterialCommunityIcons name="bell-ring" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[s.activeSubTitle, { flexShrink: 1, marginRight: 6 }]} numberOfLines={1}>
                  {isHindi ? 'सक्रिय सब्सक्रिप्शन: ' : 'Active: '}{currentSub.siteName}
                </Text>
                <View style={s.livePill}>
                  <Text style={s.livePillText}>Live</Text>
                </View>
              </View>
              <Text style={s.activeSubMeta} numberOfLines={1}>
                {isHindi
                  ? `आज का स्टेटस: ${currentSub.todayVisit?.status === 'COMPLETED' ? 'पूजा संपन्न (7:32 AM)' : 'निर्धारित'} • टैप करें`
                  : `Today's status: ${currentSub.todayVisit?.status === 'COMPLETED' ? 'Completed (7:32 AM)' : 'Scheduled'} • Tap`}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Hero Banner */}
        <View style={s.heroBanner}>
          <View style={s.heroContent}>
            <View style={s.goldBadge}>
              <MaterialCommunityIcons name="shield-check" size={14} color={colors.text} />
              <Text style={s.goldBadgeText}>100% हाजिरी गारंटी • समर्पित पंडित</Text>
            </View>
            <Text style={s.heroHeadline}>घर, दुकान व ऑफिस में नित्य वैदिक पूजन</Text>
            <Text style={s.heroDesc}>
              रोज एक ही समर्पित पंडित जी, इन-ऐप कैमरा फोटो प्रमाण और छूटने पर स्वतः क्रेडिट।
            </Text>
          </View>
          <Image
            source={resolveDevotionalSource('vedic_pandit')}
            style={s.heroImage}
          />
        </View>

        {/* 3 Pillars Value Props */}
        <View style={s.pillarsRow}>
          <View style={s.pillarCard}>
            <MaterialCommunityIcons name="account-tie" size={22} color={colors.primary} />
            <Text style={s.pillarTitle}>स्थाई पंडित</Text>
            <Text style={s.pillarSub}>रोज एक ही पंडित जी, अटूट विश्वास</Text>
          </View>
          <View style={s.pillarCard}>
            <MaterialCommunityIcons name="camera-metering-center" size={22} color={colors.primary} />
            <Text style={s.pillarTitle}>रोज फोटो रिपोर्ट</Text>
            <Text style={s.pillarSub}>GPS व समय मोहर के साथ लाइव प्रमाण</Text>
          </View>
          <View style={s.pillarCard}>
            <MaterialCommunityIcons name="calendar-sync" size={22} color={colors.primary} />
            <Text style={s.pillarTitle}>बैकअप व्यवस्था</Text>
            <Text style={s.pillarSub}>अवकाश पर बैकअप, छूटी तो स्वतः क्रेडिट</Text>
          </View>
        </View>

        {/* Section 1: Pooja Vidhi */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionNum}>1</Text>
          <Text style={s.sectionTitle}>पूजा की विधि चुनें (Select Puja Vidhi)</Text>
        </View>

        {POOJA_VIDHIS.map((vidhi) => {
          const isSelected = selectedVidhi === vidhi.id;
          return (
            <TouchableOpacity
              key={vidhi.id}
              style={[s.vidhiCard, isSelected && s.selectedCard]}
              onPress={() => setSelectedVidhi(vidhi.id)}
              activeOpacity={0.88}
            >
              <View style={s.vidhiTop}>
                <View style={[s.vidhiIconWrap, isSelected && { backgroundColor: colors.saffron }]}>
                  <MaterialCommunityIcons
                    name={vidhi.icon}
                    size={22}
                    color={isSelected ? colors.text : colors.primary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={s.vidhiName}>{vidhi.name}</Text>
                    {vidhi.popular && (
                      <View style={s.popularTag}>
                        <Text style={s.popularTagText}>सर्वाधिक लोकप्रिय</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.vidhiDuration}>
                    समय: ~{vidhi.durationMin} मिनट • {vidhi.recommendedFor}
                  </Text>
                </View>
              </View>
              <Text style={s.vidhiDesc}>{vidhi.description}</Text>
              <View style={s.vidhiBottom}>
                <Text style={s.vidhiPrice}>₹{vidhi.basePriceMonthly.toLocaleString('en-IN')}<Text style={s.perMonth}> / माह</Text></Text>
                <View style={[s.radioCircle, isSelected && s.radioCircleSelected]}>
                  {isSelected && <View style={s.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Section 2: Frequency */}
        <View style={[s.sectionHeader, { marginTop: 24 }]}>
          <Text style={s.sectionNum}>2</Text>
          <Text style={s.sectionTitle}>पूजा की आवृत्ति (Frequency)</Text>
        </View>

        <View style={s.chipGrid}>
          {FREQUENCIES.map((freq) => {
            const isSelected = selectedFreq === freq.id;
            return (
              <TouchableOpacity
                key={freq.id}
                style={[s.freqChip, isSelected && s.selectedFreqChip]}
                onPress={() => setSelectedFreq(freq.id)}
              >
                <Text style={[s.freqLabel, isSelected && s.selectedFreqLabel]}>{freq.label}</Text>
                <Text style={[s.freqSub, isSelected && s.selectedFreqSub]}>
                  {freq.daysPerMonth} दिन • {freq.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3: Time Slot */}
        <View style={[s.sectionHeader, { marginTop: 24 }]}>
          <Text style={s.sectionNum}>3</Text>
          <Text style={s.sectionTitle}>प्राथमिक समय स्लॉट (Preferred Time Slot)</Text>
        </View>
        <Text style={s.subHelpText}>पंडित जी प्रतिदिन इस निश्चित समय पर उपस्थित होंगे:</Text>

        <View style={s.slotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[s.slotChip, isSelected && s.selectedSlotChip]}
                onPress={() => setSelectedSlot(slot)}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.primary}
                />
                <Text style={[s.slotText, isSelected && s.selectedSlotText]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s.subHelpText, { marginTop: 12 }]}>वैकल्पिक समय स्लॉट (Alternative Slot - यदि प्राथमिक व्यस्त हो):</Text>
        <View style={s.slotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isAlt = selectedAltSlot === slot;
            return (
              <TouchableOpacity
                key={`alt-${slot}`}
                style={[s.altSlotChip, isAlt && s.selectedAltSlotChip]}
                onPress={() => setSelectedAltSlot(slot)}
              >
                <Text style={[s.altSlotText, isAlt && s.selectedAltSlotText]}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 4: Venue & Site Details */}
        <View style={[s.sectionHeader, { marginTop: 24 }]}>
          <Text style={s.sectionNum}>4</Text>
          <Text style={s.sectionTitle}>स्थान व मंदिर विवरण (Site Details)</Text>
        </View>

        {/* Site Type Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.siteTypesRow}>
          {SITE_TYPES.map((st) => {
            const isSelected = siteType === st.id;
            return (
              <TouchableOpacity
                key={st.id}
                style={[s.siteTypeChip, isSelected && s.selectedSiteTypeChip]}
                onPress={() => setSiteType(st.id)}
              >
                <MaterialCommunityIcons
                  name={st.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.primary}
                />
                <Text style={[s.siteTypeLabel, isSelected && s.selectedSiteTypeLabel]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={s.formBox}>
          <Text style={s.inputLabel}>स्थान / प्रतिष्ठान का नाम *</Text>
          <TextInput
            style={s.textInput}
            value={siteName}
            onChangeText={setSiteName}
            placeholder="उदा. शर्मा निवास / बालाजी टेक्सटाइल्स"
            placeholderTextColor="#A8988C"
          />

          <Text style={[s.inputLabel, { marginTop: 12 }]}>पूरा पता व लैंडमार्क *</Text>
          <TextInput
            style={[s.textInput, { height: 60 }]}
            value={address}
            onChangeText={setAddress}
            multiline
            placeholder="दुकान/मकान संख्या, मार्केट, मोहल्ला, शहर"
            placeholderTextColor="#A8988C"
          />

          <Text style={[s.inputLabel, { marginTop: 12 }]}>पूजा स्थल का स्थान (Floor / Room Note)</Text>
          <TextInput
            style={s.textInput}
            value={floorNote}
            onChangeText={setFloorNote}
            placeholder="उदा. प्रथम तल, रिसेप्शन के पीछे मंदिर"
            placeholderTextColor="#A8988C"
          />

          <View style={s.rowTwoInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.inputLabel}>संपर्क व्यक्ति *</Text>
              <TextInput
                style={s.textInput}
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholder="नाम"
                placeholderTextColor="#A8988C"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.inputLabel}>मोबाइल नंबर *</Text>
              <TextInput
                style={s.textInput}
                value={contactMobile}
                onChangeText={setContactMobile}
                placeholder="+91"
                placeholderTextColor="#A8988C"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Text style={[s.inputLabel, { marginTop: 12 }]}>विशेष निर्देश / नित्य संकल्प नोट</Text>
          <TextInput
            style={s.textInput}
            value={specialNote}
            onChangeText={setSpecialNote}
            placeholder="उदा. शनिवार को हनुमान चालीसा, गंगाजल छिड़काव"
            placeholderTextColor="#A8988C"
          />
        </View>

        {/* Samagri Add-on Toggle */}
        <View style={s.toggleRowCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="flower-tulip" size={20} color={colors.primary} />
              <Text style={s.toggleCardTitle}> मासिक सामग्री किट जोड़ें (+₹999/माह)</Text>
            </View>
            <Text style={s.toggleCardSub}>
              रोली, मौली, अक्षत, धूपबत्ती, कर्पूर, रुई बत्ती, चंदन प्रतिमाह आपके पते पर E-Store से डिलीवर होगी।
            </Text>
          </View>
          <Switch
            value={samagriByUs}
            onValueChange={setSamagriByUs}
            trackColor={{ false: '#ECE3D7', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* B2B / GST Toggle */}
        <View style={s.toggleRowCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
              <Text style={s.toggleCardTitle}> व्यावसायिक GST इनवॉइस चाहिए?</Text>
            </View>
            <Text style={s.toggleCardSub}>
              कंपनी के नाम पर GST इनपुट क्रेडिट बिल व मासिक डिजिटल उपस्थिति रिपोर्ट।
            </Text>
          </View>
          <Switch
            value={isB2B}
            onValueChange={setIsB2B}
            trackColor={{ false: '#ECE3D7', true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {isB2B && (
          <View style={[s.formBox, { marginTop: 8 }]}>
            <Text style={s.inputLabel}>कंपनी का पंजीकृत नाम</Text>
            <TextInput
              style={s.textInput}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="उदा. बालाजी टेक्सटाइल्स प्राइवेट लिमिटेड"
              placeholderTextColor="#A8988C"
            />
            <Text style={[s.inputLabel, { marginTop: 10 }]}>GSTIN संख्या</Text>
            <TextInput
              style={s.textInput}
              value={gstin}
              onChangeText={setGstin}
              placeholder="उदा. 09AAACB2201Z1Z8"
              autoCapitalize="characters"
              placeholderTextColor="#A8988C"
            />
          </View>
        )}

        {/* Section 5: Duration Plan */}
        <View style={[s.sectionHeader, { marginTop: 24 }]}>
          <Text style={s.sectionNum}>5</Text>
          <Text style={s.sectionTitle}>अवधि व बचत (Plan Duration)</Text>
        </View>

        <View style={s.durationGrid}>
          {DURATION_PLANS.map((d) => {
            const isSelected = selectedDuration === d.months;
            return (
              <TouchableOpacity
                key={d.months}
                style={[s.durationCard, isSelected && s.selectedDurationCard]}
                onPress={() => setSelectedDuration(d.months)}
              >
                {d.bestValue && (
                  <View style={s.bestValueBadge}>
                    <Text style={s.bestValueText}>सर्वोत्तम बचत</Text>
                  </View>
                )}
                <Text style={[s.durationMonths, isSelected && s.selectedDurationMonths]}>
                  {d.months} माह
                </Text>
                <Text style={[s.durationDiscount, isSelected && s.selectedDurationDiscount]}>
                  {d.discountPercent > 0 ? `${d.discountPercent}% की छूट` : 'नियमित बिल'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 6: Pricing Summary */}
        <View style={s.priceSummaryBox}>
          <View style={s.summaryHead}>
            <MaterialCommunityIcons name="calculator-variant" size={20} color={colors.primary} />
            <Text style={s.summaryHeadTitle}>भुगतान व बिल सारांश</Text>
          </View>

          <View style={s.summaryLine}>
            <Text style={s.summaryKey}>कुल मासिक विज़िट्स:</Text>
            <Text style={s.summaryVal}>{quote.visitsPerMonth} दिन / माह</Text>
          </View>

          <View style={s.summaryLine}>
            <Text style={s.summaryKey}>आधार दर ({quote.vidhi.name}):</Text>
            <Text style={s.summaryVal}>₹{quote.baseMonthly.toLocaleString('en-IN')}</Text>
          </View>

          {quote.samagriMonthly > 0 && (
            <View style={s.summaryLine}>
              <Text style={s.summaryKey}>मासिक सामग्री किट:</Text>
              <Text style={s.summaryVal}>+₹{quote.samagriMonthly}</Text>
            </View>
          )}

          {quote.discountAmountMonthly > 0 && (
            <View style={s.summaryLine}>
              <Text style={[s.summaryKey, { color: colors.success }]}>
                लंबी अवधि छूट ({quote.plan.discountPercent}%):
              </Text>
              <Text style={[s.summaryVal, { color: colors.success }]}>
                -₹{quote.discountAmountMonthly * quote.plan.months}
              </Text>
            </View>
          )}

          {quote.gstAmount > 0 && (
            <View style={s.summaryLine}>
              <Text style={s.summaryKey}>18% GST (B2B इनपुट क्रेडिट):</Text>
              <Text style={s.summaryVal}>+₹{quote.gstAmount}</Text>
            </View>
          )}

          <View style={s.summaryDivider} />

          <View style={s.summaryTotalLine}>
            <View>
              <Text style={s.netTotalLabel}>कुल देय राशि ({quote.plan.months} माह):</Text>
              <Text style={s.netTotalSub}>₹{Math.round(quote.finalTotal / quote.plan.months).toLocaleString('en-IN')} / माह प्रभावी</Text>
            </View>
            <Text style={s.netTotalAmount}>₹{quote.finalTotal.toLocaleString('en-IN')}</Text>
          </View>

          {/* Autopay Checkbox */}
          <TouchableOpacity
            style={s.autoPayRow}
            onPress={() => setAutoPay(!autoPay)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={autoPay ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={22}
              color={colors.primary}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.autoPayText}>UPI AutoPay / e-Mandate सक्रिय रखें</Text>
              <Text style={s.autoPaySub}>
                अनिर्बाध नित्य पूजा हेतु मासिक स्वतः नवीनीकरण (5 दिन पूर्व सूचना व कभी भी रद्दीकरण)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SLA Guarantee Box */}
        <View style={s.slaBox}>
          <MaterialCommunityIcons name="clock-check-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.slaTitle}>48-घंटे पंडित आवंटन SLA गारंटी</Text>
            <Text style={s.slaText}>
              अनुरोध के 48 घंटे के भीतर आपके क्षेत्र के सत्यापित पंडित जी आवंटित हो जाएंगे। किसी कारणवश आवंटन न होने पर 100% स्वतः रिफंड।
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={s.bottomPriceCol}>
          <Text style={s.bottomPriceLabel}>प्रभावी शुल्क</Text>
          <Text style={s.bottomPriceValue}>
            ₹{Math.round(quote.finalTotal / quote.plan.months).toLocaleString('en-IN')}
            <Text style={s.bottomMonthSub}>/माह</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={s.submitBtn}
          onPress={handleSubscribe}
          activeOpacity={0.9}
        >
          <Text style={s.submitBtnText}>सब्सक्रिप्शन शुरू करें</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  navSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scheduleIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  scheduleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  activeSubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    ...shadow(2),
  },
  activeSubIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSubTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  livePill: {
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeSubMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6E9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1D9B5',
    marginBottom: 16,
  },
  heroContent: {
    flex: 1,
    paddingRight: 10,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.saffron,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
  },
  heroHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    lineHeight: 22,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  heroImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  pillarCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  pillarSub: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  vidhiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBF5',
  },
  vidhiTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vidhiIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFF0D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vidhiName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  popularTag: {
    backgroundColor: colors.saffron,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
  },
  vidhiDuration: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  vidhiDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 17,
  },
  vidhiBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  vidhiPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  perMonth: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C5B5A7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqChip: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedFreqChip: {
    borderColor: colors.primary,
    backgroundColor: '#FFF9EE',
  },
  freqLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  selectedFreqLabel: {
    color: colors.primary,
  },
  freqSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedFreqSub: {
    color: colors.text,
  },
  subHelpText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
    flex: 1,
    minWidth: '46%',
    justifyContent: 'center',
  },
  selectedSlotChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  selectedSlotText: {
    color: '#FFFFFF',
  },
  altSlotChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedAltSlotChip: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.saffron,
  },
  altSlotText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  selectedAltSlotText: {
    color: colors.text,
    fontWeight: '800',
  },
  siteTypesRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  siteTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 6,
  },
  selectedSiteTypeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  siteTypeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  selectedSiteTypeLabel: {
    color: '#FFFFFF',
  },
  formBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  rowTwoInputs: {
    flexDirection: 'row',
    marginTop: 12,
  },
  toggleRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
    gap: 12,
  },
  toggleCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  toggleCardSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 15,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  selectedDurationCard: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBF5',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  durationMonths: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  selectedDurationMonths: {
    color: colors.primary,
  },
  durationDiscount: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedDurationDiscount: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  priceSummaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  summaryHeadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryKey: {
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  summaryTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  netTotalSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  netTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: serif,
  },
  autoPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  autoPayText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  autoPaySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  slaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3DFC4',
  },
  slaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  slaText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    ...shadow(4),
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  bottomMonthSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.saffron,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
});
