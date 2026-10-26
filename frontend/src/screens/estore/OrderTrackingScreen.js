import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore from '../../services/estoreStore';

export default function OrderTrackingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState(estoreStore.orders);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PROCESSING, SHIPPED, DELIVERED, CANCELLED

  const initialOrderId = route.params?.orderId || null;
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const unsub = estoreStore.subscribe(() => {
      setOrders([...estoreStore.orders]);
    });
    return unsub;
  }, []);

  const activeOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || orders[0];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return (o.status || '').toUpperCase() === activeTab;
  });

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    const res = estoreStore.cancelOrder(activeOrder.id, cancelReason);
    setShowCancelModal(false);
    setCancelReason('');
    Alert.alert('Order Update', res.message);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A0C13" />

      {/* MAROON HEADER */}
      <View style={[s.headerBar, { paddingTop: Math.max(insets.top, 24) + 6 }]}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => {
            if (selectedOrderId) {
              setSelectedOrderId(null);
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {selectedOrderId ? 'Track Order' : 'My Orders'}
        </Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <MaterialCommunityIcons name="cart-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* VIEW A: MY ORDERS LIST WITH STATUS TABS */}
        {/* ========================================================================= */}
        {!selectedOrderId && (
          <>
            {/* Filter Tabs Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterTabsRow}
            >
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'SHIPPED', label: 'Shipped' },
                { id: 'DELIVERED', label: 'Delivered' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[s.filterTab, isActive && s.filterTabActive]}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <Text style={[s.filterTabText, isActive && s.filterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <View style={s.emptyOrdersBox}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={56} color="#C4B4A5" />
                <Text style={s.emptyOrdersTitle}>No orders in this category</Text>
                <TouchableOpacity
                  style={s.exploreBtn}
                  onPress={() => navigation.navigate('EStore')}
                >
                  <Text style={s.exploreBtnText}>Shop Sacred Items</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.ordersList}>
                {filteredOrders.map((order) => {
                  const firstItem = order.items?.[0] || {};
                  const imgUri =
                    firstItem.image ||
                    'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80';

                  const status = (order.status || 'PROCESSING').toUpperCase();
                  const isDelivered = status === 'DELIVERED';
                  const isShipped = status === 'SHIPPED';
                  const isProcessing = status === 'PROCESSING';
                  const isCancelled = status === 'CANCELLED';

                  return (
                    <View key={order.id} style={s.orderCard}>
                      <View style={s.orderCardTop}>
                        <Image source={{ uri: imgUri }} style={s.orderImg} resizeMode="cover" />

                        <View style={s.orderCardDetails}>
                          <Text style={s.orderCardTitle} numberOfLines={1}>
                            {firstItem.name || 'Pooja Thali Set (Brass)'}
                          </Text>
                          <Text style={s.orderCardId}>Order ID: {order.orderNumber}</Text>
                          <Text style={s.orderCardPrice}>₹ {order.total}</Text>

                          {/* Status Badge */}
                          <View
                            style={[
                              s.orderStatusBadge,
                              isDelivered && s.badgeDelivered,
                              isShipped && s.badgeShipped,
                              isProcessing && s.badgeProcessing,
                              isCancelled && s.badgeCancelled,
                            ]}
                          >
                            <Text
                              style={[
                                s.orderStatusText,
                                isDelivered && s.badgeTextDelivered,
                                isShipped && s.badgeTextShipped,
                                isProcessing && s.badgeTextProcessing,
                                isCancelled && s.badgeTextCancelled,
                              ]}
                            >
                              {order.statusLabel || order.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={s.orderCardFooter}>
                        <Text style={s.orderPlacedDate}>
                          {order.dateDisplay || `Placed on ${order.placedAt}`}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setSelectedOrderId(order.id)}
                        >
                          <Text style={s.viewDetailsLink}>Track Order ›</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: ORDER TRACKING TIMELINE & SHIPMENT UPDATES */}
        {/* ========================================================================= */}
        {selectedOrderId && activeOrder && (
          <>
            {/* Product Summary Header Card */}
            <View style={s.trackHeaderCard}>
              <Image
                source={{
                  uri:
                    activeOrder.items?.[0]?.image ||
                    'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
                }}
                style={s.trackImg}
                resizeMode="cover"
              />
              <View style={s.trackHeaderDetails}>
                <Text style={s.trackProductName} numberOfLines={1}>
                  {activeOrder.items?.[0]?.name || 'Pooja Thali Set (Brass)'}
                </Text>
                <Text style={s.trackOrderId}>Order ID: {activeOrder.orderNumber}</Text>
                <Text style={s.trackPrice}>₹ {activeOrder.total}</Text>
              </View>
            </View>

            {/* Stepper Timeline Card */}
            <View style={s.timelineCard}>
              <Text style={s.timelineHeading}>Order Status & Timeline</Text>
              {(activeOrder.trackingEvents || []).map((step, index, arr) => {
                const isLast = index === arr.length - 1;
                const isDone = step.completed;

                return (
                  <View key={`step-${index}`} style={s.timelineStepRow}>
                    <View style={s.stepLeftCol}>
                      <View style={[s.stepDot, isDone && s.stepDotDone]}>
                        {isDone ? (
                          <MaterialCommunityIcons name="check" size={13} color="#FFF" />
                        ) : (
                          <View style={s.stepDotPendingInner} />
                        )}
                      </View>
                      {!isLast && <View style={[s.stepLine, isDone && s.stepLineDone]} />}
                    </View>

                    <View style={s.stepRightCol}>
                      <Text style={[s.stepTitle, isDone && s.stepTitleDone]}>
                        {step.status}
                      </Text>
                      <Text style={s.stepTime}>{step.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Delivery Route Map Card */}
            <View style={s.mapCard}>
              <View style={s.mapVisualBox}>
                <View style={s.mapRouteLine} />
                <View style={s.mapPinPulse}>
                  <Ionicons name="location-sharp" size={26} color="#D92D20" />
                </View>
                <View style={s.mapVanBox}>
                  <MaterialCommunityIcons name="truck-delivery" size={22} color="#15803D" />
                </View>
              </View>

              <View style={s.mapStatusContent}>
                <Text style={s.mapStatusTitle}>Your sacred order is on the way</Text>
                <Text style={s.mapStatusSub}>
                  Estimated Delivery: {activeOrder.expectedDelivery || '3 - 5 Working Days'}
                </Text>
              </View>
            </View>

            {/* Delivery Address Review */}
            <View style={s.shippingReviewCard}>
              <Text style={s.shippingReviewTitle}>Delivery Address:</Text>
              <Text style={s.shippingReviewText}>
                {activeOrder.address?.name || 'Rahul Sharma'}
                {'\n'}{activeOrder.address?.address || '101, Sunrise Apartment, Sector 12'}
                {'\n'}{activeOrder.address?.city || 'New Delhi'} - {activeOrder.address?.pincode || '110001'}
              </Text>
            </View>

            {/* Cancel Button if eligible */}
            {activeOrder.status === 'PROCESSING' && (
              <TouchableOpacity
                style={s.cancelOrderBtn}
                onPress={() => setShowCancelModal(true)}
              >
                <Text style={s.cancelOrderBtnText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* CANCEL ORDER MODAL */}
      <Modal visible={showCancelModal} transparent animationType="slide">
        <View style={s.cancelModalOverlay}>
          <View style={s.cancelModalBox}>
            <Text style={s.cancelModalTitle}>Cancel Order</Text>
            <Text style={s.cancelModalSub}>Please provide a reason for cancelling this order:</Text>
            <TextInput
              style={s.cancelInput}
              placeholder="e.g. Ordered by mistake, wrong address"
              placeholderTextColor="#A0887A"
              value={cancelReason}
              onChangeText={setCancelReason}
            />
            <View style={s.cancelModalActions}>
              <TouchableOpacity
                style={s.cancelModalBackBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={s.cancelModalBackText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.cancelModalConfirmBtn}
                onPress={handleCancelOrder}
              >
                <Text style={s.cancelModalConfirmText}>Confirm Cancel</Text>
              </TouchableOpacity>
            </View>
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

  // FILTER TABS
  filterTabsRow: {
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2D5C4',
  },
  filterTabActive: {
    backgroundColor: '#4A0C13',
    borderColor: '#4A0C13',
  },
  filterTabText: {
    fontSize: 13,
    color: '#5C4435',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#FFF',
  },

  // ORDERS LIST
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2D3',
  },
  orderCardTop: {
    flexDirection: 'row',
  },
  orderImg: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#F7EFE1',
  },
  orderCardDetails: {
    flex: 1,
    marginLeft: 14,
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  orderCardId: {
    fontSize: 12,
    color: '#7A6455',
    marginTop: 2,
  },
  orderCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A1208',
    marginTop: 4,
  },
  orderStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  badgeProcessing: {
    backgroundColor: '#FEF3C7',
  },
  badgeShipped: {
    backgroundColor: '#E0F2FE',
  },
  badgeDelivered: {
    backgroundColor: '#DCFCE7',
  },
  badgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextProcessing: {
    color: '#B45309',
  },
  badgeTextShipped: {
    color: '#0369A1',
  },
  badgeTextDelivered: {
    color: '#15803D',
  },
  badgeTextCancelled: {
    color: '#B91C1C',
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F0E5D4',
  },
  orderPlacedDate: {
    fontSize: 11,
    color: '#8E786B',
  },
  viewDetailsLink: {
    fontSize: 13,
    color: '#8E2820',
    fontWeight: '700',
  },

  // TRACK ORDER DETAILS
  trackHeaderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    marginBottom: 14,
  },
  trackImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F5EBE0',
  },
  trackHeaderDetails: {
    flex: 1,
    marginLeft: 14,
  },
  trackProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1208',
  },
  trackOrderId: {
    fontSize: 12,
    color: '#7A6455',
    marginTop: 2,
  },
  trackPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A1208',
    marginTop: 4,
  },

  // TIMELINE
  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE2D3',
    marginBottom: 14,
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 14,
  },
  timelineStepRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  stepLeftCol: {
    width: 26,
    alignItems: 'center',
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5D8C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: '#15803D',
  },
  stepDotPendingInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A89785',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5D8C7',
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: '#15803D',
  },
  stepRightCol: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8E786B',
  },
  stepTitleDone: {
    fontWeight: '700',
    color: '#3A1208',
  },
  stepTime: {
    fontSize: 11,
    color: '#8E786B',
    marginTop: 2,
  },

  // MAP CARD
  mapCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    marginBottom: 14,
  },
  mapVisualBox: {
    height: 110,
    backgroundColor: '#F3EAD8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapRouteLine: {
    position: 'absolute',
    left: 40,
    right: 40,
    height: 3,
    backgroundColor: '#D4881777',
    borderStyle: 'dashed',
  },
  mapPinPulse: {
    position: 'absolute',
    right: 40,
    top: 35,
  },
  mapVanBox: {
    position: 'absolute',
    left: 80,
    top: 40,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 16,
    elevation: 2,
  },
  mapStatusContent: {
    padding: 14,
    alignItems: 'center',
  },
  mapStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  mapStatusSub: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    marginTop: 2,
  },

  // SHIPPING REVIEW CARD
  shippingReviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE2D3',
    marginBottom: 14,
  },
  shippingReviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 4,
  },
  shippingReviewText: {
    fontSize: 12.5,
    color: '#6B5A4E',
    lineHeight: 18,
  },

  // CANCEL BUTTON
  cancelOrderBtn: {
    borderWidth: 1,
    borderColor: '#D92D20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelOrderBtnText: {
    color: '#D92D20',
    fontSize: 13,
    fontWeight: '700',
  },

  // CANCEL MODAL
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cancelModalBox: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  cancelModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A1208',
  },
  cancelModalSub: {
    fontSize: 12.5,
    color: '#7A6455',
    marginTop: 4,
    marginBottom: 12,
  },
  cancelInput: {
    borderWidth: 1,
    borderColor: '#E2D5C4',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#3A1208',
    backgroundColor: '#FBF8F2',
  },
  cancelModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelModalBackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelModalBackText: {
    color: '#7A6455',
    fontWeight: '600',
  },
  cancelModalConfirmBtn: {
    backgroundColor: '#D92D20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelModalConfirmText: {
    color: '#FFF',
    fontWeight: '700',
  },

  // EMPTY
  emptyOrdersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyOrdersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A1208',
    marginTop: 12,
  },
  exploreBtn: {
    marginTop: 16,
    backgroundColor: '#5A1017',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
