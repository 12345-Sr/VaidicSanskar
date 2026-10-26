import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Button, Card, Field } from '../components/ui';
import colors from '../theme/colors';
import { radius } from '../theme/styles';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_CAUSES = [
  { id: 'd1', title: 'गौ सेवा व चारा दान (Gau Seva)', suggested: [101, 251, 501, 1100] },
  { id: 'd2', title: 'अन्नक्षेत्र व ब्राह्मण भोजन (Annadaan)', suggested: [251, 501, 1100, 2100] },
  { id: 'd3', title: 'मंदिर जीर्णोद्धार व दीपदान (Temple Seva)', suggested: [501, 1100, 2100, 5100] },
];

export default function DonationScreen({ navigation }) {
  const { isHindi } = useLanguage();
  const [selected, setSelected] = useState(DEFAULT_CAUSES[0]);
  const [amount, setAmount] = useState('501');

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header
        title={isHindi ? 'दान एवं सहयोग' : 'Donation'}
        subtitle={isHindi ? 'दान · पुण्य · गौ सेवा व अन्नदान' : 'Daan · Punya · Seva'}
        navigation={navigation}
      />
      <Screen>
        <Text style={s.section}>
          {isHindi ? 'सहयोग का उद्देश्य चुनें' : 'Choose a cause'}
        </Text>
        {DEFAULT_CAUSES.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[s.cause, selected.id === d.id && s.causeActive]}
            onPress={() => setSelected(d)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name={selected.id === d.id ? 'radiobox-marked' : 'radiobox-blank'}
              size={22}
              color={selected.id === d.id ? colors.primary : colors.textMuted}
            />
            <Text style={s.causeText} numberOfLines={1}>{d.title}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[s.section, { marginTop: 18 }]}>
          {isHindi ? 'सहयोग राशि चुनें' : 'Select amount'}
        </Text>
        <View style={s.amounts}>
          {selected.suggested.map((a) => (
            <TouchableOpacity
              key={a}
              style={[s.amt, String(amount) === String(a) && s.amtActive]}
              onPress={() => setAmount(String(a))}
              activeOpacity={0.8}
            >
              <Text style={[s.amtText, String(amount) === String(a) && s.amtTextActive]}>₹{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field
          label={isHindi ? 'अथवा स्वेच्छा राशि दर्ज करें' : 'Or enter custom amount'}
          icon="currency-inr"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </Screen>
      <View style={s.footer}>
        <Button
          title={`${isHindi ? 'सहयोग करें' : 'Donate'} ₹${amount || 0}`}
          icon="gift"
          onPress={() => navigation.navigate('Payment', { amount: Number(amount) || 501, title: selected.title })}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  cause: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  causeActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  causeText: { fontSize: 15, fontWeight: '600', color: colors.text, marginLeft: 12 },
  amounts: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  amt: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100, borderWidth: 1, borderColor: colors.border, marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
  amtActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amtText: { fontSize: 15, fontWeight: '800', color: colors.text },
  amtTextActive: { color: '#fff' },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
});
