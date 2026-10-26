import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Button } from '../../components/ui';
import { Sheet } from '../../components/widgets';
import colors from '../../theme/colors';

/**
 * Text Reader + embedded Audio Player + Freemium metering.
 *
 * - Font scaling (A- / A+), bookmark toggle (persist via AsyncStorage in prod)
 * - Audio player: play/pause + seek bar (expo-av for real streaming +
 *   background playback — see TODO). Demo uses a progress timer.
 * - Freemium: FREE_LIMIT_SECONDS of audio/day; on hit → subscription sheet.
 */
const FREE_LIMIT_SECONDS = 120; // N minutes daily (demo = 2 min)
const TRACK_SECONDS = 570;      // mock track length (9:30)

export default function ReaderScreen({ navigation, route }) {
  const item = route.params.item;
  const [font, setFont] = useState(17);
  const [bookmarked, setBookmarked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);         // seconds played
  const [freeUsed, setFreeUsed] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const timer = useRef(null);

  // playback tick (replace with expo-av onPlaybackStatusUpdate)
  useEffect(() => {
    if (!playing) { clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setPos((p) => (p + 1) % TRACK_SECONDS);
      setFreeUsed((u) => {
        const n = u + 1;
        if (n >= FREE_LIMIT_SECONDS) { setPlaying(false); setShowSub(true); }
        return n;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [playing]);

  const remaining = Math.max(0, FREE_LIMIT_SECONDS - freeUsed);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={item.title} subtitle={item.type} navigation={navigation}
        right={
          <TouchableOpacity onPress={() => setBookmarked((b) => !b)}>
            <MaterialCommunityIcons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
          </TouchableOpacity>
        } />

      {/* font controls */}
      <View style={s.fontBar}>
        <Text style={s.fontLbl}>Text Size</Text>
        <TouchableOpacity style={s.fontBtn} onPress={() => setFont((f) => Math.max(13, f - 1))}><Text style={s.fontBtnTxt}>A-</Text></TouchableOpacity>
        <TouchableOpacity style={s.fontBtn} onPress={() => setFont((f) => Math.min(28, f + 1))}><Text style={[s.fontBtnTxt, { fontSize: 18 }]}>A+</Text></TouchableOpacity>
        <Text style={s.free}><MaterialCommunityIcons name="gift" size={13} color={colors.success} /> Free</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        {(Array.isArray(item?.verses) ? item.verses : [item?.verses || item?.description || '॥ ॐ नमः शिवाय ॥']).map((v, i) => (
          <Text key={i} style={[s.verse, { fontSize: String(v).startsWith('॥') ? font + 4 : font, fontWeight: String(v).startsWith('॥') ? '800' : '500', color: String(v).startsWith('॥') ? colors.primaryDeep : colors.text, textAlign: String(v).startsWith('॥') ? 'center' : 'left' }]}>
            {v}
          </Text>
        ))}
      </ScrollView>

      {/* Audio player bar */}
      {item.hasAudio && (
        <View style={s.player}>
          {freeUsed > 0 && (
            <Text style={s.freeTimer}>
              {remaining > 0 ? `Free preview: ${fmt(remaining)} left today` : 'Free preview over for today'}
            </Text>
          )}
          <View style={s.track}><View style={[s.fill, { width: `${(pos / TRACK_SECONDS) * 100}%` }]} /></View>
          <View style={s.pRow}>
            <Text style={s.t}>{fmt(pos)}</Text>
            <View style={s.controls}>
              <TouchableOpacity><MaterialCommunityIcons name="rewind-10" size={26} color={colors.text} /></TouchableOpacity>
              <TouchableOpacity style={s.play} onPress={() => (remaining <= 0 ? setShowSub(true) : setPlaying((p) => !p))}>
                <MaterialCommunityIcons name={playing ? 'pause' : 'play'} size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity><MaterialCommunityIcons name="fast-forward-10" size={26} color={colors.text} /></TouchableOpacity>
            </View>
            <Text style={s.t}>{fmt(TRACK_SECONDS)}</Text>
          </View>
        </View>
      )}

      {/* Subscription modal on freemium limit */}
      <Sheet visible={showSub} onClose={() => setShowSub(false)} title="Unlock Unlimited Audio 🎧">
        <Text style={s.subText}>Aapki aaj ki free listening limit poori ho gayi. Premium lijiye aur bina rukawat sunte rahiye.</Text>
        {['Ad-free unlimited audio', 'Background playback', 'Offline downloads', 'Early new releases'].map((f) => (
          <View key={f} style={s.feat}><MaterialCommunityIcons name="check-circle" size={18} color={colors.success} /><Text style={s.featText}>{f}</Text></View>
        ))}
        <View style={s.planRow}>
          <View style={s.plan}><Text style={s.planName}>Monthly</Text><Text style={s.planPrice}>₹99</Text></View>
          <View style={[s.plan, s.planBest]}><Text style={[s.planName, { color: '#fff' }]}>Yearly</Text><Text style={[s.planPrice, { color: '#fff' }]}>₹799</Text><Text style={s.save}>Save 33%</Text></View>
        </View>
        <Button title="Subscribe Now" onPress={() => setShowSub(false)} />
      </Sheet>
    </View>
  );
}

function fmt(s) { const m = Math.floor(s / 60); const r = s % 60; return `${m}:${r.toString().padStart(2, '0')}`; }

const s = StyleSheet.create({
  fontBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  fontLbl: { fontSize: 13, color: colors.textMuted, flex: 1 },
  fontBtn: { width: 40, height: 34, borderRadius: 9, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  fontBtnTxt: { fontSize: 14, fontWeight: '800', color: colors.text },
  free: { marginLeft: 12, fontSize: 12, color: colors.success, fontWeight: '700' },
  verse: { lineHeight: 30, marginBottom: 12 },
  player: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border, padding: 14, paddingBottom: 26 },
  freeTimer: { fontSize: 11.5, color: colors.warning, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  track: { height: 4, backgroundColor: colors.border, borderRadius: 2 },
  fill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  pRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  t: { fontSize: 11, color: colors.textMuted, width: 40 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  play: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  subText: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: 16 },
  feat: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featText: { fontSize: 14, color: colors.text, marginLeft: 10 },
  planRow: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  plan: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  planBest: { backgroundColor: colors.primary, borderColor: colors.primary },
  planName: { fontSize: 14, fontWeight: '700', color: colors.text },
  planPrice: { fontSize: 22, fontWeight: '900', color: colors.primary, marginTop: 4 },
  save: { fontSize: 10, color: '#fff', fontWeight: '700', marginTop: 2 },
});
