import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { useAuth } from '../../context/AppContext';
import { AuthService } from '../../services/api';

export default function ProfileSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [houseNo, setHouseNo] = useState(user?.addressDetails?.houseNo || '');
  const [locality, setLocality] = useState(user?.addressDetails?.locality || '');
  const [city, setCity] = useState(user?.city || user?.addressDetails?.city || '');
  const [pincode, setPincode] = useState(user?.addressDetails?.pincode || '');

  const onSave = async () => {
    const formattedAddress = `${houseNo}, ${locality}, ${city} - ${pincode}`;
    const payload = {
      name: fullName,
      email,
      phone,
      city,
      address: formattedAddress,
      addressDetails: {
        houseNo,
        locality,
        city,
        pincode,
      },
    };

    updateProfile(payload);
    try {
      await AuthService.updateProfile(payload);
    } catch (e) {
      // offline fallback
    }

    Alert.alert('Details Saved', 'Your personal and address details have been updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* HEADER */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#6A141D" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Complete Your Details</Text>
          <Text style={s.headerSubtitle}>Help us serve you better</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SECTION 1: PERSONAL DETAILS */}
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#6A141D" style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>Personal Details</Text>
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Full Name</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#A59282"
            />
          </View>

          <Text style={s.fieldLabel}>Email Address</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#A59282"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={s.fieldLabel}>Phone Number</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor="#A59282"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* SECTION 2: ADDRESS DETAILS */}
        <View style={[s.sectionHeader, { marginTop: 22 }]}>
          <Ionicons name="location-outline" size={20} color="#6A141D" style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>Address Details</Text>
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>House / Flat No.</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={houseNo}
              onChangeText={setHouseNo}
              placeholder="House / Flat No."
              placeholderTextColor="#A59282"
            />
          </View>

          <Text style={s.fieldLabel}>Area / Locality</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={locality}
              onChangeText={setLocality}
              placeholder="Area / Locality"
              placeholderTextColor="#A59282"
            />
          </View>

          <Text style={s.fieldLabel}>City</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#A59282"
            />
          </View>

          <Text style={s.fieldLabel}>Pincode</Text>
          <View style={s.inputBox}>
            <TextInput
              style={s.textInput}
              value={pincode}
              onChangeText={setPincode}
              placeholder="Pincode"
              placeholderTextColor="#A59282"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* SAVE & CONTINUE BUTTON */}
        <TouchableOpacity style={s.saveBtn} activeOpacity={0.85} onPress={onSave}>
          <Text style={s.saveBtnText}>Save & Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FAF4E8',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE3D5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBCE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E1308',
    fontFamily: serif,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7C6C5E',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E1308',
  },
  fieldGroup: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6E5D4F',
    marginBottom: 5,
    marginTop: 6,
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADBCE',
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14.5,
    color: '#2E1308',
  },
  saveBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
