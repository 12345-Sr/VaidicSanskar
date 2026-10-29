import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Platform,
  Share,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore from '../../services/estoreStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const product = route?.params?.product || estoreStore.getProducts()[0];

  // Multi-angle product images gallery
  const resolveImageUri = (uri) => {
    if (!uri) return 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80';
    if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:')) {
      return uri;
    }
    const base = 'https://vaidic-sanskar-admin-suite.onrender.com';
    return `${base}${uri.startsWith('/') ? '' : '/'}${uri}`;
  };

  const rawImages = (
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : [product?.image || product?.imageUrl || 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80']
  ).map(resolveImageUri);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(estoreStore.isInWishlist(product?.id));
  const [zoomModalVisible, setZoomModalVisible] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    checked: false,
    text: 'Delivering within 3-5 business days',
    cod: true,
  });

  const mainGalleryRef = useRef(null);
  const thumbListRef = useRef(null);

  const currentPrice = Number(product?.price || 599);
  const currentMrp = Number(product?.mrp || (currentPrice ? Math.round(currentPrice * 1.35) : 899));
  const discountPct = product?.discountPct || (currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 33);

  const features = Array.isArray(product?.features) && product.features.length > 0
    ? product.features
    : ['Pure Brass', 'Traditional Design', 'Long Lasting'];

  const specifications = Array.isArray(product?.specifications) && product.specifications.length > 0
    ? product.specifications
    : [
        { label: 'Category', value: product?.categoryName || 'Pooja Samagri' },
        { label: 'Authenticity', value: '100% Certified Vedic Material' },
        { label: 'Origin', value: 'Handcrafted in Bharat' },
      ];

  const reviews = Array.isArray(product?.reviews) && product.reviews.length > 0
    ? product.reviews
    : [
        { id: 'r1', user: 'Sunita G.', rating: 5, date: '18 Oct 2026', verified: true, text: 'Very heavy and authentic material. Beautiful finish. Arrived safely packed!' },
        { id: 'r2', user: 'Ramesh K.', rating: 5, date: '12 Oct 2026', verified: true, text: 'Traditional carving is lovely. Perfect for daily mandir puja.' },
      ];

  const relatedProducts = estoreStore.getProducts().filter((p) => p.id !== product?.id).slice(0, 4);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product?.name} on VaidicSanskar eStore: Only ₹${currentPrice} (${discountPct}% OFF)!`,
      });
    } catch (_) {}
  };

  const toggleWishlist = () => {
    estoreStore.toggleWishlist(product);
    setIsWishlisted(!isWishlisted);
  };

  const checkPincode = () => {
    if (!pincode || pincode.trim().length !== 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit Indian postal code.');
      return;
    }
    setDeliveryInfo({
      checked: true,
      text: 'Delivering by 3-4 days (Express Vedic Delivery)',
      cod: true,
    });
  };

  const handleThumbnailPress = (index) => {
    setActiveImageIndex(index);
    if (mainGalleryRef.current) {
      mainGalleryRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const onGalleryScroll = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index >= 0 && index < rawImages.length && index !== activeImageIndex) {
      setActiveImageIndex(index);
      if (thumbListRef.current) {
        thumbListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  };

  const handleAddToCart = () => {
    estoreStore.addToCart(product, product?.variants?.[0], qty);
    Alert.alert('Added to Cart ✓', `${product.name} (Qty: ${qty}) has been added to your cart.`, [
      { text: 'Keep Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleBuyNow = () => {
    estoreStore.addToCart(product, product?.variants?.[0], qty);
    navigation.navigate('Cart');
  };

  return (
    <View style={s.container}>
      {/* FLOATING TOP NAVIGATION BAR */}
      <View
        style={[
          s.topNav,
          {
            paddingTop: Math.max(
              insets.top,
              Platform.OS === 'android' ? 24 : 0
            ) + 6,
          },
        ]}
      >
        <TouchableOpacity
          style={s.roundNavBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#3A1208" />
        </TouchableOpacity>

        <View style={s.topNavRight}>
          <TouchableOpacity
            style={s.roundNavBtn}
            onPress={toggleWishlist}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? '#D92D20' : '#3A1208'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.roundNavBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#3A1208" />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.roundNavBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cart-outline" size={22} color="#3A1208" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* SWIPEABLE PRODUCT IMAGE GALLERY (FLIPKART / AMAZON STYLE) */}
        {/* ========================================================================= */}
        <View style={s.galleryContainer}>
          <FlatList
            ref={mainGalleryRef}
            data={rawImages}
            keyExtractor={(_, i) => `hero-img-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onGalleryScroll}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => setZoomModalVisible(true)}
                style={s.heroSlide}
              >
                <Image source={{ uri: item }} style={s.heroImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
          />

          {/* Image Counter Indicator (e.g. 1/4) */}
          <View style={s.imageCounterBadge}>
            <MaterialCommunityIcons name="image-multiple-outline" size={13} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={s.imageCounterText}>
              {activeImageIndex + 1} / {rawImages.length}
            </Text>
          </View>

          {/* Tap-to-zoom badge hint */}
          <TouchableOpacity
            style={s.zoomHintBtn}
            onPress={() => setZoomModalVisible(true)}
          >
            <MaterialCommunityIcons name="magnify-plus-outline" size={16} color="#FFF" />
          </TouchableOpacity>

          {discountPct > 0 && (
            <View style={s.discountBadgeTag}>
              <Text style={s.discountBadgeTagText}>{discountPct}% OFF</Text>
            </View>
          )}
        </View>

        {/* CLICKABLE THUMBNAIL GALLERY STRIP */}
        {rawImages.length > 1 && (
          <View style={s.thumbnailSection}>
            <FlatList
              ref={thumbListRef}
              data={rawImages}
              keyExtractor={(_, i) => `thumb-${i}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.thumbListContent}
              renderItem={({ item, index }) => {
                const isActive = activeImageIndex === index;
                const angleLabel = index === 0 ? 'Front' : index === 1 ? 'Side' : index === 2 ? 'Top' : `Angle ${index + 1}`;
                return (
                  <TouchableOpacity
                    style={[s.thumbCard, isActive && s.thumbCardActive]}
                    activeOpacity={0.85}
                    onPress={() => handleThumbnailPress(index)}
                  >
                    <Image source={{ uri: item }} style={s.thumbImage} resizeMode="cover" />
                    <View style={[s.thumbLabelWrap, isActive && s.thumbLabelWrapActive]}>
                      <Text style={[s.thumbLabelText, isActive && s.thumbLabelTextActive]}>
                        {angleLabel}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* ========================================================================= */}
        {/* PRODUCT TITLE, RATING & PRICE CARD */}
        {/* ========================================================================= */}
        <View style={s.detailsCard}>
          <Text style={s.productTitle}>{product.name}</Text>
          {product.nameHi && <Text style={s.productTitleHi}>{product.nameHi}</Text>}

          {/* Rating & Verified Buyer row */}
          <View style={s.ratingRow}>
            <View style={s.ratingPill}>
              <Ionicons name="star" size={13} color="#FFF" />
              <Text style={s.ratingPillText}>{product.rating || 4.9}</Text>
            </View>
            <Text style={s.reviewCountText}>
              ({product.reviewsCount || 156} verified customer reviews)
            </Text>
            <View style={s.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="#15803D" />
              <Text style={s.verifiedBadgeText}>Verified</Text>
            </View>
          </View>

          {/* Price Block */}
          <View style={s.priceRow}>
            <Text style={s.priceCurrent}>₹ {currentPrice}</Text>
            {currentMrp > currentPrice && (
              <Text style={s.priceMrp}>₹ {currentMrp}</Text>
            )}
            {discountPct > 0 && (
              <View style={s.discountPill}>
                <Text style={s.discountPillText}>{discountPct}% OFF</Text>
              </View>
            )}
          </View>
          <Text style={s.taxInclusiveText}>Inclusive of all Vedic consecrated taxes & rituals</Text>

          {/* 3 Authentic Feature Badges */}
          <View style={s.featuresRow}>
            {features.slice(0, 3).map((feat, idx) => (
              <View key={`feat-${idx}`} style={s.featureCard}>
                <MaterialCommunityIcons
                  name={idx === 0 ? 'fire' : idx === 1 ? 'shield-sun-outline' : 'clock-check-outline'}
                  size={20}
                  color="#A75D18"
                />
                <Text style={s.featureText} numberOfLines={2}>{feat}</Text>
              </View>
            ))}
          </View>

          {/* Quantity Selector Row */}
          <View style={s.qtySection}>
            <Text style={s.qtyLabel}>Quantity:</Text>
            <View style={s.stepperBox}>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
              >
                <MaterialCommunityIcons name="minus" size={16} color="#3A1208" />
              </TouchableOpacity>
              <Text style={s.stepperVal}>{qty}</Text>
              <TouchableOpacity
                style={s.stepperBtn}
                onPress={() => setQty((q) => Math.min(10, q + 1))}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#3A1208" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* PINCODE DELIVERY CHECKER */}
        {/* ========================================================================= */}
        <View style={s.infoCard}>
          <Text style={s.infoCardHeading}>Check Delivery & Cash on Delivery:</Text>
          <View style={s.pincodeInputRow}>
            <Ionicons name="location-outline" size={20} color="#7A685D" style={{ marginRight: 6 }} />
            <TextInput
              style={s.pincodeInput}
              placeholder="Enter 6-digit Pincode"
              placeholderTextColor="#A0887A"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
            <TouchableOpacity style={s.pincodeCheckBtn} onPress={checkPincode}>
              <Text style={s.pincodeCheckBtnText}>Check</Text>
            </TouchableOpacity>
          </View>

          {deliveryInfo.checked && (
            <View style={s.deliveryResultsBox}>
              <View style={s.deliveryResultItem}>
                <MaterialCommunityIcons name="truck-fast-outline" size={18} color="#15803D" />
                <Text style={s.deliveryResultText}>{deliveryInfo.text}</Text>
              </View>
              <View style={s.deliveryResultItem}>
                <MaterialCommunityIcons name="cash-check" size={18} color="#15803D" />
                <Text style={s.deliveryResultText}>Cash on Delivery (COD) Available</Text>
              </View>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* PRODUCT DESCRIPTION & SPECIFICATIONS */}
        {/* ========================================================================= */}
        <View style={s.infoCard}>
          <Text style={s.infoCardHeading}>Product Description</Text>
          <Text style={s.descBody}>
            {product.description ||
              'Beautifully crafted brass pooja thali set with diya, incense holder, roli, chawal and more. Perfect for daily pooja and special occasions.'}
          </Text>

          <Text style={[s.infoCardHeading, { marginTop: 18 }]}>Specifications</Text>
          <View style={s.specsTable}>
            {specifications.map((spec, index) => (
              <View key={`spec-${index}`} style={[s.specRow, index % 2 === 1 && s.specRowAlt]}>
                <Text style={s.specLabel}>{spec.label}</Text>
                <Text style={s.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* CUSTOMER REVIEWS */}
        {/* ========================================================================= */}
        <View style={s.infoCard}>
          <View style={s.reviewsHeaderRow}>
            <Text style={s.infoCardHeading}>Customer Reviews</Text>
            <View style={s.overallRatingBox}>
              <Ionicons name="star" size={14} color="#D48817" />
              <Text style={s.overallRatingScore}>{product.rating || 4.9} / 5</Text>
            </View>
          </View>

          {reviews.map((rev) => (
            <View key={rev.id} style={s.reviewItem}>
              <View style={s.reviewUserRow}>
                <Text style={s.reviewUserName}>{rev.user}</Text>
                {rev.verified && (
                  <View style={s.reviewVerifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={12} color="#15803D" />
                    <Text style={s.reviewVerifiedText}>Verified Purchase</Text>
                  </View>
                )}
                <Text style={s.reviewDate}>{rev.date}</Text>
              </View>
              <View style={s.reviewStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={`star-${star}`}
                    name="star"
                    size={12}
                    color={star <= rev.rating ? '#D48817' : '#E0D2C0'}
                  />
                ))}
              </View>
              <Text style={s.reviewText}>{rev.text}</Text>
            </View>
          ))}
        </View>

        {/* ========================================================================= */}
        {/* RECOMMENDED PRODUCTS CAROUSEL */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <View style={[s.infoCard, { paddingRight: 0 }]}>
            <Text style={s.infoCardHeading}>Similar Sacred Essentials</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.relatedScroll}
            >
              {relatedProducts.map((rel) => (
                <TouchableOpacity
                  key={rel.id}
                  style={s.relatedCard}
                  activeOpacity={0.88}
                  onPress={() => navigation.push('ProductDetail', { product: rel })}
                >
                  <Image source={{ uri: rel.images?.[0] || rel.image }} style={s.relatedImg} resizeMode="cover" />
                  <Text style={s.relatedName} numberOfLines={1}>{rel.name}</Text>
                  <Text style={s.relatedPrice}>₹ {rel.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* STICKY BOTTOM BAR: [ADD TO CART] & [BUY NOW] */}
      {/* ========================================================================= */}
      <View style={[s.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={s.addToCartBtn}
          activeOpacity={0.85}
          onPress={handleAddToCart}
        >
          <MaterialCommunityIcons name="cart-plus" size={18} color="#5A1017" style={{ marginRight: 6 }} />
          <Text style={s.addToCartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.buyNowBtn}
          activeOpacity={0.9}
          onPress={handleBuyNow}
        >
          <Text style={s.buyNowBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* FULLSCREEN TAP-TO-ZOOM MODAL */}
      {/* ========================================================================= */}
      <Modal visible={zoomModalVisible} transparent animationType="fade">
        <View style={s.zoomModalContainer}>
          <TouchableOpacity
            style={[s.zoomCloseBtn, { top: Math.max(insets.top, 24) + 10 }]}
            onPress={() => setZoomModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <Image
            source={{ uri: rawImages[activeImageIndex] }}
            style={s.zoomFullImage}
            resizeMode="contain"
          />

          <View style={s.zoomBottomNav}>
            <Text style={s.zoomIndexText}>
              Viewing Angle {activeImageIndex + 1} of {rawImages.length}
            </Text>
            <View style={s.zoomThumbsRow}>
              {rawImages.map((uri, idx) => (
                <TouchableOpacity
                  key={`zoom-thumb-${idx}`}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[s.zoomThumbCard, activeImageIndex === idx && s.zoomThumbCardActive]}
                >
                  <Image source={{ uri }} style={s.zoomThumbImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
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
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFFAE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  scrollContent: {
    paddingTop: 0,
  },

  // FLIPKART/AMAZON SWIPEABLE GALLERY
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
    backgroundColor: '#F3EAD8',
    position: 'relative',
  },
  heroSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.95,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  zoomHintBtn: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 7,
    borderRadius: 16,
  },
  discountBadgeTag: {
    position: 'absolute',
    top: 80,
    left: 16,
    backgroundColor: '#15803D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // THUMBNAIL STRIP
  thumbnailSection: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ECE3D4',
  },
  thumbListContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbCard: {
    width: 68,
    height: 68,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E2D5C4',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FBF8F2',
  },
  thumbCardActive: {
    borderColor: '#D48817', // Gold ring indicator
    borderWidth: 2.5,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbLabelWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 1,
    alignItems: 'center',
  },
  thumbLabelWrapActive: {
    backgroundColor: '#D48817',
  },
  thumbLabelText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  thumbLabelTextActive: {
    color: '#FFF',
  },

  // DETAILS CARD
  detailsCard: {
    backgroundColor: '#FFF',
    padding: 18,
    marginTop: 8,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3A1208',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  productTitleHi: {
    fontSize: 13,
    color: '#7A6455',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCountText: {
    fontSize: 12,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  verifiedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 10,
  },
  priceCurrent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5A1017',
  },
  priceMrp: {
    fontSize: 15,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountPillText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  taxInclusiveText: {
    fontSize: 11,
    color: '#8E786B',
    marginTop: 3,
  },

  // 3 FEATURE BADGES
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FDF8F0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE4D2',
  },
  featureText: {
    fontSize: 11,
    color: '#4A2A1A',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },

  // QTY SELECTOR
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EFE5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0D2C0',
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
    minWidth: 24,
    textAlign: 'center',
  },

  // INFO CARD
  infoCard: {
    backgroundColor: '#FFF',
    padding: 18,
    marginTop: 10,
  },
  infoCardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1208',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  descBody: {
    fontSize: 13,
    color: '#5C4435',
    lineHeight: 20,
  },

  // PINCODE
  pincodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FBF8F2',
    marginTop: 6,
  },
  pincodeInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A1208',
    paddingVertical: 8,
  },
  pincodeCheckBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#5A1017',
    borderRadius: 6,
  },
  pincodeCheckBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deliveryResultsBox: {
    marginTop: 10,
    gap: 6,
  },
  deliveryResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryResultText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },

  // SPECS TABLE
  specsTable: {
    borderWidth: 1,
    borderColor: '#ECE2D3',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 6,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#F0E5D4',
  },
  specRowAlt: {
    backgroundColor: '#FAF5EE',
  },
  specLabel: {
    width: '40%',
    fontSize: 12,
    color: '#7A6455',
    fontWeight: '600',
  },
  specValue: {
    flex: 1,
    fontSize: 12,
    color: '#3A1208',
    fontWeight: '500',
  },

  // REVIEWS
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overallRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overallRatingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderColor: '#F0E5D4',
    paddingVertical: 10,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
    marginRight: 6,
  },
  reviewVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: 'auto',
  },
  reviewVerifiedText: {
    fontSize: 10,
    color: '#15803D',
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 11,
    color: '#8E786B',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    marginVertical: 4,
    gap: 2,
  },
  reviewText: {
    fontSize: 12,
    color: '#5C4435',
    lineHeight: 17,
  },

  // RELATED PRODUCTS
  relatedScroll: {
    paddingTop: 8,
    gap: 12,
  },
  relatedCard: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ECE2D3',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#FAF5EE',
  },
  relatedImg: {
    width: '100%',
    height: 85,
    borderRadius: 8,
    backgroundColor: '#F0E5D4',
  },
  relatedName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A1208',
    marginTop: 6,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5A1017',
    marginTop: 2,
  },

  // STICKY BOTTOM BAR
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#ECE3D4',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#5A1017',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtnText: {
    color: '#5A1017',
    fontSize: 14,
    fontWeight: '700',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#5A1017',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A1017',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buyNowBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ZOOM MODAL
  zoomModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  zoomFullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  zoomBottomNav: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  zoomIndexText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  zoomThumbsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  zoomThumbCard: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  zoomThumbCardActive: {
    borderColor: '#D48817',
    borderWidth: 2.5,
  },
  zoomThumbImg: {
    width: '100%',
    height: '100%',
  },
});
