import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/ui';
import colors from '../../theme/colors';
import { panditBookingStore } from '../../services/panditBookingStore';
import socket from '../../services/socket';

const QUICK_REPLIES = [
  'मैं घर पर ही हूँ 🙏',
  'सामग्री तैयार है',
  'कृपया 4th फ्लोर पर आएं',
  'लिफ्ट काम कर रही है',
  'कॉल करें',
];

export default function ChatScreen({ navigation, route }) {
  const booking = panditBookingStore.getBooking();
  const name = route.params?.name || booking?.pandit?.name || 'पंडित जी';
  const [messages, setMessages] = useState(booking?.chatMessages || []);
  const [text, setText] = useState('');
  const listRef = useRef();

  useEffect(() => {
    const bookingId = booking?.id || route.params?.bookingId;
    if (bookingId) {
      socket.send('booking:join', { bookingId });
    }
    const off = socket.on('chat:message', (m) => {
      if (m?.from === 'pandit' || m?.sender === 'pandit') {
        panditBookingStore.sendChatMessage('pandit', m.text);
      }
    });
    const unsub = panditBookingStore.subscribe((b) => {
      if (b?.chatMessages) {
        setMessages([...b.chatMessages]);
      }
    });
    return () => {
      if (typeof off === 'function') off();
      unsub();
    };
  }, [booking?.id]);

  const send = (msgText) => {
    const content = (msgText || text).trim();
    if (!content) return;

    panditBookingStore.sendChatMessage('yajman', content);
    socket.send('chat:message', {
      bookingId: booking?.id || route.params?.bookingId,
      from: 'yajman',
      text: content,
    });
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={s.container}>
      <Header
        title={name}
        subtitle="🔒 Number masked · end-to-end encrypted"
        navigation={navigation}
        right={
          <TouchableOpacity
            style={s.callHeaderBtn}
            onPress={() => Alert.alert('Masked Call', 'पंडित जी से सुरक्षित मास्क्ड कॉल कनेक्ट हो रही है (+91 11 4084 4892)...')}
          >
            <MaterialCommunityIcons name="phone" size={20} color="#3A1208" />
          </TouchableOpacity>
        }
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.sender === 'yajman';
          const isSys = item.sender === 'system';

          if (isSys) {
            return (
              <View style={s.sysBubble}>
                <Text style={s.sysText}>{item.text}</Text>
              </View>
            );
          }

          return (
            <View style={[s.bubble, isMe ? s.me : s.them]}>
              <Text style={[s.msg, isMe && s.meText]}>{item.text}</Text>
              <Text style={[s.time, isMe && s.meTime]}>{item.time}</Text>
            </View>
          );
        }}
      />

      {/* QUICK REPLIES BAR */}
      <View style={s.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {QUICK_REPLIES.map((q) => (
            <TouchableOpacity key={q} style={s.quickChip} onPress={() => send(q)}>
              <Text style={s.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            placeholder="संदेश लिखें (Type a message)..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={s.sendBtn} onPress={() => send()}>
            <MaterialCommunityIcons name="send" size={20} color="#3A1208" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  callHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  me: {
    backgroundColor: '#EAA838',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  them: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  sysBubble: {
    alignSelf: 'center',
    backgroundColor: '#F3EAE0',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginVertical: 8,
  },
  sysText: {
    fontSize: 11,
    color: '#755848',
    fontWeight: '600',
  },
  msg: {
    fontSize: 14,
    color: '#3A1208',
    lineHeight: 19,
  },
  meText: {
    color: '#3A1208',
    fontWeight: '600',
  },
  time: {
    fontSize: 10,
    color: '#8A7466',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  meTime: {
    color: '#522E18',
  },
  quickBar: {
    paddingVertical: 8,
    backgroundColor: '#FAF7F0',
    borderTopWidth: 1,
    borderTopColor: '#EFE4D6',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
  },
  quickText: {
    fontSize: 12,
    color: '#6E5544',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE4D6',
  },
  input: {
    flex: 1,
    backgroundColor: '#FAF7F0',
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14,
    color: '#3A1208',
    borderWidth: 1,
    borderColor: '#EFE4D6',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAA838',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
