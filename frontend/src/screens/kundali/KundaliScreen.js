import React, { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import horoscopeKundaliStore from '../../services/horoscopeKundaliStore';
import { UploadService } from '../../services/api';

const CONCERN_CATEGORIES = [
  { id: 'marriage', labelHi: '💍 विवाह व मांगलिक विचार', labelEn: '💍 Marriage & Manglik Dosha' },
  { id: 'career', labelHi: '💼 करियर, नौकरी व पदोन्नति', labelEn: '💼 Career & Promotion' },
  { id: 'wealth', labelHi: '💰 व्यापार, धन लाभ व कर्ज', labelEn: '💰 Business & Finances' },
  { id: 'health', labelHi: '🩺 स्वास्थ्य व महादशा शांति', labelEn: '🩺 Health & Dasha Shanti' },
  { id: 'family', labelHi: '👶 संतान प्राप्ति व शिक्षा योग', labelEn: '👶 Children & Education' },
  { id: 'vastu', labelHi: '🏠 वास्तु दोष व गृह शांति', labelEn: '🏠 Vastu & House Shanti' },
];

export default function KundaliScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, isHindi, getText, clean } = useLanguage();
  const { showNotification } = useNotification();

  // Consultation submission states
  const [devoteeName, setDevoteeName] = useState('');
  const [devoteePhone, setDevoteePhone] = useState('');
  const [selectedConcern, setSelectedConcern] = useState(CONCERN_CATEGORIES[0].labelHi);
  const [questionNote, setQuestionNote] = useState('');
  const [attachedFile, setAttachedFile] = useState(null); // { uri, name, type, size }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store data
  const [analysisRequests, setAnalysisRequests] = useState(
    horoscopeKundaliStore.getAnalysisRequests()
  );
  const [savedProfiles, setSavedProfiles] = useState(
    horoscopeKundaliStore.getSavedProfiles()
  );

  // Detail Modal for Pandit Result
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);

  useEffect(() => {
    const unsub = horoscopeKundaliStore.subscribe((store) => {
      setAnalysisRequests([...store.getAnalysisRequests()]);
      setSavedProfiles([...store.getSavedProfiles()]);
    });
    return unsub;
  }, []);

  // Pick Image from Gallery or Camera
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          isHindi ? 'अनुमति आवश्यक' : 'Permission Required',
          isHindi
            ? 'कुण्डली फोटो अपलोड करने के लिए कृपया गैलरी की अनुमति दें।'
            : 'Please grant gallery permissions to upload Kundali image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `Kundali_${Date.now()}.jpg`;
        setAttachedFile({
          uri: asset.uri,
          name: fileName,
          type: 'image/jpeg',
          size: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : 'Image',
          isImage: true,
        });
      }
    } catch (err) {
      console.warn('ImagePicker error:', err);
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'फोटो चुनने में असमर्थ' : 'Could not pick image');
    }
  };

  // Pick PDF Document
  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const isPdf = file.mimeType?.includes('pdf') || file.name?.toLowerCase().endsWith('.pdf');
        setAttachedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg'),
          size: file.size ? `${Math.round(file.size / 1024)} KB` : (isPdf ? 'PDF' : 'Document'),
          isImage: !isPdf,
        });
      }
    } catch (err) {
      console.warn('DocumentPicker error:', err);
      Alert.alert(isHindi ? 'त्रुटि' : 'Error', isHindi ? 'दस्तावेज़ चुनने में असमर्थ' : 'Could not pick document');
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  // Submit Kundali to Pandit Ji
  const handleSubmitToPandit = async () => {
    if (!attachedFile && !questionNote.trim()) {
      Alert.alert(
        isHindi ? 'विवरण आवश्यक' : 'Details Required',
        isHindi
          ? 'कृपया अपनी कुण्डली की फोटो/PDF अपलोड करें अथवा अपना प्रश्न/विवरण दर्ज करें।'
          : 'Please attach your Kundali image/PDF or enter your question.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // If there is an attached file, try uploading to backend
      let remoteUrl = null;
      if (attachedFile?.uri) {
        try {
          const formData = new FormData();
          formData.append('file', {
            uri: attachedFile.uri,
            name: attachedFile.name || 'kundali_doc.jpg',
            type: attachedFile.type || 'image/jpeg',
          });
          const res = await UploadService.single(formData);
          if (res?.file?.url) {
            remoteUrl = res.file.url;
          }
        } catch (uploadErr) {
          console.log('Upload notice (local handling fallback):', uploadErr.message);
        }
      }

      // Save in store
      const newReq = horoscopeKundaliStore.submitAnalysisRequest({
        devoteeName: devoteeName.trim() || (isHindi ? 'श्रद्धालु' : 'Devotee'),
        phone: devoteePhone.trim(),
        concern: selectedConcern,
        question: questionNote.trim(),
        file: attachedFile ? { ...attachedFile, remoteUrl } : null,
      });

      // Show high fidelity in-app notification
      showNotification({
        type: 'success',
        title: isHindi ? '🙏 कुण्डली विश्लेषण अनुरोध प्राप्त' : '🙏 Kundali Received for Analysis',
        message: isHindi
          ? `पूज्य पंडित जी द्वारा आपकी कुण्डली (टोकन: ${newReq.id}) का अध्ययन आरंभ हो चुका है।`
          : `Certified Vedic Pandit is now analyzing your birth chart (Token: ${newReq.id}).`,
        duration: 8000,
      });

      // Clear form
      setQuestionNote('');
      setAttachedFile(null);
      setDevoteeName('');
      setDevoteePhone('');
    } catch (err) {
      console.error('Submit to Pandit error:', err);
      Alert.alert(
        isHindi ? 'त्रुटि' : 'Error',
        isHindi ? 'अनुरोध भेजने में समस्या आई। पुनः प्रयास करें।' : 'Could not submit request. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
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
          <Text style={s.navTitle} numberOfLines={1}>{t('kundaliHub')}</Text>
          <Text style={s.navSub} numberOfLines={1}>{t('kundaliSub')}</Text>
        </View>
        <LanguageSwitcher style={{ marginRight: 6 }} />
        <TouchableOpacity
          style={s.astroIconBtn}
          onPress={() => navigation.navigate('Vartalap')}
        >
          <MaterialCommunityIcons name="headset" size={15} color={colors.text} />
          <Text style={s.astroBtnText} numberOfLines={1}>{isHindi ? 'ज्योतिषी' : 'Astrologer'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Card 1: Generate Birth Chart */}
        <TouchableOpacity
          style={s.featureCard}
          onPress={() => navigation.navigate('KundaliMatchingForm', { mode: 'make' })}
          activeOpacity={0.9}
        >
          <View style={s.featureIconDisc}>
            <MaterialCommunityIcons name="star-four-points" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.featureTitle}>
                {isHindi ? 'जन्म कुण्डली बनाएं' : 'Generate Birth Chart'}
              </Text>
              <View style={s.freeBadge}><Text style={s.freeBadgeText}>{t('free')}</Text></View>
            </View>
            <Text style={s.featureDesc}>
              {isHindi
                ? 'D1 लग्न चार्ट, D9 नवांश, ग्रह स्थिति, विंशोत्तरी महादशा, मांगलिक व साढ़े साती दोष विवरण।'
                : 'D1 Lagna chart, D9 Navamsha, planetary degrees, Vimshottari dasha, Manglik & Sade Sati analysis.'}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* Core Card 2: 36 Gun Milan */}
        <TouchableOpacity
          style={s.featureCard}
          onPress={() => navigation.navigate('KundaliMatchingForm', { mode: 'match' })}
          activeOpacity={0.9}
        >
          <View style={s.featureIconDisc}>
            <MaterialCommunityIcons name="heart-multiple" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.featureTitle}>
                {isHindi ? 'कुण्डली मिलान (36 गुण)' : '36 Gun Milan (Matching)'}
              </Text>
              <View style={s.freeBadge}>
                <Text style={s.freeBadgeText}>{isHindi ? 'अष्टकूट' : 'Ashtakoot'}</Text>
              </View>
            </View>
            <Text style={s.featureDesc}>
              {isHindi
                ? 'विवाह हेतु 36 में से गुण, नाड़ी दोष, भकूट दोष व मांगलिक परिहार की विस्तृत रिपोर्ट।'
                : 'Detailed 36-gun compatibility report for marriage with Nadi, Bhakoot and Manglik cancellation.'}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} />
        </TouchableOpacity>

        {/* ============================================================== */}
        {/* PANDIT KUNDALI ANALYSIS & UPLOAD SECTION (Replaces AI)        */}
        {/* ============================================================== */}
        <View style={s.panditSectionCard}>
          {/* Header Banner */}
          <View style={s.panditBannerHead}>
            <View style={s.bannerIconBox}>
              <MaterialCommunityIcons name="hands-pray" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.panditTitle}>
                {isHindi ? 'पूज्य पंडित जी द्वारा कुण्डली विश्लेषण' : 'Pandit Ji Kundali Analysis'}
              </Text>
              <Text style={s.panditSub}>
                {isHindi
                  ? 'काशी व अयोध्या के विद्वान आचार्यों द्वारा हस्तनिर्मित फलादेश'
                  : 'Certified Vedic Pandits analysis with accurate remedies'}
              </Text>
            </View>
            <View style={s.verifiedBadge}>
              <MaterialCommunityIcons name="certificate" size={12} color="#15803D" />
              <Text style={s.verifiedBadgeText}>{isHindi ? '100% प्रामाणिक' : 'Authentic'}</Text>
            </View>
          </View>

          {/* Devotee File Upload Box (Image or PDF) */}
          <View style={s.uploadSection}>
            <Text style={s.uploadSectionTitle}>
              {isHindi
                ? 'कुण्डली पत्रिका फोटो अथवा PDF अपलोड करें:'
                : 'Upload Kundali Photo or PDF Document:'}
            </Text>
            <Text style={s.uploadSectionDesc}>
              {isHindi
                ? 'यदि आपके पास मुद्रित जन्मपत्री की फोटो अथवा PDF है, तो सीधे अपलोड करें ताकि पंडित जी उसका प्रत्यक्ष अध्ययन कर सकें।'
                : 'Attach an image or PDF of your Janampatri chart so the Vedic Pandit can study it directly.'}
            </Text>

            {/* Upload Action Buttons */}
            {!attachedFile ? (
              <View style={s.uploadButtonsRow}>
                <TouchableOpacity
                  style={s.uploadBtn}
                  onPress={handlePickImage}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="camera-plus-outline" size={22} color={colors.primary} />
                  <Text style={s.uploadBtnText}>
                    {isHindi ? 'फोटो अपलोड करें' : 'Upload Image'}
                  </Text>
                  <Text style={s.uploadBtnSub}>JPG, PNG</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.uploadBtn, { borderColor: '#E53E3E' }]}
                  onPress={handlePickPdf}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="file-pdf-box" size={22} color="#E53E3E" />
                  <Text style={[s.uploadBtnText, { color: '#C53030' }]}>
                    {isHindi ? 'PDF अपलोड करें' : 'Upload PDF'}
                  </Text>
                  <Text style={s.uploadBtnSub}>PDF Document</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Attached Document Card */
              <View style={s.attachedCard}>
                <View style={s.attachedLeft}>
                  {attachedFile.isImage ? (
                    <Image source={{ uri: attachedFile.uri }} style={s.attachedThumb} />
                  ) : (
                    <View style={s.pdfThumb}>
                      <MaterialCommunityIcons name="file-pdf-box" size={28} color="#E53E3E" />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.attachedName} numberOfLines={1}>
                      {attachedFile.name}
                    </Text>
                    <Text style={s.attachedSize}>{attachedFile.size}</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.removeFileBtn} onPress={removeAttachedFile}>
                  <MaterialCommunityIcons name="close-circle" size={22} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Consultation Topic Selector */}
          <Text style={s.fieldLabel}>
            {isHindi ? 'परामर्श का मुख्य विषय चुनें:' : 'Select Consultation Area:'}
          </Text>
          <View style={s.concernChipsRow}>
            {CONCERN_CATEGORIES.map((item) => {
              const label = isHindi ? item.labelHi : item.labelEn;
              const isSelected = selectedConcern === label;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.concernChip, isSelected && s.concernChipSelected]}
                  onPress={() => setSelectedConcern(label)}
                >
                  <Text style={[s.concernChipText, isSelected && s.concernChipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Devotee Question / Note Input */}
          <Text style={s.fieldLabel}>
            {isHindi ? 'पंडित जी के लिए प्रश्न / समस्या विवरण:' : 'Your Question or Concern for Pandit Ji:'}
          </Text>
          <TextInput
            style={s.textAreaInput}
            value={questionNote}
            onChangeText={setQuestionNote}
            placeholder={
              isHindi
                ? 'उदा. विवाह में विलंब के कारण, नौकरी में पदोन्नति का समय, अथवा अनुकूल रत्न व वैदिक उपाय...'
                : 'e.g. Reasons for marriage delay, auspicious timing for job promotion, gemstone remedies...'
            }
            placeholderTextColor="#A8988C"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Devotee Optional Contact Inputs */}
          <View style={s.inputsRow}>
            <TextInput
              style={[s.textInput, { flex: 1 }]}
              value={devoteeName}
              onChangeText={setDevoteeName}
              placeholder={isHindi ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
              placeholderTextColor="#A8988C"
            />
            <TextInput
              style={[s.textInput, { flex: 1 }]}
              value={devoteePhone}
              onChangeText={setDevoteePhone}
              placeholder={isHindi ? 'मोबाइल नं (वैकल्पिक)' : 'Phone Number'}
              placeholderTextColor="#A8988C"
              keyboardType="phone-pad"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[s.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmitToPandit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="send-check" size={20} color="#FFFFFF" />
                <Text style={s.submitBtnText}>
                  {isHindi ? 'पूज्य पंडित जी को कुण्डली भेजें' : 'Submit Kundali to Pandit Ji'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={s.panditGuaranteeRow}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
            <Text style={s.panditGuaranteeText}>
              {isHindi
                ? 'गोपनीयता सुरक्षित • 2-4 घंटे में वैदिक आचार्य द्वारा हस्तलिखित मार्गदर्शन'
                : 'Privacy Protected • Personalized analysis in 2-4 hours'}
            </Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* ACTIVE PANDIT ANALYSIS TRACKER (Status Workflow)               */}
        {/* ============================================================== */}
        {analysisRequests.length > 0 && (
          <View style={s.activeTrackerBox}>
            <View style={s.trackerHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
                <Text style={s.trackerHeaderTitle}>
                  {isHindi ? 'कुण्डली विश्लेषण स्थिति' : 'Kundali Analysis Status'}
                </Text>
              </View>
              <View style={s.activeBadge}>
                <Text style={s.activeBadgeText}>{analysisRequests.length}</Text>
              </View>
            </View>

            {analysisRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={s.requestCard}
                onPress={() => setSelectedRequestForDetail(req)}
                activeOpacity={0.9}
              >
                <View style={s.reqTopRow}>
                  <View>
                    <Text style={s.reqTokenText}>{req.id} • {req.concern}</Text>
                    <Text style={s.reqDateText}>
                      {isHindi ? 'अनुरोध दिनांक: ' : 'Submitted: '}{req.createdAt}
                    </Text>
                  </View>
                  <View style={s.statusPill}>
                    <View style={s.statusDot} />
                    <Text style={s.statusPillText}>
                      {isHindi ? 'पंडित जी द्वारा अध्ययन जारी' : 'Analyzing'}
                    </Text>
                  </View>
                </View>

                {req.file && (
                  <View style={s.reqFileRow}>
                    <MaterialCommunityIcons
                      name={req.file.isImage ? 'image-outline' : 'file-pdf-box'}
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={s.reqFileName} numberOfLines={1}>
                      {req.file.name} ({req.file.size})
                    </Text>
                  </View>
                )}

                {/* Status Stepper */}
                <View style={s.stepperRow}>
                  <View style={s.stepItem}>
                    <View style={[s.stepCircle, s.stepDone]}>
                      <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
                    </View>
                    <Text style={s.stepLabel}>{isHindi ? 'अनुरोध प्राप्त' : 'Received'}</Text>
                  </View>
                  <View style={s.stepLine} />
                  <View style={s.stepItem}>
                    <View style={[s.stepCircle, s.stepActive]}>
                      <MaterialCommunityIcons name="dots-horizontal" size={12} color="#FFFFFF" />
                    </View>
                    <Text style={[s.stepLabel, { color: colors.primary, fontWeight: '700' }]}>
                      {isHindi ? 'पत्री अध्ययन' : 'Analyzing'}
                    </Text>
                  </View>
                  <View style={s.stepLine} />
                  <View style={s.stepItem}>
                    <View style={s.stepCircle}>
                      <MaterialCommunityIcons name="file-document-outline" size={12} color="#A8988C" />
                    </View>
                    <Text style={s.stepLabel}>{isHindi ? 'फलादेश तैयार' : 'Result'}</Text>
                  </View>
                </View>

                <View style={s.panditAssignedRow}>
                  <MaterialCommunityIcons name="account-tie" size={16} color={colors.primaryDark} />
                  <Text style={s.panditAssignedText} numberOfLines={1}>
                    {req.assignedPandit}
                  </Text>
                  <Text style={s.viewDetailsLink}>
                    {isHindi ? 'विवरण देखें ›' : 'View Details ›'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Saved Profiles Section */}
        {savedProfiles.length > 0 && (
          <View style={s.savedProfilesBox}>
            <Text style={s.savedTitle}>{t('savedKundalis')}</Text>
            {savedProfiles.map((prof, idx) => (
              <View key={prof.id || idx} style={s.profileItemRow}>
                <View style={s.profileItemDisc}>
                  <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.profileItemName}>
                    {prof.name} ({prof.lagna} • {prof.rashi})
                  </Text>
                  <Text style={s.profileItemMeta}>
                    {prof.dob} • {prof.tob} • {prof.pob}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.viewChartBtn}
                  onPress={() => navigation.navigate('KundaliResult', { mode: 'make' })}
                >
                  <Text style={s.viewChartBtnText}>{isHindi ? 'देखें' : 'View'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ============================================================== */}
      {/* PANDIT ANALYSIS RESULT DETAIL MODAL                            */}
      {/* ============================================================== */}
      <Modal
        visible={Boolean(selectedRequestForDetail)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRequestForDetail(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="certificate" size={22} color={colors.primary} />
                <Text style={s.modalTitle}>
                  {isHindi ? 'पंडित जी फलादेश पत्र' : 'Pandit Ji Kundali Report'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedRequestForDetail(null)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRequestForDetail && (
              <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={s.modalInfoCard}>
                  <Text style={s.modalToken}>
                    {isHindi ? 'टोकन संख्या: ' : 'Token: '}{selectedRequestForDetail.id}
                  </Text>
                  <Text style={s.modalPanditName}>
                    {selectedRequestForDetail.assignedPandit}
                  </Text>
                  <Text style={s.modalConcern}>
                    {selectedRequestForDetail.concern}
                  </Text>
                </View>

                {selectedRequestForDetail.question ? (
                  <View style={s.modalBox}>
                    <Text style={s.modalBoxHeading}>
                      {isHindi ? 'श्रद्धालु का प्रश्न / समस्या:' : 'Your Query:'}
                    </Text>
                    <Text style={s.modalBoxText}>{selectedRequestForDetail.question}</Text>
                  </View>
                ) : null}

                <View style={s.modalBox}>
                  <Text style={s.modalBoxHeading}>
                    {isHindi ? 'पूज्य पंडित जी का प्रारंभिक विश्लेषण:' : 'Pandit Ji Initial Observation:'}
                  </Text>
                  <Text style={s.modalBoxText}>{selectedRequestForDetail.panditRemarks}</Text>
                </View>

                <View style={s.modalBox}>
                  <Text style={s.modalBoxHeading}>
                    {isHindi ? 'अनुशंसित वैदिक उपाय एवं मंत्र:' : 'Prescribed Vedic Remedies:'}
                  </Text>
                  {selectedRequestForDetail.remedies.map((rem, i) => (
                    <View key={i} style={s.remedyRow}>
                      <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                      <Text style={s.remedyText}>{rem}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={s.callAstroActionBtn}
                  onPress={() => {
                    setSelectedRequestForDetail(null);
                    navigation.navigate('Vartalap');
                  }}
                >
                  <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
                  <Text style={s.callAstroActionText}>
                    {isHindi ? 'पंडित जी से फोन पर बात करें' : 'Talk with Pandit Ji on Call'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  astroIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  astroBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(2),
  },
  featureIconDisc: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF8EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3DFC4',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  freeBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
  },
  featureDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },

  // Pandit Analysis Card
  panditSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.saffron,
    ...shadow(3),
  },
  panditBannerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8DC',
    paddingBottom: 12,
    marginBottom: 14,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  panditSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },

  // Upload section
  uploadSection: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1E5D5',
    marginBottom: 14,
  },
  uploadSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  uploadSectionDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 14,
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  uploadBtnSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  attachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attachedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachedThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  pdfThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachedName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  attachedSize: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 4,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    marginTop: 6,
  },
  concernChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  concernChip: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  concernChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  concernChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  concernChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textAreaInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    minHeight: 64,
    marginBottom: 10,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    ...shadow(2),
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  panditGuaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  panditGuaranteeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Active Tracker
  activeTrackerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    ...shadow(1),
  },
  trackerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  requestCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E5D4',
    marginBottom: 10,
  },
  reqTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reqTokenText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  reqDateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  reqFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqFileName: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '600',
    maxWidth: 220,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDone: {
    backgroundColor: '#16A34A',
  },
  stepActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
  },
  panditAssignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F2E8DC',
    paddingTop: 8,
    marginTop: 4,
  },
  panditAssignedText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 4,
  },
  viewDetailsLink: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },

  // Saved Profiles
  savedProfilesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  savedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  profileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  profileItemDisc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  profileItemMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  viewChartBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewChartBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  modalScroll: {
    marginTop: 12,
  },
  modalInfoCard: {
    backgroundColor: '#FFF8EB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1E1CA',
  },
  modalToken: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  modalPanditName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  modalConcern: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalBox: {
    backgroundColor: '#FAF7F0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  modalBoxHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalBoxText: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 16,
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  remedyText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    lineHeight: 15,
  },
  callAstroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  callAstroActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
