import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { AuthService } from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    if (cleanPhone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.includes('.'))) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.sendOtp(cleanPhone);
      const otpCode = res?.devOtp || res?.otp;
      Alert.alert(
        'Verification Code',
        otpCode
          ? `Your verification code (OTP) is:\n\n👉  ${otpCode}  👈\n\n(It has been placed on your verification screen).`
          : res?.message || `A verification code has been dispatched to +91 ${cleanPhone}.`
      );
      navigation.navigate('Otp', {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        isSignup: true,
        devOtp: otpCode,
      });
    } catch (err) {
      if (cleanEmail) {
        try {
          const emailRes = await AuthService.sendEmailOtp(cleanEmail);
          Alert.alert(
            'OTP Sent to Email',
            emailRes?.message || `A verification code has been dispatched to ${cleanEmail}.`
          );
          navigation.navigate('Otp', {
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            isSignup: true,
            isEmail: true,
          });
          return;
        } catch (emailErr) {
          Alert.alert('Registration Notice', emailErr?.message || err?.message || 'Could not send verification OTP.');
        }
      } else {
        Alert.alert('Registration Notice', err?.message || 'Could not send OTP to your number.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP GLOWING TEMPLE BANNER */}
        <View style={s.topHeader}>
          <Image
            source={require('../../../assets/sacred_temple_emblem.png')}
            style={s.templeHeaderImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(58,11,16,0.3)', 'rgba(58,11,16,0.9)']}
            style={s.headerGradient}
          >
            <View style={s.omCircleBadge}>
              <MaterialCommunityIcons name="om" size={32} color="#FCE6B2" />
            </View>
            <Text style={s.brandTitle}>VaidicSanskar</Text>
            <Text style={s.brandTagline}>Faith  •  Tradition  •  Together</Text>
          </LinearGradient>
        </View>

        {/* BOTTOM CARD: CREATE YOUR ACCOUNT */}
        <View style={s.cardWrapper}>
          <Text style={s.cardTitle}>Create Your Account</Text>
          <Text style={s.cardSubtitle}>Begin your spiritual journey with us</Text>

          {/* 1. Full Name */}
          <View style={s.inputBox}>
            <Feather name="user" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Full Name"
              placeholderTextColor="#A59282"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
          </View>

          {/* 2. Email Address */}
          <View style={s.inputBox}>
            <Feather name="mail" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Email Address"
              placeholderTextColor="#A59282"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>

          {/* 3. Mobile Number */}
          <View style={s.inputBox}>
            <Feather name="phone" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Mobile Number"
              placeholderTextColor="#A59282"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
              returnKeyType="next"
            />
          </View>

          {/* 4. Password */}
          <View style={s.inputBox}>
            <Feather name="lock" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Password"
              placeholderTextColor="#A59282"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8C7A68"
              />
            </TouchableOpacity>
          </View>

          {/* Create Account Primary Button (Deep Maroon) */}
          <TouchableOpacity
            style={s.createBtn}
            activeOpacity={0.85}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.createBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Already have an account? Login Link */}
          <View style={s.footerRow}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={s.loginLinkText}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Divider: "or" */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Sign In (Google, Apple, Facebook) */}
          <View style={s.socialRow}>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={21} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-facebook" size={21} color="#1877F2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FAF4E8',
  },
  topHeader: {
    height: 230,
    width: '100%',
    position: 'relative',
    backgroundColor: '#3A0B10',
  },
  templeHeaderImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
  },
  omCircleBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FDE0A4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FDF4E8',
    fontFamily: serif,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: '#FDE0A4',
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: '#FAF4E8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E1308',
    fontFamily: serif,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#7C6C5E',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADBCE',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#2E1308',
  },
  eyeBtn: {
    padding: 6,
  },
  createBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13.5,
    color: '#7C6C5E',
  },
  loginLinkText: {
    fontSize: 13.5,
    color: '#6A141D',
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EADBCE',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#A59282',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBCE',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    elevation: 1,
  },
});
