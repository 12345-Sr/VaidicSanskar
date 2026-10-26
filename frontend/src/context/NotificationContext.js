import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Modal,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { radius, shadow } from '../theme/styles';
import socketService from '../services/socket';

const NOTIFS_STORAGE_KEY = '@vs_user_notifications_v2';
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [errorAlert, setErrorAlert] = useState(null);

  const slideAnim = useRef(new Animated.Value(-200)).current;
  const timeoutRef = useRef(null);

  // Load persisted notifications
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIFS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setNotificationHistory(parsed);
        }
      } catch (e) {}
    })();
  }, []);

  const saveHistory = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) {}
  }, []);

  const clearAllNotifications = useCallback(async () => {
    setNotificationHistory([]);
    try {
      await AsyncStorage.removeItem(NOTIFS_STORAGE_KEY);
    } catch (e) {}
  }, []);

  const dismissNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setCurrentNotification(null);
    });
  }, [slideAnim]);

  const showNotification = useCallback(
    (firstArg, secondArg, thirdArg) => {
      let opts = {};
      if (typeof firstArg === 'string') {
        opts = {
          title: firstArg,
          message: secondArg || '',
          type: thirdArg || 'info',
        };
      } else if (firstArg && typeof firstArg === 'object') {
        opts = { ...firstArg };
      }

      const {
        title = 'वैदिक संस्कार (Vaidic Sanskar)',
        message = '',
        type = 'info', // 'booking' | 'pandit' | 'order' | 'sms' | 'success' | 'alert' | 'info'
        duration = 7000,
        actionText = null,
        onAction = null,
        otp = null,
      } = opts;

      // Extract OTP if present in message or passed directly
      let extractedOtp = otp;
      if (!extractedOtp) {
        const match = String(message || '').match(/\b(\d{4,6})\b/);
        if (match && (message.toLowerCase().includes('otp') || message.toLowerCase().includes('code'))) {
          extractedOtp = match[1];
        }
      }

      // Vibrate like real incoming push/SMS
      try {
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 160, 90, 180]);
        } else {
          Vibration.vibrate(200);
        }
      } catch (e) {}

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const notifItem = {
        id: Date.now().toString(),
        title,
        message,
        type,
        otp: extractedOtp,
        actionText,
        onAction,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }),
      };

      setCurrentNotification(notifItem);
      setNotificationHistory((prev) => {
        const updated = [notifItem, ...prev.filter((p) => p.id !== notifItem.id).slice(0, 49)];
        saveHistory(updated);
        return updated;
      });

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 90,
        friction: 9,
        useNativeDriver: true,
      }).start();

      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          dismissNotification();
        }, duration);
      }
    },
    [dismissNotification, slideAnim, saveHistory]
  );

  // Custom Error Alert Modal (Vaidic Sacred Themed Dialog)
  const showErrorAlert = useCallback(
    ({
      title = 'त्रुटि (Attention)',
      message = 'कुछ गलत हुआ, कृपया पुनः प्रयास करें।',
      errorDetails = null,
      confirmText = 'ठीक है (OK)',
      cancelText = null,
      onConfirm = null,
      onCancel = null,
    }) => {
      setErrorAlert({
        title,
        message,
        errorDetails,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const dismissErrorAlert = useCallback(() => {
    setErrorAlert(null);
  }, []);

  // Listen to global socket updates for instant on-screen notifications
  useEffect(() => {
    const handleBookingAccepted = (data) => {
      showNotification({
        title: 'पंडित जी मिल गए! 🙏',
        message: `${data?.panditName || 'पंडित जी'} ने आपकी पूजा स्वीकार कर ली है। वे जल्द ही आपसे संपर्क करेंगे।`,
        type: 'pandit',
      });
    };

    const handleBookingStatus = (data) => {
      const statusMap = {
        Searching: 'पंडित जी की खोज जारी है...',
        Accepted: 'पंडित जी ने पूजा स्वीकार की! 🙏',
        EnRoute: 'पंडित जी आपके स्थान के लिए निकल चुके हैं 🚗',
        Arrived: 'पंडित जी आपके स्थान पर पहुँच चुके हैं! 🪔',
        InProgress: 'शुभ पूजा प्रारंभ हो चुकी है! 🕉️',
        Completed: 'पूजा विधिपूर्वक संपन्न हुई! हर हर महादेव! 🌸',
        Cancelled: 'पूजा रद्द कर दी गई है।',
      };
      if (data?.status && statusMap[data.status]) {
        showNotification({
          title: 'पूजा स्थिति अपडेट 🔔',
          message: statusMap[data.status],
          type: data.status === 'Completed' ? 'success' : 'booking',
        });
      }
    };

    const handleOrderUpdate = (data) => {
      showNotification({
        title: 'E-Store ऑर्डर अपडेट 📦',
        message: `आपके ऑर्डर #${data?.id || ''} की स्थिति अपडेट हुई है।`,
        type: 'order',
      });
    };

    socketService.on('booking:accepted', handleBookingAccepted);
    socketService.on('booking:status', handleBookingStatus);
    socketService.on('store:orders_updated', handleOrderUpdate);

    return () => {
      socketService.off('booking:accepted', handleBookingAccepted);
      socketService.off('booking:status', handleBookingStatus);
      socketService.off('store:orders_updated', handleOrderUpdate);
    };
  }, [showNotification]);

  const handleBannerPress = () => {
    if (currentNotification?.onAction) {
      currentNotification.onAction();
    }
    dismissNotification();
  };

  const getNotificationVisuals = (type) => {
    switch (type) {
      case 'pandit':
        return { icon: 'account-tie', iconColor: '#B45309', bg: '#FEF3C7', border: '#F59E0B', badgeBg: '#FEF3C7', tag: 'PANDIT ALERT' };
      case 'booking':
        return { icon: 'fire', iconColor: '#C2410C', bg: '#FFEDD5', border: '#EA580C', badgeBg: '#FFEDD5', tag: 'POOJA UPDATE' };
      case 'order':
        return { icon: 'package-variant-closed', iconColor: '#8B1A1A', bg: '#FEE2E2', border: '#DC2626', badgeBg: '#FEE2E2', tag: 'E-STORE' };
      case 'success':
        return { icon: 'check-decagram', iconColor: '#15803D', bg: '#DCFCE7', border: '#16A34A', badgeBg: '#DCFCE7', tag: 'CONFIRMED' };
      case 'sms':
        return { icon: 'message-text-clock', iconColor: '#1D4ED8', bg: '#DBEAFE', border: '#2563EB', badgeBg: '#DBEAFE', tag: 'SMS ALERT' };
      case 'alert':
      case 'error':
        return { icon: 'alert-circle', iconColor: '#B91C1C', bg: '#FEE2E2', border: '#EF4444', badgeBg: '#FEE2E2', tag: 'ATTENTION' };
      default:
        return { icon: 'bell-ring', iconColor: '#B45309', bg: '#FEF3C7', border: '#F59E0B', badgeBg: '#FEF3C7', tag: 'NOTIFICATION' };
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        dismissNotification,
        showErrorAlert,
        dismissErrorAlert,
        notificationHistory,
        currentNotification,
        clearAllNotifications,
      }}
    >
      {children}

      {/* 1. Real-World OS Heads-Up Push & SMS Banner */}
      {currentNotification && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              top: insets.top + (Platform.OS === 'ios' ? 6 : 10),
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {(() => {
            const visual = getNotificationVisuals(currentNotification.type);
            return (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={handleBannerPress}
                style={[styles.systemCard, { borderLeftColor: visual.border }]}
              >
                {/* System App Bar */}
                <View style={styles.systemHeader}>
                  <View style={styles.systemBrandRow}>
                    <View style={styles.systemAppBadge}>
                      <Text style={{ fontSize: 11 }}>🕉️</Text>
                    </View>
                    <Text style={styles.systemAppName}>VAIDIC SANSKAR</Text>
                    <Text style={styles.systemDot}>•</Text>
                    <Text style={styles.systemTime}>{currentNotification.createdAt || 'NOW'}</Text>
                  </View>
                  <View style={[styles.priorityChip, { backgroundColor: visual.badgeBg }]}>
                    <Text style={[styles.priorityChipText, { color: visual.iconColor }]}>{visual.tag}</Text>
                  </View>
                </View>

                {/* Notification Content */}
                <View style={styles.systemContentRow}>
                  <View style={[styles.iconCircle, { backgroundColor: visual.bg }]}>
                    <MaterialCommunityIcons name={visual.icon} size={22} color={visual.iconColor} />
                  </View>
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    <Text style={styles.systemTitle} numberOfLines={1}>{currentNotification.title}</Text>
                    <Text style={styles.systemMessage} numberOfLines={2}>{currentNotification.message}</Text>

                    {/* Highlighted OTP Chip (like real banking / delivery SMS) */}
                    {currentNotification.otp ? (
                      <View style={styles.smsOtpBox}>
                        <MaterialCommunityIcons name="shield-check" size={15} color="#B45309" />
                        <Text style={styles.smsOtpLabel}>VERIFICATION OTP:</Text>
                        <Text style={styles.smsOtpCode}>{currentNotification.otp}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Action CTA Bar */}
                {currentNotification.actionText ? (
                  <View style={styles.systemFooter}>
                    <Text style={styles.systemActionBtn}>{currentNotification.actionText} →</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })()}
        </Animated.View>
      )}

      {/* 2. Custom Sacred Vedic Error & Alert Modal */}
      {errorAlert && (
        <Modal
          visible={!!errorAlert}
          transparent
          animationType="fade"
          onRequestClose={dismissErrorAlert}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.alertCard}>
              <View style={styles.alertHeaderEmblem}>
                <View style={styles.emblemCircle}>
                  <Text style={styles.emblemOm}>🕉️</Text>
                </View>
              </View>

              <Text style={styles.alertTitle}>{errorAlert.title}</Text>
              <Text style={styles.alertMessage}>{errorAlert.message}</Text>

              {errorAlert.errorDetails ? (
                <View style={styles.detailsBox}>
                  <Text style={styles.detailsText} numberOfLines={3}>
                    {String(errorAlert.errorDetails)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                {errorAlert.cancelText && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      if (errorAlert.onCancel) errorAlert.onCancel();
                      dismissErrorAlert();
                    }}
                  >
                    <Text style={styles.cancelBtnText}>{errorAlert.cancelText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    !errorAlert.cancelText && { width: '100%' },
                  ]}
                  onPress={() => {
                    if (errorAlert.onConfirm) errorAlert.onConfirm();
                    dismissErrorAlert();
                  }}
                >
                  <Text style={styles.confirmBtnText}>{errorAlert.confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 99999,
    elevation: 99999,
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 12,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 6,
  },
  systemBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  systemAppBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemAppName: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.5,
  },
  systemDot: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  systemTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  priorityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityChipText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  systemContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  systemMessage: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    fontWeight: '500',
  },
  smsOtpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  smsOtpLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  smsOtpCode: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 1.5,
  },
  systemFooter: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  systemActionBtn: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },

  /* Custom Alert Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 17, 13, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  alertHeaderEmblem: {
    marginBottom: 14,
  },
  emblemCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemOm: {
    fontSize: 26,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4A3B2C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsBox: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 18,
  },
  detailsText: {
    fontSize: 11,
    color: '#B91C1C',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
