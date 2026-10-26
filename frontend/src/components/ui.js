import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { radius, spacing, shadow, serif } from '../theme/styles';

/* ---------- Clean warm header with back button ---------- */
export const Header = ({ title, subtitle, navigation, right, showBack = true }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[hs.header, { paddingTop: insets.top + 8 }]}>
      <View style={hs.headerRow}>
        {showBack && navigation ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={hs.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
        <View style={{ flex: 1, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={hs.headerTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={hs.headerSub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        <View style={{ minWidth: 36, alignItems: 'flex-end', justifyContent: 'center' }}>
          {right || null}
        </View>
      </View>
    </View>
  );
};

/* ---------- Primary / outline buttons ---------- */
export const Button = ({ title, onPress, style, variant = 'primary', icon, disabled }) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[{ opacity: disabled ? 0.5 : 1 }, style]}>
        <View style={bs.btn}>
          {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.onGold} style={{ marginRight: 8 }} /> : null}
          <Text style={bs.btnText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled} style={[bs.outline, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.primary} style={{ marginRight: 8 }} /> : null}
      <Text style={bs.outlineText}>{title}</Text>
    </TouchableOpacity>
  );
};

/* ---------- Labeled input ---------- */
export const Field = ({ label, icon, ...props }) => (
  <View style={{ marginBottom: spacing.lg }}>
    {label ? <Text style={fs.label}>{label}</Text> : null}
    <View style={fs.wrap}>
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={colors.textMuted} style={{ marginRight: 8 }} /> : null}
      <TextInput placeholderTextColor={colors.textMuted} style={fs.input} {...props} />
    </View>
  </View>
);

/* ---------- Star rating pill ---------- */
export const Rating = ({ value }) => (
  <View style={rs.pill}>
    <Ionicons name="star" size={12} color="#fff" />
    <Text style={rs.text}>{value}</Text>
  </View>
);

/* ---------- Simple card ---------- */
export const Card = ({ children, style, onPress }) => {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap activeOpacity={0.9} onPress={onPress} style={[cs.card, style]}>
      {children}
    </Wrap>
  );
};

/* ---------- Section wrapper ---------- */
export const Screen = ({ children, scroll = true, style }) => {
  if (scroll) {
    return (
      <ScrollView style={[{ flex: 1, backgroundColor: colors.cream }, style]} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[{ flex: 1, backgroundColor: colors.cream, padding: spacing.lg }, style]}>{children}</View>;
};

export const Price = ({ value, mrp, size = 18 }) => (
  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
    <Text style={{ fontSize: size, fontWeight: '800', color: colors.primary }}>₹{value}</Text>
    {mrp ? <Text style={{ fontSize: size - 5, color: colors.textMuted, textDecorationLine: 'line-through', marginLeft: 6 }}>₹{mrp}</Text> : null}
  </View>
);

const hs = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D6',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EFE4D6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 19, fontFamily: serif, fontWeight: '700', textAlign: 'center' },
  headerSub: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 2 },
});

const bs = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    shadowColor: '#541016',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  outline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  outlineText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});

const fs = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6 },
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 50 },
  input: { flex: 1, fontSize: 15, color: colors.text },
});

const rs = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success, paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.sm, alignSelf: 'flex-start' },
  text: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 3 },
});

const cs = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, ...shadow },
});
