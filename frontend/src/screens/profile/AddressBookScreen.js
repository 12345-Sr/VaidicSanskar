import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Field, Button, Card } from '../../components/ui';
import { Sheet, Tag } from '../../components/widgets';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AppContext';

/**
 * Address Book with geocoding.
 * Developer: "Use current location" should call expo-location:
 *   const loc = await Location.getCurrentPositionAsync()
 *   const [addr] = await Location.reverseGeocodeAsync(loc.coords)
 * Here it's stubbed so the flow runs in Expo Go without permissions.
 */
export default function AddressBookScreen({ navigation }) {
  const { user, addAddress } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: 'Home', line: '', city: '', pin: '' });
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  const addresses = user?.addresses || [];

  const useCurrentLocation = () => {
    // TODO: expo-location reverseGeocode → fill form
    setForm({ label: 'Home', line: '123, Temple Road', city: 'Varanasi', pin: '221001' });
  };

  const save = () => {
    if (!form.line) return;
    addAddress(form);
    setForm({ label: 'Home', line: '', city: '', pin: '' });
    setOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Address Book" navigation={navigation} />
      <Screen>
        {addresses.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
            <MaterialCommunityIcons name="map-marker-off" size={40} color={colors.border} />
            <Text style={s.empty}>No saved addresses yet</Text>
          </Card>
        ) : addresses.map((a) => (
          <Card key={a.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="map-marker" size={22} color={colors.primary} />
              <Tag text={a.label} />
            </View>
            <Text style={s.line}>{a.line}</Text>
            <Text style={s.sub}>{a.city} {a.pin}</Text>
          </Card>
        ))}
      </Screen>
      <View style={s.footer}>
        <Button title="Add New Address" icon="plus" onPress={() => setOpen(true)} />
      </View>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Add Address">
        <Button title="📍 Use current location" variant="outline" onPress={useCurrentLocation} />
        <View style={{ height: 14 }} />
        <Field label="Label" icon="tag" placeholder="Home / Office / Shop" value={form.label} onChangeText={set('label')} />
        <Field label="Address" icon="home" placeholder="House, street, area" value={form.line} onChangeText={set('line')} />
        <Field label="City" icon="city" placeholder="City" value={form.city} onChangeText={set('city')} />
        <Field label="PIN Code" icon="numeric" keyboardType="number-pad" placeholder="PIN" value={form.pin} onChangeText={set('pin')} />
        <Button title="Save Address" onPress={save} />
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { color: colors.textMuted, marginTop: 10 },
  line: { fontSize: 14.5, color: colors.text, fontWeight: '600', marginTop: 8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
});
