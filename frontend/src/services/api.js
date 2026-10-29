import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, SOCKET_URL } from '../config/env';

/**
 * Base URL for Vaidic Sanskar Backend (Render Backend)
 */
export const BASE_URL = API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if present & persist in AsyncStorage
let authToken = null;
const TOKEN_KEY = '@vaidic_sanskar_auth_token';

// Auto-restore token on startup
AsyncStorage.getItem(TOKEN_KEY)
  .then((storedToken) => {
    if (storedToken) {
      authToken = storedToken;
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  })
  .catch(() => { });

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    AsyncStorage.setItem(TOKEN_KEY, token).catch(() => { });
  } else {
    delete api.defaults.headers.common['Authorization'];
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => { });
  }
};

export const getAuthToken = () => authToken;

api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object') {
      if ('token' in body && body.token) return body;
      if ('data' in body && body.data !== undefined) return body.data;
      if ('pujas' in body && Array.isArray(body.pujas)) return body.pujas;
      if ('vendors' in body && Array.isArray(body.vendors)) return body.vendors;
      if ('products' in body && Array.isArray(body.products)) return body.products;
      if ('plans' in body && Array.isArray(body.plans)) return body.plans;
      if ('orders' in body && Array.isArray(body.orders)) return body.orders;
      if ('bookings' in body && Array.isArray(body.bookings)) return body.bookings;
      if ('user' in body && body.user && !body.token) return body.user;
      if ('vendor' in body && body.vendor) return body.vendor;
    }
    return body;
  },
  async (err) => {
    let message =
      err?.response?.data?.message || err?.message || 'Something went wrong';

    if (err?.message === 'Network Error' || !err?.response) {
      message =
        'Network Error: Unable to reach backend server on Render. Please verify your internet connection.';
    } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
      message =
        'Request timed out. The server took too long to respond. Please try again.';
    }

    return Promise.reject({
      message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
  }
);

/**
 * Endpoint map — mapped directly to ursayush9454/Panditjibackend
 * Mounted at Express prefix: /api/partner/
 */
export const endpoints = {
  // 1. Auth & Profile (/api/partner/auth and /api/partner/profile)
  login: 'auth/login',
  forgotPassword: 'auth/forgot-password',
  resetPassword: 'auth/reset-password',
  sendOtp: 'auth/send-otp',
  verifyOtp: 'auth/verify-otp',
  sendEmailOtp: 'auth/email/send-otp',
  verifyEmailOtp: 'auth/email/verify-otp',
  googleLogin: 'auth/google',
  googleLink: 'auth/google/link',
  firebaseLogin: 'auth/firebase',
  phoneLink: 'auth/phone/link',
  profile: 'auth/me',
  updateProfile: 'profile/me',
  changeEmail: 'profile/change-email',
  changePhone: 'profile/change-phone',
  deactivateAccount: 'profile/deactivate',
  reactivateAccount: 'profile/reactivate',
  deleteAccount: 'profile/delete',
  vendorProfile: 'vendor/profile',
  updateVendorProfile: 'profile/vendor',
  updateOnlineStatus: 'profile/vendor/online-status',
  vendorRegister: 'vendor/register',
  vendorStatus: 'vendor/status',

  // 2. Wallet (/api/partner/wallet)
  wallet: 'wallet',
  walletBalance: 'wallet/balance',
  walletLedger: 'wallet/transactions',
  walletCredit: 'wallet/credit',
  walletDebit: 'wallet/debit',

  // 3. Pujas & Pandit Puja Services (/api/partner/pujas & /api/partner/pandit/puja-services)
  pujaCategories: 'pujas',
  pujaList: 'pujas',
  pujaServices: 'pandit/puja-services',

  // 4. Discovery / Vendors (/api/partner/discovery)
  discoveryVendors: 'discovery/vendors',
  panditList: 'discovery/role/pandit',
  astrologerList: 'discovery/role/astrologer',
  mandaliList: 'discovery/role/mandali',
  topAstrologers: 'discovery/astrologers/top',
  onlineAstrologers: 'discovery/astrologers/online',
  vendorDetail: 'discovery/vendors',
  discoveryStats: 'discovery/stats',

  // 5. Pandit Slots (/api/partner/pandit/slots)
  slots: 'pandit/slots',
  bookSlot: 'pandit/slots/book',
  cancelSlot: 'pandit/slots/cancel',

  // 6. Bookings (/api/partner/bookings)
  createBooking: 'bookings',
  bookingStatus: 'bookings',
  myBookings: 'bookings/my',
  vendorBookings: 'bookings/vendor',
  generateServiceOtp: 'bookings',
  verifyServiceOtp: 'bookings',
  submitReview: 'reviews',

  // 7. Instant Booking Dispatch (Uber / Rapido style) (/api/partner/instant)
  instantNearby: 'instant/nearby-pandits',
  instantEstimate: 'instant/estimate',
  instantRequest: 'instant/request',
  instantActive: 'instant/active',
  instantCancel: 'instant',
  instantDetail: 'instant',
  instantReviewCustomer: 'instant',
  instantReviewPandit: 'instant',
  instantReviews: 'instant',

  // 8. E-Store Customer Facing (/api/partner/store)
  storeHome: 'store/home',
  storeCategories: 'store/categories',
  storeProducts: 'store/products',
  productCategories: 'store/categories',
  productList: 'store/products',
  storeKit: 'store/pujas',
  storeCart: 'store/cart',
  storeCartItems: 'store/cart/items',
  storeWishlist: 'store/wishlist',
  storeAddresses: 'store/addresses',
  storeCoupons: 'store/coupons',
  storeValidateCoupon: 'store/coupons/validate',
  storeCheckoutPreview: 'store/checkout/preview',
  storeCheckout: 'store/checkout',
  storeOrders: 'store/orders',
  createOrder: 'store/checkout',
  orderTracking: 'store/orders',
  myOrders: 'store/orders',

  // Merchant / Partner Store (/api/partner/merchant)
  merchantProducts: 'merchant/products',
  merchantOrders: 'merchant/orders',
  merchantDashboard: 'merchant/dashboard',

  // 9. Daily Puja Subscriptions (/api/partner/daily-puja)
  dailyPanditPlans: 'daily-puja/plans',
  createSubscription: 'daily-puja',
  mySubscriptions: 'daily-puja/my',

  // 10. Bhajan Mandali (/api/partner/mandali & /api/partner/mandali/portfolio)
  mandaliEnquiry: 'mandali/inquiries',
  myMandaliInquiries: 'mandali/my-inquiries',
  myMandaliDispatches: 'mandali/my-dispatches',
  mandaliDispatchDetail: 'mandali/dispatches',
  mandaliPortfolio: 'mandali/portfolio',

  // 11. Astrology / Kundli / Horoscope (/api/partner/astrology & /api/partner/kundli-matching)
  makeKundali: 'astrology/kundli/generate',
  matchKundali: 'astrology/kundli/matching',
  kundliMatching: 'kundli-matching',
  horoscope: 'astrology/horoscope',
  birthProfiles: 'astrology/birth-profiles',
  myKundlis: 'astrology/kundli',

  // 12. Payments (/api/partner/payments)
  paymentCreateOrder: 'payments/orders', // Backend: POST /api/partner/payments/orders
  paymentVerify: 'payments/verify',
  paymentMy: 'payments/my',

  // 13. Notifications & Push Tokens (/api/partner/notifications & /api/partner/device-tokens)
  notifications: 'notifications',
  notificationUnreadCount: 'notifications/unread-count',
  notificationReadAll: 'notifications/read-all',
  registerDeviceToken: 'device-tokens/register', // Backend: POST /api/partner/device-tokens/register
  deactivateDeviceToken: 'device-tokens/deactivate',

  // 14. Chat & Consultation (/api/partner/chat & /api/partner/consultation)
  conversations: 'chat/conversations',
  chatUnreadCount: 'chat/unread-count',
  consultations: 'consultation',
  myConsultations: 'consultation/my',

  // 15. File Uploads (/api/partner/uploads)
  uploadSingle: 'uploads/single',

  // 16. Health (/api/health)
  health: '../health',
};

/* ----------------------------------------------------------------
 * Typed service helpers — screens call these to interact with backend
 * ---------------------------------------------------------------- */

export const PanditService = {
  list: (params) => api.get(endpoints.panditList, { params }),
  detail: (id) => api.get(`${endpoints.vendorDetail}/${id}`),
};

export const BookingService = {
  create: (payload) => {
    const body = {
      vendorId: payload.vendorId || payload.panditId,
      slotId: payload.slotId,
      serviceType: payload.serviceType || 'pooja',
      title: payload.title || payload.name || 'Vedic Pooja',
      description: payload.description || payload.notes || '',
      address: payload.address || payload.serviceAddress || '',
      city: payload.city || payload.serviceArea || '',
      pincode: payload.pincode || '',
      latitude: payload.latitude,
      longitude: payload.longitude,
      amount: payload.amount || payload.total || payload.totalAmount || 0,
      metadata: payload.metadata || { withSamagri: payload.withSamagri !== false },
      ...payload,
    };
    return api.post(endpoints.createBooking, body);
  },
  mine: () => api.get(endpoints.myBookings),
  detail: (id) => api.get(`${endpoints.bookingStatus}/${id}`),
  generateServiceOtp: (id) => api.post(`${endpoints.bookingStatus}/${id}/service-otp`),
  verifyServiceOtp: (id, otp) =>
    api.put(`${endpoints.bookingStatus}/${id}/verify-service-otp`, { otp }),
  cancel: (id, reason) => api.put(`${endpoints.bookingStatus}/${id}/cancel`, { reason }),
  reschedule: (id, data) => api.put(`${endpoints.bookingStatus}/${id}/reschedule`, data),
};

export const PaymentService = {
  createOrder: (amount, meta = {}) => {
    const payload = {
      amount,
      purpose: meta.purpose || (meta.bookingId ? 'booking' : (meta.subscriptionId ? 'daily_puja' : 'wallet_topup')),
      ...meta,
    };
    return api.post(endpoints.paymentCreateOrder, payload);
  },
  verify: (payload) => api.post(endpoints.paymentVerify, payload),
  my: () => api.get(endpoints.paymentMy),
};

export const AuthService = {
  loginWithPassword: ({ email, password }) =>
    api.post(endpoints.login, { email, password }),
  forgotPassword: (email) =>
    api.post(endpoints.forgotPassword, { email }),
  resetPassword: ({ email, otp, newPassword }) =>
    api.post(endpoints.resetPassword, { email, otp, newPassword }),
  sendOtp: (phone) => api.post(endpoints.sendOtp, { phone }),
  verifyOtp: (phone, otp) => api.post(endpoints.verifyOtp, { phone, otp }),
  sendEmailOtp: (email) => api.post(endpoints.sendEmailOtp, { email }),
  verifyEmailOtp: ({ email, otp, name }) =>
    api.post(endpoints.verifyEmailOtp, { email, otp, name }),
  googleLogin: (idToken) =>
    api.post(endpoints.googleLogin, typeof idToken === 'string' ? { idToken } : idToken),
  firebaseLogin: (idToken) =>
    api.post(endpoints.firebaseLogin, typeof idToken === 'string' ? { idToken } : idToken),
  linkGoogle: (idToken) => api.post(endpoints.googleLink, { idToken }),
  linkPhone: (idToken) => api.post(endpoints.phoneLink, { idToken }),
  getProfile: () => api.get(endpoints.profile),
  updateProfile: (data) => api.put(endpoints.updateProfile, data),
  changeEmail: (email) => api.put(endpoints.changeEmail, { email }),
  changePhone: (phoneOrToken) => api.put(endpoints.changePhone, typeof phoneOrToken === 'string' ? { phone: phoneOrToken } : phoneOrToken),
  deactivateAccount: (password) => api.put(endpoints.deactivateAccount, { password }),
  deleteAccount: (password) => api.delete(endpoints.deleteAccount, { data: { password } }),
  getVendorStatus: () => api.get(endpoints.vendorStatus),
  loginWithEmail: (email) => AuthService.sendEmailOtp(email),
};

export const WalletService = {
  get: () => api.get(endpoints.wallet),
  balance: () => api.get(endpoints.walletBalance),
  ledger: () => api.get(endpoints.walletLedger),
  credit: (amount, reference) => api.post(endpoints.walletCredit, { amount, reference }),
  debit: (amount, reference) => api.post(endpoints.walletDebit, { amount, reference }),
};

export const PujaService = {
  categories: () => api.get(endpoints.pujaCategories),
  list: (params) => api.get(endpoints.pujaList, { params }),
  detail: (id) => api.get(`${endpoints.pujaList}/${id}`),
  book: (payload) => BookingService.create(payload),
  status: (id) => api.get(`${endpoints.bookingStatus}/${id}`),
  verifyOtp: (id, otp) =>
    api.put(`${endpoints.bookingStatus}/${id}/verify-service-otp`, { otp }),
  review: (payload) => api.post(endpoints.submitReview, payload),
};

export const StoreService = {
  home: () => api.get(endpoints.storeHome),
  categories: () => api.get(endpoints.storeCategories),
  products: async (params) => {
    // 1. Try to fetch from active Admin suite backend (where admin adds live products)
    const adminSuiteCandidates = [
      (SOCKET_URL || '').replace(/\/+$/, '') + '/api/store/products',
      'https://vaidic-sanskar-admin-suite.onrender.com/api/store/products',
      'http://localhost:4000/api/store/products',
    ];

    for (const suiteUrl of adminSuiteCandidates) {
      if (suiteUrl && !suiteUrl.startsWith('/api') && !suiteUrl.includes('undefined')) {
        try {
          const res = await axios.get(suiteUrl, {
            params,
            timeout: 6000,
            headers: { 'ngrok-skip-browser-warning': '1' },
          });
          const prods = res.data?.products || res.data?.data || (Array.isArray(res.data) ? res.data : []);
          if (Array.isArray(prods) && prods.length > 0) {
            return { success: true, count: prods.length, products: prods, data: prods };
          }
        } catch (_) {}
      }
    }

    // 2. Fallback to primary API (Render)
    try {
      const res = await api.get(endpoints.storeProducts, { params });
      const prods = res?.products || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(prods) && prods.length > 0) return res;
    } catch (_) {}

    return { success: true, products: [], data: [] };
  },
  detail: async (idOrSlug) => {
    // 1. Try admin suite
    const adminSuiteCandidates = [
      (SOCKET_URL || '').replace(/\/+$/, '') + `/api/store/products/${idOrSlug}`,
      `https://vaidic-sanskar-admin-suite.onrender.com/api/store/products/${idOrSlug}`,
      'http://localhost:4000/api/store/products/' + idOrSlug,
    ];
    for (const suiteUrl of adminSuiteCandidates) {
      if (suiteUrl && !suiteUrl.startsWith('/api') && !suiteUrl.includes('undefined')) {
        try {
          const res = await axios.get(suiteUrl, {
            timeout: 6000,
            headers: { 'ngrok-skip-browser-warning': '1' },
          });
          const p = res.data?.product || res.data?.data || res.data;
          if (p && (p.id || p._id)) return { success: true, product: p, data: p };
        } catch (_) {}
      }
    }
    return api.get(`${endpoints.storeProducts}/${idOrSlug}`);
  },
  pujaKit: (pujaId) => api.get(`${endpoints.storeKit}/${pujaId}/kit`),
  cart: () => api.get(endpoints.storeCart),
  addToCart: (productId, quantity = 1, variantId) =>
    api.post(endpoints.storeCartItems, { productId, quantity, variantId }),
  updateCartItem: (productId, quantity) =>
    api.put(`${endpoints.storeCartItems}/${productId}`, { quantity }),
  removeCartItem: (productId) =>
    api.delete(`${endpoints.storeCartItems}/${productId}`),
  clearCart: () => api.delete(endpoints.storeCart),
  wishlist: () => api.get(endpoints.storeWishlist),
  addToWishlist: (productId) => api.post(`${endpoints.storeWishlist}/${productId}`),
  removeFromWishlist: (productId) => api.delete(`${endpoints.storeWishlist}/${productId}`),
  addresses: () => api.get(endpoints.storeAddresses),
  addAddress: (payload) => api.post(endpoints.storeAddresses, payload),
  updateAddress: (id, payload) => api.put(`${endpoints.storeAddresses}/${id}`, payload),
  deleteAddress: (id) => api.delete(`${endpoints.storeAddresses}/${id}`),
  coupons: () => api.get(endpoints.storeCoupons),
  validateCoupon: (code, total) =>
    api.post(endpoints.storeValidateCoupon, { code, total }),
  checkoutPreview: (payload) => api.post(endpoints.storeCheckoutPreview, payload),
  checkout: async (payload) => {
    const suiteCandidates = [
      (SOCKET_URL || '').replace(/\/+$/, '') + '/api/store/checkout',
      'https://vaidic-sanskar-admin-suite.onrender.com/api/store/checkout',
      'http://localhost:4000/api/store/checkout',
    ];
    for (const url of suiteCandidates) {
      if (url && !url.startsWith('/api') && !url.includes('undefined')) {
        try {
          const res = await axios.post(url, payload, {
            timeout: 6000,
            headers: { 'ngrok-skip-browser-warning': '1' },
          });
          if (res.data?.success || res.data?.order || res.data?.orders) {
            return res.data;
          }
        } catch (_) {}
      }
    }
    return api.post(endpoints.storeCheckout, payload);
  },
  createOrder: async (payload) => {
    const suiteCandidates = [
      (SOCKET_URL || '').replace(/\/+$/, '') + '/api/store/orders',
      'https://vaidic-sanskar-admin-suite.onrender.com/api/store/orders',
      'http://localhost:4000/api/store/orders',
    ];
    for (const url of suiteCandidates) {
      if (url && !url.startsWith('/api') && !url.includes('undefined')) {
        try {
          const res = await axios.post(url, payload, {
            timeout: 6000,
            headers: { 'ngrok-skip-browser-warning': '1' },
          });
          if (res.data?.success || res.data?.order) return res.data;
        } catch (_) {}
      }
    }
    return api.post(endpoints.storeCheckout, payload);
  },
  track: (id) => api.get(`${endpoints.storeOrders}/${id}`),
  mine: () => api.get(endpoints.storeOrders),
  cancelOrder: (id, reason) => api.put(`${endpoints.storeOrders}/${id}/cancel`, { reason }),
  returnOrder: (id, payload) => api.post(`${endpoints.storeOrders}/${id}/return`, payload),
  reorder: (id) => api.post(`${endpoints.storeOrders}/${id}/reorder`),
  invoice: (id) => api.get(`${endpoints.storeOrders}/${id}/invoice`),
  reviews: (productId) => api.get(`${endpoints.storeProducts}/${productId}/reviews`),
  createReview: (productId, payload) => api.post(`${endpoints.storeProducts}/${productId}/reviews`, payload),
};

export const SubscriptionService = {
  plans: () => api.get(endpoints.dailyPanditPlans),
  create: (payload) => api.post(endpoints.createSubscription, payload),
  mine: () => api.get(endpoints.mySubscriptions),
  get: (id) => api.get(`${endpoints.createSubscription}/${id}`),
  skip: (id, date) => api.post(`${endpoints.createSubscription}/${id}/skip`, { date }),
  cancel: (id, reason) => api.put(`${endpoints.createSubscription}/${id}/cancel`, { reason }),
};

export const MandaliService = {
  list: (params) => api.get(endpoints.mandaliList, { params }),
  enquiry: (payload) => api.post(endpoints.mandaliEnquiry, payload),
  myInquiries: () => api.get(endpoints.myMandaliInquiries),
  myDispatches: () => api.get(endpoints.myMandaliDispatches),
  getDispatch: (id) => api.get(`${endpoints.mandaliDispatchDetail}/${id}`),
  getInquiry: (id) => api.get(`${endpoints.mandaliEnquiry}/${id}`),
  acceptQuote: (inquiryId) => api.put(`${endpoints.mandaliEnquiry}/${inquiryId}/accept`),
  cancelInquiry: (inquiryId, reason) => api.put(`${endpoints.mandaliEnquiry}/${inquiryId}/cancel`, { reason }),
  portfolio: () => api.get(endpoints.mandaliPortfolio),
};

export const AstroService = {
  makeKundali: (payload) => api.post(endpoints.makeKundali, payload),
  matchKundali: (payload) => api.post(endpoints.kundliMatching, payload),
  matchKundaliDirect: (payload) => api.post(endpoints.kundliMatching, payload),
  astrologers: (params) => api.get(endpoints.astrologerList, { params }),
  top: () => api.get(endpoints.topAstrologers),
  online: () => api.get(endpoints.onlineAstrologers),
  horoscope: (params) => api.get(endpoints.horoscope, { params }),
  birthProfiles: () => api.get(endpoints.birthProfiles),
  createBirthProfile: (payload) => api.post(endpoints.birthProfiles, payload),
  getBirthProfile: (id) => api.get(`${endpoints.birthProfiles}/${id}`),
  updateBirthProfile: (id, payload) => api.put(`${endpoints.birthProfiles}/${id}`, payload),
  deleteBirthProfile: (id) => api.delete(`${endpoints.birthProfiles}/${id}`),
  setDefaultBirthProfile: (id) => api.put(`${endpoints.birthProfiles}/${id}/default`),
  myKundlis: () => api.get(endpoints.myKundlis),
  getKundli: (id) => api.get(`${endpoints.myKundlis}/${id}`),
  regenerateKundli: (id) => api.post(`${endpoints.myKundlis}/${id}/regenerate`),
};

export const SlotService = {
  get: (date) => api.get(endpoints.slots, { params: { date } }),
  book: (slotId) => api.post(endpoints.bookSlot, { slotId }),
  cancel: (slotId) => api.put(endpoints.cancelSlot, { slotId }),
};

export const ReviewService = {
  create: (payload) => api.post(endpoints.submitReview, payload),
  mine: () => api.get(`${endpoints.submitReview}/my`),
  vendor: (vendorId) => api.get(`${endpoints.submitReview}/vendor/${vendorId}`),
  get: (id) => api.get(`${endpoints.submitReview}/${id}`),
  update: (id, payload) => api.put(`${endpoints.submitReview}/${id}`, payload),
  delete: (id) => api.delete(`${endpoints.submitReview}/${id}`),
  helpful: (id) => api.post(`${endpoints.submitReview}/${id}/helpful`),
  report: (id, reason) => api.post(`${endpoints.submitReview}/${id}/report`, { reason }),
};

export const NotificationService = {
  list: (params) => api.get(endpoints.notifications, { params }),
  unreadCount: () => api.get(endpoints.notificationUnreadCount),
  markAllAsRead: () => api.put(endpoints.notificationReadAll),
  markAsRead: (id) => api.put(`${endpoints.notifications}/${id}/read`),
  delete: (id) => api.delete(`${endpoints.notifications}/${id}`),
  registerDeviceToken: (payload) =>
    api.post(endpoints.registerDeviceToken, payload),
  deactivateDeviceToken: (payload) =>
    api.post(endpoints.deactivateDeviceToken, payload),
};

export const UploadService = {
  single: (formData) =>
    api.post(endpoints.uploadSingle, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const InstantService = {
  nearbyPandits: (params) => api.get(endpoints.instantNearby, { params }),
  estimate: (payload) => api.post(endpoints.instantEstimate, payload),
  request: (payload) => {
    // Ensure scheduledAt is present and future if not provided
    const scheduledAt = payload.scheduledAt || new Date(Date.now() + 49 * 3600 * 1000).toISOString();
    return api.post(endpoints.instantRequest, { ...payload, scheduledAt });
  },
  active: () => api.get(endpoints.instantActive),
  cancel: (id, reason) =>
    api.put(`${endpoints.instantCancel}/${id}/cancel`, { reason }),
  get: (id) => api.get(`${endpoints.instantDetail}/${id}`),
  submitCustomerReview: (id, payload) =>
    api.post(`${endpoints.instantReviewCustomer}/${id}/reviews/customer`, payload),
  getReviews: (id) => api.get(`${endpoints.instantReviews}/${id}/reviews`),
};

export const ChatService = {
  conversations: () => api.get(endpoints.conversations),
  get: (id) => api.get(`${endpoints.conversations}/${id}`),
  messages: (id, params) =>
    api.get(`${endpoints.conversations}/${id}/messages`, { params }),
  sendMessage: (id, text) =>
    api.post(`${endpoints.conversations}/${id}/messages`, { text }),
  markRead: (id) => api.put(`${endpoints.conversations}/${id}/read`),
  unreadCount: () => api.get(endpoints.chatUnreadCount),
};

export const ConsultationService = {
  create: (payload) => api.post(endpoints.consultations, payload),
  mine: () => api.get(endpoints.myConsultations),
  get: (id) => api.get(`${endpoints.consultations}/${id}`),
};

export const HealthService = { check: () => api.get(endpoints.health) };

export const DEFAULT_LIBRARY_ITEMS = [
  {
    id: 'lib-1',
    title: 'Hanuman Chalisa',
    type: 'Chalisa',
    verses: 40,
    duration: '9:30',
    hasAudio: true,
    featured: true,
    popular: true,
    description: 'महावीर श्री हनुमान जी की स्तुति में गोस्वामी तुलसीदास जी द्वारा रचित पावन चालीसा।',
    versesList: [
      '॥ दोहा ॥',
      'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।\nबरनऊं रघुबर बिमल जसु जो दायकु फल चारि॥',
      'बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार।\nबल बुद्धि बिद्या देहु मोहिं हरहु कलेस बिकार॥',
      '॥ चौपाई ॥',
      'जय हनुमान ज्ञान गुन सागर।\nजय कपीस तिहुं लोक उजागर॥',
      'राम दूत अतुलित बल धामा।\nअंजनि-पुत्र पवनसुत नामा॥',
    ],
  },
  {
    id: 'lib-2',
    title: 'Shiv Tandav Stotra',
    type: 'Stotra',
    verses: 15,
    duration: '12:15',
    hasAudio: true,
    featured: false,
    popular: true,
    description: 'भगवान शिव का परम पावन तांडव स्तोत्र।',
  },
  {
    id: 'lib-3',
    title: 'Durga Saptashati',
    type: 'Granth',
    verses: 700,
    duration: '45:00',
    hasAudio: false,
    featured: false,
    popular: true,
    description: 'भगवती महामाया का पावन महाकाव्य।',
  },
  {
    id: 'lib-4',
    title: 'Mahamrityunjaya Mantra',
    type: 'Stotra',
    verses: 1,
    duration: '8:45',
    hasAudio: true,
    popular: true,
  },
  {
    id: 'lib-5',
    title: 'Ganesh Aarti',
    type: 'Aarti',
    verses: 5,
    duration: '4:30',
    hasAudio: true,
    popular: true,
  },
  {
    id: 'lib-6',
    title: 'Om Jai Jagdish Hare',
    type: 'Aarti',
    verses: 7,
    duration: '5:50',
    hasAudio: true,
    popular: true,
  },
  {
    id: 'lib-7',
    title: 'Isha Upanishad',
    type: 'Upanishad',
    verses: 18,
    duration: '15:20',
    hasAudio: false,
    popular: true,
  },
];

export const LibraryService = {
  list: () => Promise.resolve(DEFAULT_LIBRARY_ITEMS),
  get: (id) =>
    Promise.resolve(DEFAULT_LIBRARY_ITEMS.find((i) => i.id === id) || DEFAULT_LIBRARY_ITEMS[0]),
};

export default api;
