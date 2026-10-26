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
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { AuthService } from '../../services/api';

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const otp = route?.params?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert(
        'Password Too Short',
        'Your new password must be at least 8 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Passwords Do Not Match',
        'Confirm password does not match the new password. Please check and try again.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword({
        email,
        otp,
        newPassword,
      });

      Alert.alert(
        'Password Updated!',
        res?.message || 'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'Login Now',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Reset Failed',
        err?.message || 'Could not reset password. Your reset code may have expired. Please request a new code.'
      );
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

        {/* BOTTOM CARD: RESET PASSWORD */}
        <View style={s.cardWrapper}>
          <TouchableOpacity
            style={s.backRow}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#6A141D" />
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={s.cardTitle}>Set New Password</Text>
          <Text style={s.cardSubtitle}>
            Your email code has been verified for{'\n'}
            <Text style={s.emailHighlight}>{email}</Text>.{'\n'}
            Enter your new secure password below.
          </Text>

          {/* 1. New Password */}
          <Text style={s.fieldLabel}>New Password</Text>
          <View style={s.inputBox}>
            <Feather name="lock" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Enter new password (min. 8 characters)"
              placeholderTextColor="#A59282"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              returnKeyType="next"
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={s.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8C7A68"
              />
            </TouchableOpacity>
          </View>

          {/* 2. Confirm Password */}
          <Text style={s.fieldLabel}>Confirm New Password</Text>
          <View style={s.inputBox}>
            <Feather name="lock" size={18} color="#8C7A68" style={s.inputIcon} />
            <TextInput
              style={s.textInput}
              placeholder="Re-enter new password"
              placeholderTextColor="#A59282"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={s.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8C7A68"
              />
            </TouchableOpacity>
          </View>

          {/* Update Password Primary Button */}
          <TouchableOpacity
            style={s.actionBtn}
            activeOpacity={0.85}
            onPress={onResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={s.actionBtnText}>Update Password</Text>
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
    marginBottom: 20,
    lineHeight: 18,
  },
  emailHighlight: {
    color: '#6A141D',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#554438',
    marginBottom: 6,
    marginTop: 4,
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
    marginBottom: 14,
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
  actionBtn: {
    height: 50,
    backgroundColor: '#6A141D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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
