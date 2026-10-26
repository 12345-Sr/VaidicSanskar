import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import styles, { serif, radius, shadow } from '../../theme/styles';
import talkToAstroStore, { RECHARGE_PACKS } from '../../services/talkToAstroStore';
import { resolveDevotionalSource } from '../../constants/devotionalAssets';
import AgoraCallView from '../../components/agora/AgoraCallView';
import socket from '../../services/socket';

export default function CallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const astrologer = route.params?.astrologer || talkToAstroStore.getAstrologers()[0];
  const mode = route.params?.mode || 'audio'; // audio | video
  const channelName = useRef(route.params?.channelName || `vartalap_${astrologer?.id || 'astro'}_${Date.now().toString().slice(-6)}`).current;

  const [session, setSession] = useState(talkToAstroStore.getActiveSession());
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isVideoCamOff, setIsVideoCamOff] = useState(mode === 'audio');
  const [isFrontCam, setIsFrontCam] = useState(true);

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['सटीक गणना', 'सरल उपाय']);
  const [reviewText, setReviewText] = useState('');

  const rate = astrologer?.rates?.[mode] || astrologer?.[`${mode}Rate`] || 5;
  const timerRef = useRef();

  useEffect(() => {
    // Initiate live Agora call signaling to Astrologer via Socket
    socket.emit('astro:call:initiate', {
      channelName,
      recipientId: astrologer?.id || 'V4569',
      caller: { id: 'U101', name: 'Sratanshu Shukla', phone: '+91 63936 20028' },
      mode,
      rate,
    });

    const handleRemoteEnd = () => {
      handleEndCall();
    };

    socket.on('astro:call:ended', handleRemoteEnd);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 60 === 0) {
          talkToAstroStore.deductMoney(rate, `Astro ${mode === 'video' ? 'Video' : 'Audio'} Call (1 min)`);
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      socket.off('astro:call:ended', handleRemoteEnd);
    };
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const billedMinutes = Math.max(1, Math.ceil(elapsed / 60));
  const currentTotal = billedMinutes * rate;
  const remainingBal = talkToAstroStore.getTotalBalance();
  const remainingMinutes = Math.max(0, Math.floor(remainingBal / rate));

  const handleEndCall = () => {
    clearInterval(timerRef.current);
    socket.emit('astro:call:end', {
      channelName,
      callerId: 'U101',
      recipientId: astrologer?.id || 'V4569',
    });
    talkToAstroStore.endSession('USER_ENDED');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    talkToAstroStore.submitSessionReview({
      rating,
      tags: selectedTags,
      text: reviewText,
      anonymous: false,
    });
    setShowReviewModal(false);
    talkToAstroStore.clearSession();
    navigation.navigate('Vartalap');
  };

  const toggleTag = (t) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((i) => i !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const isVideo = mode === 'video';

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: isVideo ? '#0D0614' : '#FAF7F0',
          paddingTop: Math.max(insets.top, 16) + 8,
          paddingBottom: Math.max(insets.bottom, 20) + 8,
          paddingHorizontal: isVideo ? 12 : 16,
        },
      ]}
    >
      {/* Top Floating Meter */}
      <View style={[s.topFloatingMeter, isVideo && s.topFloatingMeterDark]}>
        <View style={s.meterItem}>
          <MaterialCommunityIcons name="timer-sand" size={16} color={isVideo ? colors.gold : colors.primary} />
          <Text style={[s.meterText, isVideo && { color: '#FFFFFF' }]}>{formatTimer(elapsed)}</Text>
        </View>
        <View style={[s.meterDivider, isVideo && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <View style={s.meterItem}>
          <MaterialCommunityIcons name="wallet-outline" size={16} color={isVideo ? colors.gold : colors.primary} />
          <Text style={[s.meterText, isVideo && { color: '#FFFFFF' }]}>₹{rate}/min</Text>
        </View>
        <View style={[s.meterDivider, isVideo && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <TouchableOpacity
          style={[s.rechargeQuickChip, isVideo && { backgroundColor: 'rgba(230, 126, 0, 0.25)', borderWidth: 1, borderColor: colors.gold }]}
          onPress={() => setShowRechargeModal(true)}
        >
          <Text style={[s.rechargeQuickChipText, isVideo && { color: colors.goldLight }]}>
            ~{remainingMinutes}m शेष (+ रीचार्ज)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Video / Audio Center Stage Powered by Agora */}
      <View style={s.centerStage}>
        <AgoraCallView
          channelName={channelName}
          mode={mode}
          isMuted={isMuted}
          isSpeaker={isSpeaker}
          isVideoCamOff={isVideoCamOff}
          isFrontCam={isFrontCam}
          remoteName={astrologer.name}
          remotePhoto={astrologer.photo}
          role="user"
          onCallEnded={handleEndCall}
        />
      </View>

      {/* Shared Kundali Info Card */}
      <View style={[s.kundaliSnippetCard, isVideo && s.kundaliSnippetCardDark]}>
        <MaterialCommunityIcons name="om" size={15} color={isVideo ? colors.gold : colors.primary} />
        <Text style={[s.kundaliSnippetText, isVideo && { color: '#FFECCC' }]} numberOfLines={1}>
          साझा जन्म विवरण: रमेश कुमार • सिंह लग्न • वृश्चिक राशि
        </Text>
      </View>

      {/* Call Controls Bar */}
      <View style={s.controlsBar}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[
            s.ctrlCircle,
            isVideo && s.ctrlCircleDark,
            isMuted && s.ctrlCircleActive,
          ]}
          onPress={() => setIsMuted(!isMuted)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isMuted ? 'microphone-off' : 'microphone'}
            size={22}
            color={isMuted ? '#FFFFFF' : isVideo ? '#FFFFFF' : colors.text}
          />
        </TouchableOpacity>

        {/* Speaker Button */}
        <TouchableOpacity
          style={[
            s.ctrlCircle,
            isVideo && s.ctrlCircleDark,
            isSpeaker && s.ctrlCircleActive,
          ]}
          onPress={() => setIsSpeaker(!isSpeaker)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isSpeaker ? 'volume-high' : 'volume-medium'}
            size={22}
            color={isSpeaker ? '#FFFFFF' : isVideo ? '#FFFFFF' : colors.text}
          />
        </TouchableOpacity>

        {/* Hang Up Button */}
        <TouchableOpacity style={s.hangUpBtn} onPress={handleEndCall} activeOpacity={0.85}>
          <MaterialCommunityIcons name="phone-hangup" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Video Camera Controls (if in video mode) */}
        {isVideo && (
          <>
            <TouchableOpacity
              style={[
                s.ctrlCircle,
                s.ctrlCircleDark,
                isVideoCamOff && s.ctrlCircleActive,
              ]}
              onPress={() => setIsVideoCamOff(!isVideoCamOff)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isVideoCamOff ? 'video-off' : 'video'}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.ctrlCircle, s.ctrlCircleDark]}
              onPress={() => setIsFrontCam(!isFrontCam)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera-flip" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Post-Call Review & Bill Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>कॉल समाप्त • परामर्श सारांश</Text>

            <View style={s.billBox}>
              <View style={s.billRow}>
                <Text style={s.billLabel}>कुल समय:</Text>
                <Text style={s.billVal}>{billedMinutes} मिनट ({formatTimer(elapsed)})</Text>
              </View>
              <View style={s.billRow}>
                <Text style={s.billLabel}>दर प्रति मिनट:</Text>
                <Text style={s.billVal}>₹{rate}</Text>
              </View>
              <View style={s.billRow}>
                <Text style={s.billLabel}>कुल बिल कटौती:</Text>
                <Text style={[s.billVal, { color: colors.primary }]}>₹{currentTotal}</Text>
              </View>
            </View>

            <Text style={s.reviewPrompt}>परामर्श कैसा रहा? रेटिंग दें:</Text>
            <View style={s.starsRow}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setRating(num)} style={{ padding: 4 }}>
                  <MaterialCommunityIcons
                    name={num <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.tagsRow}>
              {['सटीक गणना', 'सरल उपाय', 'धैर्यपूर्वक सुना', 'स्पष्ट आवाज'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.tagBtn, selectedTags.includes(t) && s.selectedTagBtn]}
                  onPress={() => toggleTag(t)}
                >
                  <Text style={[s.tagText, selectedTags.includes(t) && s.selectedTagText]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={s.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="अपनी टिप्पणी लिखें (वैकल्पिक)..."
              placeholderTextColor="#A8988C"
            />

            <TouchableOpacity style={s.doneBtn} onPress={handleSubmitReview}>
              <Text style={s.doneBtnText}>समीक्षा जमा करें व समाप्त करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* In-Call Quick Recharge Modal */}
      <Modal visible={showRechargeModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={s.modalTitle}>कॉल के दौरान रीचार्ज</Text>
              <TouchableOpacity onPress={() => setShowRechargeModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={s.packsGrid}>
              {RECHARGE_PACKS.slice(0, 4).map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={s.packBox}
                  onPress={() => {
                    talkToAstroStore.rechargeWallet(pack);
                    setShowRechargeModal(false);
                    Alert.alert('रीचार्ज सफल', `₹${pack.amount} वॉलेट में जुड़ गए हैं। कॉल जारी रहेगी।`);
                  }}
                >
                  <Text style={s.packAmt}>₹{pack.amount}</Text>
                  <Text style={s.packLbl}>{pack.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topFloatingMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    ...shadow(2),
    zIndex: 20,
  },
  topFloatingMeterDark: {
    backgroundColor: 'rgba(20, 10, 30, 0.88)',
    borderColor: 'rgba(230, 126, 0, 0.4)',
  },
  meterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meterText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  meterDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#ECE3D7',
    marginHorizontal: 10,
  },
  rechargeQuickChip: {
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rechargeQuickChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  centerStage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioAvatarStage: {
    alignItems: 'center',
  },
  avatarPulseDisc: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.saffron,
    marginBottom: 16,
  },
  audioAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  audioAstroName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    fontFamily: serif,
  },
  audioAstroTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  videoFrame: {
    width: '100%',
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoRemoteImage: {
    width: '100%',
    height: '100%',
  },
  videoWatermark: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoRemoteName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selfPip: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.saffron,
  },
  pipText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  kundaliSnippetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F3DFC4',
    marginBottom: 10,
    maxWidth: '92%',
  },
  kundaliSnippetCardDark: {
    backgroundColor: 'rgba(25, 12, 36, 0.85)',
    borderColor: 'rgba(230, 126, 0, 0.35)',
  },
  kundaliSnippetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 8,
    zIndex: 20,
  },
  ctrlCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE3D7',
    ...shadow(2),
  },
  ctrlCircleDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  ctrlCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hangUpBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(4),
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: 8,
  },
  billBox: {
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
  reviewPrompt: {
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
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 10,
  },
  tagBtn: {
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  selectedTagBtn: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.saffron,
  },
  tagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  selectedTagText: {
    fontWeight: '800',
  },
  reviewInput: {
    backgroundColor: '#FAF7F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#ECE3D7',
    height: 48,
    marginBottom: 12,
  },
  doneBtn: {
    backgroundColor: colors.saffron,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  packsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  packBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FAF7F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE3D7',
  },
  packAmt: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  packLbl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
