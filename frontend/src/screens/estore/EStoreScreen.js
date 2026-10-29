import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore, { STORE_CATEGORIES, PROMO_BANNERS } from '../../services/estoreStore';
import { StoreService } from '../../services/api';
import socketService from '../../services/socket';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

export default function EStoreScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialCat = route?.params?.category || 'all';

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [sortBy, setSortBy] = useState('popular'); // popular, price_asc, price_desc, rating
  const [cart, setCart] = useState(estoreStore.getCart());
  const [wishlist, setWishlist] = useState(estoreStore.getWishlist());
  const [products, setProducts] = useState(estoreStore.getProducts());
  const [refreshing, setRefreshing] = useState(false);
  const bannerSliderRef = useRef(null);

  const resolveImageUri = (uri) => {
    if (!uri) return 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80';
    if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:')) {
      return uri;
    }
    const base = 'https://vaidic-sanskar-admin-suite.onrender.com';
    return `${base}${uri.startsWith('/') ? '' : '/'}${uri}`;
  };

  const loadLiveProducts = useCallback(async () => {
    try {
      const res = await StoreService.products();
      const raw = Array.isArray(res) ? res : (res?.products || res?.data || []);
      if (raw && raw.length > 0) {
        const mapped = raw.map((p) => {
          const rawImgList = Array.isArray(p.images) && p.images.length
            ? p.images.map(resolveImageUri)
            : [resolveImageUri(p.image || p.imageUrl || 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80')];

          return {
            id: String(p._id || p.id),
            name: p.name || p.title || 'Vedic Product',
            nameHi: p.nameHi || p.name,
            category: p.category || 'pooja_essentials',
            subCategory: p.subCategory || 'all',
            categoryName: p.categoryName || 'Pooja Essentials',
            rating: Number(p.rating || 4.9),
            reviewsCount: Number(p.reviewsCount || 120),
            price: Number(p.price || 499),
            mrp: Number(p.mrp || (p.price ? Math.round(p.price * 1.35) : 699)),
            discountPct: p.discountPct || (p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 30),
            image: rawImgList[0],
            imageUrl: rawImgList[0],
            images: rawImgList,
          features: Array.isArray(p.features) && p.features.length
            ? p.features
            : ['Pure Brass', 'Traditional Design', 'Long Lasting'],
          description: p.description || 'Authentic traditional devotional item.',
          isBestseller: !!p.isBestseller,
          isFeatured: !!p.isFeatured,
          isNewArrival: !!p.isNewArrival,
          variants: Array.isArray(p.variants) && p.variants.length
            ? p.variants
            : [
                {
                  id: `v-${p._id || p.id}`,
                  name: 'Standard Pack',
                  price: Number(p.price || 499),
                  mrp: Number(p.mrp || 699),
                  stock: Number(p.stock || 20),
                },
              ],
          };
        });
        setProducts(mapped);
        estoreStore.setProducts(mapped);
      }
    } catch (_) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLiveProducts();
      setCart([...estoreStore.getCart()]);
      setWishlist([...estoreStore.getWishlist()]);
    }, [loadLiveProducts])
  );

  useEffect(() => {
    loadLiveProducts();
    const unsub = estoreStore.subscribe(() => {
      setCart([...estoreStore.getCart()]);
      setWishlist([...estoreStore.getWishlist()]);
      setProducts([...estoreStore.getProducts()]);
    });

    const handleProductSocketUpdate = () => {
      loadLiveProducts();
    };
    const unsubSocket = socketService.on('store:products_updated', handleProductSocketUpdate);

    return () => {
      unsub();
      if (typeof unsubSocket === 'function') {
        unsubSocket();
      } else if (socketService && typeof socketService.off === 'function') {
        socketService.off('store:products_updated', handleProductSocketUpdate);
      }
    };
  }, [loadLiveProducts]);

  // Auto sliding banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % PROMO_BANNERS.length;
        try {
          bannerSliderRef.current?.scrollToOffset({
            offset: next * BANNER_WIDTH,
            animated: true,
          });
        } catch (_) {}
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLiveProducts();
    setRefreshing(false);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Category alias mapping ensuring 100% forward & backward compatibility with Admin and DB
  const categoryAliases = {
    kits: ['kits', 'pooja_essentials', 'kit'],
    diya: ['diya', 'diya_lamps', 'deepak'],
    havan: ['havan', 'havan_samagri'],
    dhoop: ['dhoop', 'dhoop_agarbatti', 'incense_dhoop', 'incense'],
    murti: ['murti', 'idols_murtis', 'idol', 'idols'],
    bartan: ['bartan', 'brass_utensils', 'utensils'],
    mala: ['mala', 'rudraksha_mala', 'rudraksha'],
    vastra: ['vastra', 'vastra_aasan', 'aasan'],
    pavitra: ['pavitra', 'gangajal_dravya', 'kalash_dravya', 'gangajal'],
    yantra: ['yantra', 'yantra_jyotish', 'yantra_vastu'],
    books: ['books', 'vedic_books', 'books_scriptures'],
    prasad: ['prasad', 'prasad_bhog', 'spiritual_gifts'],
  };

  const currentCategoryObj = STORE_CATEGORIES.find((c) => c.id === selectedCat);

  // Filter & Sort
  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all') {
      const allowed = categoryAliases[selectedCat] || [selectedCat];
      const prodCat = (p.category || '').toLowerCase();
      const catMatch =
        allowed.includes(prodCat) ||
        (p.categoryName && currentCategoryObj?.name && p.categoryName.toLowerCase().includes(currentCategoryObj.name.toLowerCase()));
      if (!catMatch) return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const match =
        (p.name || '').toLowerCase().includes(q) ||
        (p.nameHi || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  const bestsellers = products.filter((p) => p.isBestseller || p.rating >= 4.9);
  const featured = products.filter((p) => p.isFeatured);
  const newArrivals = products.filter((p) => p.isNewArrival || p.category === 'yantra');

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A0C13" />

      {/* TOP MAROON HEADER */}
      <View
        style={[
          s.headerBar,
          {
            paddingTop: Math.max(
              insets.top,
              Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
            ) + 4,
          },
        ]}
      >
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => {
            if (selectedCat !== 'all') {
              setSelectedCat('all');
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={s.headerTitle} numberOfLines={1}>
          {selectedCat !== 'all' ? (currentCategoryObj?.name || 'Category') : 'eStore'}
        </Text>

        <View style={s.headerRightActions}>
          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => navigation.navigate('OrderTracking')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="heart-outline" size={23} color="#FFF" />
            {wishlist.length > 0 && (
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>{wishlist.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.headerBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cart-outline" size={23} color="#FFF" />
            {totalCartCount > 0 && (
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#7E2018']} />}
      >
        {/* ========================================================================= */}
        {/* SEARCH BAR (LIVE SUGGESTIONS & FILTERING) */}
        {/* ========================================================================= */}
        <View style={s.searchBarContainer}>
          <Ionicons name="search-outline" size={19} color="#8E6A56" style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="Search for pooja thali, diya, rudraksha, murtis..."
            placeholderTextColor="#A0887A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8E6A56" />
            </TouchableOpacity>
          )}
        </View>

        {/* If user is on 'all' and not searching, show full shopping home experience */}
        {selectedCat === 'all' && !searchQuery ? (
          <>
            {/* PROMOTIONAL BANNER CAROUSEL (AUTO-SLIDING & MANUAL SWIPE) */}
            <View style={s.carouselWrapper}>
              <FlatList
                ref={bannerSliderRef}
                data={PROMO_BANNERS}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                  length: BANNER_WIDTH,
                  offset: BANNER_WIDTH * index,
                  index,
                })}
                onScrollToIndexFailed={() => {}}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                  if (idx >= 0 && idx < PROMO_BANNERS.length) setActiveBannerIndex(idx);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.promoBannerCard}
                    activeOpacity={0.92}
                    onPress={() => {
                      setSelectedCat('kits');
                    }}
                  >
                    <View style={s.promoBannerContent}>
                      <View style={s.promoTagBadge}>
                        <Text style={s.promoTagText}>{item.tag}</Text>
                      </View>
                      <Text style={s.promoBannerTitle}>{item.title}</Text>
                      <Text style={s.promoBannerSub}>{item.subtitle}</Text>
                      <View style={s.promoDiscountPill}>
                        <Text style={s.promoDiscountText}>{item.discount}</Text>
                      </View>
                    </View>
                    <Image source={{ uri: item.image }} style={s.promoBannerImg} resizeMode="cover" />
                  </TouchableOpacity>
                )}
              />

              {/* Pagination Dots */}
              <View style={s.paginationDotsRow}>
                {PROMO_BANNERS.map((_, i) => (
                  <View
                    key={`dot-${i}`}
                    style={[s.dot, activeBannerIndex === i && s.dotActive]}
                  />
                ))}
              </View>
            </View>

            {/* PRODUCT CATEGORIES (CIRCULAR GRID WITH REAL PHOTOS) */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Shop by Sacred Category</Text>
            </View>
            <View style={s.categoryGrid}>
              {STORE_CATEGORIES.slice(1).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={s.categoryCol}
                  activeOpacity={0.82}
                  onPress={() => setSelectedCat(cat.id)}
                >
                  <View style={s.categoryCircle}>
                    {cat.image ? (
                      <Image
                        source={{ uri: cat.image }}
                        style={s.categoryImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 24 }}>{cat.icon || '🕉️'}</Text>
                    )}
                  </View>
                  <Text style={s.categoryLabel} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* BESTSELLERS HORIZONTAL CAROUSEL */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Bestselling Sacred Essentials</Text>
              <TouchableOpacity onPress={() => setSelectedCat('all')}>
                <Text style={s.viewAllLink}>View All  →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalRowScroll}
            >
              {bestsellers.map((item) => (
                <ProductHorizontalCard
                  key={`best-${item.id}`}
                  item={item}
                  navigation={navigation}
                />
              ))}
            </ScrollView>

            {/* FEATURED SPIRITUAL ITEMS HORIZONTAL CAROUSEL */}
            <View style={[s.sectionHeader, { marginTop: 18 }]}>
              <Text style={s.sectionTitle}>Featured Consecrated Items</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalRowScroll}
            >
              {featured.map((item) => (
                <ProductHorizontalCard
                  key={`feat-${item.id}`}
                  item={item}
                  navigation={navigation}
                />
              ))}
            </ScrollView>

            {/* NEW ARRIVALS HORIZONTAL CAROUSEL */}
            <View style={[s.sectionHeader, { marginTop: 18 }]}>
              <Text style={s.sectionTitle}>New Arrivals & Consecrations</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.horizontalRowScroll}
            >
              {newArrivals.map((item) => (
                <ProductHorizontalCard
                  key={`new-${item.id}`}
                  item={item}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          /* ========================================================================= */
          /* CATEGORY PRODUCT LIST / SEARCH RESULTS */
          /* ========================================================================= */
          <>
            {/* Quick Category Filter Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.quickCatScroll}
            >
              {STORE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={`pill-${cat.id}`}
                  style={[
                    s.quickCatPill,
                    selectedCat === cat.id && s.quickCatPillActive,
                  ]}
                  onPress={() => setSelectedCat(cat.id)}
                  activeOpacity={0.8}
                >
                  {cat.image ? (
                    <Image
                      source={{ uri: cat.image }}
                      style={s.quickCatThumb}
                      resizeMode="cover"
                    />
                  ) : null}
                  <Text
                    style={[
                      s.quickCatText,
                      selectedCat === cat.id && s.quickCatTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Subheader Banner */}
            {selectedCat !== 'all' && (
              <View style={s.categoryBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={s.categoryBannerTitle}>
                    {currentCategoryObj?.name || 'Sacred Collection'}
                  </Text>
                  <Text style={s.categoryBannerSub}>
                    Authentic and consecrated for your home temple & daily prayers
                  </Text>
                </View>
                <View style={s.categoryIconWrap}>
                  {currentCategoryObj?.image ? (
                    <Image
                      source={{ uri: currentCategoryObj.image }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 26 }}>{currentCategoryObj?.icon || '🕉️'}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Sort Filter Tabs Row */}
            <View style={s.sortBarRow}>
              <Text style={s.resultsCountText}>
                {filteredProducts.length} items found
              </Text>
              <View style={s.sortPills}>
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'rating', label: 'Rating' },
                  { id: 'price_asc', label: 'Price ↑' },
                  { id: 'price_desc', label: 'Price ↓' },
                ].map((sTab) => (
                  <TouchableOpacity
                    key={sTab.id}
                    style={[s.sortPill, sortBy === sTab.id && s.sortPillActive]}
                    onPress={() => setSortBy(sTab.id)}
                  >
                    <Text style={[s.sortPillText, sortBy === sTab.id && s.sortPillTextActive]}>
                      {sTab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Product Vertical List */}
            <View style={s.productListContainer}>
              {filteredProducts.map((item) => {
                const isFav = estoreStore.isInWishlist(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={s.productRowCard}
                    activeOpacity={0.92}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View style={s.productRowImgBox}>
                      <Image
                        source={{ uri: item.images?.[0] || item.image }}
                        style={s.productRowImg}
                        resizeMode="cover"
                      />
                      {item.discountPct > 0 && (
                        <View style={s.rowDiscountBadge}>
                          <Text style={s.rowDiscountText}>{item.discountPct}% OFF</Text>
                        </View>
                      )}
                    </View>

                    <View style={s.productRowInfo}>
                      <Text style={s.productRowName} numberOfLines={1}>{item.name}</Text>
                      {item.nameHi && <Text style={s.productRowNameHi} numberOfLines={1}>{item.nameHi}</Text>}

                      <View style={s.productRowRating}>
                        <Ionicons name="star" size={13} color="#D48817" />
                        <Text style={s.productRowRatingText}>
                          {item.rating || 4.8} ({item.reviewsCount || 120} reviews)
                        </Text>
                      </View>

                      <View style={s.productRowPriceRow}>
                        <Text style={s.productRowPrice}>₹ {item.price}</Text>
                        {item.mrp > item.price && (
                          <Text style={s.productRowMrp}>₹ {item.mrp}</Text>
                        )}
                      </View>

                      <View style={s.productRowActions}>
                        <TouchableOpacity
                          style={s.rowAddToCartBtn}
                          activeOpacity={0.85}
                          onPress={() => estoreStore.addToCart(item, item.variants?.[0], 1)}
                        >
                          <MaterialCommunityIcons name="cart-plus" size={15} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={s.rowAddToCartText}>Add to Cart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={s.rowHeartBtn}
                          activeOpacity={0.8}
                          onPress={() => estoreStore.toggleWishlist(item)}
                        >
                          <MaterialCommunityIcons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFav ? '#D92D20' : '#8E6A56'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* FLOATING CART BAR */}
      {totalCartCount > 0 && (
        <View style={[s.floatingCartBar, { bottom: insets.bottom + 8 }]}>
          <View>
            <Text style={s.floatingCartCount}>{totalCartCount} item(s) in cart</Text>
            <Text style={s.floatingCartTotal}>Total: ₹ {estoreStore.getCalculations().finalTotal}</Text>
          </View>
          <TouchableOpacity
            style={s.floatingCartBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={s.floatingCartBtnText}>View Cart  →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Reusable Horizontal Product Card Component
function ProductHorizontalCard({ item, navigation }) {
  const isFav = estoreStore.isInWishlist(item.id);
  return (
    <TouchableOpacity
      style={s.popularCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={s.popularImgWrapper}>
        <Image
          source={{ uri: item.images?.[0] || item.image || item.imageUrl }}
          style={s.popularImg}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={s.popularFavBtn}
          onPress={() => estoreStore.toggleWishlist(item)}
        >
          <MaterialCommunityIcons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#D92D20' : '#8E6A56'}
          />
        </TouchableOpacity>
      </View>

      <Text style={s.popularTitle} numberOfLines={1}>{item.name}</Text>
      <View style={s.popularRatingRow}>
        <Ionicons name="star" size={13} color="#D48817" />
        <Text style={s.popularRatingText}>{item.rating || 4.9}</Text>
      </View>

      <View style={s.popularPriceRow}>
        <Text style={s.popularPrice}>₹ {item.price}</Text>
        {item.mrp > item.price && <Text style={s.popularMrp}>₹ {item.mrp}</Text>}
      </View>
    </TouchableOpacity>
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
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#D48817',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: 12,
  },

  // SEARCH BAR
  searchBarContainer: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: '#E8DCCB',
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#3A1208',
  },

  // PROMOTIONAL BANNER CAROUSEL
  carouselWrapper: {
    marginBottom: 16,
  },
  promoBannerCard: {
    width: BANNER_WIDTH,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#380B0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingVertical: 14,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#D4881740',
  },
  promoBannerContent: {
    flex: 1,
    paddingRight: 8,
  },
  promoTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D48817',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  promoTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoBannerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  promoBannerSub: {
    color: '#ECC187',
    fontSize: 11,
    marginTop: 4,
  },
  promoDiscountPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  promoDiscountText: {
    color: '#FDF0CD',
    fontSize: 11,
    fontWeight: '700',
  },
  promoBannerImg: {
    width: 85,
    height: 85,
    borderRadius: 12,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9C6B2',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#5A1017',
  },

  // CATEGORIES
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A1208',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  viewAllLink: {
    fontSize: 13,
    color: '#8E2820',
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  categoryCol: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FDEFD6',
    borderWidth: 2,
    borderColor: '#E6BC7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    shadowColor: '#7E2018',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  categoryLabel: {
    fontSize: 10.5,
    color: '#4B3621',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  quickCatScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
  },
  quickCatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBD4B8',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  quickCatPillActive: {
    backgroundColor: '#7E2018',
    borderColor: '#7E2018',
  },
  quickCatThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  quickCatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C381E',
  },
  quickCatTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  // HORIZONTAL PRODUCTS
  horizontalRowScroll: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 14,
  },
  popularCard: {
    width: 130,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EFE7DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  popularImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3EAD8',
  },
  popularImg: {
    width: '100%',
    height: '100%',
  },
  popularFavBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFFAA',
    borderRadius: 12,
    padding: 4,
  },
  popularTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A1208',
    marginTop: 8,
  },
  popularRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  popularRatingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  popularPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  popularPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A1208',
  },
  popularMrp: {
    fontSize: 10,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },

  // CATEGORY LIST VIEW
  categoryBanner: {
    marginHorizontal: 16,
    backgroundColor: '#4A0C13',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBannerTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : serif,
  },
  categoryBannerSub: {
    color: '#F4D49B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 12,
    color: '#7A6455',
    fontWeight: '600',
  },
  sortPills: {
    flexDirection: 'row',
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2D5C4',
  },
  sortPillActive: {
    backgroundColor: '#4A0C13',
    borderColor: '#4A0C13',
  },
  sortPillText: {
    fontSize: 11,
    color: '#5C4435',
    fontWeight: '600',
  },
  sortPillTextActive: {
    color: '#FFF',
  },

  // PRODUCT ROW CARDS
  productListContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productRowCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECE2D3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  productRowImgBox: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F7EFE1',
    position: 'relative',
  },
  productRowImg: {
    width: '100%',
    height: '100%',
  },
  rowDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#15803D',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rowDiscountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productRowInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  productRowNameHi: {
    fontSize: 11,
    color: '#7A6455',
  },
  productRowRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  productRowRatingText: {
    fontSize: 11,
    color: '#666',
  },
  productRowPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  productRowPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3A1208',
  },
  productRowMrp: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  productRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rowAddToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A1017',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rowAddToCartText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rowHeartBtn: {
    padding: 4,
  },

  // FLOATING CART BAR
  floatingCartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#380B0F',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  floatingCartCount: {
    color: '#F4D49B',
    fontSize: 12,
    fontWeight: '600',
  },
  floatingCartTotal: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  floatingCartBtn: {
    backgroundColor: '#D48817',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  floatingCartBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
