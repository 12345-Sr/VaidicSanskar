import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { radius, shadow, serif } from '../theme/styles';
import { useLanguage, LanguageSwitcher } from '../context/LanguageContext';

export default function CategoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();
  const go = (key) => navigation.navigate(key);

  const localizedServices = [
    { key: 'PoojaBooking', title: isHindi ? 'पूजा बुकिंग' : 'Pooja Booking', icon: 'fire', color: '#E65100' },
    { key: 'Vartalap', title: isHindi ? 'ज्योतिषी परामर्श' : 'Talk to Astrologer', icon: 'comment-question', color: '#6A1B9A' },
    { key: 'Kundali', title: isHindi ? 'वैदिक कुण्डली' : 'Kundali & Milan', icon: 'star-four-points', color: '#00695C' },
    { key: 'EStore', title: isHindi ? 'पूजा ई-स्टोर' : 'Pooja E-Store', icon: 'storefront', color: '#AD1457' },
    { key: 'Library', title: isHindi ? 'साहित्य संग्रह' : 'Sahitya Sangrah', icon: 'book-open-page-variant', color: '#8B1A1A' },
    { key: 'DailyPandit', title: isHindi ? 'दैनिक पंडित' : 'Daily Pandit', icon: 'calendar-star', color: '#00838F' },
    { key: 'TempleLocator', title: isHindi ? 'मंदिर दर्शन' : 'Temple Darshan', icon: 'map-marker-radius', color: '#283593' },
    { key: 'Donation', title: isHindi ? 'दान एवं सहयोग' : 'Donations', icon: 'gift', color: '#2E7D32' },
    { key: 'BhajanMandali', title: isHindi ? 'भजन मंडली' : 'Bhajan Mandali', icon: 'music', color: '#0277BD' },
    { key: 'BhavyaAayojan', title: isHindi ? 'भव्य आयोजन' : 'Bhavya Aayojan', icon: 'crown', color: '#C2185B' },
    { key: 'Horoscope', title: isHindi ? 'दैनिक राशिफल' : 'Daily Horoscope', icon: 'zodiac-leo', color: '#5D4037' },
    { key: 'Wallet', title: isHindi ? 'मेरा वॉलेट' : 'My Wallet', icon: 'wallet', color: '#D4AF37' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[s.head, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={s.title} numberOfLines={1}>{isHindi ? 'सेवाएं एवं अनुभाग' : 'Explore Services'}</Text>
            <Text style={s.sub} numberOfLines={1}>{isHindi ? 'अपनी आध्यात्मिक सेवा चुनें' : 'Choose a category to get started'}</Text>
          </View>
          <LanguageSwitcher />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.grid}>
          {localizedServices.map((item) => (
            <TouchableOpacity key={item.key} style={s.card} activeOpacity={0.85} onPress={() => go(item.key)}>
              <View style={[s.icon, { backgroundColor: item.color + '18' }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={s.label}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#FAF7F0', borderBottomWidth: 1, borderBottomColor: '#EFE4D6' },
  title: { color: colors.text, fontSize: 22, fontFamily: serif, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  card: { width: '33.33%', padding: 8 },
  icon: { aspectRatio: 1, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, ...shadow },
  label: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 8 },
});
