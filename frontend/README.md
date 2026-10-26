# Vaidic Sanskar — Devotional Super-App (User App)

Production-oriented **React Native (Expo)** user app for a devotional super-app
platform: pandit/puja booking, e-commerce, library + audio, subscriptions,
bhajan mandali, temple darshan, astrology (Vartalap live calls) and grand-event
curation — with a **Platform Wallet**, **REST APIs**, and a **WebSocket** layer
for real-time updates.

Runnable **end-to-end scaffold**: every screen renders and navigates in Expo Go
with mock data + demo real-time simulation. Developer wires the backend, keys
and native SDKs (payment, maps, Agora, background audio) for production.

---

## 1. Run

```bash
npm install
npx expo start          # press a=Android, i=iOS, w=web, or scan QR in Expo Go
```

Node 18+. Native features (Agora calls, Google Maps, Razorpay, background audio)
need a dev build: `npx expo prebuild && npx expo run:android`. In Expo Go these
degrade gracefully (placeholders / demo mode) so the whole flow stays testable.

---

## 2. Tech & Architecture

| Layer | Choice |
|------|--------|
| Framework | React Native + Expo (Android/iOS/web) |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| State | **Provider pattern** via Context (`src/context/AppContext.js`) — slices: `auth`, `wallet`, `cart`; hooks `useAuth / useWallet / useCart`. Maps 1:1 to Redux slices or Bloc cubits if you prefer. |
| REST | `axios` instance + typed services (`src/services/api.js`) |
| Real-time | `src/services/socket.js` — WebSocket wrapper with reconnect + `simulate()` demo mode |
| Theme | `src/theme/colors.js` — Saffron `#FF9933`, Gold `#D4AF37`, Cream `#FFFDD0` |

### Theme tokens
Deep Saffron `#FF9933` (primary) · Warm Gold `#D4AF37` (secondary) · Cream White
`#FFFDD0` (background). Change once in `colors.js` → whole app updates.

---

## 3. Modules & screens

| Module | Screens | Key features |
|--------|---------|--------------|
| **Auth & Profile** | LoginMode, Login, Otp, Register, ForgotPassword, ProfileSetup, AddressBook | Phone+OTP, profile (Gotra, Nakshatra), address book with geocoding hook |
| **Wallet** | Wallet | Balance, Add Money (UPI/Card), transaction ledger, auto-deduction (powers all paid flows) |
| **1 · Pandit Booking** | PujaBrowse, PujaBooking, BookingStatus, Chat, Review | Puja categories + base rates, **With/Without Samagri** toggle, address → **Lock booking**, real-time **"Purohit assigned"** (WebSocket), masked phone, **in-app chat**, on-screen **completion OTP**, **dual review** |
| **2 · E-Commerce** | EStore, ProductDetail, Cart, Checkout, OrderTracking | Grid + categories, cart, **Wallet or gateway** checkout, **order tracking timeline** (Processing→Packed→Out→Delivered) |
| **3 · Sahitya Sangrah** | Library, Reader | Text reader with **font scaling + bookmark**, **audio player** (play/seek), **freemium metering** → subscription modal |
| **4 · Daily Pandit** | DailyPandit, MySchedule | Venue type, time slot, plan duration (1wk/1mo/3mo), active weekly schedule |
| **5 · Bhajan Mandali** | BhajanMandali, MandaliBooking | Catalog + media samples, booking form → **"2-Hour SLA"** alert |
| **6/8 · Temple** | TempleLocator, DarshanBooking, VIPPass | Map + markers, **turn-by-turn navigation** (Maps URL scheme), darshan slots, **VIP pass** booking |
| **7/9 · Astrology / Vartalap** | Kundali, KundaliMatchingForm, KundaliResult, Vartalap, Call | Kundli + Gun Milan UI, astrologer marketplace (per-min rates), **chat / audio / video**, **floating per-minute wallet timer + auto-end** when balance < 1 min |
| **10 · Bhavya Aayojan** | BhavyaAayojan | VIP guru gallery + **Request Callback** form |

Plus: Home (banners, services, **ad slot**, Talk-to-Astrologer CTA), Categories,
Donation, Rashifal, Payment, OrderSuccess, MyBookings, About, Contact.

---

## 4. Real-time (WebSocket)

`src/services/socket.js` exposes `connect() / on(event,cb) / send() / simulate()`.
Events used by the UI:

| Event | Drives |
|-------|--------|
| `booking:assigned` | Pandit assignment on BookingStatus |
| `chat:message` | In-app chat |
| `order:update` | Order tracking timeline |
| (call signaling) | Vartalap call connect/accept/end |

`mock: true` makes the app fully demoable. Set it to `false` and point `WS_URL`
at your gateway (socket.io / ws / Ably / Pusher) for production.

---

## 5. Developer TODO (production)

1. **Backend**: set `BASE_URL` + confirm paths in `src/services/api.js`. Service
   helpers are grouped per module; each screen has `// TODO` where mock → real.
2. **WebSocket**: `socket.js` → `mock=false`, set `WS_URL`.
3. **Payments**: Razorpay already integrated (`src/config/payment.js` key +
   backend `create-order`/`verify`). Wallet add-money routes through the same.
4. **Maps**: `react-native-maps` wired in TempleLocator — add key in `app.json`
   (`plugins → react-native-maps → androidGoogleMapsApiKey`).
5. **Live calls**: `src/screens/vartalap/CallScreen.js` — drop in Agora/WebRTC
   (`react-native-agora`); the per-minute wallet metering logic already works.
6. **Audio**: ReaderScreen player → `expo-av` for streaming + background audio
   (`expo-av` + `UIBackgroundModes` / Android foreground service).
7. **OTP/Auth**: wire `AuthService.sendOtp/verifyOtp` (Firebase Auth or MSG91).
8. **Geocoding**: AddressBook "use current location" → `expo-location`
   `reverseGeocodeAsync`.
9. **Push**: FCM via `expo-notifications` (+ `google-services.json`).

### ⚠️ Security
The original APK shipped a Firebase **Admin** service-account key inside assets —
revoke/rotate it in Google Cloud Console and keep Admin SDK on the server only.
This project contains no secrets.

---

## 6. Structure

```
src/
  theme/        colors, styles
  context/      AppContext (auth + wallet + cart)
  services/     api (REST), socket (WS), hooks
  config/       payment (Razorpay)
  components/   ui (Header/Button/Field/Card…), widgets (Sheet/Chip/Radio/Timeline/Avatar/Tag)
  data/         mock.js
  navigation/   RootNavigator, MainTabs
  screens/
    auth/ profile/ wallet/ pandit/ pooja/ common/ estore/
    library/ subscription/ mandali/ temple/ kundali/ vartalap/ aayojan/
```

Every screen is functional and navigable; backend + native SDKs are the
developer's final touch.


---
## v2 - New "Maroon & Gold" UI + backend

Screens redesigned from the supplied mockups: Splash, Home, Pooja Booking (4 steps), Temple Locator,
Temple Details, Vartalap, Library (Sahitya Sangrah), E-Store, Profile. Bottom tabs: Home, Bookings, Explore, Library, Profile.

Run the backend first (`../backend`, `npm install && npm start`), then:

    npm install
    npm start

API URL is set in `src/config/env.js` (Android emulator 10.0.2.2, real phone: use your PC's LAN IP via
`EXPO_PUBLIC_API_URL`). If the backend is unreachable, screens fall back to `src/data/demo.js`.
Deity/temple images are gradient placeholders; set an `image` URL on poojas/products to show real photos.
