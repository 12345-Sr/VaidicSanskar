import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/ui';
import colors from '../../theme/colors';
import { serif, shadow, radius } from '../../theme/styles';
import { panditBookingStore } from '../../services/panditBookingStore';

const TAGS = [
  'विधि-विधान से पूजा',
  'समय पर आगमन',
  'शुद्ध मंत्रोच्चार',
  'विनम्र व्यवहार',
  'उत्कृष्ट ज्ञान',
  'पवित्र आचरण',
];

const TIP_OPTIONS = [50, 100, 200, 500];

export default function ReviewScreen({ navigation }) {
  const booking = panditBookingStore.getBooking();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['विधि-विधान से पूजा', 'समय पर आगमन']);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState(100);
  const [showInvoice, setShowInvoice] = useState(false);

  const toggleTag = (t) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((x) => x !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const handleSubmit = () => {
    panditBookingStore.submitReview({
      rating,
      tags: selectedTags,
      comment,
      tip,
      from: 'yajman',
    });
    Alert.alert('समीक्षा दर्ज हुई', 'धन्यवाद! आपकी समीक्षा और दक्षिणा टिप सुरक्षित दर्ज कर ली गई है।');
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={s.container}>
      <Header
        title="पूजा संपन्न व समीक्षा"
        subtitle="पुण्य लाभ प्राप्ति · पंडित जी को रेटिंग दें"
        navigation={navigation}
        showBack={false}
      />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* CELEBRATION HEADER */}
        <View style={s.celebrateBox}>
          <View style={s.omCircle}>
            <MaterialCommunityIcons name="check-decagram" size={54} color="#16A34A" />
          </View>
          <Text style={s.celTitle}>पूजा पावन रूप से संपन्न हुई 🙏</Text>
          <Text style={s.celSub}>
            ईश्वर आपके परिवार को सुख, शांति, समृद्धि व आरोग्य प्रदान करें।
          </Text>
        </View>

        {/* 1. STAR RATING */}
        <View style={s.card}>
          <Text style={s.cardTitle}>
            {booking?.pandit?.name || 'पंडित जी'} की सेवा कैसी रही?
          </Text>
          <Text style={s.cardSub}>कृपया 1 से 5 स्टार रेटिंग दें</Text>

          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                hitSlop={8}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={38}
                  color="#F59E0B"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 2. FEEDBACK TAGS */}
        <View style={s.card}>
          <Text style={s.cardTitle}>अनुभव के मुख्य बिंदु (Tags)</Text>
          <Text style={s.cardSub}>जो बातें आपको सबसे अच्छी लगीं उन्हें चुनें</Text>

          <View style={s.tagsWrap}>
            {TAGS.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.tagChip, active && s.tagChipActive]}
                  onPress={() => toggleTag(t)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={active ? 'check-circle' : 'plus-circle-outline'}
                    size={14}
                    color={active ? '#3A1208' : '#755848'}
                  />
                  <Text style={[s.tagText, active && s.tagTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. WRITTEN FEEDBACK */}
        <View style={s.card}>
          <Text style={s.cardTitle}>लिखित समीक्षा (Written Review)</Text>
          <TextInput
            style={s.textArea}
            multiline
            placeholder="पंडित जी के विधि-विधान, मंत्रोच्चार व आचरण के बारे में अपने विचार साझा करें..."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* 4. OPTIONAL DAKSHINA TIP */}
        <View style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={s.cardTitle}>स्वैच्छिक दक्षिणा टिप (Tip)</Text>
              <Text style={s.cardSub}>पंडित जी के सत्कार हेतु अतिरिक्त दक्षिणा</Text>
            </View>
            <MaterialCommunityIcons name="heart-circle" size={26} color="#EAA838" />
          </View>

          <View style={s.tipRow}>
            {TIP_OPTIONS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[s.tipPill, tip === amt && s.tipPillActive]}
                onPress={() => setTip(amt)}
              >
                <Text style={[s.tipText, tip === amt && s.tipTextActive]}>+₹{amt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.tipPill, tip === 0 && s.tipPillActive]}
              onPress={() => setTip(0)}
            >
              <Text style={[s.tipText, tip === 0 && s.tipTextActive]}>No Tip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. INVOICE RECEIPT BUTTON */}
        <TouchableOpacity style={s.invoiceBtn} onPress={() => setShowInvoice(true)}>
          <MaterialCommunityIcons name="file-document-outline" size={18} color="#C87A14" />
          <Text style={s.invoiceBtnText}>पूजा रसीद व इनवॉइस देखें (View Invoice Receipt)</Text>
        </TouchableOpacity>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={s.submitBtnText}>समीक्षा सबमिट करें ›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* INVOICE MODAL */}
      <Modal visible={showInvoice} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.invoiceHead}>
              <MaterialCommunityIcons name="om" size={28} color="#C87A14" />
              <Text style={s.invTitle}>वैदिक संस्कार - पूजा रसीद</Text>
              <Text style={s.invDate}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>

            <View style={s.invDivider} />

            <View style={s.invRow}><Text style={s.invK}>बुकिंग आईडी:</Text><Text style={s.invV}>#{booking?.id || 'BK-1029'}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>पूजा का नाम:</Text><Text style={s.invV}>{booking?.pooja?.name || 'Satyanarayan Katha'}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>पंडित जी:</Text><Text style={s.invV}>{booking?.pandit?.name || 'पंडित जी'}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>यजमान:</Text><Text style={s.invV}>{booking?.yajmanName || 'यजमान'}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>स्थान:</Text><Text style={s.invV} numberOfLines={1}>{booking?.area || booking?.address || 'लाइव यजमान स्थान'}</Text></View>

            <View style={s.invDivider} />

            <View style={s.invRow}><Text style={s.invK}>मूल दक्षिणा:</Text><Text style={s.invV}>₹{booking?.dakshina || 2100}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>सामग्री शुल्क:</Text><Text style={s.invV}>₹{booking?.samagriFee || 600}</Text></View>
            <View style={s.invRow}><Text style={s.invK}>प्लेटफॉर्म शुल्क:</Text><Text style={s.invV}>₹50</Text></View>
            {tip > 0 && <View style={s.invRow}><Text style={s.invK}>दक्षिणा टिप:</Text><Text style={s.invV}>₹{tip}</Text></View>}
            <View style={s.invRow}><Text style={s.invK}>GST (5%):</Text><Text style={s.invV}>₹{booking?.gst || 140}</Text></View>

            <View style={s.invDivider} />

            <View style={s.invRow}>
              <Text style={[s.invK, { fontWeight: '800', color: '#3A1208' }]}>कुल भुगतान:</Text>
              <Text style={[s.invV, { fontWeight: '900', color: '#C87A14', fontSize: 16 }]}>
                ₹{((booking?.total || 2890) + tip).toLocaleString('en-IN')}
              </Text>
            </View>

            <TouchableOpacity
              style={s.downloadBtn}
              onPress={() => {
                setShowInvoice(false);
                Alert.alert('Downloaded', 'पूजा रसीद (PDF) आपके डाउनलोड्स में सेव कर दी गई है।');
              }}
            >
              <MaterialCommunityIcons name="download" size={18} color="#3A1208" />
              <Text style={s.downloadBtnText}>रसीद डाउनलोड करें (PDF)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.modalClose} onPress={() => setShowInvoice(false)}>
              <Text style={s.modalCloseText}>बंद करें</Text>
            </TouchableOpacity>
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
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  celebrateBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    marginBottom: 14,
    ...shadow,
  },
  omCircle: {
    marginBottom: 10,
  },
  celTitle: {
    fontFamily: serif,
    fontSize: 18,
    fontWeight: '700',
    color: '#3A1208',
    textAlign: 'center',
  },
  celSub: {
    fontSize: 12,
    color: '#755848',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    marginBottom: 12,
    ...shadow,
  },
  cardTitle: {
    fontFamily: serif,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#3A1208',
  },
  cardSub: {
    fontSize: 11.5,
    color: '#755848',
    marginTop: 2,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#EFE4D6',
    gap: 6,
  },
  tagChipActive: {
    backgroundColor: '#EAA838',
    borderColor: '#EAA838',
  },
  tagText: {
    fontSize: 12,
    color: '#755848',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#3A1208',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#FAF7F0',
    borderRadius: 12,
    padding: 12,
    minHeight: 74,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#3A1208',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tipPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF7F0',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  tipPillActive: {
    backgroundColor: '#EAA838',
    borderColor: '#EAA838',
  },
  tipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#755848',
  },
  tipTextActive: {
    color: '#3A1208',
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#EFE4D6',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
    gap: 6,
  },
  invoiceBtnText: {
    color: '#C87A14',
    fontWeight: '700',
    fontSize: 12.5,
  },
  submitBtn: {
    backgroundColor: '#EAA838',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  submitBtnText: {
    color: '#3A1208',
    fontSize: 15,
    fontWeight: '800',
  },

  // INVOICE MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    ...shadow,
  },
  invoiceHead: {
    alignItems: 'center',
  },
  invTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: '#3A1208',
    marginTop: 4,
  },
  invDate: {
    fontSize: 11,
    color: '#8A7466',
    marginTop: 2,
  },
  invDivider: {
    height: 1,
    backgroundColor: '#EFE4D6',
    marginVertical: 10,
  },
  invRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  invK: {
    fontSize: 12,
    color: '#755848',
  },
  invV: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A1208',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA838',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
  },
  downloadBtnText: {
    color: '#3A1208',
    fontSize: 13,
    fontWeight: '800',
  },
  modalClose: {
    alignItems: 'center',
    marginTop: 12,
    padding: 4,
  },
  modalCloseText: {
    color: '#8A7466',
    fontSize: 12,
    fontWeight: '600',
  },
});
