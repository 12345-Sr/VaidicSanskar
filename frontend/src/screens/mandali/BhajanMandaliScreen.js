import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import { useLanguage } from '../../context/LanguageContext';
import bhajanMandaliStore, {
  BHAJAN_STYLES,
} from '../../services/bhajanMandaliStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';

export default function BhajanMandaliScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isHindi } = useLanguage();
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const [booking, setBooking] = useState(bhajanMandaliStore.getBooking());
  const [mandalis, setMandalis] = useState(bhajanMandaliStore.getMandalis());

  useEffect(() => {
    // Load live mandalis from friend backend (discovery/role/mandali)
    import('../../services/api').then(({ MandaliService }) => {
      MandaliService.list().then((res) => {
        const raw = Array.isArray(res) ? res : (res?.vendors || res?.mandalis || res?.data || []);
        if (raw.length) {
          const mapped = raw.map((v) => ({
            id: String(v._id || v.id),
            name: v.name,
            nameHi: v.nameHi || v.name,
            leaderName: v.leaderName || v.name,
            leaderPhoto: v.profileImage || 'bhajan_lead',
            coverImage: v.coverImage || 'bhajan_mandali',
            city: v.city || 'वाराणसी, उत्तर प्रदेश',
            serviceRadiusKm: v.serviceRadiusKm || 30,
            membersCount: v.membersCount || 6,
            rating: Number(v.rating || v.averageRating || 4.9),
            reviewsCount: Number(v.totalReviews || 45),
            verified: true,
            experienceYears: Number(v.experience || 8),
            programsCompleted: Number(v.programsCompleted || 150),
            styles: v.styles || ['Sunderkand Path', 'Bhajan Sandhya', 'Jagran / Jagrata'],
            languages: v.languages || ['हिंदी', 'संस्कृत'],
            instruments: v.instruments || ['हारमोनियम', 'ढोलक', 'तबला', 'झांझ'],
            ownSoundSystem: true,
            about: v.bio || 'भगवती जागरण, श्री सुंदरकांड पाठ व अखंड संकीर्तन हेतु अनुभवी मंडल।',
            packages: v.packages || [
              {
                id: 'pkg-live-' + (v._id || v.id),
                name: 'दिव्य भजन संध्या व संकीर्तन (3 घंटे)',
                duration: '3 घंटे',
                durationMin: 180,
                members: v.membersCount || 6,
                price: Number(v.price || v.chatRate || 11000),
                extraHourPrice: 2000,
                includes: ['संपूर्ण वाद्य वृंद', 'साउंड सिस्टम', 'आरती व प्रसाद वितरण'],
              },
            ],
            availableDates: ['2026-10-15', '2026-10-16', '2026-10-18', '2026-10-20'],
          }));
          setMandalis(mapped);
        }
      }).catch(() => { });
    });

    const unsub = bhajanMandaliStore.subscribe(() => {
      setBooking(bhajanMandaliStore.getBooking() ? { ...bhajanMandaliStore.getBooking() } : null);
      setMandalis([...bhajanMandaliStore.getMandalis()]);
    });
    return unsub;
  }, []);

  const filteredMandalis = mandalis.filter((m) => {
    const matchStyle =
      selectedStyle === 'all' ||
      m.styles?.some((s) => s.toLowerCase().includes(selectedStyle.toLowerCase()));
    const matchCity = !searchCity.trim() || m.city?.includes(searchCity);
    return matchStyle && matchCity;
  });

  const isBookingActive =
    booking &&
    ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F0" />

      {/* Top Header Bar */}
      <View
        style={[
          s.header,
          {
            paddingTop: Math.max(
              insets.top,
              Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
            ) + 6,
          },
        ]}
      >
        <View style={s.headerRow}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color="#3A1208" />
          </TouchableOpacity>

          <View style={s.headerTitleBox}>
            <Text style={s.headerTitle} numberOfLines={1}>
              {isHindi ? 'भजन मंडली व कीर्तन' : 'Bhajan Mandali'}
            </Text>
            <Text style={s.headerSubtitle} numberOfLines={1}>
              {isHindi ? 'सत्यापित संगीत मंडलियां व कथाकार' : 'Verified Troupes & Kathavachaks'}
            </Text>
          </View>

          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              if (booking) {
                navigation.navigate('MandaliBooking', { mandali: booking.mandali, viewStatus: true });
              } else if (mandalis.length) {
                navigation.navigate('MandaliBooking', { mandali: mandalis[0] });
              }
            }}
          >
            <MaterialCommunityIcons name="calendar-check" size={22} color="#3A1208" />
            {isBookingActive && <View style={s.activeBadgeDot} />}
          </TouchableOpacity>
        </View>

        {/* City Filter / Search Input */}
        <View style={s.searchBar}>
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
          <TextInput
            style={s.searchInput}
            placeholder="स्थान / शहर से खोजें (e.g. वाराणसी, नोएडा, लखनऊ)..."
            placeholderTextColor="#8C786E"
            value={searchCity}
            onChangeText={setSearchCity}
          />
          {searchCity.length > 0 && (
            <TouchableOpacity onPress={() => setSearchCity('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#8C786E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredMandalis}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Active Booking Banner (if user has booked or requested a mandali) */}
            {isBookingActive && (
              <TouchableOpacity
                style={s.activeBookingBanner}
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate('MandaliBooking', {
                    mandali: booking.mandali,
                    viewStatus: true,
                  })
                }
              >
                <View style={s.pulseCircle}>
                  <MaterialCommunityIcons name="music-clef-treble" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={s.bannerStatusRow}>
                    <Text style={s.bannerStatusTag}>सक्रिय बुकिंग स्थिति</Text>
                    <Text style={s.bannerStatusVal}>{booking.status}</Text>
                  </View>
                  <Text style={s.bannerMandaliName}>{booking.mandali.nameHi}</Text>
                  <Text style={s.bannerEventMeta}>
                    📅 {booking.eventDate} · {booking.startTime} ({booking.occasion})
                  </Text>
                </View>
                <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#FFF" />
              </TouchableOpacity>
            )}

            {/* Feature Hero Card */}
            <View style={s.heroCard}>
              <View style={s.heroLeft}>
                <View style={s.heroTag}>
                  <Text style={s.heroTagText}>सात्विक व संगीतमय भक्ति 🪘</Text>
                </View>
                <Text style={s.heroTitle}>पारिवारिक व मांगलिक उत्सवों हेतु भजन मंडली</Text>
                <Text style={s.heroSub}>
                  सुंदरकांड, जागरण व खाटू श्याम संकीर्तन हेतु संपूर्ण वाद्य व साउंड सहित बुकिंग
                </Text>
              </View>
              <MaterialCommunityIcons name="volume-high" size={44} color={colors.gold} />
            </View>

            {/* Style Filters Horizontal Scroll */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>भजन व संकीर्तन शैलियां</Text>
              <Text style={s.sectionCount}>{BHAJAN_STYLES.length - 1} शैलियां</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.stylesScroll}
            >
              {BHAJAN_STYLES.map((st) => {
                const isActive = selectedStyle === st.id;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[s.styleChip, isActive && s.styleChipActive]}
                    onPress={() => setSelectedStyle(st.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={st.icon}
                      size={18}
                      color={isActive ? '#FFF' : colors.primary}
                    />
                    <Text style={[s.styleChipText, isActive && s.styleChipTextActive]}>
                      {st.hi}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[s.sectionHeader, { marginTop: 14 }]}>
              <Text style={s.sectionTitle}>उपलब्ध सत्यापित मंडलियां</Text>
              <Text style={s.sectionCount}>{filteredMandalis.length} मंडलियां</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={s.mandaliCard}>
            {/* Cover & Sample preview */}
            <View style={s.coverContainer}>
              <Image source={resolveDevotionalSource(item.coverImage, 'bhajan_mandali')} style={s.coverImage} />
              <View style={s.verifiedTag}>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#15803D" />
                <Text style={s.verifiedText}>प्रमाणित मंडली</Text>
              </View>
              {item.ownSoundSystem && (
                <View style={s.soundTag}>
                  <MaterialCommunityIcons name="speaker" size={13} color="#FFF" />
                  <Text style={s.soundTagText}>स्वयं का साउंड सिस्टम</Text>
                </View>
              )}
            </View>

            {/* Body */}
            <View style={s.mandaliBody}>
              <View style={s.leaderRow}>
                <Image source={resolveDevotionalSource(item.leaderPhoto, 'bhajan_lead')} style={s.leaderPhoto} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.mandaliNameHi}>{item.nameHi}</Text>
                  <Text style={s.leaderName}>मुखिया: {item.leaderName}</Text>
                </View>
                <View style={s.ratingBadge}>
                  <MaterialCommunityIcons name="star" size={14} color={colors.gold} />
                  <Text style={s.ratingVal}>{item.rating}</Text>
                </View>
              </View>

              <Text style={s.aboutText} numberOfLines={2}>
                {item.about}
              </Text>

              {/* Badges / Stats */}
              <View style={s.statsRow}>
                <View style={s.statBadge}>
                  <MaterialCommunityIcons name="account-group" size={14} color={colors.primary} />
                  <Text style={s.statBadgeText}>{item.membersCount} सदस्य</Text>
                </View>
                <View style={s.statBadge}>
                  <MaterialCommunityIcons name="map-marker-radius" size={14} color="#7A6458" />
                  <Text style={s.statBadgeText}>{item.serviceRadiusKm} किमी दायरा</Text>
                </View>
                <View style={s.statBadge}>
                  <MaterialCommunityIcons name="calendar-check" size={14} color="#15803D" />
                  <Text style={s.statBadgeText}>{item.programsCompleted}+ कार्यक्रम</Text>
                </View>
              </View>

              {/* Styles Chips */}
              <View style={s.mandaliStylesRow}>
                {item.styles.map((st, idx) => (
                  <View key={idx} style={s.styleMiniChip}>
                    <Text style={s.styleMiniText}>{st}</Text>
                  </View>
                ))}
              </View>

              <View style={s.divider} />

              {/* Price & Book CTA */}
              <View style={s.cardBottom}>
                <View>
                  <Text style={s.startingFromLabel}>आरंभिक पैकेज दर:</Text>
                  <Text style={s.startingPrice}>
                    ₹{item.packages[0].price.toLocaleString('en-IN')}
                    <Text style={s.perProg}> / कार्यक्रम</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={s.viewBtn}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('MandaliBooking', {
                      mandali: item,
                      viewStatus: false,
                    })
                  }
                >
                  <Text style={s.viewBtnText}>पैकेज व बुकिंग ›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  header: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE3D7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: serif,
    fontSize: 19,
    fontWeight: '800',
    color: '#3A1208',
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadow,
  },
  activeBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#15803D',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    ...shadow,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#3A1208',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
  },
  activeBookingBanner: {
    backgroundColor: '#3A1208',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    ...shadow,
  },
  pulseCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerStatusTag: {
    fontSize: 10.5,
    color: colors.goldLight,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  bannerStatusVal: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700',
  },
  bannerMandaliName: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF8F0',
    marginTop: 2,
  },
  bannerEventMeta: {
    fontSize: 11.5,
    color: '#D8C3B4',
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    marginBottom: 16,
    ...shadow,
  },
  heroLeft: {
    flex: 1,
    marginRight: 12,
  },
  heroTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  heroTitle: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '800',
    color: '#3A1208',
  },
  heroSub: {
    fontSize: 11.5,
    color: '#7A6458',
    marginTop: 4,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '800',
    color: '#3A1208',
  },
  sectionCount: {
    fontSize: 11.5,
    color: '#8C786E',
    fontWeight: '600',
  },
  stylesScroll: {
    gap: 8,
    paddingBottom: 6,
    marginBottom: 14,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    gap: 6,
  },
  styleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  styleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6458',
  },
  styleChipTextActive: {
    color: '#FFF',
  },
  mandaliCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    marginBottom: 16,
    ...shadow,
  },
  coverContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#FFF4E8',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  verifiedTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#DCFCE7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  soundTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(26, 10, 5, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  soundTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFF',
  },
  mandaliBody: {
    padding: 16,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaderPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#FFF4E8',
  },
  mandaliNameHi: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '800',
    color: '#3A1208',
  },
  leaderName: {
    fontSize: 12,
    color: '#7A6458',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  aboutText: {
    fontSize: 12.5,
    color: '#5C4436',
    lineHeight: 18,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBadgeText: {
    fontSize: 11.5,
    color: '#5C4436',
    fontWeight: '600',
  },
  mandaliStylesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  styleMiniChip: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  styleMiniText: {
    fontSize: 11,
    color: '#7A6458',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EDE4',
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startingFromLabel: {
    fontSize: 11,
    color: '#8C786E',
    fontWeight: '600',
  },
  startingPrice: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  perProg: {
    fontSize: 11,
    color: '#8C786E',
    fontWeight: '500',
  },
  viewBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...shadow,
  },
  viewBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
