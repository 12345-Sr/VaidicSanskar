import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

// Serif display font (headings, titles) - system serif so no font download is needed
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

// Shared spacing / radius tokens
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 100 };

export function shadow(elevation = 3) {
  const elev = typeof elevation === 'number' ? elevation : 3;
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Math.max(1, Math.round(elev / 2)) },
    shadowOpacity: Math.min(0.2, 0.05 + elev * 0.015),
    shadowRadius: Math.max(2, elev * 2),
    elevation: elev,
  };
}

// Assign properties directly to function so both `...shadow` and `...shadow(x)` work
Object.assign(shadow, {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
});

export const g = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  h1: { fontSize: 24, fontWeight: '800', color: colors.text },
  h2: { fontSize: 19, fontWeight: '700', color: colors.text },
  h3: { fontSize: 16, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  body14: { fontSize: 14, color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted },
  priceText: { fontSize: 18, fontWeight: '800', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
});

export default g;
