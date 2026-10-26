import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Field, Button, Card, Price } from '../../components/ui';
import { Radio } from '../../components/widgets';
import colors from '../../theme/colors';

const passes = [
  { id: 'vp1', name: 'VIP Darshan Pass', perks: 'Skip-the-queue entry', price: 500 },
  { id: 'vp2', name: 'VVIP Aarti Pass', perks: 'Front-row aarti + prasad', price: 1100 },
  { id: 'vp3', name: 'Special Pooja Pass', perks: 'Personal pooja + garland', price: 2100 },
];

export default function VIPPassScreen({ navigation, route }) {
  const t = route.params?.temple || { name: 'Temple' };
  const [pass, setPass] = useState(passes[0]);
  const [persons, setPersons] = useState('2');
  const [date, setDate] = useState('');

  const total = pass.price * (parseInt(persons) || 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="VIP Darshan Pass" subtitle={t.name} navigation={navigation} />
      <Screen>
        <Text style={s.section}>Select Pass Type</Text>
        {passes.map((p) => (
          <Radio key={p.id} label={p.name} sub={p.perks} selected={pass.id === p.id} onPress={() => setPass(p)}
            right={<Text style={s.price}>₹{p.price}</Text>} />
        ))}
        <Field label="Darshan Date" icon="calendar" placeholder="DD/MM/YYYY" value={date} onChangeText={setDate} />
        <Field label="Number of Persons" icon="account-group" keyboardType="number-pad" value={persons} onChangeText={setPersons} />
        <Card>
          <View style={s.pr}><Text style={s.pl}>{pass.name} × {persons}</Text><Text style={s.pv}>₹{total}</Text></View>
          <View style={[s.pr, s.total]}><Text style={s.tl}>Total</Text><Price value={total} /></View>
        </Card>
      </Screen>
      <View style={s.footer}>
        <Button title="Proceed to Payment" icon="ticket-confirmation"
          onPress={() => navigation.navigate('Payment', { amount: total, title: `${pass.name} · ${t.name}` })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  price: { fontSize: 15, fontWeight: '800', color: colors.primary },
  pr: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  pl: { color: colors.textMuted, fontSize: 14 }, pv: { color: colors.text, fontSize: 14, fontWeight: '700' },
  total: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginBottom: 0 },
  tl: { fontWeight: '800', fontSize: 16, color: colors.text },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
});
