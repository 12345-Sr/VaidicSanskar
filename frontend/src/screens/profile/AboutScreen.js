import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Card } from '../../components/ui';
import colors from '../../theme/colors';

export default function AboutScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="About Us" navigation={navigation} />
      <Screen>
        <Card style={{ alignItems: 'center' }}>
          <View style={s.logo}><MaterialCommunityIcons name="om" size={44} color={colors.saffron} /></View>
          <Text style={s.title}>Vaidic Sanskar</Text>
          <Text style={s.v}>Version 1.0.0</Text>
        </Card>
        <Card>
          <Text style={s.body}>
            Vaidic Sanskar is your one-stop platform for all devotional and vedic services —
            book verified pandits, pooja, kundali, darshan, puja items and more, all with
            authentic traditions and trusted service.
          </Text>
        </Card>
        <Card>
          <Text style={s.h}>Our Mission</Text>
          <Text style={s.body}>To make traditional vedic services accessible, transparent and convenient for every devotee, anywhere.</Text>
        </Card>
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { width: 84, height: 84, borderRadius: 24, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  v: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  h: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  body: { fontSize: 14.5, color: colors.textMuted, lineHeight: 22 },
});
