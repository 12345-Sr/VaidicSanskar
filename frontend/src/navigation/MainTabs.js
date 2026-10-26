import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import MyBookingsScreen from '../screens/profile/MyBookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const icon = (name, nameOn) => ({ color, size, focused }) => (
  <MaterialCommunityIcons name={focused ? nameOn : name} size={size} color={color} />
);

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive || '#FAF4E8',
        tabBarInactiveTintColor: colors.tabBarInactive || 'rgba(250, 244, 232, 0.65)',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.tabBarBg || '#5A1017',
          borderTopWidth: 1,
          borderTopColor: '#4A0C13',
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home', 'Home'),
          tabBarIcon: icon('home-outline', 'home'),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: t('bookings', 'Bookings'),
          tabBarIcon: icon('calendar-check-outline', 'calendar-check'),
        }}
      />
      <Tab.Screen
        name="History"
        component={MyBookingsScreen}
        initialParams={{ filter: 'completed' }}
        options={{
          tabBarLabel: t('history', 'History'),
          tabBarIcon: icon('history', 'history'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('more', 'More'),
          tabBarIcon: icon('menu', 'menu-open'),
        }}
      />
    </Tab.Navigator>
  );
}
