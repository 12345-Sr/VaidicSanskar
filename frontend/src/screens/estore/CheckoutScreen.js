import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore from '../../services/estoreStore';
import { StoreService } from '../../services/api';

export default function CheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const calcs = estoreStore.getCalculations();
  const cartItems = estoreStore.getCart();

  const [address, setAddress] = useState(estoreStore.selectedAddress);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING, COD
  const [promoCode, setPromoCode] = useState(estoreStore.appliedCoupon?.code || '');
  const [promoApplied, setPromoApplied] = useState(!!estoreStore.appliedCoupon);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ ...address });

  // Order Success Screen modal state
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const res = estoreStore.applyCoupon(promoCode);
    if (res.success) {
      setPromoApplied(true);
    }
  };

  const handleSaveAddress = () => {
    setAddress({ ...addressForm });
    estoreStore.selectedAddress = { ...addressForm };
    setIsEditingAddress(false);
  };

  const handleContinueToPay = () => {
    const currentCart = Array.isArray(estoreStore.cart) ? [...estoreStore.cart] : [];
    const firstProduct = currentCart[0]?.product;
    const itemName = firstProduct?.name || 'Pooja Samagri';

    // 1. Create order in local reactive store
    const newOrder = estoreStore.createOrder({
      paymentMethod,
      address,
    });

    // 2. Synchronize with backend API in background
    try {
      const itemsPayload = currentCart.map((item) => ({
        productId: item.product?.id || item.product?._id,
        name: item.product?.name || 'Pooja Samagri',
        price: Number(item.variant?.price || item.product?.price || 0),
        quantity: item.qty || 1,
      }));

      StoreService.checkout({
        orderId: newOrder.orderNumber || newOrder.id,
        items: itemsPayload,
        itemName: currentCart.length > 1 ? `${itemName} (+${currentCart.length - 1} more)` : itemName,
        total: calcs.finalTotal || newOrder.total || 699,
        buyer: address?.name || 'Rahul Sharma',
        shippingAddress: {
          name: address?.name || 'Rahul Sharma',
          phone: address?.phone || '9876543210',
          line1: address?.address || '101, Sunrise Apartment, Sector 12',
          city: address?.city || 'New Delhi',
          pincode: address?.pincode || '110001',
        },
        paymentMethod: paymentMethod === 'COD' ? 'cod' : 'online',
      }).catch(() => {});
    } catch (_) {}

    // 3. Display Order Placed Successfully Screen
    setPlacedOrder(newOrder);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A0C13" />

      {/* MAROON HEADER */}
      <View style={[s.headerBar, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* SHIPPING ADDRESS SECTION */}
        {/* ========================================================================= */}
        <Text style={s.sectionHeading}>Shipping Address</Text>
        <View style={s.addressCard}>
          <View style={s.addressIconWrap}>
            <Ionicons name="location-sharp" size={20} color="#D92D20" />
          </View>

          <View style={s.addressDetails}>
            <Text style={s.addressName}>{address?.name || 'Rahul Sharma'}</Text>
            <Text style={s.addressText}>
              {address?.address || '101, Sunrise Apartment, Sector 12, New Delhi - 110001'}
            </Text>
            <Text style={s.addressPhone}>Phone: {address?.phone || '+91 9876543210'}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditingAddress(!isEditingAddress)}
            activeOpacity={0.7}
          >
            <Text style={s.changeLink}>{isEditingAddress ? 'Cancel' : 'Change'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingAddress && (
          <View style={s.editAddressBox}>
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor="#A0887A"
              value={addressForm.name}
              onChangeText={(t) => setAddressForm({ ...addressForm, name: t })}
            />
            <TextInput
              style={s.input}
              placeholder="Flat / House / Apartment / Area"
              placeholderTextColor="#A0887A"
              value={addressForm.address}
              onChangeText={(t) => setAddressForm({ ...addressForm, address: t })}
            />
            <TextInput
              style={s.input}
              placeholder="City, State, Pincode"
              placeholderTextColor="#A0887A"
              value={addressForm.city}
              onChangeText={(t) => setAddressForm({ ...addressForm, city: t })}
            />
            <TextInput
              style={s.input}
              placeholder="Contact Mobile Number"
              placeholderTextColor="#A0887A"
              keyboardType="phone-pad"
              value={addressForm.phone}
              onChangeText={(t) => setAddressForm({ ...addressForm, phone: t })}
            />
            <TouchableOpacity style={s.saveAddrBtn} onPress={handleSaveAddress}>
              <Text style={s.saveAddrText}>Save Shipping Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* PAYMENT METHOD SECTION */}
        {/* ========================================================================= */}
        <Text style={[s.sectionHeading, { marginTop: 20 }]}>Payment Method</Text>

        <View style={s.paymentOptionsList}>
          {/* Option 1: UPI / Google Pay */}
          <TouchableOpacity
            style={[s.paymentOptionCard, paymentMethod === 'UPI' && s.paymentOptionActive]}
            activeOpacity={0.85}
            onPress={() => setPaymentMethod('UPI')}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'UPI' && <View style={s.radioInner} />}
            </View>
            <Text style={s.paymentLabel}>UPI / Google Pay / PhonePe</Text>
            <View style={s.paymentLogos}>
              <Text style={s.upiBadge}>UPI</Text>
              <Text style={s.gpayBadge}>GPay</Text>
            </View>
          </TouchableOpacity>

          {/* Option 2: Credit / Debit Card */}
          <TouchableOpacity
            style={[s.paymentOptionCard, paymentMethod === 'CARD' && s.paymentOptionActive]}
            activeOpacity={0.85}
            onPress={() => setPaymentMethod('CARD')}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'CARD' && <View style={s.radioInner} />}
            </View>
            <Text style={s.paymentLabel}>Credit / Debit Card</Text>
            <MaterialCommunityIcons name="credit-card-outline" size={22} color="#5C4435" />
          </TouchableOpacity>

          {/* Option 3: Net Banking */}
          <TouchableOpacity
            style={[s.paymentOptionCard, paymentMethod === 'NETBANKING' && s.paymentOptionActive]}
            activeOpacity={0.85}
            onPress={() => setPaymentMethod('NETBANKING')}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'NETBANKING' && <View style={s.radioInner} />}
            </View>
            <Text style={s.paymentLabel}>Net Banking (All Indian Banks)</Text>
            <MaterialCommunityIcons name="bank" size={20} color="#5C4435" />
          </TouchableOpacity>

          {/* Option 4: Cash on Delivery */}
          <TouchableOpacity
            style={[s.paymentOptionCard, paymentMethod === 'COD' && s.paymentOptionActive]}
            activeOpacity={0.85}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={s.radioCircle}>
              {paymentMethod === 'COD' && <View style={s.radioInner} />}
            </View>
            <Text style={s.paymentLabel}>Cash on Delivery (Pay upon Receipt)</Text>
            <MaterialCommunityIcons name="cash" size={22} color="#15803D" />
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* PROMO CODE SECTION */}
        {/* ========================================================================= */}
        <Text style={[s.promoHeading, { marginTop: 20 }]}>Have a promo code?</Text>
        <View style={s.promoInputRow}>
          <TextInput
            style={s.promoInput}
            placeholder="Enter promo code"
            placeholderTextColor="#A0887A"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={s.promoApplyBtn}
            activeOpacity={0.85}
            onPress={handleApplyPromo}
          >
            <Text style={s.promoApplyText}>{promoApplied ? 'Applied ✓' : 'Apply'}</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* ORDER SUMMARY PREVIEW */}
        {/* ========================================================================= */}
        <Text style={[s.sectionHeading, { marginTop: 20 }]}>Order Summary</Text>
        <View style={s.summaryBox}>
          {cartItems.map((item, idx) => (
            <View key={`chk-item-${idx}`} style={s.summaryItemRow}>
              <Text style={s.summaryItemName} numberOfLines={1}>
                {item.product?.name} × {item.qty}
              </Text>
              <Text style={s.summaryItemPrice}>
                ₹ {(Number(item.variant?.price || item.product?.price || 0)) * item.qty}
              </Text>
            </View>
          ))}
          <View style={s.summaryDivider} />
          <View style={s.totalAmountRow}>
            <Text style={s.totalAmountLabel}>Total Amount to Pay</Text>
            <Text style={s.totalAmountValue}>₹ {calcs.finalTotal || 699}</Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY CONTINUE TO PAY BUTTON */}
      <View style={[s.stickyBottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={s.continuePayBtn}
          activeOpacity={0.9}
          onPress={handleContinueToPay}
        >
          <Text style={s.continuePayBtnText}>Continue to Pay  •  ₹ {calcs.finalTotal || 699}</Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* SCREEN 8: ORDER PLACED SUCCESSFULLY MODAL */}
      {/* ========================================================================= */}
      <Modal visible={!!placedOrder} animationType="fade" transparent={false}>
        <View style={s.successScreenContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#FAF5EE" />

          {/* Temple Aura Circular Checkmark */}
          <View style={s.auraBackgroundBox}>
            <View style={s.mandalaRing} />
            <View style={s.successCheckCircle}>
              <MaterialCommunityIcons name="check" size={44} color="#FFF" />
            </View>
          </View>

          {/* Confirmation Titles */}
          <Text style={s.successTitle}>Order Placed Successfully!</Text>
          <Text style={s.successSub}>
            Your sacred order has been confirmed.{'\n'}We will notify you once it is dispatched.
          </Text>

          {/* Order Details Card */}
          <View style={s.orderInfoCard}>
            <View style={s.orderInfoRow}>
              <Text style={s.orderInfoLabel}>Order ID</Text>
              <Text style={s.orderInfoValue}>{placedOrder?.orderNumber || '#VS102456'}</Text>
            </View>
            <View style={[s.orderInfoRow, { marginTop: 10 }]}>
              <Text style={s.orderInfoLabel}>Estimated Delivery</Text>
              <Text style={s.orderInfoValue}>3 - 5 Working Days</Text>
            </View>
            <View style={[s.orderInfoRow, { marginTop: 10 }]}>
              <Text style={s.orderInfoLabel}>Payment Mode</Text>
              <Text style={s.orderInfoValue}>{placedOrder?.paymentMethod || 'UPI'}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={s.successActions}>
            <TouchableOpacity
              style={s.viewOrderDetailsBtn}
              activeOpacity={0.85}
              onPress={() => {
                const oid = placedOrder?.id;
                setPlacedOrder(null);
                navigation.replace('OrderTracking', { orderId: oid });
              }}
            >
              <Text style={s.viewOrderDetailsText}>View Order Details & Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.continueShoppingBtn}
              activeOpacity={0.9}
              onPress={() => {
                setPlacedOrder(null);
                navigation.navigate('EStore');
              }}
            >
              <Text style={s.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          {/* Sacred Footer */}
          <View style={s.sacredFooter}>
            <View style={s.sacredDivider} />
            <Text style={s.omShantiText}>~ Om Shanti ~</Text>
            <View style={s.sacredDivider} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  headerBar: {
    backgroundColor: '#4A0C13',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },

  // ADDRESS CARD
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDEEEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  addressText: {
    fontSize: 12,
    color: '#6B5A4E',
    marginTop: 2,
    lineHeight: 16,
  },
  addressPhone: {
    fontSize: 11,
    color: '#8E786B',
    marginTop: 2,
  },
  changeLink: {
    fontSize: 13,
    color: '#8E2820',
    fontWeight: '700',
  },
  editAddressBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ECE2D3',
    gap: 8,
  },
  input: {
    backgroundColor: '#FBF8F2',
    borderWidth: 1,
    borderColor: '#E8DDCF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#3A1208',
  },
  saveAddrBtn: {
    backgroundColor: '#5A1017',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveAddrText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // PAYMENT METHODS
  paymentOptionsList: {
    gap: 10,
  },
  paymentOptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECE2D3',
  },
  paymentOptionActive: {
    borderColor: '#8E2820',
    backgroundColor: '#FFFBF7',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8E2820',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8E2820',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#3A1208',
  },
  paymentLogos: {
    flexDirection: 'row',
    gap: 6,
  },
  upiBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#F3EAD8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#3A1208',
  },
  gpayBadge: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#15803D',
  },

  // PROMO CODE
  promoHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5A4E',
    marginBottom: 8,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3A1208',
  },
  promoApplyBtn: {
    backgroundColor: '#5A1017',
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // SUMMARY BOX
  summaryBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryItemName: {
    fontSize: 13,
    color: '#5C4435',
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    marginLeft: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EFE7DA',
    marginVertical: 10,
  },
  totalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmountLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1208',
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5A1017',
  },

  // STICKY BOTTOM CONTINUE TO PAY
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#ECE3D4',
  },
  continuePayBtn: {
    backgroundColor: '#5A1017',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuePayBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // SUCCESS SCREEN
  successScreenContainer: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  auraBackgroundBox: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  mandalaRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#D4881755',
    borderStyle: 'dashed',
  },
  successCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5A1017',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5A1017',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A0C13',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  successSub: {
    fontSize: 13,
    color: '#7A6455',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  orderInfoCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 26,
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfoLabel: {
    fontSize: 13,
    color: '#7A6455',
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  successActions: {
    width: '100%',
    marginTop: 28,
    gap: 12,
  },
  viewOrderDetailsBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#5A1017',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  viewOrderDetailsText: {
    color: '#5A1017',
    fontSize: 14,
    fontWeight: '700',
  },
  continueShoppingBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5A1017',
  },
  continueShoppingText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sacredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    gap: 10,
  },
  sacredDivider: {
    width: 40,
    height: 1,
    backgroundColor: '#D4881766',
  },
  omShantiText: {
    fontSize: 13,
    color: '#A75D18',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
