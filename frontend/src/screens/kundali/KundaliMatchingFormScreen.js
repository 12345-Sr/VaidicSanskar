import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import horoscopeKundaliStore from '../../services/horoscopeKundaliStore';
import { AstroService } from '../../services/api';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';

export default function KundaliMatchingFormScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { t, getText, clean, isHindi } = useLanguage();
  const { showNotification } = useNotification();
  const mode = route.params?.mode || 'match'; // 'make' or 'match'

  // Input Mode: 'manual' or 'upload'
  const [entryMethod, setEntryMethod] = useState('manual');

  // Form states - manual
  const [boyName, setBoyName] = useState('');
  const [boyDob, setBoyDob] = useState('');
  const [boyTob, setBoyTob] = useState('');
  const [boyPob, setBoyPob] = useState('');

  const [girlName, setGirlName] = useState('');
  const [girlDob, setGirlDob] = useState('');
  const [girlTob, setGirlTob] = useState('');
  const [girlPob, setGirlPob] = useState('');

  // Upload states
  const [primaryFile, setPrimaryFile] = useState(null);
  const [secondaryFile, setSecondaryFile] = useState(null);
  const [uploadNote, setUploadNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showMatchResult, setShowMatchResult] = useState(false);
  const [matchData, setMatchData] = useState(null);

  // Pick Image
  const pickFileImage = async (isSecondary = false) => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(isHindi ? 'अनुमति आवश्यक' : 'Permission Required', isHindi ? 'गैलरी की अनुमति दें।' : 'Allow gallery permission.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const fileObj = {
          uri: res.assets[0].uri,
          name: res.assets[0].fileName || `Kundali_${Date.now()}.jpg`,
          isImage: true,
          size: res.assets[0].fileSize ? `${Math.round(res.assets[0].fileSize / 1024)} KB` : 'Image',
        };
        if (isSecondary) setSecondaryFile(fileObj);
        else setPrimaryFile(fileObj);
      }
    } catch (e) {
      console.warn('Pick error:', e);
    }
  };

  // Pick PDF
  const pickFilePdf = async (isSecondary = false) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const doc = res.assets[0];
        const isPdf = doc.mimeType?.includes('pdf') || doc.name?.toLowerCase().endsWith('.pdf');
        const fileObj = {
          uri: doc.uri,
          name: doc.name,
          isImage: !isPdf,
          size: doc.size ? `${Math.round(doc.size / 1024)} KB` : (isPdf ? 'PDF' : 'Doc'),
        };
        if (isSecondary) setSecondaryFile(fileObj);
        else setPrimaryFile(fileObj);
      }
    } catch (e) {
      console.warn('Doc picker error:', e);
    }
  };

  const handleAction = () => {
    if (entryMethod === 'upload') {
      if (!primaryFile) {
        Alert.alert(
          isHindi ? 'फाइल आवश्यक' : 'File Required',
          isHindi ? 'कृपया कुण्डली की फोटो अथवा PDF संलग्न करें।' : 'Please attach Kundali image or PDF.'
        );
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        const req = horoscopeKundaliStore.submitAnalysisRequest({
          devoteeName: boyName.trim() || (mode === 'match' ? 'वर व कन्या पक्ष' : 'श्रद्धालु जातक'),
          concern: mode === 'match' ? 'विवाह व कुण्डली मिलान' : 'विस्तृत कुण्डली विश्लेषण',
          question: uploadNote.trim(),
          file: primaryFile,
        });

        showNotification({
          type: 'success',
          title: isHindi ? '🙏 कुण्डली विश्लेषण अनुरोध प्राप्त' : '🙏 Kundali Received for Analysis',
          message: isHindi
            ? `आपकी कुण्डली (टोकन: ${req.id}) पूज्य पंडित जी को प्रेषित कर दी गई है।`
            : `Your chart (Token: ${req.id}) has been forwarded to certified Vedic Pandit.`,
          duration: 8000,
        });

        navigation.navigate('Kundali');
      }, 700);
      return;
    }

    if (mode === 'make') {
      if (!boyName.trim() || !boyDob.trim() || !boyPob.trim()) {
        Alert.alert(t('incompleteInfo'), t('fillRequiredFields'));
        return;
      }
      horoscopeKundaliStore.generateKundali({
        name: boyName,
        dob: boyDob,
        tob: boyTob,
        pob: boyPob,
      });
      navigation.navigate('KundaliResult', { mode: 'make' });
    } else {
      if (!boyName.trim() || !girlName.trim()) {
        Alert.alert(t('incompleteInfo'), t('fillBothGroomBride'));
        return;
      }
      setIsSubmitting(true);
      const groomPayload = {
        name: boyName.trim(),
        dateOfBirth: boyDob.trim() || '1995-08-24',
        timeOfBirth: boyTob.trim() || '14:15',
        placeOfBirth: boyPob.trim() || 'New Delhi',
      };
      const bridePayload = {
        name: girlName.trim(),
        dateOfBirth: girlDob.trim() || '1998-05-12',
        timeOfBirth: girlTob.trim() || '10:30',
        placeOfBirth: girlPob.trim() || 'New Delhi',
      };

      AstroService.matchKundali({ groom: groomPayload, bride: bridePayload })
        .then((res) => {
          const matchResult = res?.data || res;
          const b = matchResult.breakdown || {};
          const ashtakoot = [
            { name: 'वर्ण (Varna)', name_en: 'Varna', score: b.varna?.score ?? 1, max: 1, desc: `वर: ${b.varna?.groom_value || 'विप्र'}, कन्या: ${b.varna?.bride_value || 'विप्र'}`, desc_en: `Groom: ${b.varna?.groom_value || 'Brahmin'}, Bride: ${b.varna?.bride_value || 'Brahmin'}` },
            { name: 'वश्य (Vashya)', name_en: 'Vashya', score: b.vashya?.score ?? 0, max: 2, desc: `वर: ${b.vashya?.groom_value || 'जलचर'}, कन्या: ${b.vashya?.bride_value || 'कीट'}`, desc_en: `Groom: ${b.vashya?.groom_value || 'Jalchar'}, Bride: ${b.vashya?.bride_value || 'Keet'}` },
            { name: 'तारा (Tara)', name_en: 'Tara', score: b.tara?.score ?? 0, max: 3, desc: 'जन्म नक्षत्र तारा विचार', desc_en: 'Birth star compatibility' },
            { name: 'योनि (Yoni)', name_en: 'Yoni', score: b.yoni?.score ?? 2, max: 4, desc: `वर: ${b.yoni?.groom_value || 'अज'}, कन्या: ${b.yoni?.bride_value || 'मृग'}`, desc_en: `Groom: ${b.yoni?.groom_value || 'Goat'}, Bride: ${b.yoni?.bride_value || 'Deer'}` },
            { name: 'ग्रह मैत्री (Maitri)', name_en: 'Graha Maitri', score: b.graha_maitri?.score ?? 4, max: 5, desc: `राशि स्वामी संबंध: ${b.graha_maitri?.relationship || 'अनुकूल'}`, desc_en: `Lord friendship: ${b.graha_maitri?.relationship || 'Friendly'}` },
            { name: 'गण (Gana)', name_en: 'Gana', score: b.gana?.score ?? 6, max: 6, desc: `वर: ${b.gana?.groom_value || 'देव'}, कन्या: ${b.gana?.bride_value || 'देव'}`, desc_en: `Groom: ${b.gana?.groom_value || 'Deva'}, Bride: ${b.gana?.bride_value || 'Deva'}` },
            { name: 'भकूट (Bhakoot)', name_en: 'Bhakoot', score: b.bhakoot?.score ?? 0, max: 7, desc: b.bhakoot?.has_dosha ? 'भकूट दोष (परिहार विचारणीय)' : 'भकूट अनुकूल', desc_en: b.bhakoot?.has_dosha ? 'Bhakoot Dosha applies' : 'Favorable Bhakoot' },
            { name: 'नाड़ी (Nadi)', name_en: 'Nadi', score: b.nadi?.score ?? 0, max: 8, desc: b.nadi?.has_dosha ? 'नाड़ी दोष दृष्ट' : 'नाड़ी दोष मुक्त', desc_en: b.nadi?.has_dosha ? 'Nadi Dosha detected' : 'No Nadi Dosha' },
          ];
          const total = Number(matchResult.totalScore ?? matchResult.effective_total_score ?? 28);
          setMatchData({
            boyName: boyName.trim(),
            boyName_en: boyName.trim(),
            girlName: girlName.trim(),
            girlName_en: girlName.trim(),
            totalScore: total,
            maxScore: matchResult.maximumScore || 36,
            verdict: total >= 18 ? 'उत्तम विवाह योग (Auspicious)' : 'मध्यम योग (Fair Compatibility)',
            verdict_en: total >= 18 ? 'Auspicious Match' : 'Fair Compatibility',
            advice: matchResult.interpretation || `36 में से ${total} गुण मिले हैं। वैवाहिक जीवन अनुकूल रहेगा।`,
            advice_en: matchResult.interpretation || `Score of ${total}/36 points. Traditional compatibility calculated.`,
            ashtakoot,
            doshaCheck: {
              manglikBoth: 'मांगलिक प्रभाव सामान्य',
              manglikBoth_en: 'Normal Manglik balance',
              nadiDosha: b.nadi?.has_dosha ? 'नाड़ी दोष' : 'नाड़ी दोष मुक्त',
              nadiDosha_en: b.nadi?.has_dosha ? 'Nadi Dosha' : 'Free from Nadi Dosha',
              bhakootDosha: b.bhakoot?.has_dosha ? 'भकूट दोष' : 'भकूट अनुकूल',
              bhakootDosha_en: b.bhakoot?.has_dosha ? 'Bhakoot Dosha' : 'Favorable Bhakoot',
            },
          });
          setShowMatchResult(true);
        })
        .catch((err) => {
          console.warn('API error, using local computation:', err?.message);
          const fallback = horoscopeKundaliStore.matchKundalis({ name: boyName }, { name: girlName });
          setMatchData(fallback);
          setShowMatchResult(true);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Navigation Header */}
      <View style={s.navHeader}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.navTitle}>
            {mode === 'match' ? t('kundaliMatching') : t('generateKundali')}
          </Text>
          <Text style={s.navSub}>{t('vedicSystemSub')}</Text>
        </View>
        <LanguageSwitcher />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* If Match Result is ready to display */}
        {showMatchResult && mode === 'match' && matchData ? (
          <View>
            {/* Big Score Card */}
            <View style={s.scoreCard}>
              <Text style={s.scoreTitle}>
                {getText(matchData.boyName, matchData.boyName_en || matchData.boyName)} & {getText(matchData.girlName, matchData.girlName_en || matchData.girlName)}
              </Text>
              <View style={s.scoreCircle}>
                <Text style={s.scoreNum}>{matchData.totalScore}</Text>
                <Text style={s.scoreMax}>/ {matchData.maxScore} {t('outOf36')}</Text>
              </View>
              <View style={s.verdictBadge}>
                <MaterialCommunityIcons name="check-decagram" size={16} color={colors.success} />
                <Text style={s.verdictText}>{getText(matchData.verdict, matchData.verdict_en)}</Text>
              </View>
              <Text style={s.scoreAdviceText}>{getText(matchData.advice, matchData.advice_en)}</Text>
            </View>

            {/* Ashtakoot 8-Koot Breakdown Table */}
            <View style={s.breakdownCard}>
              <Text style={s.breakdownTitle}>{t('ashtakootBreakdown')}:</Text>
              {matchData.ashtakoot?.map((koot, idx) => (
                <View key={idx} style={s.kootRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.kootName}>{getText(koot.name, koot.name_en)}</Text>
                    <Text style={s.kootDesc}>{getText(koot.desc, koot.desc_en)}</Text>
                  </View>
                  <View style={s.kootScoreBadge}>
                    <Text style={s.kootScoreText}>{koot.score} / {koot.max}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Dosha & Cancellation Status */}
            <View style={s.doshaCard}>
              <Text style={s.doshaTitle}>{t('doshaAnalysis')}:</Text>
              <View style={s.doshaRow}>
                <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.doshaName}>{t('manglikStatus')}</Text>
                  <Text style={s.doshaValue}>{getText(matchData.doshaCheck?.manglikBoth, matchData.doshaCheck?.manglikBoth_en)}</Text>
                </View>
              </View>
              <View style={s.doshaRow}>
                <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.doshaName}>{t('nadiDosha')}</Text>
                  <Text style={s.doshaValue}>{getText(matchData.doshaCheck?.nadiDosha, matchData.doshaCheck?.nadiDosha_en)}</Text>
                </View>
              </View>
              <View style={s.doshaRow}>
                <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={s.doshaName}>{t('bhakootDosha')}</Text>
                  <Text style={s.doshaValue}>{getText(matchData.doshaCheck?.bhakootDosha, matchData.doshaCheck?.bhakootDosha_en)}</Text>
                </View>
              </View>
            </View>

            {/* CTA for Pandit Ji Consultation */}
            <TouchableOpacity
              style={s.astroMatchCta}
              onPress={() => navigation.navigate('Vartalap')}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name="headset" size={24} color={colors.text} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.astroMatchCtaTitle}>{t('consultAstroMatchTitle')}</Text>
                <Text style={s.astroMatchCtaSub}>{t('consultAstroMatchSub')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.reCalculateBtn}
              onPress={() => setShowMatchResult(false)}
            >
              <Text style={s.reCalculateBtnText}>{t('recalculateMatch')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form Inputs */
          <View>
            {/* Segmented Control: Manual Entry vs Upload */}
            <View style={s.segmentRow}>
              <TouchableOpacity
                style={[s.segmentBtn, entryMethod === 'manual' && s.segmentBtnActive]}
                onPress={() => setEntryMethod('manual')}
              >
                <MaterialCommunityIcons
                  name="card-text-outline"
                  size={16}
                  color={entryMethod === 'manual' ? '#FFFFFF' : colors.text}
                />
                <Text style={[s.segmentBtnText, entryMethod === 'manual' && s.segmentBtnTextActive]}>
                  {isHindi ? 'जन्म विवरण दर्ज करें' : 'Manual Entry'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.segmentBtn, entryMethod === 'upload' && s.segmentBtnActive]}
                onPress={() => setEntryMethod('upload')}
              >
                <MaterialCommunityIcons
                  name="file-upload-outline"
                  size={16}
                  color={entryMethod === 'upload' ? '#FFFFFF' : colors.text}
                />
                <Text style={[s.segmentBtnText, entryMethod === 'upload' && s.segmentBtnTextActive]}>
                  {isHindi ? 'कुण्डली फोटो/PDF अपलोड' : 'Upload Image / PDF'}
                </Text>
              </TouchableOpacity>
            </View>

            {entryMethod === 'upload' ? (
              /* Upload Kundali UI */
              <View style={s.uploadBox}>
                <View style={s.uploadNoticeBox}>
                  <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                  <Text style={s.uploadNoticeText}>
                    {isHindi
                      ? 'यदि आपके पास पहले से मुद्रित जन्मपत्रिका, लग्न चार्ट या कुण्डली PDF उपलब्ध है, तो उसे सीधे संलग्न करें। पूज्य पंडित जी इसका विश्लेषण कर परिणाम प्रदान करेंगे।'
                      : 'Attach existing Kundali photo or PDF chart. A Vedic Pandit will analyze it directly and provide the certified results.'}
                  </Text>
                </View>

                {/* File 1: Boy or Primary Chart */}
                <Text style={s.fieldLabel}>
                  {mode === 'match'
                    ? (isHindi ? 'वर (लड़के) की कुण्डली पत्रिका फोटो या PDF:' : 'Groom Kundali Image/PDF:')
                    : (isHindi ? 'जातक की कुण्डली पत्रिका फोटो या PDF:' : 'Devotee Kundali Image/PDF:')}
                </Text>

                {!primaryFile ? (
                  <View style={s.uploadActionsRow}>
                    <TouchableOpacity style={s.subUploadBtn} onPress={() => pickFileImage(false)}>
                      <MaterialCommunityIcons name="camera-plus" size={20} color={colors.primary} />
                      <Text style={s.subUploadText}>{isHindi ? 'फोटो अपलोड' : 'Upload Image'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.subUploadBtn, { borderColor: '#E53E3E' }]} onPress={() => pickFilePdf(false)}>
                      <MaterialCommunityIcons name="file-pdf-box" size={20} color="#E53E3E" />
                      <Text style={[s.subUploadText, { color: '#C53030' }]}>{isHindi ? 'PDF अपलोड' : 'Upload PDF'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={s.fileBadgeCard}>
                    <MaterialCommunityIcons
                      name={primaryFile.isImage ? 'image' : 'file-pdf-box'}
                      size={22}
                      color={primaryFile.isImage ? colors.primary : '#E53E3E'}
                    />
                    <Text style={s.fileBadgeName} numberOfLines={1}>{primaryFile.name}</Text>
                    <TouchableOpacity onPress={() => setPrimaryFile(null)}>
                      <MaterialCommunityIcons name="close-circle" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* File 2: Bride (If match mode) */}
                {mode === 'match' && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={s.fieldLabel}>
                      {isHindi ? 'कन्या (लड़की) की कुण्डली पत्रिका फोटो या PDF:' : 'Bride Kundali Image/PDF:'}
                    </Text>
                    {!secondaryFile ? (
                      <View style={s.uploadActionsRow}>
                        <TouchableOpacity style={s.subUploadBtn} onPress={() => pickFileImage(true)}>
                          <MaterialCommunityIcons name="camera-plus" size={20} color={colors.primary} />
                          <Text style={s.subUploadText}>{isHindi ? 'फोटो अपलोड' : 'Upload Image'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.subUploadBtn, { borderColor: '#E53E3E' }]} onPress={() => pickFilePdf(true)}>
                          <MaterialCommunityIcons name="file-pdf-box" size={20} color="#E53E3E" />
                          <Text style={[s.subUploadText, { color: '#C53030' }]}>{isHindi ? 'PDF अपलोड' : 'Upload PDF'}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={s.fileBadgeCard}>
                        <MaterialCommunityIcons
                          name={secondaryFile.isImage ? 'image' : 'file-pdf-box'}
                          size={22}
                          color={secondaryFile.isImage ? colors.primary : '#E53E3E'}
                        />
                        <Text style={s.fileBadgeName} numberOfLines={1}>{secondaryFile.name}</Text>
                        <TouchableOpacity onPress={() => setSecondaryFile(null)}>
                          <MaterialCommunityIcons name="close-circle" size={20} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <Text style={[s.fieldLabel, { marginTop: 14 }]}>
                  {isHindi ? 'नाम अथवा कोई विशेष टिप्पणी (वैकल्पिक):' : 'Name or Special Remarks (Optional):'}
                </Text>
                <TextInput
                  style={s.input}
                  value={boyName}
                  onChangeText={setBoyName}
                  placeholder={mode === 'match' ? (isHindi ? 'वर एवं कन्या का नाम' : 'Groom & Bride Names') : (isHindi ? 'जातक का नाम' : 'Full Name')}
                  placeholderTextColor="#A8988C"
                />

                <TextInput
                  style={[s.input, { minHeight: 60, marginTop: 8 }]}
                  value={uploadNote}
                  onChangeText={setUploadNote}
                  placeholder={isHindi ? 'पंडित जी के लिए कोई प्रश्न या संदेश...' : 'Any query for Pandit Ji...'}
                  placeholderTextColor="#A8988C"
                  multiline
                />
              </View>
            ) : (
              /* Manual Input Form */
              <View>
                {/* Person 1 / Boy Form */}
                <View style={s.formBox}>
                  <Text style={s.formHeaderTitle}>
                    {mode === 'match' ? t('groomDetails') : t('birthDetails')}
                  </Text>

                  <Text style={s.fieldLabel}>{t('fullName')} *</Text>
                  <TextInput
                    style={s.input}
                    value={boyName}
                    onChangeText={setBoyName}
                    placeholder={t('enterName')}
                    placeholderTextColor="#A8988C"
                  />

                  <View style={s.twoColsRow}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text style={s.fieldLabel}>{t('dateOfBirth')} *</Text>
                      <TextInput
                        style={s.input}
                        value={boyDob}
                        onChangeText={setBoyDob}
                        placeholder="15/08/1994"
                        placeholderTextColor="#A8988C"
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <Text style={s.fieldLabel}>{t('timeOfBirth')}</Text>
                      <TextInput
                        style={s.input}
                        value={boyTob}
                        onChangeText={setBoyTob}
                        placeholder="06:45 AM"
                        placeholderTextColor="#A8988C"
                      />
                    </View>
                  </View>

                  <Text style={[s.fieldLabel, { marginTop: 10 }]}>{t('placeOfBirth')} *</Text>
                  <TextInput
                    style={s.input}
                    value={boyPob}
                    onChangeText={setBoyPob}
                    placeholder={t('enterBirthplace')}
                    placeholderTextColor="#A8988C"
                  />
                </View>

                {/* Girl Form (If match mode) */}
                {mode === 'match' && (
                  <View style={[s.formBox, { marginTop: 14 }]}>
                    <Text style={s.formHeaderTitle}>{t('brideDetails')}</Text>

                    <Text style={s.fieldLabel}>{t('fullName')} *</Text>
                    <TextInput
                      style={s.input}
                      value={girlName}
                      onChangeText={setGirlName}
                      placeholder={t('enterName')}
                      placeholderTextColor="#A8988C"
                    />

                    <View style={s.twoColsRow}>
                      <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={s.fieldLabel}>{t('dateOfBirth')} *</Text>
                        <TextInput
                          style={s.input}
                          value={girlDob}
                          onChangeText={setGirlDob}
                          placeholder="22/11/1996"
                          placeholderTextColor="#A8988C"
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 6 }}>
                        <Text style={s.fieldLabel}>{t('timeOfBirth')}</Text>
                        <TextInput
                          style={s.input}
                          value={girlTob}
                          onChangeText={setGirlTob}
                          placeholder="11:20 AM"
                          placeholderTextColor="#A8988C"
                        />
                      </View>
                    </View>

                    <Text style={[s.fieldLabel, { marginTop: 10 }]}>{t('placeOfBirth')} *</Text>
                    <TextInput
                      style={s.input}
                      value={girlPob}
                      onChangeText={setGirlPob}
                      placeholder={t('enterBirthplace')}
                      placeholderTextColor="#A8988C"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Action CTA */}
            <TouchableOpacity
              style={[s.primaryBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleAction}
              disabled={isSubmitting}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.primaryBtnText}>
                  {entryMethod === 'upload'
                    ? (isHindi ? 'पंडित जी को विश्लेषण हेतु भेजें' : 'Send to Pandit Ji for Analysis')
                    : (mode === 'match' ? t('matchKundalisBtn') : t('generateChartBtn'))}
                </Text>
              )}
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
  },
  scrollContent: {
    padding: 16,
  },

  // Segmented Control
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE1D3',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(2),
  },
  uploadNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8EB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F2DFCA',
    marginBottom: 14,
    gap: 8,
    alignItems: 'flex-start',
  },
  uploadNoticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    lineHeight: 16,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  subUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F0',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  subUploadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  fileBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    marginBottom: 12,
  },
  fileBadgeName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 8,
  },

  formBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(2),
  },
  formHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
    paddingBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  twoColsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    ...shadow(2),
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Match Result
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(2),
  },
  scoreTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 12,
  },
  scoreNum: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primary,
  },
  scoreMax: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '700',
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  verdictText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  scoreAdviceText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  kootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF7F0',
  },
  kootName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  kootDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  kootScoreBadge: {
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  kootScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  doshaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  doshaTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  doshaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  doshaName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  doshaValue: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  astroMatchCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8D4B8',
  },
  astroMatchCtaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  astroMatchCtaSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  reCalculateBtn: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  reCalculateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
});
