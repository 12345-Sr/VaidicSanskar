import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { serif } from '../../theme/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 720;

export default function LoginModeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0);
  const bottomInset = Math.max(insets.bottom, 24);

  // Responsive sizing tailored so image never clips or forces overflow on any device
  const heroSize = Math.min(SCREEN_WIDTH * 0.82, SCREEN_HEIGHT * 0.36, 280);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF4E8" translucent={false} />

      {/* Decorative Hanging Bells Row - Cleanly positioned above the artwork with zero overlap */}
      <View style={[s.topBellsRow, { paddingTop: topInset + 6 }]} pointerEvents="none">
        <View style={s.bellWrap}>
          <View style={s.bellChain} />
          <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#D48817" />
        </View>
        <View style={s.bellWrap}>
          <View style={s.bellChain} />
          <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#D48817" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: topInset + 24,
            paddingBottom: bottomInset + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={s.contentCenter}>
          {/* Hero Artwork: Feathered PNG that seamlessly blends into #FAF4E8 with NO square cutting */}
          <View style={[s.imageWrapper, { width: heroSize, height: heroSize }]}>
            <Image
              source={require('../../../assets/spiritual_journey_diya.png')}
              style={s.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Typography Section */}
          <View style={s.textContainer}>
            <Text style={s.title}>
              Your Spiritual{'\n'}Journey Begins
            </Text>
            <Text style={s.subtitle}>
              Trusted Puja Services for{'\n'}a Happier, Healthier and{'\n'}More Blessed Life
            </Text>

            {/* 3 Pagination Dots */}
            <View style={s.pagination}>
              <View style={s.activeDot} />
              <View style={s.inactiveDot} />
              <View style={s.inactiveDot} />
            </View>
          </View>
        </View>

        {/* Bottom Actions with ample breathing room */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.primaryBtnText}>Get Started  →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF4E8',
  },
  topBellsRow: {
    position: 'absolute',
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  bellWrap: {
    alignItems: 'center',
  },
  bellChain: {
    width: 1.5,
    height: 22,
    backgroundColor: '#D48817',
    opacity: 0.65,
    marginBottom: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  contentCenter: {
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isSmallScreen ? 8 : 16,
    marginBottom: isSmallScreen ? 12 : 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: isSmallScreen ? 25 : 28,
    fontWeight: '700',
    color: '#7A1E14',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    lineHeight: isSmallScreen ? 33 : 37,
    letterSpacing: 0.3,
    marginBottom: isSmallScreen ? 8 : 12,
  },
  subtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#7C6C5E',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 19 : 21,
    maxWidth: 290,
    marginBottom: isSmallScreen ? 14 : 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeDot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D48817',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E6D3BF',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    marginTop: isSmallScreen ? 16 : 28,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#D48817',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D48817',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    color: '#7A1E14',
    fontWeight: '600',
  },
});
