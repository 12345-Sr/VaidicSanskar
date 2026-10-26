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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { AuthService } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(cleanEmail);
      Alert.alert(
        'Reset Code Sent',
        res?.message || 'If an account exists for that email, a 6-digit password-reset code has been dispatched.',
        [
          {
            text: 'Enter Code',
            onPress: () => {
              navigation.navigate('Otp', {
                email: cleanEmail,
                isEmail: true,
                isForgotPassword: true,
              });
            },
          },
        ]
      );
    } catch (err) {
      // If server returned message or network offline fallback
      Alert.alert('Notice', err?.message || 'Could not send reset code. Please try again.');
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

        {/* BOTTOM CARD: FORGOT PASSWORD */}
        <View style={s.cardWrapper}>
          <TouchableOpacity
            style={s.backRow}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#6A141D" />
            <Text style={s.backText}>Back to Login</Text>
          </TouchableOpacity>

          <Text style={s.cardTitle}>Forgot Password?</Text>
          <Text style={s.cardSubtitle}>
            Enter your registered email address and we will send you a 6-digit verification code to reset your password.
          </Text>

          {/* Email Input */}
          <View style={s.inputBox}>
            <Feather name="mail" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Registered Email Address"
              placeholderTextColor="#A59282"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />
          </View>

          {/* Send Reset Code Button */}
          <TouchableOpacity
            style={s.actionBtn}
            activeOpacity={0.85}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.actionBtnText}>Send Reset Code  →</Text>
            )}
          </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 13.5,
    color: '#6A141D',
    fontWeight: '600',
    marginLeft: 4,
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
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 19,
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
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#2E1308',
  },
  actionBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
