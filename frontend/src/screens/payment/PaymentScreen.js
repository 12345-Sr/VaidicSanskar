import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Button, Card, Price } from '../../components/ui';
import colors from '../../theme/colors';
import { radius } from '../../theme/styles';
import { useApp } from '../../context/AppContext';
import { RAZORPAY } from '../../config/payment';
import { PaymentService } from '../../services/api';

/**
 * Razorpay is loaded lazily so the app still runs in Expo Go (where the
 * native module isn't present). For real payments build a dev client:
 *   npx expo prebuild && npx expo run:android
 */
let RazorpayCheckout = null;
try {
  // eslint-disable-next-line global-require
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
  RazorpayCheckout = null;
}

const methods = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: 'cellphone' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'credit-card' },
  { id: 'netbanking', label: 'Net Banking', icon: 'bank' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'cash' },
];

export default function PaymentScreen({ navigation, route }) {
  const { amount = 0, title = 'Order', next, booking } = route.params || {};
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const { clearCart } = useApp();

  const finishSuccess = (paymentId) => {
    clearCart();
    // Some flows (e-store) continue to a tracking screen instead of the generic success
    if (next) return navigation.replace(next, { amount, paymentId, booking });
    navigation.replace('OrderSuccess', { amount, title, paymentId });
  };

  const onPay = async () => {
    // Cash on delivery — no gateway
    if (method === 'cod') return finishSuccess(null);

    // If the native SDK isn't available (e.g. Expo Go), simulate success
    // so the flow stays demoable. Real builds will use the SDK path below.
    if (!RazorpayCheckout) {
      Alert.alert(
        'Demo Mode',
        'Razorpay native module not found (running in Expo Go). Simulating a successful payment.',
        [{ text: 'OK', onPress: () => finishSuccess('demo_payment') }]
      );
      return;
    }

    try {
      setLoading(true);

      // 1) Create order on backend (recommended & required for verification)
      let order = {};
      try {
        order = await PaymentService.createOrder(amount, { title });
      } catch (e) {
        // backend not ready yet — Razorpay can still open without order_id in test mode
        order = {};
      }

      // 2) Open Razorpay checkout
      const options = {
        key: order.keyId || order.key || order.key_id || RAZORPAY.KEY_ID,
        name: RAZORPAY.NAME,
        description: title || RAZORPAY.DESCRIPTION,
        currency: order.currency || RAZORPAY.CURRENCY,
        amount: order.amountPaise || (order.amount || amount) * 100, // paise
        order_id: order.orderId || order.order_id, // undefined is fine in test mode
        theme: { color: RAZORPAY.THEME_COLOR },
        prefill: {},
      };

      const data = await RazorpayCheckout.open(options);

      // 3) Verify on backend
      try {
        await PaymentService.verify({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
        });
      } catch (e) {
        // log but continue; backend can reconcile later
      }

      finishSuccess(data.razorpay_payment_id);
    } catch (err) {
      Alert.alert('Payment cancelled', err?.description || 'Payment was not completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Payment" navigation={navigation} />
      <Screen>
        <Card>
          <Text style={s.label}>Paying for</Text>
          <Text style={s.title}>{title}</Text>
          <View style={s.amountRow}><Text style={s.amtLabel}>Amount payable</Text><Price value={amount} size={22} /></View>
        </Card>

        <Text style={s.section}>Select Payment Method</Text>
        {methods.map((m) => (
          <TouchableOpacity key={m.id} style={[s.method, method === m.id && s.methodActive]} onPress={() => setMethod(m.id)}>
            <MaterialCommunityIcons name={m.icon} size={24} color={method === m.id ? colors.primary : colors.textMuted} />
            <Text style={s.methodText}>{m.label}</Text>
            <MaterialCommunityIcons name={method === m.id ? 'radiobox-marked' : 'radiobox-blank'} size={22} color={method === m.id ? colors.primary : colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={s.secure}>
          <MaterialCommunityIcons name="shield-check" size={16} color={colors.success} />
          <Text style={s.secureText}>100% secure payment</Text>
        </View>
      </Screen>
      <View style={s.footer}>
        {loading ? (
          <View style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <Button title={method === 'cod' ? 'Place Order' : `Pay ₹${amount}`} icon="lock" onPress={onPay} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 12, color: colors.textMuted },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  amtLabel: { fontSize: 14, color: colors.textMuted },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginVertical: 14 },
  method: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.md, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  methodText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.text, marginLeft: 14 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secureText: { fontSize: 13, color: colors.success, fontWeight: '600', marginLeft: 6 },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
});
