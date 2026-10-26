import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import colors from '../../theme/colors';
import {
  getCurrentUserLocation,
  getNearbyPandits,
  DEFAULT_COORDS,
} from '../../services/mapplsService';
import MapplsMapView from '../../components/MapplsMapView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RADIUS_OPTIONS = [
  { label_en: '2 km', label_hi: '2 किमी', value: 2 },
  { label_en: '5 km', label_hi: '5 किमी', value: 5 },
  { label_en: '10 km', label_hi: '10 किमी', value: 10 },
  { label_en: '25 km', label_hi: '25 किमी', value: 25 },
];

const SPECIALTY_OPTIONS = [
  { label_en: 'All Poojas', label_hi: 'सभी पूजा', value: 'All' },
  { label_en: 'Griha Pravesh', label_hi: 'गृह प्रवेश', value: 'गृह प्रवेश' },
  { label_en: 'Rudrabhishek', label_hi: 'रुद्राभिषेक', value: 'रुद्राभिषेक' },
  { label_en: 'Satyanarayan', label_hi: 'सत्यनारायण कथा', value: 'सत्यनारायण' },
  { label_en: 'Vivah Sanskar', label_hi: 'विवाह संस्कार', value: 'विवाह' },
  { label_en: 'Vastu Shanti', label_hi: 'वास्तु शांति', value: 'वास्तु' },
  { label_en: 'Havan & Yagya', label_hi: 'हवन एवं यज्ञ', value: 'हवन' },
];

export default function NearbyPanditsMapScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
  const bottomInset = Math.max(insets.bottom, 16);

  const { isHindi, getText } = useLanguage();
  const { user } = useApp();

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_COORDS);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedPandit, setSelectedPandit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch current GPS location
  useEffect(() => {
    async function initLocation() {
      setLoading(true);
      const res = await getCurrentUserLocation();
      if (res?.coords) {
        setUserLocation(res.coords);
      }
      setLoading(false);
    }
    initLocation();
  }, []);

  // 2. Fetch nearby pandits based on location and filters
  const panditsList = useMemo(() => {
    const list = getNearbyPandits(
      userLocation.latitude,
      userLocation.longitude,
      selectedRadius,
      selectedSpecialty
    );

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }, [userLocation, selectedRadius, selectedSpecialty, searchQuery]);

  // Auto-select first pandit when list changes
  useEffect(() => {
    if (panditsList.length > 0 && !selectedPandit) {
      setSelectedPandit(panditsList[0]);
    } else if (panditsList.length > 0 && selectedPandit) {
      const stillInList = panditsList.find((p) => p.id === selectedPandit.id);
      if (!stillInList) setSelectedPandit(panditsList[0]);
    }
  }, [panditsList]);

  const handleBookPandit = (pandit) => {
    navigation.navigate('PujaBooking', {
      preselectedPandit: pandit,
      puja: {
        title_hi: `${pandit.name} द्वारा वैदिक पूजा`,
        title_en: `Vedic Puja with ${pandit.name}`,
        fee: pandit.fee,
      },
    });
  };

  const handleCallPandit = (pandit) => {
    Linking.openURL('tel:9876543210');
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* TOP HEADER */}
      <View style={[s.headerRow, { paddingTop: topInset + 10 }]}>
        <TouchableOpacity
          style={s.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#4A1808" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            {isHindi ? 'नजदीकी पंडित जी खोजें' : 'Search Nearby Pandits'}
          </Text>
          <View style={s.headerLocationRow}>
            <Ionicons name="location-sharp" size={13} color="#C87A14" />
            <Text style={s.headerLocationText} numberOfLines={1}>
              {userLocation.formattedAddress}
            </Text>
          </View>
        </View>

        {/* View Mode Toggle: Map vs List */}
        <TouchableOpacity
          style={s.toggleBtn}
          activeOpacity={0.8}
          onPress={() => setViewMode((prev) => (prev === 'map' ? 'list' : 'map'))}
        >
          <Ionicons
            name={viewMode === 'map' ? 'list' : 'map'}
            size={18}
            color="#681A0E"
          />
          <Text style={s.toggleText}>
            {viewMode === 'map' ? (isHindi ? 'सूची' : 'List') : (isHindi ? 'नक्शा' : 'Map')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#8A6E58" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder={isHindi ? 'पंडित जी का नाम या पूजा खोजें...' : 'Search pandit name or puja...'}
          placeholderTextColor="#9C8370"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#8A6E58" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER BAR 1: RADIUS CHIPS */}
      <View style={s.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          <Text style={s.filterLabel}>{isHindi ? 'दूरी:' : 'Radius:'}</Text>
          {RADIUS_OPTIONS.map((opt) => {
            const active = selectedRadius === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[s.chip, active ? s.chipActive : null]}
                activeOpacity={0.75}
                onPress={() => setSelectedRadius(opt.value)}
              >
                <Text style={[s.chipText, active ? s.chipTextActive : null]}>
                  {getText(opt.label_hi, opt.label_en)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FILTER BAR 2: PUJA SPECIALTY CHIPS */}
      <View style={[s.filterContainer, { paddingTop: 0 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {SPECIALTY_OPTIONS.map((opt) => {
            const active = selectedSpecialty === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[s.specialtyChip, active ? s.specialtyChipActive : null]}
                activeOpacity={0.75}
                onPress={() => setSelectedSpecialty(opt.value)}
              >
                <Text style={[s.specialtyChipText, active ? s.specialtyChipTextActive : null]}>
                  {getText(opt.label_hi, opt.label_en)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.centerLoading}>
          <ActivityIndicator size="large" color="#C87A14" />
          <Text style={s.loadingText}>
            {isHindi ? 'मैपल्स जीपीएस से नजदीकी पंडित खोज रहे हैं...' : 'Finding verified pandits on Mappls...'}
          </Text>
        </View>
      ) : viewMode === 'map' ? (
        /* MAP VIEW MODE */
        <View style={s.mapWrapper}>
          <MapplsMapView
            userLocation={userLocation}
            pandits={panditsList}
            selectedPandit={selectedPandit}
            onSelectPandit={(p) => setSelectedPandit(p)}
            style={s.mapView}
          />

          {/* Floating Live GPS Recalibrate Button */}
          <TouchableOpacity
            style={s.recenterGpsFab}
            activeOpacity={0.8}
            onPress={async () => {
              setLoading(true);
              const res = await getCurrentUserLocation();
              if (res?.coords) {
                setUserLocation(res.coords);
              }
              setLoading(false);
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#C87A14" />
          </TouchableOpacity>

          {/* FLOATING PANDIT PROFILE CARD AT BOTTOM */}
          {selectedPandit && (
            <View style={[s.floatingCardWrap, { paddingBottom: bottomInset }]}>
              <View style={s.floatingCard}>
                <View style={s.cardTopRow}>
                  <Image source={{ uri: selectedPandit.avatar }} style={s.panditAvatar} />

                  <View style={s.cardInfo}>
                    <View style={s.verifiedTag}>
                      <MaterialCommunityIcons name="check-decagram" size={13} color="#2E7D32" />
                      <Text style={s.verifiedText}>
                        {isHindi ? 'प्रमाणित वैदिक पंडित' : 'Verified Vedic Pandit'}
                      </Text>
                    </View>

                    <Text style={s.panditName} numberOfLines={1}>
                      {selectedPandit.name}
                    </Text>
                    <Text style={s.panditTitle} numberOfLines={1}>
                      {selectedPandit.title}
                    </Text>

                    <View style={s.metaRow}>
                      <View style={s.ratingBadge}>
                        <Ionicons name="star" size={12} color="#D87A16" />
                        <Text style={s.ratingText}>{selectedPandit.rating}</Text>
                      </View>

                      <View style={s.distanceBadge}>
                        <Ionicons name="navigate-circle-outline" size={13} color="#681A0E" />
                        <Text style={s.distanceText}>{selectedPandit.distanceText}</Text>
                      </View>

                      <Text style={s.etaBadge}>{selectedPandit.etaText}</Text>
                    </View>
                  </View>
                </View>

                {/* Specialties Tags */}
                <View style={s.specialtiesRow}>
                  {selectedPandit.specialties.slice(0, 3).map((sp, idx) => (
                    <View key={idx} style={s.specialtyBadge}>
                      <Text style={s.specialtyBadgeText}>{sp}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions Bottom Bar */}
                <View style={s.cardBottomActions}>
                  <TouchableOpacity
                    style={s.callBtn}
                    activeOpacity={0.8}
                    onPress={() => handleCallPandit(selectedPandit)}
                  >
                    <Ionicons name="call" size={16} color="#7A240C" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={s.bookBtn}
                    activeOpacity={0.85}
                    onPress={() => handleBookPandit(selectedPandit)}
                  >
                    <Text style={s.bookBtnText}>
                      {isHindi ? 'पंडित जी से पूजा बुक करें' : 'Book Puja with Pandit Ji'} • {selectedPandit.fee}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        /* LIST VIEW MODE */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.listContainer, { paddingBottom: bottomInset + 30 }]}
        >
          <Text style={s.resultsCount}>
            {isHindi
              ? `${panditsList.length} पंडित जी उपलब्ध (${selectedRadius} किमी दायरे में)`
              : `${panditsList.length} verified pandits available (within ${selectedRadius} km)`}
          </Text>

          {panditsList.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={s.listCard}
              activeOpacity={0.85}
              onPress={() => handleBookPandit(p)}
            >
              <View style={s.cardTopRow}>
                <Image source={{ uri: p.avatar }} style={s.panditAvatar} />

                <View style={s.cardInfo}>
                  <View style={s.verifiedTag}>
                    <MaterialCommunityIcons name="check-decagram" size={13} color="#2E7D32" />
                    <Text style={s.verifiedText}>
                      {isHindi ? 'प्रमाणित वैदिक पंडित' : 'Verified Vedic Pandit'}
                    </Text>
                  </View>

                  <Text style={s.panditName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={s.panditTitle} numberOfLines={1}>
                    {p.title}
                  </Text>

                  <View style={s.metaRow}>
                    <View style={s.ratingBadge}>
                      <Ionicons name="star" size={12} color="#D87A16" />
                      <Text style={s.ratingText}>
                        {p.rating} ({p.reviewCount})
                      </Text>
                    </View>

                    <View style={s.distanceBadge}>
                      <Ionicons name="navigate-circle-outline" size={13} color="#681A0E" />
                      <Text style={s.distanceText}>{p.distanceText}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.priceBox}>
                  <Text style={s.priceText}>{p.fee}</Text>
                  <Text style={s.priceSub}>{isHindi ? 'दक्षिणा' : 'Dakshina'}</Text>
                </View>
              </View>

              <View style={s.specialtiesRow}>
                {p.specialties.map((sp, idx) => (
                  <View key={idx} style={s.specialtyBadge}>
                    <Text style={s.specialtyBadgeText}>{sp}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FAF4E8',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5E8D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A1808',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerLocationText: {
    fontSize: 12,
    color: '#7A4D30',
    marginLeft: 3,
    fontWeight: '500',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5D4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#681A0E',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6D7C8',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A1408',
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#681A0E',
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F3E5D4',
  },
  chipActive: {
    backgroundColor: '#C87A14',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#681A0E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  specialtyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6D7C8',
  },
  specialtyChipActive: {
    backgroundColor: '#681A0E',
    borderColor: '#681A0E',
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C3A24',
  },
  specialtyChipTextActive: {
    color: '#FFFFFF',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    color: '#681A0E',
    marginTop: 10,
    fontWeight: '500',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingCardWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  floatingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E2D2',
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  panditAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E67E22',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  panditName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A1408',
    marginTop: 1,
  },
  panditTitle: {
    fontSize: 11.5,
    color: '#705442',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FDF2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C87A14',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 11,
    color: '#681A0E',
    fontWeight: '600',
  },
  etaBadge: {
    fontSize: 10.5,
    color: '#2E7D32',
    fontWeight: '600',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  specialtyBadge: {
    backgroundColor: '#FAF2E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specialtyBadgeText: {
    fontSize: 10.5,
    color: '#5C381E',
    fontWeight: '500',
  },
  cardBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FCEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5C6BC',
  },
  bookBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#C87A14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#681A0E',
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEDBCE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  priceBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C87A14',
  },
  priceSub: {
    fontSize: 10,
    color: '#8A6850',
  },
  recenterGpsFab: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E8D5C2',
  },
});
