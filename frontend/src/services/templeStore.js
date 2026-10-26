/**
 * Temple Store (User App)
 * Implements Temple Locator PRD specifications:
 * - Verified Temples (Saffron badge, full Aarti schedule, darshan slots, live stream, history, facilities)
 * - Google Places Temples (Attribution, basic info, claim/contribute CTA)
 * - 12 Jyotirlinga, Char Dham, 51 Shakti Peeth collections
 * - Search by name, deity, city, collection
 * - Radius and advanced filters (open now, verified, facilities)
 * - "Mera Mandir" follow list with aarti notifications
 * - User suggestions, add new temple, and trustee claim submissions
 */

export const TIRTH_COLLECTIONS = [
  {
    id: 'jyotirlinga',
    title: '12 ज्योतिर्लिंग (12 Jyotirlinga)',
    subtitle: 'भगवान शिव के 12 पावन ज्योतिर्लिंग दर्शन',
    icon: 'fire',
    count: 12,
    templeIds: ['t1', 't4', 't_somnath', 't_kedarnath'],
    tag: 'शिव तीर्थ',
  },
  {
    id: 'chardham',
    title: 'चार धाम यात्रा (Char Dham)',
    subtitle: 'बद्रीनाथ, द्वारका, जगन्नाथ पुरी, रामेश्वरम',
    icon: 'compass',
    count: 4,
    templeIds: ['t_badrinath', 't_puri', 't_dwarka', 't_rameshwaram'],
    tag: 'मोक्ष धाम',
  },
  {
    id: 'shaktipeeth',
    title: '51 शक्तिपीठ (51 Shakti Peeth)',
    subtitle: 'माँ भगवती के पावन शक्तिपीठ',
    icon: 'flower-tulip',
    count: 51,
    templeIds: ['t_kamakhya', 't_vaishnodevi', 't_kalighat'],
    tag: 'देवी तीर्थ',
  },
];

export const INITIAL_TEMPLES = [];

class TempleStore {
  constructor() {
    this.temples = JSON.parse(JSON.stringify(INITIAL_TEMPLES));
    this.searchQuery = '';
    this.selectedRadius = 'All'; // '1', '5', '10', '25', 'All'
    this.selectedDeity = 'All';
    this.onlyVerified = false;
    this.onlyOpen = false;
    this.onlyDarshanBooking = false;
    this.userContributions = [];
    this.claimRequests = [];
    this.recentSearches = ['काशी विश्वनाथ', 'हनुमान मंदिर', 'महाकाल', '12 ज्योतिर्लिंग'];
    this.currentLocation = {
      city: 'वाराणसी (Varanasi)',
      pincode: '221001',
      coords: { lat: 25.3109, lng: 83.0107 },
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in TempleStore listener:', e);
      }
    });
  }

  getTemples() {
    return this.temples;
  }

  getFilteredTemples() {
    return this.temples.filter((t) => {
      // Radius filter
      if (this.selectedRadius !== 'All') {
        const rad = parseFloat(this.selectedRadius);
        if (t.distanceKm > rad) return false;
      }
      // Deity filter
      if (this.selectedDeity !== 'All' && t.deity.toLowerCase() !== this.selectedDeity.toLowerCase()) {
        return false;
      }
      // Verified filter
      if (this.onlyVerified && !t.is_verified) {
        return false;
      }
      // Open now filter
      if (this.onlyOpen && !t.open) {
        return false;
      }
      // Darshan booking filter
      if (this.onlyDarshanBooking && !t.hasDarshanBooking) {
        return false;
      }
      // Search query filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesName = (t.name || '').toLowerCase().includes(q) || (t.name_en || '').toLowerCase().includes(q);
        const matchesCity = (t.city || '').toLowerCase().includes(q);
        const matchesDeity = (t.deity || '').toLowerCase().includes(q) || (t.deity_hi || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesDeity) return false;
      }
      return true;
    });
  }

  getTempleById(id) {
    return this.temples.find((t) => t.id === id) || this.temples[0];
  }

  getFollowedTemples() {
    return this.temples.filter((t) => t.isFollowed);
  }

  toggleFollowTemple(id) {
    const temple = this.temples.find((t) => t.id === id);
    if (temple) {
      temple.isFollowed = !temple.isFollowed;
      this.notify();
    }
  }

  setSearchQuery(q) {
    this.searchQuery = q;
    if (q && q.length > 2 && !this.recentSearches.includes(q)) {
      this.recentSearches = [q, ...this.recentSearches.slice(0, 5)];
    }
    this.notify();
  }

  setRadius(r) {
    this.selectedRadius = r;
    this.notify();
  }

  setDeityFilter(d) {
    this.selectedDeity = d;
    this.notify();
  }

  setFilterFlags({ onlyVerified, onlyOpen, onlyDarshanBooking }) {
    if (onlyVerified !== undefined) this.onlyVerified = onlyVerified;
    if (onlyOpen !== undefined) this.onlyOpen = onlyOpen;
    if (onlyDarshanBooking !== undefined) this.onlyDarshanBooking = onlyDarshanBooking;
    this.notify();
  }

  addReview(templeId, { user, rating, comment }) {
    const temple = this.temples.find((t) => t.id === templeId);
    if (temple) {
      if (!temple.reviews) temple.reviews = [];
      temple.reviews.unshift({
        user: user || 'भक्त (You)',
        rating: rating || 5,
        date: 'अभी-अभी',
        comment: comment || 'सुन्दर दर्शन।',
      });
      this.notify();
      return true;
    }
    return false;
  }

  // User Suggestion / Correction
  submitSuggestion({ templeId, templeName, type, details, photo }) {
    const suggestion = {
      id: 'sug_' + Date.now(),
      templeId,
      templeName: templeName || 'नया मंदिर',
      type, // 'timing_correction', 'closed', 'new_temple', 'facilities'
      details,
      photo,
      status: 'pending_admin_approval',
      createdAt: new Date().toISOString(),
    };
    this.userContributions.push(suggestion);
    this.notify();
    return suggestion;
  }

  // Submit Temple Claim for Pujari / Trustee / Prabandhak
  submitClaim({ templeId, templeName, role, applicantName, phone, idProof, letterhead }) {
    const claim = {
      id: 'claim_' + Date.now(),
      templeId,
      templeName,
      role, // 'pujari', 'trustee', 'prabandhak'
      applicantName,
      phone,
      idProof,
      letterhead,
      status: 'pending_verification', // 'approved', 'rejected'
      submittedAt: new Date().toISOString(),
    };
    this.claimRequests.push(claim);
    this.notify();
    return claim;
  }

  // Add brand new temple by user
  addNewTemple({ name, name_en, deity, city, address, timings, lat, lng }) {
    const newTemple = {
      id: 'user_t_' + Date.now(),
      name,
      name_en: name_en || name,
      city: city || 'वाराणसी',
      state: 'भारत',
      address: address || city,
      deity: deity || 'Shiva',
      deity_hi: deity === 'Shiva' ? 'भगवान शिव' : deity,
      sampraday: 'सनातन',
      distanceKm: 2.5,
      travelTimeWalk: '25 मिनट',
      travelTimeDrive: '8 मिनट',
      lat: lat || 25.31,
      lng: lng || 83.01,
      is_verified: false,
      hasDarshanBooking: false,
      hasDonation: false,
      hasPoojaBooking: false,
      source: 'user_contributed',
      open: true,
      statusText: 'श्रद्धालु द्वारा जोड़ा गया (सत्यापन प्रतीक्षित)',
      nextAartiText: 'आरती समय पुष्टि प्रतीक्षित',
      rating: 5.0,
      reviewsCount: '1',
      about: 'भक्तों द्वारा जोड़ा गया पावन मंदिर। प्रशासनिक सत्यापन प्रक्रियाधीन है।',
      timings: timings || '06:00 AM - 09:00 PM',
      darshanTimings: [{ session: 'दैनिक दर्शन', time: timings || '06:00 AM - 09:00 PM' }],
      aartis: [],
      facilities: [{ key: 'prasad', label: 'प्रसाद काउंटर', available: true, icon: 'food-apple' }],
      slots: [],
      poojas: [],
      isFollowed: false,
      reviews: [],
    };
    this.temples.unshift(newTemple);
    this.notify();
    return newTemple;
  }
}

export const templeStore = new TempleStore();
export default templeStore;
