import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Rating, Price, Button, Card } from '../../components/ui';
import colors from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';

export default function PanditDetailScreen({ navigation, route }) {
  const { isHindi } = useLanguage();
  const p = route?.params?.pandit;

  if (!p) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Header title={isHindi ? 'पंडित जी का विवरण' : 'Pandit Profile'} navigation={navigation} />
        <MaterialCommunityIcons name="account-search" size={60} color={colors.textMuted} />
        <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 12, textAlign: 'center' }}>
          {isHindi ? 'पंडित जी का विवरण उपलब्ध नहीं है।' : 'Pandit profile not available.'}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isHindi ? 'वापस जाएं' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exp = p.experience || p.exp || 10;
  const lang = p.languages || p.lang || (isHindi ? 'हिंदी, संस्कृत' : 'Hindi, Sanskrit');

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header
        title={isHindi ? 'पंडित जी का विवरण' : 'Pandit Profile'}
        navigation={navigation}
      />
      <Screen>
        <Card>
          <View style={{ alignItems: 'center' }}>
            <View style={s.avatar}>
              <Image source={resolveDevotionalSource(p.photo, 'vedic_pandit')} style={s.avatarImg} />
            </View>
            <Text style={s.name}>{p.name}</Text>
            <Rating value={p.rating || 4.8} />
            <Text style={s.meta}>
              {exp} {isHindi ? 'वर्ष का अनुभव' : 'yrs experience'} · {p.city || (isHindi ? 'वाराणसी' : 'Varanasi')}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={s.h}>{isHindi ? 'परिचय' : 'About'}</Text>
          <Text style={s.body}>
            {isHindi
              ? 'प्रमाणित वैदिक पुरोहित, वैदिक परंपरा व सम्पूर्ण मंत्रोच्चार से पूजा अनुष्ठान संपन्न कराने में दक्ष। गृह व मंदिर दोनों स्थलों पर उपलब्ध।'
              : 'Experienced Vedic pandit specialising in traditional rituals, performed with authentic Vedic mantras and vidhi. Available for both home and temple ceremonies.'}
          </Text>
          <Text style={[s.h, { marginTop: 14 }]}>{isHindi ? 'भाषाएं' : 'Languages'}</Text>
          <Text style={s.body}>{lang}</Text>
          <Text style={[s.h, { marginTop: 14 }]}>{isHindi ? 'विशेषज्ञता' : 'Specialities'}</Text>
          <View style={s.chips}>
            {(p?.specialities || (isHindi ? ['सत्यनारायण कथा', 'रुद्राभिषेक', 'गृह प्रवेश'] : ['Satyanarayan Katha', 'Rudrabhishek', 'Griha Pravesh'])).map((sp) => (
              <View key={sp} style={s.chip}>
                <Text style={s.chipText}>{sp}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Screen>

      <View style={s.footer}>
        <View>
          <Text style={s.fLabel}>{isHindi ? 'दक्षिणा' : 'Starting at'}</Text>
          <Price value={p.price || 2100} />
        </View>
        <Button
          title={isHindi ? 'बुकिंग के लिए आगे बढ़ें' : 'Proceed to Book'}
          style={{ flex: 1, marginLeft: 16 }}
          onPress={() => navigation.navigate('BookingReview', { item: { title: p.name, price: p.price || 2100, type: 'Pandit' } })}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 90, height: 90, borderRadius: 24, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 24 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 6 },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  h: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 6 },
  body: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: { backgroundColor: colors.saffron + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginRight: 8, marginBottom: 8 },
  chipText: { color: colors.saffron, fontWeight: '700', fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
  fLabel: { fontSize: 12, color: colors.textMuted },
});
