import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';

const SAMAGRI_ITEMS = [
  'Panchamrit',
  'Tulsi Leaves',
  'Fruits & Flowers',
  'Incense Sticks',
  'Diya & Ghee',
  'Roli, Chawal, Akshat',
  'Puja Thali',
  'Other Essentials',
];

export default function PoojaDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const p = route.params?.pooja || {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    tagline: 'For happiness & prosperity',
    category: 'Popular',
    price: 2500,
    samagri: 600,
    duration: '1.5 - 2 hrs',
    bestDay: 'Thursday, Purnima',
    suitableFor: 'Family, Business, New Home',
    desc: 'Satyanarayan Pooja is performed to bring happiness, peace, and prosperity in life. It removes obstacles and fulfills your wishes.',
  };

  const [withSamagri, setWithSamagri] = useState(true);

  const basePrice = p.price || 2500;
  const samagriCost = p.samagri || 600;
  const totalPrice = withSamagri ? basePrice : basePrice - samagriCost;

  const handleBookNow = () => {
    navigation.navigate('PoojaBooking', {
      pooja: p,
      withSamagri,
      totalPrice,
    });
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
        <Text style={s.headerTitle} numberOfLines={1}>
          {p.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER IMAGE WITH ROUNDED EDGES */}
        <View style={s.imageBannerCard}>
          <Image
            source={require('../../../assets/vedic_puja_banner.jpg')}
            style={s.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* TITLE & SUBTITLE */}
        <View style={s.titleRow}>
          <Text style={s.poojaTitle}>{p.name}</Text>
          <Text style={s.poojaTagline}>{p.tagline}</Text>
          <View style={s.popularBadge}>
            <Text style={s.popularBadgeText}>★  {p.category || 'Popular'}</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text style={s.descriptionText}>{p.desc}</Text>

        {/* 3 STATS BOXES (MATCHING SCREEN 5) */}
        <View style={s.statsRow}>
          {/* Duration */}
          <View style={s.statBox}>
            <Ionicons name="time-outline" size={22} color="#6A141D" />
            <Text style={s.statLabel}>Duration</Text>
            <Text style={s.statValue}>{p.duration}</Text>
          </View>

          {/* Best Day */}
          <View style={s.statBox}>
            <Ionicons name="calendar-outline" size={22} color="#6A141D" />
            <Text style={s.statLabel}>Best Day</Text>
            <Text style={s.statValue}>{p.bestDay}</Text>
          </View>

          {/* Suitable For */}
          <View style={s.statBox}>
            <Ionicons name="people-outline" size={22} color="#6A141D" />
            <Text style={s.statLabel}>Suitable For</Text>
            <Text style={s.statValue} numberOfLines={2}>
              {p.suitableFor}
            </Text>
          </View>
        </View>

        {/* WITH SAMAGRI / WITHOUT SAMAGRI TOGGLE TABS (MATCHING SCREEN 5 & 6) */}
        <View style={s.toggleContainer}>
          <TouchableOpacity
            style={[s.toggleBtn, withSamagri && s.toggleBtnActive]}
            activeOpacity={0.85}
            onPress={() => setWithSamagri(true)}
          >
            <Text
              style={[s.toggleBtnText, withSamagri && s.toggleBtnTextActive]}
            >
              With Samagri
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.toggleBtn, !withSamagri && s.toggleBtnActive]}
            activeOpacity={0.85}
            onPress={() => setWithSamagri(false)}
          >
            <Text
              style={[s.toggleBtnText, !withSamagri && s.toggleBtnTextActive]}
            >
              Without Samagri
            </Text>
          </TouchableOpacity>
        </View>

        {/* SAMAGRI INCLUDED SECTION (SCREEN 6) */}
        {withSamagri && (
          <View style={s.samagriSection}>
            <Text style={s.samagriHeading}>Samagri Included</Text>
            <View style={s.samagriGrid}>
              {SAMAGRI_ITEMS.map((item, idx) => (
                <View key={idx} style={s.samagriRow}>
                  <View style={s.checkCircle}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                  <Text style={s.samagriItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM STICKY BAR (MATCHING SCREEN 5 & 6) */}
      <View style={[s.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.priceBox}>
          <Text style={s.priceText}>
            ₹ {totalPrice.toLocaleString('en-IN')}
          </Text>
          <Text style={s.priceSubText}>
            {withSamagri ? '(with Samagri + Pandit)' : '(Pandit Dakshina only)'}
          </Text>
        </View>

        <TouchableOpacity
          style={s.bookNowBtn}
          activeOpacity={0.88}
          onPress={handleBookNow}
        >
          <Text style={s.bookNowBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
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
    zIndex: 10,
    elevation: 3,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#2E1308',
    fontFamily: serif,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  imageBannerCard: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#541016',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    marginTop: 16,
  },
  poojaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E1308',
    fontFamily: serif,
  },
  poojaTagline: {
    fontSize: 13,
    color: '#7C6C5E',
    marginTop: 3,
  },
  popularBadge: {
    backgroundColor: '#FDF0DC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  popularBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D48817',
  },
  descriptionText: {
    fontSize: 13.5,
    color: '#554438',
    lineHeight: 20,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EADBCE',
    padding: 14,
    marginTop: 18,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 11.5,
    color: '#7C6C5E',
    marginTop: 5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E1308',
    textAlign: 'center',
    marginTop: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EADBCE',
    padding: 4,
    marginTop: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#6A141D',
  },
  toggleBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6A141D',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  samagriSection: {
    marginTop: 20,
  },
  samagriHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E1308',
    marginBottom: 12,
  },
  samagriGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  samagriRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
    paddingRight: 6,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6A141D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  samagriItemText: {
    fontSize: 13,
    color: '#2E1308',
    fontWeight: '500',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EADBCE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  priceBox: {
    flex: 1,
  },
  priceText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2E1308',
  },
  priceSubText: {
    fontSize: 11,
    color: '#7C6C5E',
    marginTop: 2,
  },
  bookNowBtn: {
    backgroundColor: '#6A141D',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
