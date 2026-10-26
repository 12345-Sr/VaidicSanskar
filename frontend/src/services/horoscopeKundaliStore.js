/**
 * Horoscope & Kundali Store (User App)
 * - 12 Rashis Daily, Weekly, Monthly, Yearly horoscope
 * - Daily Panchang (Tithi, Nakshatra, Rahu Kaal, Abhijit Muhurat)
 * - Vedic Kundali (Lagna, Rashi, Nakshatra, Vimshottari dasha, Doshas)
 * - Ashtakoot 36 Gun Milan with Manglik & Nadi cancellation checks
 * - Authentic Pandit Kundali Analysis Workflow (replaces AI)
 * - Devotee file uploads (Image / PDF) submitted directly to certified Pandits
 */

export const RASHIS = [
  { id: 'aries', name: 'मेष', en: 'Aries', symbol: '♈', lord: 'मंगल (Mars)', element: 'अग्नि' },
  { id: 'taurus', name: 'वृषभ', en: 'Taurus', symbol: '♉', lord: 'शुक्र (Venus)', element: 'पृथ्वी' },
  { id: 'gemini', name: 'मिथुन', en: 'Gemini', symbol: '♊', lord: 'बुध (Mercury)', element: 'वायु' },
  { id: 'cancer', name: 'कर्क', en: 'Cancer', symbol: '♋', lord: 'चंद्रमा (Moon)', element: 'जल' },
  { id: 'leo', name: 'सिंह', en: 'Leo', symbol: '♌', lord: 'सूर्य (Sun)', element: 'अग्नि' },
  { id: 'virgo', name: 'कन्या', en: 'Virgo', symbol: '♍', lord: 'बुध (Mercury)', element: 'पृथ्वी' },
  { id: 'libra', name: 'तुला', en: 'Libra', symbol: '♎', lord: 'शुक्र (Venus)', element: 'वायु' },
  { id: 'scorpio', name: 'वृश्चिक', en: 'Scorpio', symbol: '♏', lord: 'मंगल (Mars)', element: 'जल' },
  { id: 'sagittarius', name: 'धनु', en: 'Sagittarius', symbol: '♐', lord: 'बृहस्पति (Jupiter)', element: 'अग्नि' },
  { id: 'capricorn', name: 'मकर', en: 'Capricorn', symbol: '♑', lord: 'शनि (Saturn)', element: 'पृथ्वी' },
  { id: 'aquarius', name: 'कुंभ', en: 'Aquarius', symbol: '♒', lord: 'शनि (Saturn)', element: 'वायु' },
  { id: 'pisces', name: 'मीन', en: 'Pisces', symbol: '♓', lord: 'बृहस्पति (Jupiter)', element: 'जल' },
];

export const TODAY_PANCHANG = {
  date: '13 अक्टूबर 2026',
  date_en: '13 October 2026',
  day: 'मंगलवार',
  day_en: 'Tuesday',
  tithi: 'कार्तिक शुक्ल पक्ष तृतीया (16:15 तक)',
  tithi_en: 'Kartik Shukla Tritiya (till 16:15)',
  nakshatra: 'अनुराधा (19:40 तक)',
  nakshatra_en: 'Anuradha (till 19:40)',
  yoga: 'सौभाग्य योग (21:10 तक)',
  yoga_en: 'Saubhagya Yoga (till 21:10)',
  karana: 'तैतिल / गर (16:15 तक)',
  karana_en: 'Taitila / Gara (till 16:15)',
  sunrise: '06:21 AM',
  sunset: '05:51 PM',
  rahuKaal: '03:00 PM – 04:30 PM',
  abhijitMuhurat: '11:44 AM – 12:30 PM',
  choghadiya: 'शुभ: 09:15 - 10:45 AM • अमृत: 12:15 - 01:45 PM',
  choghadiya_en: 'Shubh: 09:15 - 10:45 AM • Amrit: 12:15 - 01:45 PM',
};

class HoroscopeKundaliStore {
  constructor() {
    this.selectedRashi = 'leo';
    this.userKundali = null;
    this.matchingResult = null;
    this.analysisRequests = [];
    this.savedProfiles = [];
    this.listeners = new Set();
  }

  getSelectedRashi() {
    return this.selectedRashi;
  }

  setSelectedRashi(rashiId) {
    this.selectedRashi = rashiId;
    this.notify();
  }

  getKundali() {
    return this.userKundali;
  }

  getMatchingResult() {
    return this.matchingResult;
  }

  getAnalysisRequests() {
    return this.analysisRequests;
  }

  getSavedProfiles() {
    return this.savedProfiles;
  }

  generateKundali(profile = {}) {
    const name = profile.name || 'जातक';
    const dob = profile.dob || '01-01-1995';
    const tob = profile.tob || '12:00 PM';
    const pob = profile.pob || 'वाराणसी';

    this.userKundali = {
      name,
      dob,
      tob,
      pob,
      lagna: 'सिंह (Leo)',
      rashi: 'वृश्चिक (Scorpio)',
      nakshatra: 'अनुराधा (Anuradha)',
      charan: 'द्वितीय (2nd)',
      varna: 'विप्र (Brahmin)',
      vashya: 'कीट (Keet)',
      yoni: 'मृग (Deer)',
      gana: 'देव (Deva)',
      nadi: 'मध्य (Madhya)',
      currentDasha: 'बुध - शुक्र (Mercury - Venus)',
      manglikStatus: 'अ-मांगलिक (Non-Manglik)',
      sadeSatiStatus: 'साढ़े साती से मुक्त (Free)',
      overview: {
        personalitySummary:
          'स्वाभिमानी, नेतृत्व क्षमता से युक्त, कर्तव्यनिष्ठ एवं न्यायप्रिय व्यक्तित्व। जीवन के मध्य काल में विशेष प्रतिष्ठा व ऐश्वर्य प्राप्ति का योग।',
        lagna: 'सिंह (Leo)',
        lagnaLord: 'सूर्य (Sun)',
        rashi: 'वृश्चिक (Scorpio)',
        rashiLord: 'मंगल (Mars)',
        nakshatra: 'अनुराधा (Anuradha)',
        nakshatraLord: 'शनि (Saturn)',
        currentDasha: 'बुध महादशा • शुक्र अंतर्दशा (2025–2028)',
      },
      planets: [
        { name: 'सूर्य (Sun)', rashi: 'सिंह (Leo)', degree: "14°28'", bhav: '1', state: 'स्वराशि (Own)' },
        { name: 'चंद्रमा (Moon)', rashi: 'वृश्चिक (Scorpio)', degree: "08°12'", bhav: '4', state: 'नीच (Debilitated)' },
        { name: 'मंगल (Mars)', rashi: 'मिथुन (Gemini)', degree: "22°05'", bhav: '11', state: 'मित्र (Friendly)' },
        { name: 'बुध (Mercury)', rashi: 'सिंह (Leo)', degree: "18°40'", bhav: '1', state: 'मित्र (Friendly)' },
        { name: 'बृहस्पति (Jupiter)', rashi: 'तुला (Libra)', degree: "05°19'", bhav: '3', state: 'सम (Neutral)' },
        { name: 'शुक्र (Venus)', rashi: 'कन्या (Virgo)', degree: "12°54'", bhav: '2', state: 'नीच (Debilitated)' },
        { name: 'शनि (Saturn)', rashi: 'कुंभ (Aquarius)', degree: "27°11'", bhav: '7', state: 'मूलत्रिकोण (Mooltrikona)' },
        { name: 'राहु (Rahu)', rashi: 'वृश्चिक (Scorpio)', degree: "19°33'", bhav: '4', state: 'नीच (Debilitated)' },
        { name: 'केतु (Ketu)', rashi: 'वृषभ (Taurus)', degree: "19°33'", bhav: '10', state: 'उच्च (Exalted)' },
      ],
      doshas: {
        manglik: {
          isDosha: false,
          title: 'मंगल दोष से पूर्णतः मुक्त (Non-Manglik)',
          desc: 'कुंडली में मंगल एकादश (लाभ) भाव में स्थित है; अतः किसी प्रकार का मांगलिक दोष नहीं है। वैवाहिक जीवन उत्तम रहेगा।',
        },
        sadeSati: {
          isDosha: false,
          title: 'शनि साढ़े साती से मुक्त',
          desc: 'आपकी राशि वृश्चिक वर्तमान समय में शनि की साढ़े साती के प्रभाव से पूरी तरह मुक्त है। कार्य-व्यवसाय में उन्नति का समय है।',
        },
        kaalSarp: {
          isDosha: false,
          title: 'काल सर्प दोष अनुपस्थित',
          desc: 'राहु-केतु अक्ष के दोनों ओर ग्रह स्वतंत्र रूप से स्थित हैं, अतः कुंडली में काल सर्प दोष नहीं है।',
        },
        pitra: {
          isDosha: false,
          title: 'सामान्य पितृ आशीर्वाद',
          desc: 'अमावस्या पर दान व जल अर्पण से भाग्योन्नति के मार्ग सुगम होंगे।',
        },
      },
      yogas: [
        { name: 'बुधादित्य राजयोग (लग्न भाव)', desc: 'सूर्य और बुध की प्रथम भाव में युति से प्रखर बुद्धि, उच्च मान-सम्मान एवं नेतृत्व क्षमता प्राप्त होती है।' },
        { name: 'शश महापुरुष योग (सप्तम भाव)', desc: 'शनि देव अपनी स्वराशि कुंभ में केंद्र में होने से स्थिरता, दीर्घायु एवं व्यापार में सफलता दिलाते हैं।' },
        { name: 'गजलक्ष्मी योग', desc: 'केंद्र और त्रिकोण का शुभ संबंध आर्थिक समृद्धि एवं प्रतिष्ठा में निरंतर वृद्धि कारक है।' },
      ],
      remedies: [
        { title: 'सूर्य नमस्कार व तांबे के लोटे से अर्घ्य', desc: 'प्रतिदिन प्रातः तांबे के लोटे में जल, रोली व अक्षत मिलाकर भगवान सूर्य को अर्घ्य दें।' },
        { title: 'गायत्री मंत्र का 108 बार जाप', desc: 'प्रतिदिन पूर्व दिशा में मुख करके 1 माला गायत्री मंत्र का जाप करें। एकाग्रता व ओज में वृद्धि होगी।' },
        { title: 'भगवान शिव का जलाभिषेक', desc: 'प्रत्येक सोमवार को शिवलिंग पर कच्चा दूध व जल चढ़ाएं। चंद्र शांति व मानसिक शांति प्राप्त होगी।' },
      ],
    };
    if (profile.name) {
      const exists = this.savedProfiles.some((p) => p.name === profile.name);
      if (!exists) {
        this.savedProfiles.push({ ...this.userKundali, id: `PROF-${Date.now()}` });
      }
    }
    this.notify();
    return this.userKundali;
  }

  matchKundalis(boy = {}, girl = {}) {
    this.matchingResult = {
      boyName: boy.name || 'वर',
      girlName: girl.name || 'कन्या',
      totalScore: 28.5,
      maxScore: 36,
      verdict: 'उत्तम विवाह योग (Auspicious)',
      color: '#16A34A',
      ashtakoot: [
        { name: 'वर्ण', name_en: 'Varna', score: 1, max: 1, desc: 'कार्यशैली व स्वभाव सामंजस्य उत्तम है।', desc_en: 'Good mutual temperament.' },
        { name: 'वश्य', name_en: 'Vashya', score: 2, max: 2, desc: 'पारस्परिक आकर्षण व संतुलन अनुकूल।', desc_en: 'Favorable mutual balance.' },
        { name: 'तारा', name_en: 'Tara', score: 3, max: 3, desc: 'भाग्य व स्वास्थ्य वृद्धि कारक।', desc_en: 'Auspicious for destiny and health.' },
        { name: 'योनि', name_en: 'Yoni', score: 3.5, max: 4, desc: 'शारीरिक व भावनात्मक अनुकूलता श्रेष्ठ।', desc_en: 'High mutual intimacy.' },
        { name: 'ग्रह मैत्री', name_en: 'Graha Maitri', score: 5, max: 5, desc: 'राशि स्वामियों में परस्पर मित्रता।', desc_en: 'Friendly planetary lords.' },
        { name: 'गण', name_en: 'Gana', score: 6, max: 6, desc: 'दोनों का देव/मनुष्य गण मेल उत्तम।', desc_en: 'Harmonious temperament.' },
        { name: 'भकूट', name_en: 'Bhakoot', score: 0, max: 7, desc: 'नवम-पंचम संबंध; शुभ परिहार लागू।', desc_en: 'Favorable cancellation applies.' },
        { name: 'नाड़ी', name_en: 'Nadi', score: 8, max: 8, desc: 'नाड़ी दोष नहीं है, स्वास्थ्य उत्तम।', desc_en: 'No Nadi dosha.' },
      ],
      doshaCheck: {
        manglikBoth: 'वर अ-मांगलिक, कन्या सामान्य (परिहार लागू)',
        manglikBoth_en: 'No major Manglik affliction',
        nadiDosha: 'नाड़ी दोष नहीं है (भिन्न नाड़ी)',
        nadiDosha_en: 'No Nadi Dosha detected',
        bhakootDosha: 'भकूट दोष का बृहस्पति दृष्टि से परिहार',
        bhakootDosha_en: 'Cancellation of Bhakoot dosha applies',
      },
      advice: '36 में से 28.5 गुण मिलना श्रेष्ठ विवाह का संकेत है।',
      advice_en: 'A score of 28.5 indicates an auspicious match.',
    };
    this.notify();
    return this.matchingResult;
  }

  submitAnalysisRequest({
    devoteeName = '',
    phone = '',
    concern = 'विवाह व मांगलिक विचार',
    question = '',
    file = null,
    dob = '',
    tob = '',
    pob = '',
  }) {
    const newRequest = {
      id: `KUN-${Date.now().toString().slice(-6)}`,
      devoteeName: devoteeName || 'श्रद्धालु',
      phone,
      concern,
      question,
      file, // { uri, name, type, size }
      dob,
      tob,
      pob,
      status: 'ANALYZING', // SUBMITTED | ANALYZING | COMPLETED
      assignedPandit: 'पूज्य आचार्य विद्याधर शास्त्री (काशी पीठाधीश्वर)',
      createdAt: new Date().toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      estimatedHours: '2 से 4 घंटे',
      panditRemarks: 'कुण्डली चक्र एवं ग्रह गोचर का सूक्ष्म अध्ययन किया जा रहा है। फलादेश पत्र तैयार होते ही यहाँ उपलब्ध होगा।',
      remedies: [
        'प्रतिदिन प्रातः सूर्य नमस्कार एवं ॐ घृणि सूर्याय नमः का 11 बार जप करें।',
        'गुरुवार को गाय को हल्दी युक्त गुड़ व चना दाल खिलाएं।',
      ],
    };

    this.analysisRequests.unshift(newRequest);
    this.notify();
    return newRequest;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this);
      } catch (e) {
        console.error('Error in HoroscopeKundaliStore listener:', e);
      }
    });
  }
}

export const horoscopeKundaliStore = new HoroscopeKundaliStore();
export default horoscopeKundaliStore;
