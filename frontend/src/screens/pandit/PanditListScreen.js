import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Rating, Price } from '../../components/ui';
import colors from '../../theme/colors';
import { radius, shadow } from '../../theme/styles';
import { PanditService } from '../../services/api';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';

/**
 * Example of REAL API wiring (other modules follow the same pattern):
 *  - fetch from backend via PanditService.list()
 *  - show a loading spinner
 *  - fall back to mock data if the backend isn't ready / fails
 *  - pull-to-refresh supported
 *
 * Developer: adjust `normalize()` to match your backend's actual JSON shape.
 */
function normalize(apiItem) {
  return {
    id: String(apiItem.id ?? apiItem._id),
    name: apiItem.name ?? apiItem.pandit_name,
    exp: apiItem.experience ? `${apiItem.experience} yrs` : (apiItem.exp || '10+ yrs'),
    rating: Number(apiItem.rating ?? apiItem.averageRating ?? 4.8),
    lang: Array.isArray(apiItem.languages) ? apiItem.languages.join(', ') : (apiItem.languages ?? apiItem.lang ?? 'Hindi, Sanskrit'),
    price: Number(apiItem.price ?? apiItem.charge ?? apiItem.audioRate ?? apiItem.chatRate ?? 2100),
    specialities: Array.isArray(apiItem.specialities) ? apiItem.specialities : (apiItem.skills || ['वैदिक पूजा', 'हवन']),
    city: apiItem.city ?? 'वाराणसी',
    photo: apiItem.profileImage || apiItem.photo || 'vedic_pandit',
  };
}

export default function PanditListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  const load = async () => {
    try {
      const res = await PanditService.list();
      const raw = Array.isArray(res) ? res : (res?.vendors ?? res?.data ?? res?.pandits ?? []);
      setData((raw || []).map(normalize));
      setUsingMock(false);
    } catch (e) {
      setData([]);
      setUsingMock(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <Header title="Book a Pandit" navigation={navigation} />
        <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={s.loadText}>Loading pandits from backend…</Text></View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Book a Pandit" subtitle={`${data.length} pandits available`} navigation={navigation} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {data.length === 0 ? (
          <View style={[s.card, { alignItems: 'center', justifyContent: 'center', padding: 28 }]}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={colors.primary} />
            <Text style={[s.name, { marginTop: 12, textAlign: 'center' }]}>कोई पंजीकृत पंडित उपलब्ध नहीं हैं</Text>
            <Text style={[s.meta, { textAlign: 'center', marginTop: 4 }]}>बैकएंड डेटाबेस से सूची प्राप्त करने हेतु रिफ्रेश करें।</Text>
            <TouchableOpacity style={[s.bookBtn, { marginTop: 16, paddingHorizontal: 20 }]} onPress={onRefresh}>
              <Text style={s.bookText}>रिफ्रेश करें / Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          data.map((p) => (
            <TouchableOpacity key={p.id} activeOpacity={0.9} style={s.card} onPress={() => navigation.navigate('PanditDetail', { pandit: p })}>
              <View style={s.avatar}>
                <Image source={resolveDevotionalSource(p.photo, 'vedic_pandit')} style={s.avatarImg} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={s.rowBetween}>
                  <Text style={s.name}>{p.name}</Text>
                  <Rating value={p.rating} />
                </View>
                <Text style={s.meta}>{p.exp} experience · {p.city}</Text>
                <Text style={s.meta}>{p.lang}</Text>
                <Text style={s.spec} numberOfLines={1}>{p.specialities.join(' · ')}</Text>
                <View style={[s.rowBetween, { marginTop: 6 }]}>
                  <Price value={p.price} size={16} />
                  <View style={s.bookBtn}><Text style={s.bookText}>Book</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadText: { color: colors.textMuted, marginTop: 10 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron + '18', paddingHorizontal: 16, paddingVertical: 8 },
  bannerText: { color: colors.saffron, fontSize: 12, fontWeight: '700', marginLeft: 6 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, marginBottom: 12, ...shadow },
  avatar: { width: 60, height: 60, borderRadius: 16, backgroundColor: colors.primary + '12', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  spec: { fontSize: 12.5, color: colors.saffron, fontWeight: '600', marginTop: 4 },
  bookBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 7, borderRadius: radius.pill },
  bookText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
