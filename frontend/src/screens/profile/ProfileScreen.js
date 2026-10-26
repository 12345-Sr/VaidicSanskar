import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 720;

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
  const bottomInset = Math.max(insets.bottom, 16);

  const { user, logout } = useApp();
  const { language, openLanguageModal, isHindi, getText } = useLanguage();

  const displayName = user?.name || (isHindi ? 'भक्त' : 'Rohan Sharma');
  const userEmail = user?.email || 'rohan@example.com';

  const menuItems = [
    {
      id: 'account',
      title_en: 'My Account',
      title_hi: 'मेरा खाता',
      sub_en: userEmail,
      sub_hi: userEmail,
      icon: 'account',
      action: () => navigation.navigate('ProfileSetup'),
    },
    {
      id: 'bookings',
      title_en: 'My Bookings',
      title_hi: 'मेरी बुकिंग्स',
      sub_en: 'View your puja and seva bookings',
      sub_hi: 'अपनी पूजा व सेवा बुकिंग देखें',
      icon: 'calendar-month',
      action: () => navigation.navigate('MyBookings'),
    },
    {
      id: 'addresses',
      title_en: 'Saved Addresses',
      title_hi: 'सहेजे गए पते',
      sub_en: 'Manage your locations',
      sub_hi: 'अपने पते प्रबंधित करें',
      icon: 'map-marker',
      action: () => navigation.navigate('AddressBook'),
    },
    {
      id: 'language',
      title_en: 'Language',
      title_hi: 'भाषा',
      sub_en: language === 'hi' ? 'हिंदी' : 'English',
      sub_hi: language === 'hi' ? 'हिंदी' : 'English',
      icon: 'translate',
      badge: language === 'hi' ? 'हिंदी' : 'English',
      action: openLanguageModal,
    },
    {
      id: 'notifications',
      title_en: 'Notifications',
      title_hi: 'नोटिफिकेशन',
      sub_en: 'Manage alerts and reminders',
      sub_hi: 'अलर्ट व सूचनाएं प्रबंधित करें',
      icon: 'bell',
      action: () => navigation.navigate('NotificationCenter'),
    },
    {
      id: 'support',
      title_en: 'Help & Support',
      title_hi: 'सहायता एवं संपर्क',
      sub_en: 'Get help or raise a ticket',
      sub_hi: 'सहायता प्राप्त करें या टिकट बनाएं',
      icon: 'help-circle',
      action: () => navigation.navigate('Contact'),
    },
    {
      id: 'terms',
      title_en: 'Terms & Privacy',
      title_hi: 'नियम एवं गोपनीयता नीति',
      sub_en: 'Terms of Service & Privacy Policy',
      sub_hi: 'सेवा की शर्तें एवं गोपनीयता नीति',
      icon: 'file-document-outline',
      action: () => navigation.navigate('About'),
    },
  ];

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'LoginMode' }] });
  };

  const avatarHaloSize = isSmallScreen ? 94 : 106;
  const avatarImgSize = isSmallScreen ? 84 : 96;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* 1. TOP HEADER WITH SETTINGS ICON */}
      <View style={[s.headerRow, { paddingTop: topInset + 10 }]}>
        <View style={{ width: 40 }} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={s.settingsBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProfileSetup')}
        >
          <MaterialCommunityIcons name="cog-outline" size={24} color="#7A1E14" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 30 }}
      >
        {/* 2. PROFILE HERO: BAL GOPAL AVATAR & BLESSING */}
        <View style={s.heroWrap}>
          <View style={[s.avatarHalo, { width: avatarHaloSize, height: avatarHaloSize, borderRadius: avatarHaloSize / 2 }]}>
            <Image
              source={require('../../../assets/profile_krishna_avatar.png')}
              style={[s.avatarImage, { width: avatarImgSize, height: avatarImgSize, borderRadius: avatarImgSize / 2 }]}
              resizeMode="contain"
            />
          </View>
          <Text style={s.greetingTitle}>
            {isHindi ? `नमस्ते, ${displayName}` : `Hello, ${displayName}`}
          </Text>
          <Text style={s.greetingSubtitle}>
            {isHindi
              ? 'आपका जीवन सकारात्मकता एवं ईश्वरीय कृपा से परिपूर्ण हो।'
              : 'May your life be filled with positivity\nand divine blessings'}
          </Text>
          <Text style={s.lotusDivider}>🪷</Text>
        </View>

        {/* 3. STACKED CARD MENU */}
        <View style={s.menuCard}>
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.menuItem, !isLast && s.menuItemBorder]}
                activeOpacity={0.7}
                onPress={item.action}
              >
                <View style={s.iconCircle}>
                  <MaterialCommunityIcons name={item.icon} size={19} color="#D48817" />
                </View>

                <View style={s.itemTextWrap}>
                  <Text style={s.menuTitle}>
                    {getText(item.title_hi, item.title_en)}
                  </Text>
                  <Text style={s.menuSub} numberOfLines={1}>
                    {getText(item.sub_hi, item.sub_en)}
                  </Text>
                </View>

                {item.badge && (
                  <View style={s.badgePill}>
                    <Text style={s.badgeText}>{item.badge}</Text>
                  </View>
                )}

                <Ionicons name="chevron-forward" size={17} color="#C4B4A5" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. LOGOUT BUTTON (SOFT RED PILL MATCHING SCREENSHOT) */}
        <TouchableOpacity
          style={s.logoutBtn}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#C62828" style={{ marginRight: 8 }} />
          <Text style={s.logoutText}>
            {isHindi ? 'लॉग आउट' : 'Logout'}
          </Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: '#FAF4E8',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  avatarHalo: {
    padding: 3,
    backgroundColor: '#FFF8EE',
    borderWidth: 2,
    borderColor: '#D48817',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D48817',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  avatarImage: {
    // sizing dynamic
  },
  greetingTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '700',
    color: '#7A1E14',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#7C6C5E',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
    maxWidth: 280,
  },
  lotusDivider: {
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.85,
  },
  menuCard: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EADBCE',
    overflow: 'hidden',
    shadowColor: '#2E1308',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8DC',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9EE',
    borderWidth: 1,
    borderColor: '#F3E4D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E1308',
  },
  menuSub: {
    fontSize: 11,
    color: '#8C7A68',
    marginTop: 1,
  },
  badgePill: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D48817',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C62828',
  },
  bottomCornerLeft: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    zIndex: 1,
  },
  bottomCornerRight: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    zIndex: 1,
  },
});
