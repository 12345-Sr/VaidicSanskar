import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal as RNModal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { radius, spacing, shadow } from '../theme/styles';

/* ---------- Bottom-sheet style modal ---------- */
export const Sheet = ({ visible, onClose, children, title }) => (
  <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={ws.backdrop} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={ws.sheet}>
        <View style={ws.handle} />
        {title ? <Text style={ws.sheetTitle}>{title}</Text> : null}
        {children}
      </TouchableOpacity>
    </TouchableOpacity>
  </RNModal>
);

/* ---------- Selectable chip ---------- */
export const Chip = ({ label, active, onPress, icon }) => (
  <TouchableOpacity style={[ws.chip, active && ws.chipActive]} onPress={onPress} activeOpacity={0.8}>
    {icon ? <MaterialCommunityIcons name={icon} size={15} color={active ? '#fff' : colors.textMuted} style={{ marginRight: 5 }} /> : null}
    <Text style={[ws.chipText, active && ws.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

/* ---------- Radio row ---------- */
export const Radio = ({ label, sub, selected, onPress, right }) => (
  <TouchableOpacity style={[ws.radio, selected && ws.radioActive]} onPress={onPress} activeOpacity={0.85}>
    <MaterialCommunityIcons name={selected ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={selected ? colors.primary : colors.textMuted} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={ws.radioLabel}>{label}</Text>
      {sub ? <Text style={ws.radioSub}>{sub}</Text> : null}
    </View>
    {right}
  </TouchableOpacity>
);

/* ---------- Vertical status timeline (order / booking tracking) ---------- */
export const Timeline = ({ steps = [], currentIndex }) => (
  <View style={{ paddingVertical: 4 }}>
    {(steps || []).map((step, i) => {
      const done = i <= currentIndex;
      const isLast = i === steps.length - 1;
      return (
        <View key={step} style={ws.tlRow}>
          <View style={ws.tlLeft}>
            <View style={[ws.tlDot, done && ws.tlDotDone]}>
              {done ? <MaterialCommunityIcons name="check" size={13} color="#fff" /> : null}
            </View>
            {!isLast && <View style={[ws.tlLine, i < currentIndex && ws.tlLineDone]} />}
          </View>
          <Text style={[ws.tlLabel, done && ws.tlLabelDone]}>{step}</Text>
        </View>
      );
    })}
  </View>
);

/* ---------- Small coloured badge ---------- */
export const Tag = ({ text, color = colors.primary }) => (
  <View style={[ws.tag, { backgroundColor: color + '18' }]}>
    <Text style={[ws.tagText, { color }]}>{text}</Text>
  </View>
);

/* ---------- Avatar circle ---------- */
export const Avatar = ({ icon = 'account', size = 48, online }) => (
  <View style={{ width: size, height: size }}>
    <View style={[ws.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons name={icon} size={size * 0.55} color={colors.primaryDeep} />
    </View>
    {online != null && <View style={[ws.dot, { backgroundColor: online ? colors.online : colors.textMuted }]} />}
  </View>
);

const ws = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 32 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 14 },

  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.onGold },

  radio: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary + '0A' },
  radioLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  radioSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },

  tlRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tlLeft: { alignItems: 'center', marginRight: 14 },
  tlDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  tlDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  tlLine: { width: 2, height: 30, backgroundColor: colors.border, marginVertical: 2 },
  tlLineDone: { backgroundColor: colors.success },
  tlLabel: { fontSize: 14.5, color: colors.textMuted, paddingTop: 2, fontWeight: '600' },
  tlLabelDone: { color: colors.text, fontWeight: '700' },

  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7, alignSelf: 'flex-start' },
  tagText: { fontSize: 11, fontWeight: '800' },

  avatar: { backgroundColor: colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 0, bottom: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
});

/* ================= NEW DESIGN WIDGETS ================= */
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { serif } from '../theme/styles';

const DEITY_LOOK = {
  Shiva: { icon: 'om', c: ['#3B5A8C', '#1B2C4A'] },
  Vishnu: { icon: 'flower-tulip', c: ['#C9892B', '#7A3E10'] },
  Navgraha: { icon: 'orbit', c: ['#B8481E', '#4A1408'] },
  Hanuman: { icon: 'hand-peace', c: ['#D9731F', '#7A2A0C'] },
  Ganesh: { icon: 'elephant', c: ['#D04A2B', '#6E1B0E'] },
  Vastu: { icon: 'home-heart', c: ['#7E5A2B', '#3B2410'] },
  Krishna: { icon: 'music-note', c: ['#2F6F9F', '#14304A'] },
  default: { icon: 'temple-hindu', c: ['#C9892B', '#5A1A12'] },
};

/** Image tile: shows `uri` when given, else a deity-themed gradient with an icon. */
export const Thumb = ({ uri, deity = 'default', icon, size = 64, radiusPx = 12, style }) => {
  const look = DEITY_LOOK[deity] || DEITY_LOOK.default;
  const w = typeof size === 'number' ? size : undefined;
  if (uri) return <Image source={{ uri }} style={[{ width: w, height: w, borderRadius: radiusPx }, style]} />;
  return (
    <LinearGradient colors={look.c} style={[{ width: w, height: w, borderRadius: radiusPx, alignItems: 'center', justifyContent: 'center' }, style]}>
      <MaterialCommunityIcons name={icon || look.icon} size={(w || 64) * 0.5} color="rgba(255,236,190,0.95)" />
    </LinearGradient>
  );
};

/** 4-step booking stepper (circles + labels). */
export const Stepper = ({ steps, current }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
    {steps.map((label, i) => {
      const active = i === current, done = i < current;
      return (
        <View key={label} style={{ flex: 1, alignItems: 'center' }}>
          {i > 0 && <View style={[ns.stepLine, (done || active) && { backgroundColor: colors.gold }]} />}
          <View style={[ns.stepDot, (active || done) && ns.stepDotOn]}>
            {done ? <MaterialCommunityIcons name="check" size={16} color={colors.onGold} />
              : <Text style={[ns.stepNum, (active || done) && { color: colors.onGold }]}>{i + 1}</Text>}
          </View>
          <Text style={[ns.stepLabel, active && { color: colors.gold, fontWeight: '800' }]} numberOfLines={1}>{label}</Text>
        </View>
      );
    })}
  </View>
);

/** Pill filter chips (gold when active). Dark variant for dark screens. */
export const Pills = ({ items, value, onChange, dark }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {items.map((it) => {
      const on = value === it;
      return (
        <TouchableOpacity key={it} onPress={() => onChange(it)} activeOpacity={0.85}
          style={[ns.pill, dark && ns.pillDark, on && ns.pillOn]}>
          <Text style={[ns.pillText, dark && { color: '#EBD9B4' }, on && { color: colors.onGold, fontWeight: '800' }]}>{it}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const SearchBar = ({ value, onChangeText, placeholder, style }) => (
  <View style={[ns.search, style]}>
    <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={ns.searchInput} />
  </View>
);

export const GoldButton = ({ title, onPress, icon, style, disabled }) => (
  <TouchableOpacity activeOpacity={0.88} onPress={onPress} disabled={disabled} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
    <LinearGradient colors={colors.goldGradient} style={ns.goldBtn}>
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.onGold} style={{ marginRight: 8 }} /> : null}
      <Text style={ns.goldBtnText}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export const SectionTitle = ({ children, light, style }) => (
  <Text style={[{ fontFamily: serif, fontSize: 18, fontWeight: '600', color: light ? '#F6E6BF' : colors.text }, style]}>{children}</Text>
);

const ns = StyleSheet.create({
  stepDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  stepDotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNum: { color: colors.textMuted, fontWeight: '700', fontSize: 13 },
  stepLabel: { color: colors.textMuted, fontSize: 10.5, marginTop: 5, fontWeight: '600' },
  stepLine: { position: 'absolute', top: 14, right: '50%', width: '100%', height: 2, backgroundColor: colors.border },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 8 },
  pillDark: { backgroundColor: '#FFFFFF', borderColor: colors.border },
  pillOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 12, height: 46, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.text, paddingVertical: 0 },
  goldBtn: { height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  goldBtnText: { color: colors.onGold, fontSize: 15.5, fontWeight: '800' },
});
