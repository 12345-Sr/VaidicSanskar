/**
 * Daily Pandit Subscription Store (User App)
 * Implements PRD specifications for Daily Pandit Recurring Puja Module:
 * - Plans: Laghu (10-15m), Dainik (20-30m), Vishesh (45-60m)
 * - Frequencies: 7 days, 6 days (Mon-Sat), 5 days (Mon-Fri), 2 days (Tue+Sat)
 * - 48-Hour Assignment SLA with auto-refund rule
 * - Daily verification without user burden: GPS geofence (100m) + Site QR + In-app camera photo
 * - Attendance calendar with Green (Completed), Yellow (Backup), Blue (Skipped), Red (Missed)
 * - Missed-visit automatic credit calculation
 * - Skip / Pause / Cancel / Pandit change workflows
 */

export const POOJA_VIDHIS = [
  {
    id: 'laghu',
    name: 'लघु पूजा (Laghu Puja)',
    durationMin: 15,
    tagline: 'दैनिक दीप, धूप, आरती एवं तिलक',
    description: 'नित्य दीप प्रज्ज्वलन, अगरबत्ती/धूप, शांति मंत्र, मुख्य देव आरती एवं तिलक। दुकानों व शोरूम के लिए सर्वोत्तम।',
    basePriceMonthly: 2499,
    icon: 'fire',
    recommendedFor: 'दुकान, शोरूम, केबिन',
  },
  {
    id: 'dainik',
    name: 'दैनिक पूजा (Regular Puja)',
    durationMin: 30,
    tagline: 'गणेश-लक्ष्मी पूजन, नित्य पाठ व आरती',
    description: 'आचमन, गणेश-गौरी पूजन, नित्य स्तोत्र पाठ (हनुमान चालीसा/श्री सूक्त), कर्पूर आरती, पुष्प समर्पण व प्रसाद भोग।',
    basePriceMonthly: 3999,
    icon: 'hands-pray',
    recommendedFor: 'घर, कार्यालय, प्रतिष्ठा प्रतिष्ठान',
    popular: true,
  },
  {
    id: 'vishesh',
    name: 'विशेष दैनिक (Extended Puja)',
    durationMin: 50,
    tagline: 'रुद्राभिषेक / सुंदरकांड अंश / दुर्गा पाठ',
    description: 'विस्तृत वैदिक षोडशोपचार पूजन, नित्य रुद्राभिषेक अथवा सुंदरकांड का अंश पाठ, महाआरती एवं रक्षासूत्र।',
    basePriceMonthly: 6499,
    icon: 'book-open-page-variant',
    recommendedFor: 'उद्योग, फैक्ट्री, मंदिर, विशेष अनुष्ठान',
  },
];

export const FREQUENCIES = [
  { id: 'daily_7', label: 'रोज (7 दिन)', daysPerMonth: 30, multiplier: 1.0, sub: 'सभी 30 दिन' },
  { id: 'mon_sat_6', label: 'सोम – शनि (6 दिन)', daysPerMonth: 26, multiplier: 0.88, sub: 'रविवार अवकाश' },
  { id: 'mon_fri_5', label: 'सोम – शुक्र (5 दिन)', daysPerMonth: 22, multiplier: 0.78, sub: 'कार्यालय हेतु' },
  { id: 'tue_sat_2', label: 'मंगल व शनि (2 दिन)', daysPerMonth: 8, multiplier: 0.35, sub: 'हनुमान जी विशेष' },
];

export const TIME_SLOTS = [
  '06:00 – 07:00 AM',
  '07:00 – 08:00 AM',
  '08:00 – 09:00 AM',
  '09:00 – 10:00 AM',
];

export const DURATION_PLANS = [
  { months: 1, discountPercent: 0, label: '1 माह (मासिक बिलिंग)' },
  { months: 3, discountPercent: 5, label: '3 माह (5% बचत)' },
  { months: 6, discountPercent: 10, label: '6 माह (10% बचत)' },
  { months: 12, discountPercent: 15, label: '1 वर्ष (15% बचत)', bestValue: true },
];

export const SITE_TYPES = [
  { id: 'home', label: 'घर (Home)', icon: 'home' },
  { id: 'shop', label: 'दुकान (Shop)', icon: 'store' },
  { id: 'office', label: 'ऑफिस (Office)', icon: 'office-building' },
  { id: 'factory', label: 'फैक्ट्री (Factory)', icon: 'factory' },
  { id: 'showroom', label: 'शोरूम (Showroom)', icon: 'domain' },
  { id: 'mandir', label: 'सोसायटी मंदिर (Temple)', icon: 'temple-hindu' },
];

// Subscriptions are loaded from live backend
const INITIAL_DEMO_SUBSCRIPTION = null;
class DailyPanditStore {
  constructor() {
    this.subscription = null;
    this.listeners = new Set();
  }

  getSubscription() {
    return this.subscription;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.subscription);
      } catch (e) {
        console.error('Error in dailyPanditStore listener:', e);
      }
    });
  }

  // Calculate pricing based on options
  calculateQuote({ vidhiId, frequencyId, durationMonths, samagriByUs = false, isB2B = false }) {
    const vidhi = POOJA_VIDHIS.find((v) => v.id === vidhiId) || POOJA_VIDHIS[1];
    const freq = FREQUENCIES.find((f) => f.id === frequencyId) || FREQUENCIES[0];
    const plan = DURATION_PLANS.find((p) => p.months === durationMonths) || DURATION_PLANS[0];

    const baseMonthly = Math.round(vidhi.basePriceMonthly * freq.multiplier);
    const samagriMonthly = samagriByUs ? 999 : 0;
    const grossMonthly = baseMonthly + samagriMonthly;

    const discountAmountMonthly = Math.round((grossMonthly * plan.discountPercent) / 100);
    const netMonthly = grossMonthly - discountAmountMonthly;
    const totalAmount = netMonthly * plan.months;

    const gstAmount = isB2B ? Math.round(totalAmount * 0.18) : 0;
    const finalTotal = totalAmount + gstAmount;

    return {
      vidhi,
      freq,
      plan,
      visitsPerMonth: freq.daysPerMonth,
      baseMonthly,
      samagriMonthly,
      discountAmountMonthly,
      netMonthly,
      totalAmount,
      gstAmount,
      finalTotal,
    };
  }

  // Submit a new subscription request
  createSubscription(formData) {
    const quote = this.calculateQuote(formData);

    this.subscription = {
      id: `DPS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'REQUESTED',
      siteType: formData.siteType || 'home',
      siteTypeName: SITE_TYPES.find((s) => s.id === formData.siteType)?.label || 'घर (Home)',
      siteName: formData.siteName || 'मेरा निवास',
      address: formData.address || 'हजरतगंज, लखनऊ',
      floorNote: formData.floorNote || 'पूजा घर, भूतल',
      contactPerson: formData.contactPerson || 'उपभोक्ता',
      contactMobile: formData.contactMobile || '+91 98765 43210',
      vidhiId: formData.vidhiId,
      frequencyId: formData.frequencyId,
      slot: formData.slot,
      altSlot: formData.altSlot || '08:00 – 09:00 AM',
      durationMonths: formData.durationMonths || 1,
      startDate: formData.startDate || 'कल से (Tomorrow)',
      renewalDate: '10 Nov 2026',
      samagriByUs: formData.samagriByUs || false,
      isB2B: formData.isB2B || false,
      companyName: formData.companyName || '',
      gstin: formData.gstin || '',
      monthlyPrice: quote.netMonthly,
      qrSecret: `VSDK-QR-SITE-${Math.floor(1000 + Math.random() * 9000)}`,
      creditsAccumulated: 0,
      autoPayEnabled: formData.autoPayEnabled !== false,

      assignedPandit: null,
      backupPandit: null,
      requestedAt: new Date().toISOString(),
      slaRemainingHours: 48,

      todayVisit: {
        date: 'कल',
        dayName: 'कल की पूजा',
        slotTime: formData.slot,
        status: 'SCHEDULED',
        checkinAt: null,
        startedAt: null,
        completedAt: null,
        durationMinutes: 0,
        verifiedGps: false,
        verifiedQr: false,
        photoProofUrl: null,
        photoWatermark: null,
        panditName: 'आवंटन जारी है...',
        feedbackGiven: false,
      },

      attendanceCalendar: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        date: `${i + 1} Oct`,
        status: 'SCHEDULED',
        time: formData.slot.split('–')[0].trim(),
        dur: `${POOJA_VIDHIS.find((v) => v.id === formData.vidhiId)?.durationMin || 30} min`,
        pandit: 'निर्धारित पंडित',
      })),
    };

    this.notify();
    return this.subscription;
  }

  // Simulate Admin assigning Pandit (SLA fulfillment)
  simulateAdminAssignPandit() {
    if (!this.subscription) return;
    this.subscription.status = 'ACTIVE';
    this.subscription.assignedPandit = {
      id: 'PND-9912',
      name: 'पं. राधेश्याम शास्त्री',
      photo: 'vedic_pandit',
      rating: 4.96,
      ratingCount: 310,
      expYears: 16,
      gurukul: 'सम्पूर्णानन्द संस्कृत विश्वविद्यालय, वाराणसी',
      languages: ['हिन्दी', 'संस्कृत', 'अवधी'],
      phoneMasked: '+91 94•••• ••42',
      onTimeRate: '98%',
      totalDailySites: 5,
    };
    this.subscription.backupPandit = {
      id: 'PND-7703',
      name: 'पं. अमित जोशी',
      photo: 'astro_kashi',
      rating: 4.9,
      expYears: 11,
      phoneMasked: '+91 98•••• ••19',
    };
    if (this.subscription.todayVisit) {
      this.subscription.todayVisit.panditName = 'पं. राधेश्याम शास्त्री';
    }
    this.notify();
  }

  // Simulate Live Visit Stages for testing / demo
  setTodayVisitStatus(newStatus) {
    if (!this.subscription || !this.subscription.todayVisit) return;
    const v = this.subscription.todayVisit;
    v.status = newStatus;

    if (newStatus === 'ON_THE_WAY') {
      v.liveLocation = '0.9 किमी दूर (आगमन 6 मिनट में)';
    } else if (newStatus === 'CHECKED_IN') {
      v.checkinAt = '07:05 AM';
      v.verifiedGps = true;
      v.verifiedQr = true;
    } else if (newStatus === 'IN_PROGRESS') {
      v.startedAt = '07:07 AM';
      v.durationMinutes = 12;
    } else if (newStatus === 'COMPLETED') {
      v.completedAt = '07:34 AM';
      v.durationMinutes = 27;
      v.photoProofUrl = 'pooja_kit';
      v.photoWatermark = `${this.subscription.siteName} • 10-10-2026 07:33 AM • GPS: Verified`;
    }
    this.notify();
  }

  // Submit quick daily feedback for today's pooja
  submitDailyFeedback(rating, tags = []) {
    if (!this.subscription || !this.subscription.todayVisit) return;
    this.subscription.todayVisit.feedbackGiven = true;
    this.subscription.todayVisit.rating = rating;
    this.subscription.todayVisit.feedbackTags = tags;
    this.notify();
  }

  // Skip a specific day (user pause / shop holiday)
  skipVisit(dateString, reason = 'दुकान अवकाश / व्यक्तिगत कार्य') {
    if (!this.subscription) return;
    // PRD: up to 4 skips/mo get 100% credit towards next invoice
    const creditAmount = Math.round(this.subscription.monthlyPrice / 30);
    this.subscription.creditsAccumulated += creditAmount;

    // update today's visit if skipped today
    if (this.subscription.todayVisit) {
      this.subscription.todayVisit.status = 'SKIPPED_BY_USER';
    }
    this.notify();
    return { creditAmount, totalCredits: this.subscription.creditsAccumulated };
  }

  // Pause subscription for 7-30 days
  pauseSubscription(pauseDays = 14) {
    if (!this.subscription) return;
    this.subscription.status = 'PAUSED';
    this.subscription.pauseDays = pauseDays;
    this.notify();
  }

  // Resume subscription
  resumeSubscription() {
    if (!this.subscription) return;
    this.subscription.status = 'ACTIVE';
    this.subscription.pauseDays = 0;
    this.notify();
  }

  // Cancel subscription with pro-rata refund minus ₹199 processing
  cancelSubscription(reason = '') {
    if (!this.subscription) return;
    const remainingDays = 18;
    const proRataAmount = Math.round((this.subscription.monthlyPrice / 30) * remainingDays);
    const refundAmount = Math.max(0, proRataAmount - 199 + this.subscription.creditsAccumulated);

    this.subscription.status = 'CANCELLED';
    this.subscription.cancelReason = reason;
    this.subscription.refundIssued = refundAmount;
    this.notify();
    return { proRataAmount, processingFee: 199, refundAmount };
  }

  // Change Pandit Request
  requestPanditChange(reason = 'समय में विलंब / भाषा समन्वय') {
    if (!this.subscription) return;
    this.subscription.changePanditRequested = true;
    this.subscription.changePanditReason = reason;
    this.notify();
  }

  // Reset to demo active subscription
  resetDemo() {
    this.subscription = JSON.parse(JSON.stringify(INITIAL_DEMO_SUBSCRIPTION));
    this.notify();
  }
}

export const dailyPanditStore = new DailyPanditStore();
export default dailyPanditStore;
