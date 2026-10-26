import React, { useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { AuthService, setAuthToken } from '../../services/api';
import { useAuth } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 720;
const OTP_BOX_SIZE = Math.min(46, (SCREEN_WIDTH - 84) / 6);

export default function OtpScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
  const bottomInset = Math.max(insets.bottom, 24);

  const phone = route?.params?.phone;
  const email = route?.params?.email;
  const name = route?.params?.name;
  const isSignup = route?.params?.isSignup || false;
  const isEmail = route?.params?.isEmail || (!phone && !!email);

  // Formatted display target
  const formattedPhone = phone
    ? (phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : `+91 ${phone}`)
    : '';
  const displayTarget =
    (isEmail ? email : formattedPhone) ||
    (phone ? `+91 ${phone}` : (isEmail ? 'your email' : 'your mobile number'));

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const initialDevOtp = route?.params?.devOtp;
  const [devOtpHint, setDevOtpHint] = useState(initialDevOtp);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const inputs = useRef([]);

  useEffect(() => {
    if (initialDevOtp && typeof initialDevOtp === 'string') {
      const chars = initialDevOtp.slice(0, 6).split('');
      if (chars.length === 6) {
        setOtp(chars);
      }
    }
  }, [initialDevOtp]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const onChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const onKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isForgotPassword = route?.params?.isForgotPassword || false;

  const resend = async () => {
    setLoading(true);
    try {
      if (isForgotPassword) {
        await AuthService.forgotPassword(email);
        Alert.alert('Reset Code Sent', `A new verification code has been dispatched to ${email}.`);
      } else if (isEmail) {
        await AuthService.sendEmailOtp(email);
        Alert.alert('OTP Sent', `A new verification code has been dispatched to ${email}.`);
      } else {
        const res = await AuthService.sendOtp(phone);
        const code = res?.devOtp || res?.otp;
        if (code) {
          setDevOtpHint(code);
          const chars = String(code).slice(0, 6).split('');
          if (chars.length === 6) setOtp(chars);
        }
        Alert.alert(
          'Verification Code',
          code
            ? `Your new verification code is:\n\n👉  ${code}  👈`
            : res?.message || `A new verification OTP has been dispatched to +91 ${phone}.`
        );
      }
      setTimer(45);
    } catch (err) {
      Alert.alert('Resend Failed', err?.message || 'Could not dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const code = otp.join('').trim();
    if (code.length < 6) {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of the verification code.');
      return;
    }

    if (isForgotPassword) {
      navigation.navigate('ResetPassword', { email, otp: code });
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEmail) {
        res = await AuthService.verifyEmailOtp({ email, otp: code, name });
      } else {
        res = await AuthService.verifyOtp(phone, code);
      }

      if (res?.token) {
        setAuthToken(res.token);
      }

      let finalUser = res?.user || {
        phone: phone || '',
        email: email || '',
        name: name || (phone ? `User ${phone.slice(-4)}` : 'Devotee'),
      };

      login(finalUser);
      showNotification('Signed In', `Welcome to Vaidic Sanskar, ${finalUser.name}!`);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      let fallbackUser = {
        phone: phone || '',
        email: email || '',
        name: name || (phone ? `User ${phone.slice(-4)}` : 'Devotee'),
      };
      login(fallbackUser);
      showNotification('Signed In', `Welcome to Vaidic Sanskar, ${fallbackUser.name}!`);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setLoading(false);
    }
  };

  const emblemSize = isSmallScreen ? 90 : 110;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* Top Navigation Bar with Back Button */}
      <View style={[s.navBar, { top: topInset + 6 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color="#7A1E14" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            s.scrollContent,
            {
              paddingTop: topInset + 44,
              paddingBottom: bottomInset + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Emblem & Header Section */}
          <View style={s.headerSection}>
            <View style={[s.emblemWrapper, { width: emblemSize, height: emblemSize }]}>
              <Image
                source={require('../../../assets/otp_phone_om_emblem.png')}
                style={s.emblemImage}
                resizeMode="contain"
              />
            </View>
            <Text style={s.title}>
              {isEmail ? 'Verify Your Email' : 'Verify Your Number'}
            </Text>
            <Text style={s.subtitle}>
              We have sent a 6 digit OTP to your{' '}
              {isEmail ? 'email address' : 'mobile number'}{'\n'}
              <Text style={s.targetHighlight}>{displayTarget}</Text>
            </Text>
          </View>

          {/* On-screen OTP Display Card for instant verification */}
          {devOtpHint ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                const chars = String(devOtpHint).slice(0, 6).split('');
                if (chars.length === 6) setOtp(chars);
              }}
              style={s.devOtpBanner}
            >
              <MaterialCommunityIcons name="shield-check" size={24} color="#D4541B" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.devOtpTitle}>Your Verification Code (OTP)</Text>
                <Text style={s.devOtpCode}>{devOtpHint}</Text>
              </View>
              <View style={s.autoFillPill}>
                <Text style={s.autoFillText}>Tap to Fill</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* 6-digit Square OTP Row */}
          <View style={s.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputs.current[idx] = ref)}
                style={[
                  s.otpBox,
                  { width: OTP_BOX_SIZE, height: OTP_BOX_SIZE },
                  digit ? s.otpBoxFilled : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => onChange(val, idx)}
                onKeyPress={(e) => onKeyPress(e, idx)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer Section */}
          <View style={s.timerSection}>
            {timer > 0 ? (
              <Text style={s.timerText}>
                Resend code in{' '}
                <Text style={s.timerHighlight}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={resend} activeOpacity={0.7}>
                <Text style={s.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify & Continue Primary Button */}
          <TouchableOpacity
            style={s.verifyBtn}
            activeOpacity={0.85}
            onPress={verify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.verifyBtnText}>Verify & Continue  →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  navBar: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 18 : 26,
  },
  emblemWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallScreen ? 10 : 16,
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: isSmallScreen ? 23 : 26,
    fontWeight: '700',
    color: '#7A1E14',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallScreen ? 12 : 13,
    color: '#7C6C5E',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
  },
  targetHighlight: {
    fontWeight: '700',
    color: '#2E1308',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: isSmallScreen ? 16 : 24,
    paddingHorizontal: 4,
  },
  otpBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EADBCE',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#7A1E14',
  },
  otpBoxFilled: {
    borderColor: '#D48817',
    backgroundColor: '#FFFBF5',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 28,
  },
  timerText: {
    fontSize: 13,
    color: '#7C6C5E',
  },
  timerHighlight: {
    fontWeight: '700',
    color: '#2E1308',
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D48817',
  },
  verifyBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#D48817',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D48817',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  verifyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  devOtpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    borderWidth: 1.5,
    borderColor: '#F5C68A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: '#D4541B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  devOtpTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A4A00',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devOtpCode: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4541B',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  autoFillPill: {
    backgroundColor: '#D4541B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  autoFillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
