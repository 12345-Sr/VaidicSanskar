import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import SplashScreen from '../screens/SplashScreen';
import LoginModeScreen from '../screens/auth/LoginModeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import MainTabs from './MainTabs';

// Profile & Wallet
import ProfileSetupScreen from '../screens/profile/ProfileSetupScreen';
import AddressBookScreen from '../screens/profile/AddressBookScreen';
import MyBookingsScreen from '../screens/profile/MyBookingsScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import ContactScreen from '../screens/profile/ContactScreen';
import WalletScreen from '../screens/wallet/WalletScreen';

// Module 1 — Pandit/Puja booking
import PujaBrowseScreen from '../screens/pandit/PujaBrowseScreen';
import PujaBookingScreen from '../screens/pandit/PujaBookingScreen';
import SearchingScreen from '../screens/pandit/SearchingScreen';
import BookingStatusScreen from '../screens/pandit/BookingStatusScreen';
import ReviewScreen from '../screens/pandit/ReviewScreen';
import PanditListScreen from '../screens/pandit/PanditListScreen';
import PanditDetailScreen from '../screens/pandit/PanditDetailScreen';
import BookingReviewScreen from '../screens/pandit/BookingReviewScreen';
import PoojaDetailScreen from '../screens/pooja/PoojaDetailScreen';
import PoojaBookingScreen from '../screens/pooja/PoojaBookingScreen';
import NearbyPanditsMapScreen from '../screens/pandit/NearbyPanditsMapScreen';

// Common
import ChatScreen from '../screens/common/ChatScreen';

// Module 2 — E-commerce
import EStoreScreen from '../screens/estore/EStoreScreen';
import ProductDetailScreen from '../screens/estore/ProductDetailScreen';
import CartScreen from '../screens/estore/CartScreen';
import CheckoutScreen from '../screens/estore/CheckoutScreen';
import OrderTrackingScreen from '../screens/estore/OrderTrackingScreen';
import WishlistScreen from '../screens/estore/WishlistScreen';

// Module 3 — Library
import LibraryScreen from '../screens/library/LibraryScreen';
import ReaderScreen from '../screens/library/ReaderScreen';

// Module 4 — Subscription
import DailyPanditScreen from '../screens/subscription/DailyPanditScreen';
import MyScheduleScreen from '../screens/subscription/MyScheduleScreen';

// Module 5 — Bhajan Mandali
import BhajanMandaliScreen from '../screens/mandali/BhajanMandaliScreen';
import MandaliBookingScreen from '../screens/mandali/MandaliBookingScreen';

// Module 6/8 — Temple
import TempleLocatorScreen from '../screens/temple/TempleLocatorScreen';
import DarshanBookingScreen from '../screens/temple/DarshanBookingScreen';
import TempleDetailScreen from '../screens/temple/TempleDetailScreen';
import VIPPassScreen from '../screens/temple/VIPPassScreen';
import TempleClaimScreen from '../screens/temple/TempleClaimScreen';
import TirthCollectionsScreen from '../screens/temple/TirthCollectionsScreen';

// Module 7/9 — Astrology / Vartalap
import KundaliScreen from '../screens/kundali/KundaliScreen';
import KundaliMatchingFormScreen from '../screens/kundali/KundaliMatchingFormScreen';
import KundaliResultScreen from '../screens/kundali/KundaliResultScreen';
import VartalapScreen from '../screens/vartalap/VartalapScreen';
import AstroProfileScreen from '../screens/vartalap/AstroProfileScreen';
import AstroChatScreen from '../screens/vartalap/AstroChatScreen';
import CallScreen from '../screens/vartalap/CallScreen';

// Module 10 — Bhavya Aayojan
import BhavyaAayojanScreen from '../screens/aayojan/BhavyaAayojanScreen';

import DonationScreen from '../screens/DonationScreen';
import HoroscopeScreen from '../screens/HoroscopeScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import OrderSuccessScreen from '../screens/payment/OrderSuccessScreen';
import NotificationCenterScreen from '../screens/NotificationCenterScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LoginMode" component={LoginModeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Main */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Profile & Wallet */}
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="AddressBook" component={AddressBookScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />

        {/* Module 1 */}
        <Stack.Screen name="PujaBrowse" component={PujaBrowseScreen} />
        <Stack.Screen name="PujaBooking" component={PujaBookingScreen} />
        <Stack.Screen name="Searching" component={SearchingScreen} />
        <Stack.Screen name="SearchingScreen" component={SearchingScreen} />
        <Stack.Screen name="BookingStatus" component={BookingStatusScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="PanditBooking" component={PujaBrowseScreen} />
        <Stack.Screen name="PanditList" component={PanditListScreen} />
        <Stack.Screen name="PanditDetail" component={PanditDetailScreen} />
        <Stack.Screen name="BookingReview" component={BookingReviewScreen} />
        <Stack.Screen name="PoojaDetail" component={PoojaDetailScreen} />
        <Stack.Screen name="PoojaBooking" component={PoojaBookingScreen} />
        <Stack.Screen name="NearbyPanditsMap" component={NearbyPanditsMapScreen} />

        {/* Common */}
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Module 2 */}
        <Stack.Screen name="EStore" component={EStoreScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />

        {/* Module 3 */}
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />

        {/* Module 4 */}
        <Stack.Screen name="DailyPandit" component={DailyPanditScreen} />
        <Stack.Screen name="MySchedule" component={MyScheduleScreen} />

        {/* Module 5 */}
        <Stack.Screen name="BhajanMandali" component={BhajanMandaliScreen} />
        <Stack.Screen name="MandaliBooking" component={MandaliBookingScreen} />

        {/* Module 6/8 */}
        <Stack.Screen name="TempleLocator" component={TempleLocatorScreen} />
        <Stack.Screen name="DarshanBooking" component={DarshanBookingScreen} />
        <Stack.Screen name="TempleDetail" component={TempleDetailScreen} />
        <Stack.Screen name="VIPPass" component={VIPPassScreen} />
        <Stack.Screen name="TempleClaim" component={TempleClaimScreen} />
        <Stack.Screen name="TirthCollections" component={TirthCollectionsScreen} />

        {/* Module 7/9 */}
        <Stack.Screen name="Kundali" component={KundaliScreen} />
        <Stack.Screen name="KundaliMatchingForm" component={KundaliMatchingFormScreen} />
        <Stack.Screen name="KundaliResult" component={KundaliResultScreen} />
        <Stack.Screen name="Vartalap" component={VartalapScreen} />
        <Stack.Screen name="AstroProfile" component={AstroProfileScreen} />
        <Stack.Screen name="AstroChat" component={AstroChatScreen} />
        <Stack.Screen name="Call" component={CallScreen} />

        {/* Module 10 */}
        <Stack.Screen name="BhavyaAayojan" component={BhavyaAayojanScreen} />

        {/* Misc */}
        <Stack.Screen name="Donation" component={DonationScreen} />
        <Stack.Screen name="Horoscope" component={HoroscopeScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
