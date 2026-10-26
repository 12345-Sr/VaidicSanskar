import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { serif } from '../theme/styles';
import { useApp } from '../context/AppContext';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

// Top Quick Services matching the 4 circular icons in mockup Screen 3
const TOP_SERVICES = [
  {
    id: 'pooja_booking',
    title_en: 'Pooja\nBooking',
    title_hi: 'पूजा\nबुकिंग',
    icon: 'fire',
    route: 'PujaBrowse',
    image: require('../../assets/services/pandit_booking.png'),
  },
  {
    id: 'pandit_booking',
    title_en: 'Pandit\nBooking',
    title_hi: 'पंडित\nबुकिंग',
    icon: 'account-tie',
    route: 'PujaBrowse',
    image: require('../../assets/services/daily_pandit.png'),
  },
  {
    id: 'astro_talk',
    title_en: 'Astro\nTalk',
    title_hi: 'एस्ट्रो\nटॉक',
    icon: 'creation',
    route: 'Vartalap',
    image: require('../../assets/services/virtual_services.png'),
  },
  {
    id: 'estore',
    title_en: 'Pooja\nE-Store',
    title_hi: 'पूजा\nई-स्टोर',
    icon: 'shopping',
    route: 'EStore',
    image: require('../../assets/services/estore.png'),
  },
];

// All additional services user has in the app
const MORE_SERVICES = [
  {
    id: 'temple_darshan',
    title_en: 'Temple Darshan',
    title_hi: 'मंदिर दर्शन',
    image: require('../../assets/services/darshan_booking.png'),
    route: 'DarshanBooking',
  },
  {
    id: 'kundali',
    title_en: 'Kundali',
    title_hi: 'कुंडली',
    image: require('../../assets/services/horoscope.png'),
    route: 'Kundali',
  },
  {
    id: 'brahman_bhoj',
    title_en: 'Brahman Bhoj',
    title_hi: 'ब्राह्मण भोज',
    image: require('../../assets/services/brahman_bhoj.png'),
    route: 'BhavyaAayojan',
    routeParams: { category: 'Brahman Bhoj' },
  },
  {
    id: 'bhajan_mandal',
    title_en: 'Bhajan Mandal',
    title_hi: 'भजन मंडली',
    image: require('../../assets/services/bhajan_mandal.png'),
    route: 'BhajanMandali',
  },
  {
    id: 'daily_pandit',
    title_en: 'Daily Pandit',
    title_hi: 'दैनिक पंडित',
    image: require('../../assets/services/daily_pandit.png'),
    route: 'DailyPandit',
  },
  {
    id: 'puja_temple',
    title_en: 'Puja at Temple',
    title_hi: 'मंदिर पूजा',
    image: require('../../assets/services/puja_temple.png'),
    route: 'TempleLocator',
  },
  {
    id: 'donation',
    title_en: 'Donation',
    title_hi: 'दान एवं सहयोग',
    image: require('../../assets/services/donation.png'),
    route: 'Donation',
  },
  {
    id: 'temple_locator',
    title_en: 'Temple Locator',
    title_hi: 'मंदिर लोकेटर',
    image: require('../../assets/services/temple_locator.png'),
    route: 'TempleLocator',
  },
  {
    id: 'bhavya_ayojana',
    title_en: 'Bhavya Ayojana',
    title_hi: 'भव्य आयोजन',
    image: require('../../assets/services/bhavya_ayojana.png'),
    route: 'BhavyaAayojan',
  },
];

import { PujaService } from '../services/api';
import { panditBookingStore } from '../services/panditBookingStore';

const CITIES = ['New Delhi', 'Varanasi', 'Haridwar', 'Ayodhya', 'Ujjain', 'Mathura', 'Prayagraj'];

const DEFAULT_POPULAR_POOJAS = [
  {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    hindi: 'श्री सत्यनारायण महापूजा',
    tagline: 'For happiness, peace & family prosperity',
    price: 2500,
    duration: '1.5 - 2 hrs',
    image: require('../../assets/services/puja_temple.png'),
  },
  {
    id: 'griha_pravesh',
    name: 'Griha Pravesh Pooja',
    hindi: 'गृह प्रवेश एवं वास्तु शांति',
    tagline: 'Auspicious housewarming and negative energy removal',
    price: 5100,
    duration: '3 - 3.5 hrs',
    image: require('../../assets/services/pandit_booking.png'),
  },
  {
    id: 'ganesh_pooja',
    name: 'Ganesh Pooja',
    hindi: 'श्री गणेश चतुर्थी व विघ्नहर्ता पूजा',
    tagline: 'Removal of obstacles & auspicious beginnings',
    price: 2100,
    duration: '1 - 1.5 hrs',
    image: require('../../assets/services/pandit_booking.png'),
  },
  {
    id: 'rudrabhishek',
    name: 'Rudrabhishek Pooja',
    hindi: 'महा रुद्राभिषेक एवं शिव पूजन',
    tagline: 'For health, longevity & negative dosha removal',
    price: 3100,
    duration: '2 - 2.5 hrs',
    image: require('../../assets/banner_havan_kund.png'),
  },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
  const { user } = useApp();
  const { isHindi } = useLanguage();

  const [selectedCity, setSelectedCity] = useState(user?.city || 'New Delhi');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [activeBooking, setActiveBooking] = useState(panditBookingStore.getBooking());
  const [popularPoojas, setPopularPoojas] = useState(DEFAULT_POPULAR_POOJAS);

  React.useEffect(() => {
    const unsub = panditBookingStore.subscribe((b) => {
      setActiveBooking(b ? { ...b } : null);
    });

    // Fetch dynamic poojas from backend database
    PujaService.list()
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.pujas || res?.data || [];
        if (raw.length > 0) {
          setPopularPoojas(raw);
        }
      })
      .catch((err) => console.log('Backend pooja fetch notice:', err?.message));

    return () => unsub();
  }, []);

  const drawerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.45,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    if (activeBooking && activeBooking.status !== 'COMPLETED') {
      pulseLoop.start();
    } else {
      pulseLoop.stop();
    }
    return () => pulseLoop.stop();
  }, [activeBooking]);

  const displayName = user?.name ? user.name.split(' ')[0] : (isHindi ? 'भक्त' : 'Devotee');
  const fullName = user?.name || (isHindi ? 'वैदिक भक्त' : 'Vaidic Devotee');

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = (callback) => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
      if (typeof callback === 'function') callback();
    });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* 1. TOP CURVED DEEP MAROON HEADER */}
        <LinearGradient
          colors={['#5A1017', '#4A0C13']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[s.topMaroonHeader, { paddingTop: topInset + 12 }]}
        >
          <View style={s.topHeaderRow}>
            {/* Left: Greeting & Subtitle */}
            <TouchableOpacity style={{ flex: 1, paddingRight: 10 }} activeOpacity={0.8} onPress={openDrawer}>
              <Text style={s.namasteTitle}>
                {isHindi ? `नमस्ते, ${displayName}` : `Namaste, ${displayName}`}
              </Text>
              <Text style={s.blessingSub}>
                {isHindi
                  ? 'आपका जीवन सकारात्मकता व आशीर्वाद से परिपूर्ण हो।'
                  : 'May your life be filled with positivity and blessings.'}
              </Text>

              {/* Location Pill */}
              <TouchableOpacity
                style={s.locationPill}
                activeOpacity={0.7}
                onPress={() => setCityModalVisible(true)}
              >
                <Ionicons name="location-sharp" size={12} color="#FDE0A4" style={{ marginRight: 4 }} />
                <Text style={s.locationPillText} numberOfLines={1}>
                  {selectedCity}
                </Text>
                <Ionicons name="chevron-forward" size={11} color="#FDE0A4" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Right: Circular Profile Avatar with Golden Ring */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Profile')}
              style={s.avatarContainer}
            >
              <Image
                source={require('../../assets/profile_krishna_avatar.png')}
                style={s.avatarImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Quick Pooja Search Bar */}
          <TouchableOpacity
            style={s.homeSearchBar}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PujaBrowse')}
          >
            <Ionicons name="search" size={18} color="#D48B28" style={{ marginRight: 8 }} />
            <Text style={s.homeSearchPlaceholder}>Search for pooja, ritual, or havan...</Text>
            <View style={s.searchFilterTag}>
              <Text style={s.searchFilterText}>Vedic</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* 2. HERO BANNER: "Book a Pooja" */}
        <View style={s.heroBannerWrap}>
          <TouchableOpacity
            style={s.heroBannerCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PujaBrowse')}
          >
            <LinearGradient
              colors={['#7E2018', '#541016']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroGradient}
            >
              <View style={s.heroLeft}>
                <Text style={s.heroTitle}>Book a Pooja</Text>
                <Text style={s.heroSub}>
                  {isHindi
                    ? 'घर में सुख, शांति व सकारात्मक ऊर्जा का संचार करें।'
                    : 'Bring peace, prosperity and positive energy into your life.'}
                </Text>
                <TouchableOpacity
                  style={s.exploreBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('PujaBrowse')}
                >
                  <Text style={s.exploreBtnText}>Explore Poojas  →</Text>
                </TouchableOpacity>
              </View>

              <View style={s.heroRight}>
                <Image
                  source={require('../../assets/banner_havan_kund.png')}
                  style={s.heroArtImage}
                  resizeMode="contain"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 3. QUICK SERVICES: 4 CIRCULAR ICONS MATCHING MOCKUP SCREEN 3 */}
        <View style={s.quickServicesRow}>
          {TOP_SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.serviceCol}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={s.serviceCircle}>
                <Image source={item.image} style={s.serviceIconImg} resizeMode="contain" />
              </View>
              <Text style={s.serviceTitle} numberOfLines={2}>
                {isHindi ? item.title_hi : item.title_en}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. EXPANDABLE ALL SERVICES ("Add more services that I have") */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>
            {isHindi ? 'सभी वैदिक सेवाएं' : 'All Sacred Services'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAllServices(!showAllServices)}
          >
            <Text style={s.viewAllLink}>
              {showAllServices ? (isHindi ? 'कम देखें ▴' : 'Show Less ▴') : (isHindi ? 'और देखें ▾' : 'View More ▾')}
            </Text>
          </TouchableOpacity>
        </View>

        {showAllServices && (
          <View style={s.moreServicesGrid}>
            {MORE_SERVICES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.moreServiceItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.route, item.routeParams || {})}
              >
                <View style={s.moreServiceCircle}>
                  <Image source={item.image} style={s.moreServiceImg} resizeMode="contain" />
                </View>
                <Text style={s.moreServiceText} numberOfLines={2}>
                  {isHindi ? item.title_hi : item.title_en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 5. POPULAR POOJAS: HORIZONTAL CARDS (MATCHING MOCKUP SCREEN 3) */}
        <View style={[s.sectionHeader, { marginTop: 18 }]}>
          <Text style={s.sectionTitle}>
            {isHindi ? 'प्रमुख पूजाएं' : 'Popular Poojas'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PujaBrowse')}
          >
            <Text style={s.viewAllLink}>View All  →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.popularPoojasScroll}
        >
          {popularPoojas.map((pooja) => {
            const poojaImg = typeof pooja.image === 'number'
              ? pooja.image
              : require('../../assets/services/puja_temple.png');

            return (
              <TouchableOpacity
                key={pooja.id || pooja._id}
                style={s.poojaCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('PujaBooking', { pooja })}
              >
                <View style={s.poojaImageWrapper}>
                  <Image source={poojaImg} style={s.poojaThumb} resizeMode="contain" />
                </View>
                <View style={s.poojaCardBottom}>
                  <Text style={s.poojaCardTitle} numberOfLines={1}>
                    {pooja.name}
                  </Text>
                  <Text style={s.poojaCardSub} numberOfLines={1}>
                    {pooja.tagline || pooja.hindi || '₹ ' + (pooja.price || pooja.basePrice || 2500)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>

      {/* CITY PICKER MODAL (CLEAN TEXT MODAL - NO MAP / NO LIVE TRACKING) */}
      <Modal
        visible={cityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}
        >
          <View style={s.cityModalCard}>
            <View style={s.cityModalHeader}>
              <Text style={s.cityModalTitle}>Select Your Sacred City</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={22} color="#7C6C5E" />
              </TouchableOpacity>
            </View>
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.cityRow, selectedCity === c && s.cityRowActive]}
                onPress={() => {
                  setSelectedCity(c);
                  setCityModalVisible(false);
                }}
              >
                <Ionicons
                  name="location"
                  size={18}
                  color={selectedCity === c ? '#6A141D' : '#8C7A68'}
                />
                <Text
                  style={[s.cityRowText, selectedCity === c && s.cityRowTextActive]}
                >
                  {c}
                </Text>
                {selectedCity === c && (
                  <Ionicons name="checkmark-circle" size={18} color="#6A141D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SIDE DRAWER */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}
      >
        <View style={s.drawerBackdropWrap}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => closeDrawer()}
          />
          <Animated.View
            style={[
              s.drawerPanel,
              {
                width: DRAWER_WIDTH,
                transform: [
                  {
                    translateX: drawerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-DRAWER_WIDTH, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[s.drawerHeader, { paddingTop: topInset + 16 }]}>
              <Image
                source={require('../../assets/profile_krishna_avatar.png')}
                style={s.drawerAvatar}
                resizeMode="cover"
              />
              <Text style={s.drawerName}>{fullName}</Text>
              {(user?.email || user?.phone) ? (
                <Text style={s.drawerEmail}>{user?.email || user?.phone}</Text>
              ) : null}
            </View>

            <View style={s.drawerMenu}>
              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('ProfileSetup'))}
              >
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>Personal & Address Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('PujaBrowse'))}
              >
                <MaterialCommunityIcons name="fire" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>Pooja Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('Bookings'))}
              >
                <MaterialCommunityIcons name="calendar-check" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>My Bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('Vartalap'))}
              >
                <MaterialCommunityIcons name="creation" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>Astro Talk (वार्तालाप)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('EStore'))}
              >
                <MaterialCommunityIcons name="shopping-outline" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>Pooja E-Store</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.drawerMenuItem}
                onPress={() => closeDrawer(() => navigation.navigate('Wallet'))}
              >
                <MaterialCommunityIcons name="wallet-outline" size={20} color="#6A141D" />
                <Text style={s.drawerMenuText}>Vedic Wallet</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* FLOATING CIRCULAR TRACKER (Uber / Rapido style) */}
      {activeBooking &&
        activeBooking.status !== 'COMPLETED' &&
        activeBooking.status !== 'CANCELLED_BY_YAJMAN' &&
        activeBooking.status !== 'CANCELLED_BY_PANDIT' &&
        activeBooking.status !== 'NO_PANDIT_FOUND' && (
          <View
            style={[
              s.floatingTrackerContainer,
              { bottom: Math.max(86, insets.bottom + 65) },
            ]}
            pointerEvents="box-none"
          >
            {/* Animated Radar Pulse Halo */}
            <Animated.View
              style={[
                s.floatingRadarHalo,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacity,
                },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.88}
              style={s.floatingCircleBtn}
              onPress={() =>
                navigation.navigate(
                  activeBooking.status === 'SEARCHING' ? 'Searching' : 'BookingStatus',
                  { bookingId: activeBooking.id }
                )
              }
            >
              <LinearGradient
                colors={['#7E2018', '#4A0C13']}
                style={s.floatingCircleGrad}
              >
                {/* Status Icon */}
                <MaterialCommunityIcons
                  name={
                    activeBooking.status === 'SEARCHING'
                      ? 'radar'
                      : activeBooking.status === 'ON_THE_WAY'
                        ? 'navigation-variant'
                        : activeBooking.status === 'ARRIVED'
                          ? 'map-marker-check'
                          : activeBooking.status === 'IN_PROGRESS'
                            ? 'fire'
                            : 'om'
                  }
                  size={24}
                  color="#FFF8F0"
                />

                {/* Micro Track Badge */}
                <View style={s.floatingMiniBadge}>
                  <Text style={s.floatingMiniBadgeText}>TRACK</Text>
                </View>

                {/* Live Indicator Dot */}
                <View style={s.floatingLiveDot} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  topMaroonHeader: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  namasteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FAF4E8',
    fontFamily: serif,
  },
  blessingSub: {
    fontSize: 12,
    color: '#E8C588',
    marginTop: 3,
    lineHeight: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  locationPillText: {
    fontSize: 12,
    color: '#FAF4E8',
    fontWeight: '600',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E8C588',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroBannerWrap: {
    paddingHorizontal: 16,
    marginTop: -10,
  },
  heroBannerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FAF4E8',
    fontFamily: serif,
  },
  heroSub: {
    fontSize: 12,
    color: '#FDE0A4',
    marginTop: 4,
    lineHeight: 16,
  },
  exploreBtn: {
    backgroundColor: '#FDE0A4',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  exploreBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#541016',
  },
  heroRight: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArtImage: {
    width: '100%',
    height: '100%',
  },
  quickServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 22,
  },
  serviceCol: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 64) / 4,
  },
  serviceCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F7E7CD',
    borderWidth: 1.5,
    borderColor: '#E8C588',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#D48817',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  serviceIconImg: {
    width: 36,
    height: 36,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E1308',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E1308',
    fontFamily: serif,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6A141D',
  },
  moreServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  moreServiceItem: {
    width: (SCREEN_WIDTH - 28) / 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  moreServiceCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBCE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  moreServiceImg: {
    width: 30,
    height: 30,
  },
  moreServiceText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2E1308',
    textAlign: 'center',
    marginTop: 5,
  },
  popularPoojasScroll: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  poojaCard: {
    width: 136,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EADBCE',
    marginRight: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  poojaImageWrapper: {
    height: 94,
    backgroundColor: '#FDF7EC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  poojaThumb: {
    width: '100%',
    height: '100%',
  },
  poojaCardBottom: {
    padding: 10,
  },
  poojaCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E1308',
  },
  poojaCardSub: {
    fontSize: 11,
    color: '#7C6C5E',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cityModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 8,
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cityModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E1308',
    fontFamily: serif,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4ECE1',
  },
  cityRowActive: {
    backgroundColor: '#FAF4E8',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  cityRowText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#2E1308',
  },
  cityRowTextActive: {
    fontWeight: '700',
    color: '#6A141D',
  },
  drawerBackdropWrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerPanel: {
    flex: 1,
    backgroundColor: '#FAF4E8',
    elevation: 16,
  },
  drawerHeader: {
    backgroundColor: '#5A1017',
    padding: 20,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E8C588',
    marginBottom: 10,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FAF4E8',
    fontFamily: serif,
  },
  drawerEmail: {
    fontSize: 12,
    color: '#E8C588',
    marginTop: 2,
  },
  drawerMenu: {
    padding: 16,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EADBCE',
  },
  drawerMenuText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#2E1308',
    marginLeft: 14,
  },
  homeSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeSearchPlaceholder: {
    fontSize: 12.5,
    color: '#8A6E58',
    flex: 1,
  },
  searchFilterTag: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  searchFilterText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A05E0A',
  },
  floatingTrackerContainer: {
    position: 'absolute',
    right: 18,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  floatingRadarHalo: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 139, 40, 0.45)',
  },
  floatingCircleBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'visible',
    shadowColor: '#3A0812',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingCircleGrad: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D48B28',
    position: 'relative',
  },
  floatingLiveDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  floatingMiniBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#D48B28',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  floatingMiniBadgeText: {
    color: '#3A0812',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
