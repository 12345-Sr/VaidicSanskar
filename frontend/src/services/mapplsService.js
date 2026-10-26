import * as Location from 'expo-location';
import axios from 'axios';

/**
 * Mappls (MapmyIndia) Integration Service for Vaidic Sanskar
 * Free developer portal: https://apis.mappls.com/
 *
 * Environment variables:
 * EXPO_PUBLIC_MAPPLS_REST_KEY
 * EXPO_PUBLIC_MAPPLS_CLIENT_ID
 * EXPO_PUBLIC_MAPPLS_CLIENT_SECRET
 */

// Mappls REST Key from environment or active developer key
const MAPPLS_REST_KEY =
  process.env.EXPO_PUBLIC_MAPPLS_REST_KEY || '9a2b6c7bdda0afa47a7fbebfa3608e90';
const MAPPLS_CLIENT_ID = process.env.EXPO_PUBLIC_MAPPLS_CLIENT_ID || '';
const MAPPLS_CLIENT_SECRET = process.env.EXPO_PUBLIC_MAPPLS_CLIENT_SECRET || '';

/**
 * Haversine formula to calculate distance between two coordinates in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Strictly request device GPS permission and fetch live user GPS coordinates
 */
export async function getCurrentUserLocation() {
  try {
    // 1. Check if location services are enabled on device
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.log('Location services disabled on device');
    }

    // 2. Request Foreground GPS Permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        coords: null,
        message: 'कृपया लोकेशन अनुमति दें ताकि नजदीकी पंडित जी को खोजा जा सके। (Location permission is required)',
      };
    }

    // 3. Fetch exact live device GPS position with High Accuracy
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;

    // 4. Resolve exact Indian address via Mappls reverse geocoding API
    const address = await reverseGeocode(latitude, longitude);

    return {
      success: true,
      coords: {
        latitude,
        longitude,
        city: address.city || 'My Location',
        state: address.state || '',
        formattedAddress: address.formattedAddress || `${address.city || 'Live Location'}`,
        locality: address.locality || '',
      },
    };
  } catch (error) {
    console.log('Error getting live location:', error);
    // If high accuracy times out, try balanced as fallback
    try {
      const fallbackLoc = await Location.getLastKnownPositionAsync();
      if (fallbackLoc?.coords) {
        const address = await reverseGeocode(
          fallbackLoc.coords.latitude,
          fallbackLoc.coords.longitude
        );
        return {
          success: true,
          coords: {
            latitude: fallbackLoc.coords.latitude,
            longitude: fallbackLoc.coords.longitude,
            city: address.city || 'Live Location',
            state: address.state || '',
            formattedAddress: address.formattedAddress || 'Live GPS Location',
            locality: address.locality || '',
          },
        };
      }
    } catch {}

    return {
      success: false,
      coords: null,
      message: error?.message || 'Could not fetch device live location.',
    };
  }
}

/**
 * Reverse Geocode coordinates using official Mappls REST API
 */
export async function reverseGeocode(lat, lng) {
  if (MAPPLS_REST_KEY) {
    try {
      const url = `https://apis.mappls.com/advancedmaps/v1/${MAPPLS_REST_KEY}/rev_geocode?lat=${lat}&lng=${lng}`;
      const res = await axios.get(url, { timeout: 8000 });
      if (res.data?.responseCode === 200 && res.data?.results?.[0]) {
        const item = res.data.results[0];
        return {
          formattedAddress: item.formatted_address || `${item.locality || ''}, ${item.city || ''}`,
          city: item.city || item.district || '',
          state: item.state || '',
          pincode: item.pincode || '',
        };
      }
    } catch (e) {
      console.log('Mappls reverse geocode failed, using fallback:', e?.message);
    }
  }

  // Fallback to Expo Location
  try {
    const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (geo && geo.length > 0) {
      const g = geo[0];
      const parts = [g.name, g.street, g.subregion || g.district, g.city, g.region].filter(Boolean);
      return {
        formattedAddress: parts.join(', ') || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
        city: g.city || g.district || 'Live Location',
        state: g.region || '',
        pincode: g.postalCode || '',
      };
    }
  } catch (err) {
    console.log('Expo reverse geocode error:', err);
  }

  return {
    formattedAddress: `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
    city: 'Live Location',
    state: '',
  };
}

/**
 * Mappls Place AutoSuggest API for searching cities, sectors, or landmarks in India
 */
export async function searchMapplsPlaces(query, userLocation = null) {
  if (!query || query.trim().length < 2) return [];

  if (MAPPLS_REST_KEY) {
    try {
      let url = `https://atlas.mappls.com/api/places/geocode?address=${encodeURIComponent(query)}`;
      if (userLocation) {
        url += `&bias=${userLocation.latitude},${userLocation.longitude}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `bearer ${MAPPLS_REST_KEY}` },
        timeout: 6000,
      });

      if (res.data?.copResults && Array.isArray(res.data.copResults)) {
        return res.data.copResults.map((p) => ({
          id: p.eLoc || String(Math.random()),
          placeName: p.placeName || p.formattedAddress,
          address: p.formattedAddress,
          latitude: parseFloat(p.latitude),
          longitude: parseFloat(p.longitude),
        }));
      }
    } catch (e) {
      console.log('Mappls places search fallback:', e?.message);
    }
  }

  // Fallback to Expo geocode
  try {
    const results = await Location.geocodeAsync(query);
    return results.slice(0, 5).map((r, i) => ({
      id: `geo-${i}`,
      placeName: query,
      address: query,
      latitude: r.latitude,
      longitude: r.longitude,
    }));
  } catch {
    return [];
  }
}

/**
 * Generate certified Nearby Pandits dynamically surrounding the user's location
 */
export function getNearbyPandits(userLat, userLng, radiusKm = 15, specialty = 'All') {
  const panditTemplates = [
    {
      id: 'p1',
      name: 'पं. राधेश्याम शास्त्री',
      title: 'आचार्य (काशी संपूर्णानंद संस्कृत वि.वि.)',
      experience: '18 वर्ष अनुभव',
      rating: 4.9,
      reviewCount: 184,
      specialties: ['गृह प्रवेश', 'रुद्राभिषेक', 'महामृत्युंजय जाप', 'सत्यनारायण कथा'],
      offsetLat: 0.0075, // ~0.8 km north
      offsetLng: 0.0062,
      fee: '₹1,500',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      verified: true,
      languages: ['हिंदी', 'संस्कृत'],
    },
    {
      id: 'p2',
      name: 'पं. मुरलीधर मिश्र',
      title: 'वेदाचार्य (ऋग्वेद व यजुर्वेद पारायण)',
      experience: '14 वर्ष अनुभव',
      rating: 4.8,
      reviewCount: 142,
      specialties: ['विवाह संस्कार', 'वास्तु शांति', 'हवन एवं यज्ञ', 'कुंडली मिलान'],
      offsetLat: -0.0092, // ~1.2 km south
      offsetLng: 0.0081,
      fee: '₹2,100',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      verified: true,
      languages: ['हिंदी', 'संस्कृत', 'भोजपुरी'],
    },
    {
      id: 'p3',
      name: 'पं. देवकीनंदन पाठक',
      title: 'ज्योतिष विशारद व कर्मकांडी',
      experience: '22 वर्ष अनुभव',
      rating: 5.0,
      reviewCount: 260,
      specialties: ['नवग्रह शांति', 'कालसर्प योग', 'सत्यनारायण कथा', 'मुंडन संस्कार'],
      offsetLat: 0.0145, // ~1.8 km north-east
      offsetLng: -0.0112,
      fee: '₹1,800',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      verified: true,
      languages: ['हिंदी', 'संस्कृत', 'English'],
    },
    {
      id: 'p4',
      name: 'पं. आशुतोष भारद्वाज',
      title: 'शास्त्री (कर्मकांड व अनुष्ठान विशेषज्ञ)',
      experience: '11 वर्ष अनुभव',
      rating: 4.8,
      reviewCount: 98,
      specialties: ['रुद्राभिषेक', 'सुंदरकांड पाठ', 'महामृत्युंजय जाप', 'हवन'],
      offsetLat: -0.0165, // ~2.1 km south-west
      offsetLng: -0.0074,
      fee: '₹1,200',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      verified: true,
      languages: ['हिंदी', 'संस्कृत'],
    },
    {
      id: 'p5',
      name: 'पं. हरिशंकर वाजपेयी',
      title: 'संस्कृत साहित्य व कर्मकांड मर्मज्ञ',
      experience: '25 वर्ष अनुभव',
      rating: 4.9,
      reviewCount: 310,
      specialties: ['विवाह संस्कार', 'गृह प्रवेश', 'वास्तु शांति', 'श्रीमद्भागवत'],
      offsetLat: 0.0240, // ~3.1 km
      offsetLng: 0.0185,
      fee: '₹2,500',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      isOnline: false,
      verified: true,
      languages: ['हिंदी', 'संस्कृत'],
    },
    {
      id: 'p6',
      name: 'पं. सतीश चंद्र त्रिपाठी',
      title: 'वेद वेदांग विशेषज्ञ',
      experience: '16 वर्ष अनुभव',
      rating: 4.7,
      reviewCount: 115,
      specialties: ['हवन एवं यज्ञ', 'सत्यनारायण कथा', 'नामकरण', 'मुंडन'],
      offsetLat: -0.0290, // ~3.8 km
      offsetLng: 0.0220,
      fee: '₹1,100',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isOnline: true,
      verified: true,
      languages: ['हिंदी', 'संस्कृत'],
    },
  ];

  return panditTemplates
    .map((p) => {
      const pLat = userLat + p.offsetLat;
      const pLng = userLng + p.offsetLng;
      const dist = calculateDistance(userLat, userLng, pLat, pLng);
      const approxMins = Math.max(5, Math.round(dist * 7));

      return {
        ...p,
        latitude: pLat,
        longitude: pLng,
        distanceKm: dist,
        distanceText: `${dist} किमी दूर`,
        etaText: `~${approxMins} मिनट`,
      };
    })
    .filter((p) => {
      const withinRadius = p.distanceKm <= radiusKm;
      if (!withinRadius) return false;
      if (specialty === 'All' || specialty === 'सभी') return true;
      return p.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
