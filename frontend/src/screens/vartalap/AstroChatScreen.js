import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import talkToAstroStore, { RECHARGE_PACKS } from '../../services/talkToAstroStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';
import socket from '../../services/socket';

export default function AstroChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState(talkToAstroStore.getActiveSession());
  const [inputText, setInputText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['सटीक गणना', 'धैर्यपूर्वक सुना']);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const scrollViewRef = useRef();

  useEffect(() => {
    const unsub = talkToAstroStore.subscribe((store) => {
      const s = store.getActiveSession();
      setSession(s ? { ...s } : null);
      if (s?.status === 'ENDED' && !s.reviewSubmitted) {
        setShowReviewModal(true);
      }
    });

    // Notify Astrologer Partner App about incoming live chat consultation
    const cur = talkToAstroStore.getActiveSession();
    if (cur) {
      socket.emit('astro:call:initiate', {
        channelName: `astro_chat_${cur.id || Date.now()}`,
        recipientId: cur.astrologerId || 'V4569',
        caller: {
          id: 'U101',
          name: 'Sratanshu Shukla',
          phone: '+91 63936 20028',
        },
        mode: 'chat',
        rate: cur.rate || 5,
        topic: 'परामर्श',
      });
    }

    const handleIncomingMessage = (payload) => {
      const text = payload?.text || payload?.message?.text;
      const sender = payload?.sender || payload?.message?.sender;
      if (sender === 'astrologer' && text) {
        talkToAstroStore.receiveMessage(text);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    socket.on('astro:chat:message', handleIncomingMessage);

    return () => {
      unsub();
      socket.off('astro:chat:message', handleIncomingMessage);
    };
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    talkToAstroStore.sendMessage(text);
    socket.emit('astro:chat:send', {
      sessionId: session?.id || 'SES-CURRENT',
      recipientId: session?.astrologerId || 'V4569',
      text,
      sender: 'user',
      message: {
        id: `M-${Date.now()}`,
        sender: 'user',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
    setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEndChat = () => {
    Alert.alert(
      'चैट परामर्श समाप्त करें?',
      'क्या आप यह परामर्श समाप्त करना चाहते हैं? कुल उपयोग किए गए मिनटों का बिल वॉलेट से काटा जाएगा।',
      [
        { text: 'रद्द', style: 'cancel' },
        {
          text: 'हाँ, समाप्त करें',
          style: 'destructive',
          onPress: () => {
            talkToAstroStore.endSession('USER_ENDED');
            setShowReviewModal(true);
          },
        },
      ]
    );
  };

  const handleSubmitReview = () => {
    talkToAstroStore.submitSessionReview({
      rating,
      tags: selectedTags,
      text: reviewText,
      anonymous: isAnonymous,
    });
    setShowReviewModal(false);
    talkToAstroStore.clearSession();
    Alert.alert('धन्यवाद!', 'आपकी समीक्षा सफलतापूर्वक दर्ज हो गई है।', [
      { text: 'वापस जाएं', onPress: () => navigation.navigate('Vartalap') },
    ]);
  };

  const toggleTag = (t) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((item) => item !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  if (!session) {
    return (
      <View style={[s.centerContainer, { paddingTop: insets.top }]}>
        <Text style={s.noSessionText}>कोई सक्रिय परामर्श सत्र नहीं है</Text>
        <TouchableOpacity style={s.goHomeBtn} onPress={() => navigation.navigate('Vartalap')}>
          <Text style={s.goHomeBtnText}>वार्तालाप पर लौटें</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const astro = session.astrologer;
  const remainingBal = talkToAstroStore.getTotalBalance();
  const minsLeft = Math.floor(remainingBal / session.rate);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[s.container, { paddingTop: insets.top }]}
    >
      {/* Top Header */}
      <View style={s.navHeader}>
        <Image source={resolveDevotionalSource(astro.photo, 'jyotish_acharya')} style={s.headerAvatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.headerName}>{astro.name}</Text>
          <Text style={s.headerRate}>
            ₹{session.rate}/min • {session.topic}
          </Text>
        </View>

        {/* Live Timer & Balance Indicator */}
        <View style={s.timerCol}>
          <View style={s.timerPill}>
            <MaterialCommunityIcons name="timer-sand" size={12} color={colors.primary} />
            <Text style={s.timerText}>{formatTimer(session.elapsedSeconds)}</Text>
          </View>
          <Text style={s.minsLeftText}>~{minsLeft} मिनट शेष</Text>
        </View>

        {/* End Button */}
        <TouchableOpacity style={s.endChatBtn} onPress={handleEndChat}>
          <Text style={s.endChatBtnText}>समाप्त</Text>
        </TouchableOpacity>
      </View>

      {/* Low Balance Warning Banner */}
      {session.lowBalanceWarning && (
        <View style={s.lowBalanceBanner}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={colors.danger} />
          <Text style={s.lowBalanceText}>
            वॉलेट में 2 मिनट से कम शेष हैं! परामर्श जारी रखने हेतु रीचार्ज करें।
          </Text>
          <TouchableOpacity
            style={s.rechargeQuickBtn}
            onPress={() => setShowRechargeModal(true)}
          >
            <Text style={s.rechargeQuickBtnText}>रीचार्ज</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Unified Paramarsh Session Badge */}
      <View style={s.kundaliShareBadge}>
        <MaterialCommunityIcons name="creation" size={15} color={colors.primary} />
        <Text style={s.kundaliShareText}>
          वैदिक परामर्श सत्र • अपनी समस्या अथवा जिज्ञासा नीचे चैट में विस्तार से लिखें
        </Text>
      </View>

      {/* Chat Messages List */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={s.messagesScroll}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {session.chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[s.messageBubbleRow, isUser ? s.userBubbleRow : s.astroBubbleRow]}
            >
              {!isUser && (
                <Image source={resolveDevotionalSource(astro.photo, 'jyotish_acharya')} style={s.msgSmallAvatar} />
              )}
              <View
                style={[
                  s.messageBubble,
                  isUser ? s.userBubble : s.astroBubble,
                ]}
              >
                <Text style={[s.messageText, isUser && s.userMessageText]}>
                  {msg.text}
                </Text>
                <Text style={[s.messageTime, isUser && s.userMessageTime]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Message Input Bar */}
      <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={s.attachBtn}
          onPress={() => Alert.alert('फोटो भेजें', 'अपनी हथेली या जन्मकुंडली की फोटो भेजें।')}
        >
          <MaterialCommunityIcons name="camera-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={s.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="अपना प्रश्न यहाँ लिखें..."
          placeholderTextColor="#A8988C"
        />

        <TouchableOpacity
          style={[s.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Post-Session Summary & Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>परामर्श सारांश व समीक्षा</Text>
            </View>

            {/* Bill Summary */}
            <View style={s.billSummaryBox}>
              <View style={s.billRow}>
                <Text style={s.billLabel}>कुल परामर्श अवधि:</Text>
                <Text style={s.billVal}>{session.finalBilledMinutes || 1} मिनट</Text>
              </View>
              <View style={s.billRow}>
                <Text style={s.billLabel}>दर प्रति मिनट:</Text>
                <Text style={s.billVal}>₹{session.rate}</Text>
              </View>
              <View style={s.billRow}>
                <Text style={s.billLabel}>कुल वॉलेट कटौती:</Text>
                <Text style={[s.billVal, { color: colors.primary }]}>
                  ₹{session.finalAmount || session.rate}
                </Text>
              </View>
            </View>

            {/* Rating Stars */}
            <Text style={s.ratingPrompt}>ज्योतिषाचार्य जी को रेटिंग दें:</Text>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map((sNum) => (
                <TouchableOpacity key={sNum} onPress={() => setRating(sNum)} style={{ padding: 4 }}>
                  <MaterialCommunityIcons
                    name={sNum <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Tags */}
            <View style={s.tagsGrid}>
              {['सटीक गणना', 'धैर्यपूर्वक सुना', 'सरल उपाय', 'स्पष्ट मार्गदर्शन', 'सकारात्मक ऊर्जा'].map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[s.tagChip, isSelected && s.selectedTagChip]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[s.tagChipText, isSelected && s.selectedTagChipText]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Written Review */}
            <TextInput
              style={s.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="अपना अनुभव लिखें (वैकल्पिक)..."
              placeholderTextColor="#A8988C"
              multiline
            />

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={s.anonRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isAnonymous ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={20}
                color={colors.primary}
              />
              <Text style={s.anonText}>समीक्षा में मेरा नाम गुप्त रखें (Anonymous)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.submitReviewBtn} onPress={handleSubmitReview}>
              <Text style={s.submitReviewBtnText}>समीक्षा जमा करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quick In-Session Recharge Modal */}
      <Modal visible={showRechargeModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.modalTitle}>त्वरित रीचार्ज करें</Text>
              <TouchableOpacity onPress={() => setShowRechargeModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={s.rechargePacksGrid}>
              {RECHARGE_PACKS.slice(0, 4).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={s.rechargePackBox}
                  onPress={() => {
                    talkToAstroStore.rechargeWallet(p);
                    setShowRechargeModal(false);
                    Alert.alert('रीचार्ज सफल', `₹${p.amount} आपके वॉलेट में जुड़ गए हैं।`);
                  }}
                >
                  <Text style={s.rechargeAmount}>₹{p.amount}</Text>
                  <Text style={s.rechargeBonus}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noSessionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  goHomeBtn: {
    backgroundColor: colors.saffron,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  goHomeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.saffron,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  headerRate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  timerCol: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  minsLeftText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  endChatBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  endChatBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
  },
  lowBalanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  lowBalanceText: {
    flex: 1,
    fontSize: 11,
    color: colors.danger,
    marginLeft: 6,
  },
  rechargeQuickBtn: {
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rechargeQuickBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kundaliShareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3DFC4',
  },
  kundaliShareText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
  messagesScroll: {
    padding: 14,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userBubbleRow: {
    justifyContent: 'flex-end',
  },
  astroBubbleRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  msgSmallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  astroBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow(1),
  },
  messageText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 9,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  attachBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF7F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    marginHorizontal: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    ...shadow(4),
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  billSummaryBox: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    marginVertical: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  billLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  billVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  ratingPrompt: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 8,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 10,
  },
  tagChip: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  selectedTagChip: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.saffron,
  },
  tagChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  selectedTagChipText: {
    fontWeight: '800',
  },
  reviewInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    height: 60,
    marginBottom: 10,
  },
  anonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  anonText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  submitReviewBtn: {
    backgroundColor: colors.saffron,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  rechargePacksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  rechargePackBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  rechargeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  rechargeBonus: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
