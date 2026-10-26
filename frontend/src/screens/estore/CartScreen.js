import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore, { DEMO_COUPONS } from '../../services/estoreStore';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState(estoreStore.getCart());
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(estoreStore.appliedCoupon);

  useEffect(() => {
    const unsub = estoreStore.subscribe(() => {
      setCart([...estoreStore.getCart()]);
      setAppliedCoupon(estoreStore.appliedCoupon);
    });
    return unsub;
  }, []);

  const calcs = estoreStore.getCalculations();

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) return;
    const res = estoreStore.applyCoupon(code);
    if (!res.success) {
      Alert.alert('Coupon Alert', res.message);
    } else {
      setCouponCode('');
      Alert.alert('Success 🎉', res.message);
    }
  };

  const handleRemoveCoupon = () => {
    estoreStore.removeCoupon();
  };

  const handleSaveForLater = (product, variantId) => {
    estoreStore.toggleWishlist(product);
    estoreStore.removeFromCart(product.id, variantId);
    Alert.alert('Saved to Wishlist', `${product.name} has been moved to your wishlist.`);
  };

  if (cart.length === 0) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A0C13" />
        <View style={[s.headerBar, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Cart</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.emptyBox}>
          <MaterialCommunityIcons name="cart-outline" size={64} color="#C4B4A5" />
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <Text style={s.emptySub}>Explore our eStore for sacred pooja essentials, murtis & malas.</Text>
          <TouchableOpacity
            style={s.exploreBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EStore')}
          >
            <Text style={s.exploreBtnText}>Explore eStore</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={s.headerTitle}>My Cart ({calcs.itemCount})</Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <MaterialCommunityIcons name="heart-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* FREE DELIVERY TRACKER */}
        <View style={s.deliveryBadgeCard}>
          <MaterialCommunityIcons name="truck-check-outline" size={20} color="#15803D" />
          <Text style={s.deliveryBadgeText}>
            Eligible for <Text style={{ fontWeight: '800' }}>FREE Express Vedic Delivery</Text>
          </Text>
        </View>

        {/* CART ITEM CARDS */}
        <View style={s.itemsList}>
          {cart.map((item, idx) => {
            const product = item.product || {};
            const variant = item.variant || {};
            const price = Number(variant.price || product.price || 0);
            const isFav = estoreStore.isInWishlist(product.id);
            const imgUri = product.images?.[0] || product.image || product.imageUrl || 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80';

            return (
              <View key={`cart-item-${idx}`} style={s.cartItemCard}>
                <Image source={{ uri: imgUri }} style={s.itemImage} resizeMode="cover" />

                <View style={s.itemDetails}>
                  <Text style={s.itemName} numberOfLines={1}>{product.name}</Text>
                  <Text style={s.itemPrice}>₹ {price}</Text>

                  {/* Quantity Stepper & Action Buttons */}
                  <View style={s.itemBottomRow}>
                    <View style={s.stepper}>
                      <TouchableOpacity
                        style={s.stepperBtn}
                        onPress={() => estoreStore.updateQty(product.id, variant.id, item.qty - 1)}
                      >
                        <MaterialCommunityIcons name="minus" size={14} color="#3A1208" />
                      </TouchableOpacity>
                      <Text style={s.stepperText}>{item.qty}</Text>
                      <TouchableOpacity
                        style={s.stepperBtn}
                        onPress={() => estoreStore.updateQty(product.id, variant.id, item.qty + 1)}
                      >
                        <MaterialCommunityIcons name="plus" size={14} color="#3A1208" />
                      </TouchableOpacity>
                    </View>

                    <View style={s.itemActionsGroup}>
                      <TouchableOpacity
                        style={s.saveLaterBtn}
                        onPress={() => handleSaveForLater(product, variant.id)}
                      >
                        <Text style={s.saveLaterText}>Save for later</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={s.iconBtn}
                        onPress={() => estoreStore.removeFromCart(product.id, variant.id)}
                      >
                        <MaterialCommunityIcons name="delete-outline" size={20} color="#7A685D" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ========================================================================= */}
        {/* COUPON SECTION */}
        {/* ========================================================================= */}
        <View style={s.couponCard}>
          <Text style={s.couponHeading}>Apply Promo / Divine Coupon</Text>
          {appliedCoupon ? (
            <View style={s.appliedCouponBox}>
              <View>
                <Text style={s.appliedCouponCode}>Coupon {appliedCoupon.code} Applied ✓</Text>
                <Text style={s.appliedCouponDiscount}>You saved ₹{calcs.couponDiscount} on this order</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={s.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.couponInputRow}>
              <TextInput
                style={s.couponInput}
                placeholder="Enter Coupon Code (e.g. VAIDIC10)"
                placeholderTextColor="#A0887A"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={s.applyCouponBtn}
                activeOpacity={0.85}
                onPress={() => handleApplyCoupon()}
              >
                <Text style={s.applyCouponBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Apply Available Coupons */}
          {!appliedCoupon && (
            <View style={s.availableCouponsRow}>
              {DEMO_COUPONS.map((cp) => (
                <TouchableOpacity
                  key={cp.code}
                  style={s.couponChip}
                  onPress={() => handleApplyCoupon(cp.code)}
                >
                  <Text style={s.couponChipCode}>{cp.code}</Text>
                  <Text style={s.couponChipTitle}>{cp.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* PRICE SUMMARY CARD */}
        {/* ========================================================================= */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Price Breakdown</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Price ({calcs.itemCount} items)</Text>
            <Text style={s.summaryValue}>₹ {calcs.mrpTotal}</Text>
          </View>

          {calcs.catalogDiscount > 0 && (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Catalog Discount</Text>
              <Text style={s.discountValue}>- ₹ {calcs.catalogDiscount}</Text>
            </View>
          )}

          {calcs.couponDiscount > 0 && (
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Coupon Discount ({appliedCoupon?.code})</Text>
              <Text style={s.discountValue}>- ₹ {calcs.couponDiscount}</Text>
            </View>
          )}

          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Delivery Charges</Text>
            <Text style={s.freeDeliveryText}>FREE</Text>
          </View>

          <View style={[s.summaryRow, s.totalRow]}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalValue}>₹ {calcs.finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM PROCEED TO CHECKOUT */}
      <View style={[s.stickyBottom, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={s.stickyPriceBox}>
          <Text style={s.stickyPriceLabel}>Total:</Text>
          <Text style={s.stickyPriceValue}>₹ {calcs.finalTotal}</Text>
        </View>
        <TouchableOpacity
          style={s.checkoutBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={s.checkoutBtnText}>Proceed to Checkout</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
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
  deliveryBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  deliveryBadgeText: {
    fontSize: 12.5,
    color: '#15803D',
  },
  itemsList: {
    gap: 12,
  },
  cartItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    elevation: 1,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F5ECE0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#3A1208',
    marginTop: 4,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EFE5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2D5C4',
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    minWidth: 20,
    textAlign: 'center',
  },
  itemActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveLaterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  saveLaterText: {
    fontSize: 11.5,
    color: '#8E2820',
    fontWeight: '600',
  },
  iconBtn: {
    padding: 4,
  },

  // COUPON
  couponCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  couponHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FBF8F2',
    borderWidth: 1,
    borderColor: '#E2D5C4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#3A1208',
  },
  applyCouponBtn: {
    backgroundColor: '#5A1017',
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  appliedCouponBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  appliedCouponCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  appliedCouponDiscount: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  removeCouponText: {
    fontSize: 12,
    color: '#D92D20',
    fontWeight: '700',
  },
  availableCouponsRow: {
    marginTop: 10,
    gap: 6,
  },
  couponChip: {
    backgroundColor: '#FDF8F0',
    borderWidth: 1,
    borderColor: '#EAD7BA',
    borderRadius: 6,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponChipCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E2820',
    backgroundColor: '#FDEFD6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  couponChipTitle: {
    fontSize: 11,
    color: '#5C4435',
  },

  // SUMMARY CARD
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13.5,
    color: '#5C4435',
  },
  summaryValue: {
    fontSize: 13.5,
    color: '#3A1208',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 13.5,
    color: '#15803D',
    fontWeight: '700',
  },
  freeDeliveryText: {
    fontSize: 13.5,
    color: '#15803D',
    fontWeight: '800',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#F0E5D4',
    paddingTop: 12,
    marginBottom: 0,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A1208',
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#5A1017',
  },

  // STICKY BOTTOM
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#ECE3D4',
    gap: 12,
  },
  stickyPriceBox: {
    justifyContent: 'center',
  },
  stickyPriceLabel: {
    fontSize: 11,
    color: '#7A6455',
  },
  stickyPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5A1017',
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: '#5A1017',
    paddingVertical: 13,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 14.5,
    fontWeight: '700',
  },

  // EMPTY STATE
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A1208',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    color: '#8E6A56',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  exploreBtn: {
    marginTop: 20,
    backgroundColor: '#5A1017',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
