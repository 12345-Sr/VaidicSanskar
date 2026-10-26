import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, Button } from '../../components/ui';
import { Sheet, Chip } from '../../components/widgets';
import colors from '../../theme/colors';
import { radius, shadow } from '../../theme/styles';
import { useWallet } from '../../context/AppContext';

const quickAmts = [100, 200, 500, 1000, 2000];

export default function WalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { balance, ledger, addMoney } = useWallet();
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState(500);
  const [method, setMethod] = useState('UPI');

  const confirmAdd = () => { addMoney(Number(amt), method); setOpen(false); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="My Wallet" navigation={navigation} showBack={navigation.canGoBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {/* Balance card */}
        <LinearGradient colors={colors.bannerGradient || ['#FFE2C5', '#FAD397']} style={s.balCard}>
          <Text style={s.balLabel}>Available Balance</Text>
          <Text style={s.balAmt}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={s.balRow}>
            <TouchableOpacity style={s.addBtn} onPress={() => setOpen(true)}>
              <MaterialCommunityIcons name="plus-circle" size={18} color="#3A1208" />
              <Text style={s.addText}>Add Money</Text>
            </TouchableOpacity>
            <MaterialCommunityIcons name="wallet" size={40} color="rgba(90,44,16,0.18)" />
          </View>
        </LinearGradient>

        {/* Quick add */}
        <View style={s.quick}>
          {quickAmts.map((a) => (
            <TouchableOpacity key={a} style={s.qChip} onPress={() => { setAmt(a); setOpen(true); }}>
              <Text style={s.qText}>+₹{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ledger */}
        <Text style={s.section}>Transaction History</Text>
        {ledger.map((t) => (
          <View key={t.id} style={s.txRow}>
            <View style={[s.txIcon, { backgroundColor: (t.type === 'credit' ? colors.success : colors.danger) + '18' }]}>
              <MaterialCommunityIcons name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={t.type === 'credit' ? colors.success : colors.danger} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.txTitle}>{t.title}</Text>
              <Text style={s.txDate}>{t.at}</Text>
            </View>
            <Text style={[s.txAmt, { color: t.type === 'credit' ? colors.success : colors.danger }]}>
              {t.type === 'credit' ? '+' : '−'}₹{t.amount}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Sheet visible={open} onClose={() => setOpen(false)} title="Add Money">
        <Text style={s.lbl}>Amount</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
          {quickAmts.map((a) => <Chip key={a} label={`₹${a}`} active={Number(amt) === a} onPress={() => setAmt(a)} />)}
        </View>
        <Text style={s.lbl}>Payment Method</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
          {['UPI', 'Card', 'Net Banking'].map((m) => <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />)}
        </View>
        <Button title={`Add ₹${amt} via ${method}`} icon="lock" onPress={confirmAdd} />
        <Text style={s.note}>Developer: route this through Razorpay/UPI, then credit on verified webhook.</Text>
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  balCard: { borderRadius: 20, padding: 20, ...shadow },
  balLabel: { color: '#6E5544', fontSize: 13, fontWeight: '600' },
  balAmt: { color: '#3A1208', fontSize: 36, fontWeight: '900', marginTop: 4 },
  balRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAA838', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100 },
  addText: { color: '#3A1208', fontWeight: '800', marginLeft: 6 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  qChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9, marginRight: 8, marginBottom: 8 },
  qText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 14, marginBottom: 10, ...shadow },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 14.5, fontWeight: '700', color: colors.text },
  txDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: '800' },
  lbl: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  note: { fontSize: 11, color: colors.textMuted, marginTop: 12, textAlign: 'center' },
});
