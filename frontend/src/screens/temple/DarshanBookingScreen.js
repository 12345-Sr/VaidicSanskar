import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Field, Button, Card } from '../../components/ui';
import colors from '../../theme/colors';

const slots = ['06:00 AM', '09:00 AM', '12:00 PM', '04:00 PM', '07:00 PM'];

export default function DarshanBookingScreen({ navigation, route }) {
  const t = route.params?.temple || { name: 'Temple', city: '' };
  const [slot, setSlot] = useState(slots[1]);
  const [persons, setPersons] = useState('2');

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Darshan Booking" subtitle={t.name} navigation={navigation} />
      <Screen>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="temple-hindu" size={30} color={colors.saffron} />
            <View style={{ marginLeft: 12 }}>
              <Text style={s.name}>{t.name}</Text>
              <Text style={s.meta}>{t.city} · {t.deity}</Text>
            </View>
          </View>
        </Card>

        <Field label="Select Date" icon="calendar" placeholder="DD/MM/YYYY" />
        <Text style={s.label}>Select Time Slot</Text>
        <View style={s.slots}>
          {slots.map((sl) => (
            <TouchableOpacity key={sl} style={[s.slot, slot === sl && s.slotActive]} onPress={() => setSlot(sl)}>
              <Text style={[s.slotText, slot === sl && s.slotTextActive]}>{sl}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field label="Number of Persons" icon="account-group" keyboardType="number-pad" value={persons} onChangeText={setPersons} />
      </Screen>
      <View style={s.footer}>
        <Button title="Book VIP Pass (skip queue)" variant="outline" icon="crown" onPress={() => navigation.navigate('VIPPass', { temple: t })} />
        <View style={{ height: 10 }} />
        <Button title="Book Darshan" onPress={() => navigation.navigate('BookingReview', { item: { title: `Darshan · ${t.name}`, price: 251, type: 'Darshan' } })} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  slot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: colors.border, marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
  slotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  slotTextActive: { color: '#fff' },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
});
