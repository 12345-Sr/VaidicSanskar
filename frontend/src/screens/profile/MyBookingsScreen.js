import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen } from '../../components/ui';
import colors from '../../theme/colors';
import { radius, shadow } from '../../theme/styles';
import { useFetch } from '../../services/hooks';
import { BookingService } from '../../services/api';

const tabs = ['All', 'Pooja', 'Darshan'];
const statusColor = { Confirmed: colors.success, Pending: colors.saffron, Delivered: colors.primary };

export default function MyBookingsScreen({ navigation, route }) {
  const [tab, setTab] = useState('All');
  const { data: all } = useFetch(() => BookingService.mine(), []);
  const list = Array.isArray(all) ? all : [];
  const data = tab === 'All' ? list : list.filter((b) => b.type === tab);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="My Bookings" navigation={navigation} showBack={route?.name !== 'Bookings'} />
      <View style={s.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Screen>
        {data.length === 0 ? (
          <Text style={s.empty}>No bookings in this category.</Text>
        ) : data.map((b) => (
          <View key={b.id} style={s.card}>
            <View style={s.icon}><MaterialCommunityIcons name="bookmark-check" size={24} color={colors.primary} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.title}>{b.title}</Text>
              <Text style={s.meta}>{b.type} · {b.date}</Text>
              <Text style={s.amount}>₹{b.amount}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: (statusColor[b.status] || colors.textMuted) + '18' }]}>
              <Text style={[s.badgeText, { color: statusColor[b.status] || colors.textMuted }]}>{b.status}</Text>
            </View>
          </View>
        ))}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, marginRight: 8 },
  tabActive: { backgroundColor: colors.gold },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.onGold },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow },
  icon: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '800', color: colors.primary, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11.5, fontWeight: '800' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
