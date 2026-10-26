import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen } from '../components/ui';
import colors from '../theme/colors';
import { radius, shadow } from '../theme/styles';
import { NotificationService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function NotificationCenterScreen({ navigation }) {
  const { notificationHistory, clearAllNotifications } = useNotification();
  const [serverNotifications, setServerNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('Online');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await NotificationService.list();
      if (res?.data && Array.isArray(res.data)) {
        setServerNotifications(res.data);
      } else if (Array.isArray(res)) {
        setServerNotifications(res);
      }
      setServerStatus('Active (Render)');
    } catch (err) {
      // If unauthenticated or Render push disabled
      setServerStatus('Ready (Local & In-App)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Merge history with server notifications
  const combinedNotifications = [
    ...notificationHistory,
    ...serverNotifications.filter(
      (sn) => !notificationHistory.some((nh) => nh.id === sn._id || nh.id === sn.id)
    ),
  ];

  const handleClear = () => {
    setServerNotifications([]);
    if (clearAllNotifications) clearAllNotifications();
  };

  const renderItem = ({ item }) => (
    <View style={s.notifCard}>
      <View style={s.iconWrap}>
        <MaterialCommunityIcons
          name={item.type === 'otp' || item.otp ? 'shield-key' : 'bell-ring'}
          size={22}
          color={colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{item.title || 'Notification'}</Text>
          <Text style={s.cardTime}>{item.createdAt || 'Just now'}</Text>
        </View>
        <Text style={s.cardMessage}>{item.message || item.body || ''}</Text>
        {item.otp && (
          <View style={s.otpChip}>
            <Text style={s.otpChipText}>Code: {item.otp}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <Header title="Notification Center" navigation={navigation} />
      <Screen>
        {/* Status indicator */}
        <View style={s.statusBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>Notification Service: {serverStatus}</Text>
          </View>
          {combinedNotifications.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {combinedNotifications.length === 0 && !loading ? (
          <View style={s.emptyState}>
            <MaterialCommunityIcons name="bell-outline" size={48} color={colors.textMuted} />
            <Text style={s.emptyTitle}>No Notifications</Text>
            <Text style={s.emptySubtitle}>
              You will receive OTP alerts, puja reminders, and booking notifications here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedNotifications}
            keyExtractor={(item, idx) => item.id || item._id || String(idx)}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={fetchNotifications} colors={[colors.primary]} />
            }
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
      </Screen>
    </View>
  );
}

const s = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  cardTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginTop: 2,
  },
  otpChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  otpChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
