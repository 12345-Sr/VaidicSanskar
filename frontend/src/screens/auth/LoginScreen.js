import React, { useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { AuthService, setAuthToken } from '../../services/api';
import { useAuth } from '../../context/AppContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Google OAuth
  const webId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || webId;
  const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || webId;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webId,
    androidClientId: androidId,
    iosClientId: iosId,
    webClientId: webId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleSuccess(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleSuccess = async (token) => {
    setLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await res.json();
      const serverRes = await AuthService.googleLogin({
        email: profile.email,
        name: profile.name,
        photo: profile.picture,
        googleId: profile.id,
      });
      if (serverRes?.token) setAuthToken(serverRes.token);
      if (serverRes?.user) login(serverRes.user);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Google Sign-In Error', err?.message || 'Could not complete Google sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const onGooglePress = async () => {
    try {
      if (!promptAsync) {
        Alert.alert('Google Sign-In', 'Google Sign-In is not initialized or not supported on this device.');
        return;
      }
      await promptAsync();
    } catch (e) {
      Alert.alert('Google Sign-In Error', e?.message || 'Could not initiate Google Sign-In.');
    }
  };

  const onSubmit = async () => {
    const input = phoneOrEmail.trim();
    if (!input) {
      Alert.alert('Required', 'Please enter your mobile number or email address.');
      return;
    }

    const isEmail = input.includes('@');
    setLoading(true);

    // If user provided email and password, attempt email+password login
    if (isEmail && password) {
      try {
        const res = await AuthService.loginWithPassword({
          email: input.toLowerCase(),
          password,
        });

        if (res?.token) {
          setAuthToken(res.token);
        }
        if (res?.user) {
          login(res.user);
        }
        navigation.replace('Main');
        return;
      } catch (err) {
        if (err?.data?.code === 'PASSWORD_RESET_REQUIRED' || err?.data?.requiresPasswordReset) {
          Alert.alert(
            'Password Setup Required',
            err?.data?.message || 'Please set your password. We have sent a verification code to your email.',
            [
              {
                text: 'Set Password',
                onPress: () =>
                  navigation.navigate('Otp', {
                    email: input.toLowerCase(),
                    isEmail: true,
                    isForgotPassword: true,
                  }),
              },
            ]
          );
          setLoading(false);
          return;
        }

        // If password login fails, check if we should fall back or show error
        Alert.alert(
          'Login Error',
          err?.message || 'Invalid email or password. Use Forgot Password if you need to reset.'
        );
        setLoading(false);
        return;
      }
    }

    if (isEmail) {
      try {
        const res = await AuthService.sendEmailOtp(input.toLowerCase());
        Alert.alert(
          'OTP Dispatched',
          res?.message || `A verification code has been dispatched to ${input}.`
        );
        navigation.navigate('Otp', {
          email: input.toLowerCase(),
          isEmail: true,
        });
      } catch (err) {
        Alert.alert('Login Notice', err?.message || 'Could not send verification code.');
      } finally {
        setLoading(false);
      }
    } else {
      const cleanPhone = input.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setLoading(false);
        Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      try {
        const res = await AuthService.sendOtp(cleanPhone);
        const otpCode = res?.devOtp || res?.otp;
        Alert.alert(
          'Verification Code',
          otpCode
            ? `Your verification code (OTP) is:\n\n👉  ${otpCode}  👈\n\n(It has been placed on your verification screen).`
            : res?.message || `A verification OTP has been dispatched to +91 ${cleanPhone}.`
        );
      } catch (err) {
        if (err?.data?.useFirebase || err?.message?.includes('Firebase')) {
          Alert.alert(
            'SMS OTP Mode',
            'Phone SMS is in Firebase mode on the server. Please enter your Email address to receive your 6-digit OTP code instantly, or log in with password / Google.'
          );
        } else {
          Alert.alert('Login Notice', err?.message || 'Could not send verification code.');
        }
      } finally {
        setLoading(false);
      }
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

        {/* BOTTOM CARD: LOGIN */}
        <View style={s.cardWrapper}>
          <Text style={s.cardTitle}>Login to Your Account</Text>
          <Text style={s.cardSubtitle}>Welcome back to your spiritual journey</Text>

          {/* 1. Mobile Number or Email */}
          <View style={s.inputBox}>
            <Feather name="user" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Mobile Number or Email"
              placeholderTextColor="#A59282"
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* 2. Password */}
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

          {/* Forgot Password */}
          <TouchableOpacity
            style={s.forgotBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Primary Button (Deep Maroon) */}
          <TouchableOpacity
            style={s.loginBtn}
            activeOpacity={0.85}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Don't have an account? Create account Link */}
          <View style={s.footerRow}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.createAccountText}>Create account</Text>
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
              onPress={onGooglePress}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => Alert.alert('Apple Sign In', 'Apple Sign In initiated.')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={21} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.socialBtn}
              onPress={() => Alert.alert('Facebook Sign In', 'Facebook Sign In initiated.')}
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    marginTop: 2,
  },
  forgotText: {
    fontSize: 12.5,
    color: '#6A141D',
    fontWeight: '600',
  },
  loginBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13.5,
    color: '#7C6C5E',
  },
  createAccountText: {
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
