import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';
import { Thumb } from '../../components/widgets';
import { useFetch } from '../../services/hooks';
import { LibraryService } from '../../services/api';

const DEFAULT_CATS = [
  { key: 'Chalisa', icon: 'hands-pray' }, { key: 'Stotra', icon: 'flower-tulip' }, { key: 'Aarti', icon: 'candle' },
  { key: 'Granth', icon: 'book-open-page-variant' }, { key: 'Upanishad', icon: 'script-text' }, { key: 'Audio', icon: 'headphones' },
];

const BORDER = 'rgba(232,185,63,0.4)';
const deityFor = (t) => ({ 'Hanuman Chalisa': 'Hanuman', 'Shiv Tandav Stotra': 'Shiva', 'Durga Saptashati': 'Navgraha' }[t] || 'default');

export default function LibraryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState(null);
  const [playing, setPlaying] = useState(true);
  const { data } = useFetch(() => LibraryService.list(), []);
  const all = Array.isArray(data) ? data : [];
  const filtered = cat ? all.filter((i) => i.type === cat || (cat === 'Audio' && i.hasAudio)) : all;
  const featured = all.find((i) => i.featured) || all[0];
  const popular = cat ? filtered : all.filter((i) => i.popular);
  const open = (item) => navigation.navigate('Reader', { item });

  return (
    <View style={{ flex: 1, backgroundColor: '#2A0C0E' }}>
      <LinearGradient colors={['#4A1014', '#2A0C0E']} style={[s.head, { paddingTop: insets.top + 12 }]}>
        <Text style={s.title}>Sahitya Sangrah</Text>
        <Text style={s.sub}>Divine wisdom at your fingertips</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {DEFAULT_CATS.map((c) => (
            <TouchableOpacity key={c.key} onPress={() => setCat(cat === c.key ? null : c.key)} activeOpacity={0.85} style={[s.cat, cat === c.key && s.catOn]}>
              <MaterialCommunityIcons name={c.icon} size={24} color={colors.gold} />
              <Text style={s.catText}>{c.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!cat && featured && (
          <>
            <Text style={s.section}>Featured</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => open(featured)} style={s.feature}>
              <Thumb deity={deityFor(featured.title)} size={62} radiusPx={10} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.fTitle}>{featured.title}</Text>
                <Text style={s.fSub}>{featured.verses} verses  •  {featured.duration}</Text>
              </View>
              <View style={s.play}><MaterialCommunityIcons name="play" size={24} color={colors.onGold} /></View>
            </TouchableOpacity>
          </>
        )}

        <Text style={s.section}>{cat ? cat : 'Popular'}</Text>
        {popular.map((i) => (
          <TouchableOpacity key={i.id} activeOpacity={0.9} onPress={() => open(i)} style={s.row}>
            <Thumb deity={deityFor(i.title)} size={46} radiusPx={8} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.rTitle}>{i.title}</Text>
              <Text style={s.rSub}>{i.duration !== '-' ? i.duration : i.lang}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.gold} />
          </TouchableOpacity>
        ))}
        {popular.length === 0 && <Text style={s.rSub}>Nothing here yet.</Text>}
      </ScrollView>

      {/* mini player */}
      {featured?.hasAudio && (
        <View style={s.mini}>
          <Thumb deity="Hanuman" size={38} radiusPx={19} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.mTitle}>{featured.title}</Text>
            <View style={s.bar}><View style={s.barFill} /></View>
          </View>
          <TouchableOpacity onPress={() => setPlaying(!playing)} style={s.pp}>
            <MaterialCommunityIcons name={playing ? 'pause' : 'play'} size={20} color={colors.onGold} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  head: { alignItems: 'center', paddingBottom: 18 },
  title: { fontFamily: serif, fontSize: 24, color: '#F6E6BF', fontWeight: '600' },
  sub: { color: '#CDB9A6', fontSize: 12.5, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cat: { width: '31.5%', height: 74, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  catOn: { backgroundColor: 'rgba(232,185,63,0.2)', borderColor: colors.gold },
  catText: { color: '#F6E6BF', fontSize: 13, fontWeight: '700', marginTop: 6 },
  section: { fontFamily: serif, color: '#F6E6BF', fontSize: 17, fontWeight: '600', marginTop: 14, marginBottom: 10 },
  feature: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: 'rgba(120,60,20,0.35)' },
  fTitle: { fontFamily: serif, color: '#fff', fontSize: 16, fontWeight: '600' },
  fSub: { color: '#CDB9A6', fontSize: 11.5, marginTop: 4 },
  play: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 9, borderRadius: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 8 },
  rTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  rSub: { color: '#CDB9A6', fontSize: 11.5, marginTop: 3 },
  mini: { position: 'absolute', left: 12, right: 12, bottom: 10, flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 14, borderWidth: 1, borderColor: colors.gold, backgroundColor: '#4A1014' },
  mTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  bar: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8 },
  barFill: { width: '35%', height: 3, borderRadius: 2, backgroundColor: colors.gold },
  pp: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
});
