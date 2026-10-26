import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header, Screen, Field, Button, Card } from '../../components/ui';
import { Sheet, Avatar } from '../../components/widgets';
import colors from '../../theme/colors';
import { radius, shadow } from '../../theme/styles';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Module 10 — Bhavya Aayojan: VIP Gurus & Grand Havan curators + Request Callback.
 */
export default function BhavyaAayojanScreen({ navigation }) {
  const { isHindi } = useLanguage();
  const [open, setOpen] = useState(false);
  const [guru, setGuru] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  const [done, setDone] = useState(false);
  const [gurus, setGurus] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    api.get('discovery/role/guru')
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res?.vendors || res?.data || []);
        if (raw.length) {
          setGurus(raw.map((g) => ({
            id: String(g._id || g.id),
            name: g.name,
            focus: g.focus || g.specialities?.[0] || 'महायज्ञ व वैदिक अनुष्ठान',
            events: g.programsCompleted || g.events || 50,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const requestCallback = (g) => {
    setGuru(g);
    setForm({ name: '', phone: '', note: '' });
    setDone(false);
    setOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={isHindi ? 'भव्य आयोजन' : 'Bhavya Aayojan'}
        subtitle={isHindi ? 'विशिष्ट आचार्य · महायज्ञ व अनुष्ठान' : 'VIP Gurus · Grand Havan & Events'}
        navigation={navigation}
      />
      <Screen>
        <LinearGradient colors={colors.goldGradient || ['#E9C86A', '#D4AF37']} style={s.hero}>
          <MaterialCommunityIcons name="crown" size={34} color="#fff" />
          <Text style={s.heroText}>
            {isHindi
              ? 'प्रख्यात आचार्यों व संतों के सान्निध्य में भव्य धार्मिक आयोजन'
              : 'Grand spiritual events, curated by renowned Gurus'}
          </Text>
        </LinearGradient>

        {gurus.map((g) => (
          <Card key={g.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar icon="account-star" size={58} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.name}>{g.name}</Text>
                <Text style={s.focus}>{g.focus}</Text>
                <Text style={s.events}>
                  🎉 {g.events}+ {isHindi ? 'आयोजन संपन्न' : 'events curated'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={s.cb} onPress={() => requestCallback(g)}>
              <MaterialCommunityIcons name="phone-in-talk" size={18} color="#fff" />
              <Text style={s.cbText}>
                {isHindi ? 'कॉल बैक का अनुरोध करें' : 'Request Callback'}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}

        {!loading && gurus.length === 0 && (
          <Card style={{ alignItems: 'center', padding: 24 }}>
            <MaterialCommunityIcons name="crown-outline" size={48} color={colors.gold} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 10, textAlign: 'center' }}>
              {isHindi ? 'भव्य धार्मिक आयोजन एवं महायज्ञ' : 'Grand Vedic Ceremonies & Yagya'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
              {isHindi
                ? 'विशिष्ट आचार्यों के सान्निध्य में अपने स्थल पर श्रीमद्भागवत कथा, शतचंडी महायज्ञ अथवा भव्य जागरण हेतु सीधे संपर्क करें।'
                : 'Directly request our event curation team for grand havan, katha or spiritual events with certified Gurus.'}
            </Text>
            <TouchableOpacity
              style={[s.cb, { alignSelf: 'stretch', marginTop: 16 }]}
              onPress={() => requestCallback({ name: isHindi ? 'वैदिक आयोजन समिति' : 'Vaidic Event Team' })}
            >
              <MaterialCommunityIcons name="phone-in-talk" size={18} color="#fff" />
              <Text style={s.cbText}>
                {isHindi ? 'आयोजन परामर्श हेतु अनुरोध करें' : 'Request Event Consultation'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </Screen>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={done ? '' : (isHindi ? `कॉल बैक अनुरोध — ${guru?.name || ''}` : `Request Callback — ${guru?.name || ''}`)}
      >
        {done ? (
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name="check-decagram" size={54} color={colors.success} />
            <Text style={s.doneTitle}>
              {isHindi ? 'अनुरोध दर्ज हो गया!' : 'Callback Requested!'}
            </Text>
            <Text style={s.doneSub}>
              {isHindi
                ? 'हमारी आयोजन टीम शीघ्र ही आपसे संपर्क करेगी।'
                : 'Our spiritual events team will contact you shortly.'}
            </Text>
            <Button
              title={isHindi ? 'संपन्न' : 'Done'}
              style={{ marginTop: 18, alignSelf: 'stretch' }}
              onPress={() => setOpen(false)}
            />
          </View>
        ) : (
          <>
            <Field
              label={isHindi ? 'आपका नाम' : 'Your Name'}
              icon="account"
              placeholder={isHindi ? 'नाम दर्ज करें' : 'Name'}
              value={form.name}
              onChangeText={set('name')}
            />
            <Field
              label={isHindi ? 'मोबाइल नंबर' : 'Phone'}
              icon="cellphone"
              keyboardType="phone-pad"
              placeholder={isHindi ? 'फ़ोन नंबर' : 'Mobile number'}
              value={form.phone}
              onChangeText={set('phone')}
            />
            <Field
              label={isHindi ? 'आयोजन का विवरण' : 'Event Details'}
              icon="text"
              placeholder={isHindi ? 'अपने आयोजन के विषय में बताएं' : 'Tell us about your event'}
              value={form.note}
              onChangeText={set('note')}
              multiline
            />
            <Button
              title={isHindi ? 'अनुरोध भेजें' : 'Submit Request'}
              onPress={() => setDone(true)}
            />
          </>
        )}
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: 20, alignItems: 'center', marginBottom: 16 },
  heroText: { color: '#fff', fontWeight: '700', textAlign: 'center', marginTop: 10, fontSize: 14 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  focus: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 3 },
  events: { fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDeep, borderRadius: 12, paddingVertical: 12, marginTop: 14 },
  cbText: { color: '#fff', fontWeight: '800', marginLeft: 8 },
  doneTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14 },
  doneSub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
