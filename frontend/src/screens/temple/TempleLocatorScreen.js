import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Switch,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif, shadow } from '../../theme/styles';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import templeStore, { TIRTH_COLLECTIONS } from '../../services/templeStore';

export default function TempleLocatorScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, isHindi, getText, clean } = useLanguage();
  const [, setTick] = useState(0);

  // States
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState('All');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyBooking, setOnlyBooking] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPinTemple, setSelectedPinTemple] = useState(null);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [manualCity, setManualCity] = useState('वाराणसी (Varanasi)');
  const [searchAreaMoved, setSearchAreaMoved] = useState(false);

  const RADIUS_OPTIONS = [
    { label: isHindi ? 'सभी' : 'All', value: 'All' },
    { label: isHindi ? '1 किमी' : '1 km', value: '1' },
    { label: isHindi ? '5 किमी' : '5 km', value: '5' },
    { label: isHindi ? '10 किमी' : '10 km', value: '10' },
    { label: isHindi ? '25 किमी' : '25 km', value: '25' },
  ];

  const DEITIES = [
    { label: isHindi ? 'सभी देवता' : 'All Deities', value: 'All' },
    { label: isHindi ? 'भगवान शिव' : 'Lord Shiva', value: 'Shiva' },
    { label: isHindi ? 'श्री हनुमान' : 'Lord Hanuman', value: 'Hanuman' },
    { label: isHindi ? 'प्रभु श्री राम' : 'Lord Ram', value: 'Ram' },
    { label: isHindi ? 'श्री कृष्ण' : 'Lord Krishna', value: 'Krishna' },
    { label: isHindi ? 'माँ दुर्गा' : 'Maa Durga', value: 'Durga' },
  ];

  useEffect(() => {
    const unsub = templeStore.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const temples = templeStore.getFilteredTemples();

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    templeStore.setSearchQuery(text);
  };

  const handleRadiusChange = (rad) => {
    setSelectedRadius(rad);
    templeStore.setRadius(rad);
  };

  const handleDeityChange = (d) => {
    setSelectedDeity(d);
    templeStore.setDeityFilter(d);
  };

  const applyFilters = () => {
    templeStore.setFilterFlags({
      onlyVerified,
      onlyOpen,
      onlyDarshanBooking: onlyBooking,
    });
    setFilterModalVisible(false);
  };

  const openGoogleMapsDirections = (tItem) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${tItem.lat},${tItem.lng}`;
    const label = encodeURIComponent(getText(tItem.name, tItem.name_en));
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${tItem.lat},${tItem.lng}`);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View style={[s.head, { paddingTop: insets.top + 8 }]}>
        <View style={s.headRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.headerTitle}>{t('templeLocator')}</Text>
            <TouchableOpacity
              onPress={() => setCityModalVisible(true)}
              style={s.locCityPill}
            >
              <Ionicons name="location-sharp" size={12} color={colors.primary} />
              <Text style={s.locCityText}>{clean(manualCity)}</Text>
              <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LanguageSwitcher />
            <TouchableOpacity
              style={s.claimIconBtn}
              onPress={() => navigation.navigate('TempleClaim')}
            >
              <MaterialCommunityIcons name="shield-crown-outline" size={20} color={colors.maroon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar with Filter Icon */}
        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder={t('searchTemplesPlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[s.filterBtn, (onlyVerified || onlyOpen || onlyBooking || selectedDeity !== 'All') && s.filterBtnActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color={(onlyVerified || onlyOpen || onlyBooking || selectedDeity !== 'All') ? '#fff' : colors.maroon}
            />
          </TouchableOpacity>
        </View>

        {/* View Mode Toggle: Map vs List */}
        <View style={s.viewToggleRow}>
          <View style={s.viewSwitchContainer}>
            <TouchableOpacity
              style={[s.viewSwitchTab, viewMode === 'list' && s.viewSwitchTabActive]}
              onPress={() => setViewMode('list')}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={16}
                color={viewMode === 'list' ? '#fff' : colors.maroon}
              />
              <Text style={[s.viewSwitchText, viewMode === 'list' && s.viewSwitchTextActive]}>
                {t('listView')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.viewSwitchTab, viewMode === 'map' && s.viewSwitchTabActive]}
              onPress={() => setViewMode('map')}
            >
              <MaterialCommunityIcons
                name="map-outline"
                size={16}
                color={viewMode === 'map' ? '#fff' : colors.maroon}
              />
              <Text style={[s.viewSwitchText, viewMode === 'map' && s.viewSwitchTextActive]}>
                {t('mapView')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Radius selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.radiusScroll}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[s.radiusPill, selectedRadius === r.value && s.radiusPillActive]}
                onPress={() => handleRadiusChange(r.value)}
              >
                <Text style={[s.radiusText, selectedRadius === r.value && s.radiusTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <View style={{ flex: 1 }}>
          {/* Mock Interactive Map Canvas */}
          <View style={s.mapCanvas}>
            {/* Background Map Graphic Elements */}
            <View style={s.mapGridBackground}>
              <View style={s.mapRiverPath} />
              <View style={s.mapRoadVertical} />
              <View style={s.mapRoadHorizontal} />
            </View>

            {/* User GPS Location Pin */}
            <View style={[s.userGpsPin, { top: '55%', left: '46%' }]}>
              <View style={s.userGpsPulse} />
              <View style={s.userGpsDot} />
              <Text style={s.userGpsLabel}>आप यहाँ हैं</Text>
            </View>

            {/* Interactive Temple Pins */}
            {temples.map((t, idx) => {
              const offsets = [
                { top: '30%', left: '48%' },
                { top: '72%', left: '38%' },
                { top: '22%', left: '75%' },
                { top: '65%', left: '60%' },
                { top: '42%', left: '20%' },
              ];
              const pos = offsets[idx % offsets.length];
              const isSelected = selectedPinTemple?.id === t.id;

              return (
                <TouchableOpacity
                  key={t.id}
                  style={[s.mapPinItem, pos]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPinTemple(t)}
                >
                  <View
                    style={[
                      s.mapPinBadge,
                      t.is_verified ? s.mapPinVerified : s.mapPinGoogle,
                      isSelected && s.mapPinSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={t.is_verified ? 'temple-hindu' : 'map-marker'}
                      size={18}
                      color="#fff"
                    />
                    {t.hasDarshanBooking && (
                      <View style={s.ticketIconDot}>
                        <MaterialCommunityIcons name="ticket-confirmation" size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                  <View style={s.mapPinNameTag}>
                    <Text style={s.mapPinNameText} numberOfLines={1}>
                      {t.name_en ? t.name_en.split(' ')[1] || t.name : t.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* "Is area mein dhoondhein" floating trigger */}
            <TouchableOpacity
              style={s.searchAreaFloatingBtn}
              onPress={() => {
                setSearchAreaMoved(true);
                setTimeout(() => setSearchAreaMoved(false), 2000);
              }}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.maroon} />
              <Text style={s.searchAreaFloatingText}>
                {searchAreaMoved
                  ? isHindi
                    ? '✓ इस क्षेत्र में 5 मंदिर मिले'
                    : '✓ 5 Temples found in area'
                  : t('searchArea')}
              </Text>
            </TouchableOpacity>

            {/* Map Legend */}
            <View style={s.mapLegend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colors.saffron }]} />
                <Text style={s.legendText}>{t('verifiedTemple')}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: '#64748B' }]} />
                <Text style={s.legendText}>{t('googleListing')}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colors.success }]} />
                <Text style={s.legendText}>{t('darshanBookingAvailable')} 🎟️</Text>
              </View>
            </View>
          </View>

          {/* Selected Pin Bottom Preview Card */}
          {selectedPinTemple && (
            <View style={s.mapCardPreview}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {selectedPinTemple.is_verified ? (
                    <View style={s.verifiedBadgeSmall}>
                      <MaterialCommunityIcons name="check-decagram" size={13} color="#C26A00" />
                      <Text style={s.verifiedBadgeText}>{t('verifiedTemple')}</Text>
                    </View>
                  ) : (
                    <Text style={s.googleBadgeText}>{t('googleListing')}</Text>
                  )}
                  <Text style={s.previewDist}> • {selectedPinTemple.distanceKm} {isHindi ? 'किमी' : 'km'}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPinTemple(null)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={s.previewTitle} numberOfLines={1}>
                {getText(selectedPinTemple.name, selectedPinTemple.name_en)}
              </Text>
              <Text style={s.previewStatus}>{clean(selectedPinTemple.statusText)}</Text>

              <View style={s.previewActionRow}>
                <TouchableOpacity
                  style={s.previewActionOutline}
                  onPress={() => openGoogleMapsDirections(selectedPinTemple)}
                >
                  <MaterialCommunityIcons name="navigation-variant" size={16} color={colors.maroon} />
                  <Text style={s.previewActionOutlineText}>{t('getDirections')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.previewActionGold}
                  onPress={() => navigation.navigate('TempleDetail', { temple: selectedPinTemple })}
                >
                  <Text style={s.previewActionGoldText}>{t('viewDetails')} ›</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        /* LIST VIEW */
        <ScrollView
          contentContainerStyle={{ padding: 14, paddingBottom: 50 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tirth Collections Banner Carousel */}
          <View style={s.tirthHeader}>
            <Text style={s.tirthSectionTitle}>{t('tirthYatras')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TirthCollections')}>
              <Text style={s.tirthViewAll}>{t('viewAll')} ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tirthScroll}
          >
            {TIRTH_COLLECTIONS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={s.tirthCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TirthCollections', { collection: c })}
              >
                <LinearGradient
                  colors={['#5A180E', '#3A0D07']}
                  style={s.tirthCardGradient}
                >
                  <View style={s.tirthIconCircle}>
                    <MaterialCommunityIcons name={c.icon} size={20} color={colors.gold} />
                  </View>
                  <Text style={s.tirthCardTitle}>{clean(c.title)}</Text>
                  <Text style={s.tirthCardSub}>{clean(c.subtitle)}</Text>
                  <View style={s.tirthCountBadge}>
                    <Text style={s.tirthCountText}>
                      {c.count} {isHindi ? 'पवित्र धाम' : 'Sacred Shrines'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Temples List Count Strip */}
          <View style={s.listCountStrip}>
            <Text style={s.listCountText}>
              {temples.length} {t('templesFound')} ({clean(manualCity)})
            </Text>
            <TouchableOpacity
              style={s.addTempleLink}
              onPress={() => navigation.navigate('TempleClaim', { mode: 'add' })}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={15} color={colors.maroon} />
              <Text style={s.addTempleLinkText}> {t('addNewTemple')}</Text>
            </TouchableOpacity>
          </View>

          {/* Temple Cards */}
          {temples.map((tItem) => (
            <View key={tItem.id} style={s.templeCard}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('TempleDetail', { temple: tItem })}
              >
                <View style={s.cardTopRow}>
                  {/* Temple Avatar / Icon Box */}
                  <View style={[s.templeIconBox, tItem.is_verified ? s.templeIconBoxVerified : s.templeIconBoxGoogle]}>
                    <MaterialCommunityIcons
                      name={tItem.is_verified ? 'temple-hindu' : 'map-marker'}
                      size={32}
                      color={tItem.is_verified ? colors.saffron : '#64748B'}
                    />
                  </View>

                  {/* Title & Badges */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      {tItem.is_verified ? (
                        <View style={s.badgeVerified}>
                          <MaterialCommunityIcons name="check-decagram" size={12} color="#C26A00" />
                          <Text style={s.badgeVerifiedText}>{t('verifiedTemple')}</Text>
                        </View>
                      ) : (
                        <View style={s.badgeGoogle}>
                          <Text style={s.badgeGoogleText}>{t('googleListing')}</Text>
                        </View>
                      )}
                      {tItem.hasDarshanBooking && (
                        <View style={s.badgeBooking}>
                          <MaterialCommunityIcons name="ticket-confirmation" size={11} color="#0D9488" />
                          <Text style={s.badgeBookingText}>{t('darshanBookingAvailable')}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={s.templeName} numberOfLines={2}>
                      {getText(tItem.name, tItem.name_en)}
                    </Text>
                    <Text style={s.templeDeityText}>
                      {clean(getText(tItem.deity_hi, tItem.deity_en))} • {clean(tItem.sampraday)}
                    </Text>
                  </View>

                  {/* Open Status Tag */}
                  <View style={[s.openPill, !tItem.open && s.closedPill]}>
                    <Text style={[s.openPillText, !tItem.open && s.closedPillText]}>
                      {tItem.open ? t('open') : t('closed')}
                    </Text>
                  </View>
                </View>

                {/* Distance & Travel Time Strip */}
                <View style={s.travelTimeRow}>
                  <View style={s.travelItem}>
                    <Ionicons name="location-outline" size={13} color={colors.maroon} />
                    <Text style={s.travelText}>{tItem.distanceKm} {isHindi ? 'किमी' : 'km'}</Text>
                  </View>
                  <Text style={s.bullet}>•</Text>
                  <View style={s.travelItem}>
                    <MaterialCommunityIcons name="walk" size={14} color={colors.textMuted} />
                    <Text style={s.travelText}>{clean(tItem.travelTimeWalk)}</Text>
                  </View>
                  <Text style={s.bullet}>•</Text>
                  <View style={s.travelItem}>
                    <MaterialCommunityIcons name="car" size={14} color={colors.textMuted} />
                    <Text style={s.travelText}>{clean(tItem.travelTimeDrive)}</Text>
                  </View>
                </View>

                {/* Status & Next Aarti Notice */}
                <View style={s.statusNoticeBox}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.maroon} />
                  <Text style={s.statusNoticeText} numberOfLines={1}>
                    {clean(tItem.statusText)}
                  </Text>
                </View>
                {tItem.nextAartiText && (
                  <View style={s.aartiNoticeBox}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={13} color="#C26A00" />
                    <Text style={s.aartiNoticeText} numberOfLines={1}>
                      {clean(tItem.nextAartiText)}
                    </Text>
                  </View>
                )}

                {/* Facilities Icons Row */}
                {tItem.facilities && tItem.facilities.length > 0 && (
                  <View style={s.facilitiesRow}>
                    {tItem.facilities.slice(0, 4).map((f) => (
                      <View key={f.key} style={s.facilityTag}>
                        <MaterialCommunityIcons name={f.icon} size={12} color={colors.maroon} />
                        <Text style={s.facilityTagText}>{clean(f.label.split(' ')[0])}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={s.cardActionsRow}>
                <TouchableOpacity
                  style={s.actionRouteBtn}
                  onPress={() => openGoogleMapsDirections(tItem)}
                >
                  <MaterialCommunityIcons name="navigation-variant-outline" size={16} color={colors.maroon} />
                  <Text style={s.actionRouteBtnText}>{t('getDirections')}</Text>
                </TouchableOpacity>

                {tItem.hasDarshanBooking ? (
                  <TouchableOpacity
                    style={s.actionDarshanBtn}
                    onPress={() => navigation.navigate('DarshanBooking', { temple: tItem })}
                  >
                    <MaterialCommunityIcons name="ticket-outline" size={16} color="#fff" />
                    <Text style={s.actionDarshanBtnText}>{t('bookDarshan')} ›</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={s.actionDetailBtn}
                    onPress={() => navigation.navigate('TempleDetail', { temple: tItem })}
                  >
                    <Text style={s.actionDetailBtnText}>{t('viewDetails')} ›</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {temples.length === 0 && (
            <View style={s.emptyState}>
              <MaterialCommunityIcons name="temple-hindu-outline" size={48} color={colors.textMuted} />
              <Text style={s.emptyStateTitle}>कोई मंदिर नहीं मिला</Text>
              <Text style={s.emptyStateSub}>
                कृपया अपनी खोज या फ़िल्टर बदलकर पुनः प्रयास करें, अथवा अपने क्षेत्र का मंदिर जोड़ें।
              </Text>
              <TouchableOpacity
                style={s.emptyAddBtn}
                onPress={() => navigation.navigate('TempleClaim', { mode: 'add' })}
              >
                <Text style={s.emptyAddBtnText}>+ नया मंदिर जोड़ें</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{isHindi ? 'फ़िल्टर विकल्प' : 'Filter Options'}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Deity Filter */}
              <Text style={s.filterSectionTitle}>{isHindi ? 'देवता अनुसार' : 'By Deity'}</Text>
              <View style={s.deityGrid}>
                {DEITIES.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[s.deityChip, selectedDeity === d.value && s.deityChipActive]}
                    onPress={() => handleDeityChange(d.value)}
                  >
                    <Text style={[s.deityChipText, selectedDeity === d.value && s.deityChipTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Toggle Switches */}
              <View style={s.toggleItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>
                    {isHindi ? 'केवल सत्यापित मंदिर' : 'Verified Temples Only'}
                  </Text>
                  <Text style={s.toggleSub}>
                    {isHindi ? 'प्रशासनिक व ट्रस्ट द्वारा सत्यापित सूची' : 'Official administration and trustee verified'}
                  </Text>
                </View>
                <Switch
                  value={onlyVerified}
                  onValueChange={setOnlyVerified}
                  trackColor={{ true: colors.primary, false: '#DDD' }}
                />
              </View>

              <View style={s.toggleItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>
                    {isHindi ? 'अभी खुला है' : 'Open Now'}
                  </Text>
                  <Text style={s.toggleSub}>
                    {isHindi ? 'वर्तमान में कपाट खुले हैं' : 'Currently open for darshan'}
                  </Text>
                </View>
                <Switch
                  value={onlyOpen}
                  onValueChange={setOnlyOpen}
                  trackColor={{ true: colors.primary, false: '#DDD' }}
                />
              </View>

              <View style={s.toggleItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>
                    {isHindi ? 'दर्शन बुकिंग उपलब्ध' : 'Darshan Booking Available'}
                  </Text>
                  <Text style={s.toggleSub}>
                    {isHindi ? 'सुगम दर्शन स्लॉट बुकिंग वाले मंदिर' : 'Temples with online darshan pass booking'}
                  </Text>
                </View>
                <Switch
                  value={onlyBooking}
                  onValueChange={setOnlyBooking}
                  trackColor={{ true: colors.primary, false: '#DDD' }}
                />
              </View>
            </ScrollView>

            <View style={s.modalFooter}>
              <TouchableOpacity
                style={s.resetFilterBtn}
                onPress={() => {
                  setOnlyVerified(false);
                  setOnlyOpen(false);
                  setOnlyBooking(false);
                  setSelectedDeity('All');
                }}
              >
                <Text style={s.resetFilterText}>{t('reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.applyFilterBtn} onPress={applyFilters}>
                <Text style={s.applyFilterText}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual City Selector Modal (Location Permission Fallback) */}
      <Modal visible={cityModalVisible} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { maxHeight: 380 }]}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{isHindi ? 'शहर / स्थान चुनें' : 'Select City / Location'}</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
              {isHindi
                ? 'यदि GPS लोकेशन बंद है, तो अपने निकटतम तीर्थ नगर का चयन करें:'
                : 'Choose your nearest sacred city:'}
            </Text>
            {['वाराणसी (Varanasi)', 'अयोध्या (Ayodhya)', 'उज्जैन (Ujjain)', 'हरिद्वार / ऋषिकेश', 'मथुरा / वृन्दावन', 'प्रयागराज'].map(
              (ct) => (
                <TouchableOpacity
                  key={ct}
                  style={s.citySelectRow}
                  onPress={() => {
                    setManualCity(ct);
                    setCityModalVisible(false);
                  }}
                >
                  <Ionicons name="location-outline" size={18} color={colors.maroon} />
                  <Text style={s.citySelectText}>{clean(ct)}</Text>
                  {manualCity === ct && <Ionicons name="checkmark" size={18} color={colors.success} />}
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    backgroundColor: '#FAF7F0',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE4D6',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.maroon,
  },
  locCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8DB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
    gap: 4,
  },
  locCityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
  },
  claimIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  viewToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  viewSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFE4D6',
    borderRadius: 8,
    padding: 2,
  },
  viewSwitchTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewSwitchTabActive: {
    backgroundColor: colors.maroon,
  },
  viewSwitchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
  },
  viewSwitchTextActive: {
    color: '#fff',
  },
  radiusScroll: {
    paddingLeft: 8,
    gap: 6,
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  radiusPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  radiusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  radiusTextActive: {
    color: '#fff',
  },

  /* Tirth Yatras Banner Carousel */
  tirthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tirthSectionTitle: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '700',
    color: colors.maroon,
  },
  tirthViewAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  tirthScroll: {
    paddingBottom: 14,
    gap: 10,
  },
  tirthCard: {
    width: 200,
    borderRadius: 14,
    overflow: 'hidden',
    ...shadow,
  },
  tirthCardGradient: {
    padding: 14,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  tirthIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tirthCardTitle: {
    fontFamily: serif,
    fontSize: 13,
    fontWeight: '700',
    color: '#FDFBF7',
  },
  tirthCardSub: {
    fontSize: 10.5,
    color: '#F4D9B6',
    marginTop: 2,
  },
  tirthCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(234,168,56,0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  tirthCountText: {
    fontSize: 10,
    color: '#FCE7C8',
    fontWeight: '700',
  },

  /* List View Elements */
  listCountStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listCountText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addTempleLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTempleLinkText: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '700',
  },
  templeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  templeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templeIconBoxVerified: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  templeIconBoxGoogle: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    gap: 3,
  },
  badgeVerifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#92400E',
  },
  badgeGoogle: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeGoogleText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  badgeBooking: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  badgeBookingText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  templeName: {
    fontFamily: serif,
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  templeDeityText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  openPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  openPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  closedPill: {
    backgroundColor: '#FEE2E2',
  },
  closedPillText: {
    color: '#B91C1C',
  },
  travelTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F6F0E6',
    gap: 4,
  },
  travelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  travelText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  bullet: {
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: 3,
  },
  statusNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    gap: 6,
  },
  statusNoticeText: {
    fontSize: 11,
    color: colors.maroon,
    fontWeight: '600',
    flex: 1,
  },
  aartiNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    gap: 6,
  },
  aartiNoticeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  facilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8DB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  facilityTagText: {
    fontSize: 9.5,
    color: colors.maroon,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  actionRouteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    backgroundColor: '#FAF7F0',
    gap: 4,
  },
  actionRouteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.maroon,
  },
  actionDarshanBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary,
    gap: 4,
  },
  actionDarshanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  actionDetailBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.maroon,
  },
  actionDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  /* Map Canvas Styles */
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E8E2D2',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  mapRiverPath: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 60,
    width: 48,
    backgroundColor: '#93C5FD',
    opacity: 0.6,
    transform: [{ rotate: '-15deg' }],
  },
  mapRoadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '45%',
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  mapRoadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 14,
    backgroundColor: '#CBD5E1',
  },
  userGpsPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  userGpsPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    position: 'absolute',
    top: -4,
    left: -4,
  },
  userGpsDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userGpsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  mapPinItem: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapPinBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...shadow,
  },
  mapPinVerified: {
    backgroundColor: colors.saffron,
  },
  mapPinGoogle: {
    backgroundColor: '#64748B',
  },
  mapPinSelected: {
    borderColor: '#F59E0B',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  ticketIconDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  mapPinNameTag: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapPinNameText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.text,
  },
  searchAreaFloatingBtn: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    gap: 6,
    ...shadow,
  },
  searchAreaFloatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.maroon,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.text,
  },
  mapCardPreview: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  verifiedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },
  googleBadgeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  previewDist: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  previewTitle: {
    fontFamily: serif,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  previewStatus: {
    fontSize: 11,
    color: colors.maroon,
    marginTop: 2,
  },
  previewActionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  previewActionOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    gap: 4,
  },
  previewActionOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.maroon,
  },
  previewActionGold: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  previewActionGoldText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAddBtn: {
    marginTop: 14,
    backgroundColor: colors.maroon,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Modal Sheets */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: colors.maroon,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  deityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  deityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  deityChipActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  deityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  deityChipTextActive: {
    color: '#fff',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F0E6',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetFilterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  applyFilterBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  applyFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  citySelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F0E6',
    gap: 10,
  },
  citySelectText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
