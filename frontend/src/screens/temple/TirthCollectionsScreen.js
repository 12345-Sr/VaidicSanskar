import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif, shadow } from '../../theme/styles';
import { TIRTH_COLLECTIONS } from '../../services/templeStore';

const JYOTIRLINGA_LIST = [
  { no: 1, name: 'श्री सोमनाथ', place: 'प्रभास पाटन, गुजरात', deity: 'शिव' },
  { no: 2, name: 'श्री मल्लिकार्जुन', place: 'श्रीशैलम, आंध्र प्रदेश', deity: 'शिव' },
  { no: 3, name: 'श्री महाकालेश्वर', place: 'उज्जैन, मध्य प्रदेश', deity: 'शिव', id: 't4', hasBooking: true },
  { no: 4, name: 'श्री ओंकारेश्वर', place: 'खंडवा, मध्य प्रदेश', deity: 'शिव' },
  { no: 5, name: 'श्री केदारनाथ', place: 'रुद्रप्रयाग, उत्तराखण्ड', deity: 'शिव' },
  { no: 6, name: 'श्री भीमाशंकर', place: 'पुणे, महाराष्ट्र', deity: 'शिव' },
  { no: 7, name: 'श्री काशी विश्वनाथ', place: 'वाराणसी, उत्तर प्रदेश', deity: 'शिव', id: 't1', hasBooking: true },
  { no: 8, name: 'श्री त्र्यंबकेश्वर', place: 'नासिक, महाराष्ट्र', deity: 'शिव' },
  { no: 9, name: 'श्री वैद्यनाथ', place: 'देवघर, झारखण्ड', deity: 'शिव' },
  { no: 10, name: 'श्री नागेश्वर', place: 'द्वारका, गुजरात', deity: 'शिव' },
  { no: 11, name: 'श्री रामेश्वरम', place: 'रामेश्वरम, तमिलनाडु', deity: 'शिव' },
  { no: 12, name: 'श्री घृष्णेश्वर', place: 'छत्रपति संभाजीनगर, महाराष्ट्र', deity: 'शिव' },
];

const CHARDHAM_LIST = [
  { no: 1, name: 'श्री बद्रीनाथ धाम', place: 'चमोली, उत्तराखण्ड', deity: 'विष्णु' },
  { no: 2, name: 'श्री द्वारकाधीश धाम', place: 'द्वारका, गुजरात', deity: 'कृष्ण' },
  { no: 3, name: 'श्री जगन्नाथ पुरी धाम', place: 'पुरी, ओडिशा', deity: 'जगन्नाथ' },
  { no: 4, name: 'श्री रामेश्वरम धाम', place: 'रामेश्वरम, तमिलनाडु', deity: 'शिव' },
];

const SHAKTI_PEETH_LIST = [
  { no: 1, name: 'माँ कामाख्या देवी', place: 'गुवाहाटी, असम', ang: 'योनि मंडल' },
  { no: 2, name: 'माँ वैष्णो देवी', place: 'कटरा, जम्मू-कश्मीर', ang: 'पिंडी रूप' },
  { no: 3, name: 'माँ कालीघाट', place: 'कोलकाता, पश्चिम बंगाल', ang: 'दायां पैर' },
  { no: 4, name: 'माँ ज्वाला जी', place: 'कांगड़ा, हिमाचल प्रदेश', ang: 'जिह्वा' },
  { no: 5, name: 'माँ विशालाक्षी (काशी)', place: 'वाराणसी, उत्तर प्रदेश', ang: 'कर्णकुंडल' },
];

export default function TirthCollectionsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initCol = route.params?.collection?.id || 'jyotirlinga';
  const [activeCollectionId, setActiveCollectionId] = useState(initCol);

  const activeCollection =
    TIRTH_COLLECTIONS.find((c) => c.id === activeCollectionId) || TIRTH_COLLECTIONS[0];

  const currentList =
    activeCollectionId === 'jyotirlinga'
      ? JYOTIRLINGA_LIST
      : activeCollectionId === 'chardham'
      ? CHARDHAM_LIST
      : SHAKTI_PEETH_LIST;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View style={[s.head, { paddingTop: insets.top + 8 }]}>
        <View style={s.headRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headTitle}>पवित्र तीर्थ यात्रा संग्रह</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Collection Selector Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          {TIRTH_COLLECTIONS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[s.tabPill, activeCollectionId === c.id && s.tabPillActive]}
              onPress={() => setActiveCollectionId(c.id)}
            >
              <MaterialCommunityIcons
                name={c.icon}
                size={16}
                color={activeCollectionId === c.id ? '#fff' : colors.maroon}
              />
              <Text style={[s.tabPillText, activeCollectionId === c.id && s.tabPillTextActive]}>
                {c.title.split(' ')[0]} {c.title.split(' ')[1]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Collection Hero Card */}
        <LinearGradient colors={['#5A180E', '#3A0D07']} style={s.heroCard}>
          <View style={{ flex: 1 }}>
            <View style={s.tagBadge}>
              <Text style={s.tagBadgeText}>{activeCollection.tag}</Text>
            </View>
            <Text style={s.heroTitle}>{activeCollection.title}</Text>
            <Text style={s.heroSub}>{activeCollection.subtitle}</Text>
          </View>
          <MaterialCommunityIcons name={activeCollection.icon} size={48} color={colors.gold} />
        </LinearGradient>

        <Text style={s.listHeaderTitle}>
          पावन पीठों की सूची ({currentList.length} पावन धाम)
        </Text>

        {/* Shrines Listing */}
        {currentList.map((item) => (
          <View key={item.no} style={s.shrineCard}>
            <View style={s.shrineNumBox}>
              <Text style={s.shrineNumText}>{item.no}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.shrineName}>{item.name}</Text>
              <View style={s.shrinePlaceRow}>
                <Ionicons name="location-outline" size={13} color={colors.maroon} />
                <Text style={s.shrinePlaceText}>{item.place}</Text>
              </View>
              {item.ang && (
                <Text style={s.shrineAngText}>शक्ति पीठ अंग: {item.ang}</Text>
              )}
            </View>

            {item.hasBooking && (
              <TouchableOpacity
                style={s.shrineBookingBtn}
                onPress={() => navigation.navigate('DarshanBooking', { temple: { name: item.name, city: item.place } })}
              >
                <Text style={s.shrineBookingBtnText}>दर्शन बुक करें</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D6',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.maroon,
  },
  tabScroll: {
    marginTop: 12,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.maroon,
  },
  tabPillTextActive: {
    color: '#fff',
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...shadow,
  },
  tagBadge: {
    backgroundColor: 'rgba(234, 168, 56, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagBadgeText: {
    color: '#FCE7C8',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: '#FDFBF7',
  },
  heroSub: {
    fontSize: 12,
    color: '#F4D9B6',
    marginTop: 3,
  },
  listHeaderTitle: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '700',
    color: colors.maroon,
    marginBottom: 10,
  },
  shrineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  shrineNumBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shrineNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  shrineName: {
    fontFamily: serif,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  shrinePlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 3,
  },
  shrinePlaceText: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  shrineAngText: {
    fontSize: 11,
    color: colors.maroon,
    marginTop: 2,
    fontWeight: '600',
  },
  shrineBookingBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shrineBookingBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
