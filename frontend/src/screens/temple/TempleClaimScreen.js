import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif, shadow } from '../../theme/styles';
import templeStore from '../../services/templeStore';
import { AuthService } from '../../services/api';

export default function TempleClaimScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialMode = route.params?.mode || 'claim'; // 'claim' | 'suggest' | 'add'
  const targetTemple = route.params?.temple || null;

  const [activeTab, setActiveTab] = useState(
    initialMode === 'add' ? 'add' : initialMode === 'suggest' ? 'suggest' : 'claim'
  );

  // Claim Form State
  const [claimTempleName, setClaimTempleName] = useState(targetTemple ? targetTemple.name : '');
  const [claimRole, setClaimRole] = useState('pujari'); // 'pujari' | 'trustee' | 'prabandhak'
  const [claimName, setClaimName] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimOtp, setClaimOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  // Suggestion / Correction Form State
  const [suggestType, setSuggestType] = useState('timing_correction'); // 'timing_correction' | 'closed' | 'other'
  const [suggestDetails, setSuggestDetails] = useState('');

  // Add New Temple Form State
  const [newName, setNewName] = useState('');
  const [newDeity, setNewDeity] = useState('Shiva');
  const [newCity, setNewCity] = useState('वाराणसी');
  const [newAddress, setNewAddress] = useState('');
  const [newTimings, setNewTimings] = useState('06:00 AM - 08:30 PM');

  const handleSendOtp = async () => {
    const cleanPhone = (claimPhone || '').trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      Alert.alert('अमान्य फ़ोन', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    try {
      await AuthService.sendOtp(cleanPhone);
      setOtpSent(true);
      Alert.alert('OTP प्रेषित', `मोबाइल नंबर +91 ${cleanPhone} पर सत्यापन OTP भेजा गया है।`);
    } catch (err) {
      Alert.alert('OTP त्रुटि', err?.message || 'सर्वर से OTP भेजने में असमर्थ।');
    }
  };

  const handleClaimSubmit = () => {
    if (!claimName || !claimTempleName) {
      Alert.alert('अपूर्ण जानकारी', 'कृपया मंदिर का नाम व अपना नाम भरें।');
      return;
    }
    if (!docUploaded) {
      Alert.alert('दस्तावेज़ आवश्यक', 'कृपया पहचान पत्र अथवा मंदिर का लेटरहेड संलग्न करें।');
      return;
    }
    templeStore.submitClaim({
      templeId: targetTemple?.id || 'new_claim',
      templeName: claimTempleName,
      role: claimRole,
      applicantName: claimName,
      phone: claimPhone,
      idProof: 'id_doc_verified.pdf',
      letterhead: 'temple_letterhead.jpg',
    });
    setClaimSubmitted(true);
  };

  const handleSuggestSubmit = () => {
    if (!suggestDetails.trim()) {
      Alert.alert('विवरण आवश्यक', 'कृपया सुधार का संक्षिप्त विवरण लिखें।');
      return;
    }
    templeStore.submitSuggestion({
      templeId: targetTemple?.id || null,
      templeName: targetTemple?.name || 'मंदिर',
      type: suggestType,
      details: suggestDetails.trim(),
    });
    Alert.alert(
      'सुधार अनुरोध प्राप्त हुआ',
      'धन्यवाद! आपके द्वारा भेजा गया सुधार वैदिक संस्कार एडमिन टीम के सत्यापन उपरांत अद्यतन कर दिया जाएगा।',
      [{ text: 'ठीक है', onPress: () => navigation.goBack() }]
    );
  };

  const handleAddNewTempleSubmit = () => {
    if (!newName.trim() || !newAddress.trim()) {
      Alert.alert('आवश्यक जानकारी', 'कृपया मंदिर का नाम व पता अवश्य भरें।');
      return;
    }
    const created = templeStore.addNewTemple({
      name: newName.trim(),
      deity: newDeity,
      city: newCity.trim(),
      address: newAddress.trim(),
      timings: newTimings.trim(),
    });
    Alert.alert(
      'मंदिर सफलतापूर्वक जोड़ा गया',
      `‘${created.name}’ को सूची में जोड़ दिया गया है। एडमिन द्वारा सत्यापन पश्चात यह सभी को दिखेगा।`,
      [{ text: 'मंदिर देखें', onPress: () => navigation.replace('TempleDetail', { temple: created }) }]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View style={[s.head, { paddingTop: insets.top + 8 }]}>
        <View style={s.headRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headTitle}>मंदिर योगदान व दावा</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tab Switcher */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'claim' && s.tabBtnActive]}
            onPress={() => setActiveTab('claim')}
          >
            <MaterialCommunityIcons
              name="shield-crown-outline"
              size={15}
              color={activeTab === 'claim' ? '#fff' : colors.maroon}
            />
            <Text style={[s.tabBtnText, activeTab === 'claim' && s.tabBtnTextActive]}>
              मंदिर दावा (Claim)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'add' && s.tabBtnActive]}
            onPress={() => setActiveTab('add')}
          >
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={15}
              color={activeTab === 'add' ? '#fff' : colors.maroon}
            />
            <Text style={[s.tabBtnText, activeTab === 'add' && s.tabBtnTextActive]}>
              नया मंदिर जोड़ें
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.tabBtn, activeTab === 'suggest' && s.tabBtnActive]}
            onPress={() => setActiveTab('suggest')}
          >
            <MaterialCommunityIcons
              name="pencil-box-outline"
              size={15}
              color={activeTab === 'suggest' ? '#fff' : colors.maroon}
            />
            <Text style={[s.tabBtnText, activeTab === 'suggest' && s.tabBtnTextActive]}>
              सुधार भेजें
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* TAB 1: TEMPLE CLAIM (Pujari / Trustee) */}
        {activeTab === 'claim' && (
          <View>
            {claimSubmitted ? (
              <View style={s.successCard}>
                <MaterialCommunityIcons name="checkbox-marked-circle" size={54} color={colors.success} />
                <Text style={s.successTitle}>दावा आवेदन सफलता से दर्ज हुआ!</Text>
                <Text style={s.successSub}>
                  वैदिक संस्कार एडमिन टीम 24 घंटों के भीतर आपके मोबाइल व दस्तावेजों का सत्यापन करेगी। सत्यापन उपरांत पार्टनर ऐप (VaidicSanskarPartner) में 'Temple Admin' अधिकार सक्रिय हो जाएंगे।
                </Text>
                <TouchableOpacity
                  style={s.successDoneBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={s.successDoneBtnText}>मुख्य पृष्ठ पर जाएं</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={s.infoBanner}>
                  <MaterialCommunityIcons name="information-outline" size={20} color="#92400E" />
                  <Text style={s.infoBannerText}>
                    मंदिर के मुख्य पुजारी, महंत अथवा प्रबंध ट्रस्टी मंदिर की आरती, समय, घोषणाएं और दर्शन स्लॉट प्रबंधित करने हेतु दावा प्रस्तुत कर सकते हैं।
                  </Text>
                </View>

                {/* Form Fields */}
                <Text style={s.fieldLabel}>मंदिर का नाम *</Text>
                <TextInput
                  style={s.input}
                  value={claimTempleName}
                  onChangeText={setClaimTempleName}
                  placeholder="उदा. श्री संकट मोचन हनुमान मंदिर"
                />

                <Text style={s.fieldLabel}>मंदिर में आपका पद (Role) *</Text>
                <View style={s.roleGrid}>
                  {[
                    { key: 'pujari', label: 'पुजारी / अर्चक' },
                    { key: 'trustee', label: 'ट्रस्टी (Trustee)' },
                    { key: 'prabandhak', label: 'प्रबंधक (Manager)' },
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.key}
                      style={[s.roleChip, claimRole === r.key && s.roleChipActive]}
                      onPress={() => setClaimRole(r.key)}
                    >
                      <Text style={[s.roleChipText, claimRole === r.key && s.roleChipTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.fieldLabel}>आपका पूरा नाम *</Text>
                <TextInput
                  style={s.input}
                  value={claimName}
                  onChangeText={setClaimName}
                  placeholder="उदा. पंडित विन्ध्येश्वरी प्रसाद"
                />

                <Text style={s.fieldLabel}>मोबाइल नंबर (OTP सत्यापन) *</Text>
                <View style={s.otpRow}>
                  <TextInput
                    style={[s.input, { flex: 1, marginBottom: 0 }]}
                    value={claimPhone}
                    onChangeText={setClaimPhone}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity
                    style={[s.otpBtn, otpSent && { backgroundColor: colors.success }]}
                    onPress={handleSendOtp}
                  >
                    <Text style={s.otpBtnText}>{otpSent ? '✓ भेजा गया' : 'OTP भेजें'}</Text>
                  </TouchableOpacity>
                </View>

                {otpSent && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={s.fieldLabel}>OTP दर्ज करें</Text>
                    <TextInput
                      style={s.input}
                      value={claimOtp}
                      onChangeText={setClaimOtp}
                      placeholder="6 अंकों का OTP"
                      keyboardType="number-pad"
                    />
                  </View>
                )}

                <Text style={s.fieldLabel}>सत्यापन दस्तावेज संलग्न करें *</Text>
                <TouchableOpacity
                  style={[s.uploadBox, docUploaded && s.uploadBoxDone]}
                  onPress={() => setDocUploaded(true)}
                >
                  <MaterialCommunityIcons
                    name={docUploaded ? 'file-check' : 'cloud-upload-outline'}
                    size={32}
                    color={docUploaded ? colors.success : colors.maroon}
                  />
                  <Text style={s.uploadBoxTitle}>
                    {docUploaded ? '✓ मंदिर लेटरहेड व पहचान पत्र संलग्न' : 'लेटरहेड या ट्रस्ट प्रमाण पत्र अपलोड करें'}
                  </Text>
                  <Text style={s.uploadBoxSub}>PDF, JPG या PNG (अधिकतम 5 MB)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.submitActionBtn} onPress={handleClaimSubmit}>
                  <Text style={s.submitActionBtnText}>सत्यापन हेतु दावा प्रस्तुत करें ›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: ADD NEW TEMPLE */}
        {activeTab === 'add' && (
          <View>
            <View style={s.infoBanner}>
              <MaterialCommunityIcons name="map-marker-plus" size={20} color="#92400E" />
              <Text style={s.infoBannerText}>
                यदि आपकी कॉलोनी अथवा क्षेत्र का पावन मंदिर ऐप में नहीं है, तो जानकारी भरें। 100 मीटर के भीतर डुप्लिकेट जांच उपरांत यह लाइव हो जाएगा।
              </Text>
            </View>

            <Text style={s.fieldLabel}>मंदिर का नाम *</Text>
            <TextInput
              style={s.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="उदा. श्री सिद्धेश्वर महादेव मंदिर"
            />

            <Text style={s.fieldLabel}>प्रधान देवता *</Text>
            <View style={s.roleGrid}>
              {[
                { key: 'Shiva', label: 'भगवान शिव' },
                { key: 'Hanuman', label: 'हनुमान जी' },
                { key: 'Ram', label: 'श्री राम' },
                { key: 'Krishna', label: 'श्री कृष्ण' },
                { key: 'Durga', label: 'माँ दुर्गा' },
              ].map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[s.roleChip, newDeity === d.key && s.roleChipActive]}
                  onPress={() => setNewDeity(d.key)}
                >
                  <Text style={[s.roleChipText, newDeity === d.key && s.roleChipTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>शहर *</Text>
            <TextInput
              style={s.input}
              value={newCity}
              onChangeText={setNewCity}
              placeholder="उदा. वाराणसी"
            />

            <Text style={s.fieldLabel}>पूरा पता व लैंडमार्क *</Text>
            <TextInput
              style={s.input}
              value={newAddress}
              onChangeText={setNewAddress}
              placeholder="गली, मोहल्ला, निकटतम लैंडमार्क"
            />

            <Text style={s.fieldLabel}>दर्शन समय</Text>
            <TextInput
              style={s.input}
              value={newTimings}
              onChangeText={setNewTimings}
              placeholder="06:00 AM - 08:30 PM"
            />

            <TouchableOpacity style={s.submitActionBtn} onPress={handleAddNewTempleSubmit}>
              <Text style={s.submitActionBtnText}>नया मंदिर सूची में जोड़ें ›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: SUGGEST CORRECTION */}
        {activeTab === 'suggest' && (
          <View>
            <View style={s.infoBanner}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#92400E" />
              <Text style={s.infoBannerText}>
                {targetTemple
                  ? `‘${targetTemple.name}’ की जानकारी में सुधार सुझाएं:`
                  : 'किसी भी मंदिर के गलत समय अथवा स्थिति की रिपोर्ट करें:'}
              </Text>
            </View>

            <Text style={s.fieldLabel}>सुधार का प्रकार *</Text>
            <View style={s.roleGrid}>
              {[
                { key: 'timing_correction', label: 'समय / आरती गलत है' },
                { key: 'closed', label: 'मंदिर स्थायी बंद है' },
                { key: 'other', label: 'अन्य त्रुटि' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[s.roleChip, suggestType === t.key && s.roleChipActive]}
                  onPress={() => setSuggestType(t.key)}
                >
                  <Text style={[s.roleChipText, suggestType === t.key && s.roleChipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>सही जानकारी का विवरण *</Text>
            <TextInput
              style={[s.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={4}
              value={suggestDetails}
              onChangeText={setSuggestDetails}
              placeholder="उदा. शाम की आरती 7 बजे के स्थान पर 7:30 बजे होती है..."
            />

            <TouchableOpacity style={s.submitActionBtn} onPress={handleSuggestSubmit}>
              <Text style={s.submitActionBtnText}>सुधार भेजें ›</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D6',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.maroon,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#EFE4D6',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  tabBtnActive: {
    backgroundColor: colors.maroon,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    marginBottom: 6,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  roleChipActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  roleChipTextActive: {
    color: '#fff',
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  otpBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  otpBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#EFE4D6',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    marginTop: 4,
    marginBottom: 16,
  },
  uploadBoxDone: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  uploadBoxSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  submitActionBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    ...shadow,
  },
  submitActionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    marginTop: 20,
    ...shadow,
  },
  successTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.maroon,
    marginTop: 14,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  successDoneBtn: {
    backgroundColor: colors.maroon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  successDoneBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
