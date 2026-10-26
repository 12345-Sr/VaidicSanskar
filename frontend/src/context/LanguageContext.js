import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import translations from '../i18n/translations';
import colors from '../theme/colors';
import { serif, shadow } from '../theme/styles';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', icon: 'translate' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', icon: 'om' },
];

/**
 * Strips bilingual stacked text:
 * E.g. "दैनिक राशिफल (Horoscope)" -> "Horoscope" (en) / "दैनिक राशिफल" (hi)
 * "वाराणसी (Varanasi)" -> "Varanasi" (en) / "वाराणसी" (hi)
 * "शनिवार (Saturday)" -> "Saturday" (en) / "शनिवार" (hi)
 */
export const cleanBilingual = (text, lang = 'en') => {
  if (!text || typeof text !== 'string') return text;

  // Match: "Hindi (English)" or "English (Hindi)"
  const parenMatch = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim(); // outside
    const part2 = parenMatch[2].trim(); // inside
    const p1Dev = /[\u0900-\u097F]/.test(part1);
    const p2Dev = /[\u0900-\u097F]/.test(part2);

    if (lang === 'en') {
      if (!p2Dev && p1Dev) return part2; // inside is English
      if (!p1Dev) return part1; // outside is English
      return part2;
    } else {
      if (p1Dev) return part1; // outside is Hindi
      if (p2Dev) return part2; // inside is Hindi
      return part1;
    }
  }

  // Match "A / B"
  if (text.includes(' / ')) {
    const parts = text.split(' / ').map((p) => p.trim());
    if (parts.length === 2) {
      const p0Dev = /[\u0900-\u097F]/.test(parts[0]);
      const p1Dev = /[\u0900-\u097F]/.test(parts[1]);
      if (lang === 'en') {
        if (!p1Dev && p0Dev) return parts[1];
        if (!p0Dev) return parts[0];
      } else {
        if (p0Dev) return parts[0];
        if (p1Dev) return parts[1];
      }
    }
  }

  return text;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en'); // 'en' | 'hi'
  const [modalVisible, setModalVisible] = useState(false);

  const setLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
    }
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = translations[language] || translations.en;
      return dict[key] !== undefined ? dict[key] : fallback !== undefined ? fallback : key;
    },
    [language]
  );

  /**
   * Cleans text based on selected language.
   * If language is 'en', returns English string.
   * If language is 'hi', returns Hindi string.
   */
  const getText = useCallback(
    (hiText, enText) => {
      if (language === 'hi') {
        return hiText || enText || '';
      }
      return enText || hiText || '';
    },
    [language]
  );

  /**
   * Helper to clean any stacked bilingual string
   */
  const clean = useCallback(
    (text) => {
      return cleanBilingual(text, language);
    },
    [language]
  );

  const isHindi = language === 'hi';
  const isEnglish = language === 'en';

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const value = {
    language,
    setLanguage,
    t,
    getText,
    clean,
    isHindi,
    isEnglish,
    toggleLanguage,
    openLanguageModal: () => setModalVisible(true),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}

      {/* Global Language Selector Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="translate" size={22} color={colors.maroon} />
                <Text style={s.modalTitle}>
                  {language === 'hi' ? 'भाषा चुनें' : 'Select App Language'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={s.modalSub}>
              {language === 'hi'
                ? 'ऐप की संपूर्ण सामग्री व डेटा आपकी चुनी गई भाषा में प्रदर्शित होगा:'
                : 'All app screens and spiritual data will display in your chosen language:'}
            </Text>

            <View style={s.langOptionsGrid}>
              {SUPPORTED_LANGUAGES.map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <TouchableOpacity
                    key={langItem.code}
                    activeOpacity={0.8}
                    style={[s.langCard, isSelected && s.langCardSelected]}
                    onPress={() => {
                      setLanguage(langItem.code);
                      setModalVisible(false);
                    }}
                  >
                    <View style={[s.langIconBox, isSelected && s.langIconBoxSelected]}>
                      <MaterialCommunityIcons
                        name={langItem.icon}
                        size={24}
                        color={isSelected ? '#fff' : colors.maroon}
                      />
                    </View>
                    <Text style={[s.langNativeTitle, isSelected && s.langNativeTitleSelected]}>
                      {langItem.native}
                    </Text>
                    <Text style={s.langEnglishSub}>{langItem.label}</Text>
                    {isSelected && (
                      <View style={s.checkBadge}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Universal Language Switcher Pill Header Component
 * Can be placed in any Screen Header
 */
export const LanguageSwitcher = ({ style }) => {
  const { language, toggleLanguage, openLanguageModal } = useLanguage();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[s.switchPill, style]}
      onPress={toggleLanguage}
      onLongPress={openLanguageModal}
      accessibilityRole="button"
      accessibilityLabel={`Current language: ${language === 'en' ? 'English' : 'Hindi'}. Tap to switch.`}
    >
      <MaterialCommunityIcons name="translate" size={14} color={colors.maroon} />
      <View style={s.switchPillInner}>
        <Text style={[s.switchPillText, language === 'en' && s.switchPillTextActive]}>
          EN
        </Text>
        <Text style={s.switchDivider}>|</Text>
        <Text style={[s.switchPillText, language === 'hi' && s.switchPillTextActive]}>
          हि
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFE4D6',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  switchPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  switchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C7A6B',
  },
  switchPillTextActive: {
    color: colors.maroon,
    fontWeight: '800',
  },
  switchDivider: {
    fontSize: 10,
    color: '#D8C7B5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FAF7F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: '700',
    color: colors.maroon,
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  langOptionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  langCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EFE4D6',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  langCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDF9',
  },
  langIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  langIconBoxSelected: {
    backgroundColor: colors.maroon,
  },
  langNativeTitle: {
    fontFamily: serif,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  langNativeTitleSelected: {
    color: colors.maroon,
  },
  langEnglishSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default LanguageContext;
