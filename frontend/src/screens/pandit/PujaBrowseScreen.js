import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { useLanguage } from '../../context/LanguageContext';
import { PujaService } from '../../services/api';

import { ActivityIndicator } from 'react-native';

const CATEGORIES = ['All', 'Popular', 'Peace', 'Prosperity'];

const DEFAULT_POOJAS = [
  {
    id: 'satyanarayan',
    name: 'Satyanarayan Pooja',
    hindi: 'श्री सत्यनारायण महापूजा',
    tagline: 'For happiness, peace & family prosperity',
    category: 'Popular',
    price: 2500,
    duration: '1.5 - 2 hrs',
    samagri: 600,
    bestDay: 'Thursday, Purnima, Ekadashi',
    suitableFor: 'Family, New Home, Business, Gratitude',
    desc: 'Sacred recitation of Lord Satyanarayan Katha with Panchamrit, Tulsi Arpan, and Havan.',
    image: require('../../../assets/services/puja_temple.png'),
  },
  {
    id: 'griha_pravesh',
    name: 'Griha Pravesh Pooja',
    hindi: 'गृह प्रवेश एवं वास्तु शांति',
    tagline: 'Auspicious housewarming and negative energy removal',
    category: 'Popular',
    price: 5100,
    duration: '3 - 3.5 hrs',
    samagri: 1100,
    bestDay: 'Shukla Paksha Auspicious Muhurat',
    suitableFor: 'New House, Flat, Office Inauguration',
    desc: 'Complete Vastu Shanti, Navgrah Havan, and Dwar Pooja by Vedic scholars.',
    image: require('../../../assets/services/pandit_booking.png'),
  },
  {
    id: 'ganesh_pooja',
    name: 'Ganesh Pooja',
    hindi: 'श्री गणेश चतुर्थी व विघ्नहर्ता पूजा',
    tagline: 'Removal of obstacles & auspicious beginnings',
    category: 'Popular',
    price: 2100,
    duration: '1 - 1.5 hrs',
    samagri: 500,
    bestDay: 'Wednesday, Chaturthi',
    suitableFor: 'New Business, Exams, New Projects',
    desc: 'Invocation of Lord Vighnaharta with Modak Bhog, Atharvashirsha Path, and Durva offering.',
    image: require('../../../assets/services/pandit_booking.png'),
  },
  {
    id: 'rudrabhishek',
    name: 'Rudrabhishek Pooja',
    hindi: 'महा रुद्राभिषेक एवं शिव पूजन',
    tagline: 'For health, longevity & negative dosha removal',
    category: 'Peace',
    price: 3100,
    duration: '2 - 2.5 hrs',
    samagri: 700,
    bestDay: 'Monday, Pradosh, Shivratri',
    suitableFor: 'Health, Overcoming Sickness, Mental Peace',
    desc: 'Potent Shivling Abhishek with 11 sacred Dravyas and Sri Rudram chanting.',
    image: require('../../../assets/banner_havan_kund.png'),
  },
  {
    id: 'havan_yagya',
    name: 'Maha Havan & Yagya',
    hindi: 'पवित्र महा हवन एवं यज्ञ',
    tagline: 'Spiritual purification and aura cleansing',
    category: 'Popular',
    price: 3500,
    duration: '2 - 2.5 hrs',
    samagri: 800,
    bestDay: 'Sunday, Purnima, Amavasya',
    suitableFor: 'Home Purification, Negative Energy Removal',
    desc: 'Sacred Agni invocation with pure desi cow ghee, 108 Ahutis, and herbal samagri.',
    image: require('../../../assets/banner_havan_kund.png'),
  },
  {
    id: 'vivah_sanskar',
    name: 'Vivah Sanskar (Wedding Rituals)',
    hindi: 'वैदिक विवाह संस्कार',
    tagline: 'Complete 16 Samskaras traditional Vedic marriage ceremony',
    category: 'Popular',
    price: 11000,
    duration: '4 - 5 hrs',
    samagri: 2500,
    bestDay: 'Shubh Vivah Lagna Muhurat',
    suitableFor: 'Wedding, Kanyadaan, Saptapadi',
    desc: 'Authentic Vedic marriage conducted with Jaimala, Kanyadaan, Laja Havan, and Saptapadi.',
    image: require('../../../assets/services/puja_temple.png'),
  },
];

export default function PujaBrowseScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('All');
  const [q, setQ] = useState('');
  const [poojas, setPoojas] = useState(DEFAULT_POOJAS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    PujaService.list()
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.pujas || res?.data || [];
        if (raw.length) {
          const mapped = raw.map((p) => ({
            id: String(p._id || p.id),
            name: p.name,
            hindi: p.hindi || '',
            tagline: p.tagline || p.shortDescription || p.description || 'Vedic Pooja',
            category: p.category || 'Popular',
            price: Number(p.basePrice || p.price || 2500),
            duration: p.duration || (p.durationMinutes ? `${p.durationMinutes} mins` : '1.5 - 2 hrs'),
            samagri: Number(p.samagri || p.samagriComboPrice || 600),
            bestDay: p.bestDay || 'Auspicious Muhurat',
            suitableFor: p.suitableFor || 'Family, Home & Business',
            desc: p.desc || p.description || 'Conducted by certified Vedic pandits.',
            image: require('../../../assets/services/puja_temple.png'),
          }));
          setPoojas(mapped);
        }
      })
      .catch((err) => console.log('Error loading poojas from backend:', err?.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredPoojas = poojas.filter((p) => {
    const matchesCat =
      selectedCat === 'All' ||
      p.category?.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.tagline.toLowerCase().includes(q.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* 1. HEADER (MATCHING SCREEN 4) */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color="#6A141D" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Pooja Booking</Text>
          <Text style={s.headerSubtitle}>Choose from our sacred poojas</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* 2. SEARCH BAR */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={19} color="#8C7A68" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search for pooja..."
          placeholderTextColor="#A59282"
          value={q}
          onChangeText={setQ}
        />
        {q ? (
          <TouchableOpacity onPress={() => setQ('')}>
            <Ionicons name="close-circle" size={18} color="#8C7A68" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3. CATEGORY PILLS (MATCHING SCREEN 4: 'All' in filled deep maroon) */}
      <View style={s.catsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {CATEGORIES.map((c) => {
            const isActive = selectedCat === c;
            return (
              <TouchableOpacity
                key={c}
                style={[s.catPill, isActive && s.catPillActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCat(c)}
              >
                <Text style={[s.catPillText, isActive && s.catPillTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. SACRED POOJA LIST CARDS (MATCHING SCREEN 4) */}
      <ScrollView
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPoojas.map((pooja) => (
          <TouchableOpacity
            key={pooja.id}
            style={s.poojaItemCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('PoojaDetail', { pooja })}
          >
            <View style={s.poojaIconBox}>
              <Image source={pooja.image} style={s.poojaIconImg} resizeMode="contain" />
            </View>

            <View style={s.poojaInfo}>
              <Text style={s.poojaTitle} numberOfLines={1}>
                {pooja.name}
              </Text>
              <Text style={s.poojaSub} numberOfLines={1}>
                {pooja.tagline}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#8C7A68" />
          </TouchableOpacity>
        ))}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADBCE',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2E1308',
  },
  catsContainer: {
    marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADBCE',
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: '#6A141D',
    borderColor: '#6A141D',
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6E5D4F',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  poojaItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EADBCE',
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  poojaIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FDF7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  poojaIconImg: {
    width: 38,
    height: 38,
  },
  poojaInfo: {
    flex: 1,
  },
  poojaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E1308',
  },
  poojaSub: {
    fontSize: 12,
    color: '#7C6C5E',
    marginTop: 3,
  },
});
