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
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif } from '../../theme/styles';
import estoreStore from '../../services/estoreStore';

export default function WishlistScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [wishlist, setWishlist] = useState(estoreStore.getWishlist());

  useEffect(() => {
    const unsub = estoreStore.subscribe(() => {
      setWishlist([...estoreStore.getWishlist()]);
    });
    return unsub;
  }, []);

  const handleAddToCart = (item) => {
    estoreStore.addToCart(item, item.variants?.[0], 1);
    Alert.alert('Added to Cart ✓', `${item.name} has been added to your cart.`, [
      { text: 'Continue', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleRemove = (item) => {
    estoreStore.removeFromWishlist(item.id);
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
        <Text style={s.headerTitle}>My Wishlist ({wishlist.length})</Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {wishlist.length === 0 ? (
          <View style={s.emptyBox}>
            <MaterialCommunityIcons name="heart-outline" size={64} color="#C4B4A5" />
            <Text style={s.emptyTitle}>Your wishlist is empty</Text>
            <Text style={s.emptySub}>Save your favorite sacred pooja items and murtis to buy later.</Text>
            <TouchableOpacity
              style={s.exploreBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EStore')}
            >
              <Text style={s.exploreBtnText}>Explore eStore</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.wishlistContainer}>
            {wishlist.map((item) => {
              const imgUri =
                item.images?.[0] ||
                item.image ||
                item.imageUrl ||
                'https://images.unsplash.com/photo-1615716175586-7e8c146d92ec?w=800&auto=format&fit=crop&q=80';

              return (
                <View key={item.id} style={s.wishCard}>
                  <TouchableOpacity
                    style={s.cardLeft}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <Image source={{ uri: imgUri }} style={s.itemImg} resizeMode="cover" />
                    <View style={s.itemInfo}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      {item.nameHi && <Text style={s.itemNameHi} numberOfLines={1}>{item.nameHi}</Text>}
                      <Text style={s.itemPrice}>₹ {item.price}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={s.cardRight}>
                    <TouchableOpacity
                      style={s.addToCartBtn}
                      activeOpacity={0.85}
                      onPress={() => handleAddToCart(item)}
                    >
                      <Text style={s.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={s.heartBtn}
                      activeOpacity={0.8}
                      onPress={() => handleRemove(item)}
                    >
                      <MaterialCommunityIcons name="heart" size={24} color="#D92D20" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  wishlistContainer: {
    gap: 12,
  },
  wishCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECE2D3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F5ECE0',
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A1208',
  },
  itemNameHi: {
    fontSize: 11,
    color: '#7A6455',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A1208',
    marginTop: 3,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addToCartBtn: {
    backgroundColor: '#5A1017',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heartBtn: {
    padding: 4,
  },

  // EMPTY STATE
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
