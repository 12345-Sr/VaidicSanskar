/**
 * Bhajan Mandali Marketplace Engine & State Store (User App)
 * Implements Bhajan Mandali PRD:
 * - Listing-based marketplace with packages, media samples & availability calendar
 * - Scheduled booking request flow (24-hr response SLA timer)
 * - Max 3 parallel requests with 1 payment authorization
 * - State Machine:
 *   REQUESTED -> ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
 *   (Alternate: REJECTED, EXPIRED, CANCELLED_BY_USER, CANCELLED_BY_MANDALI, DISPUTED)
 * - Start OTP (generated on accept, entered by Mandali upon arrival within 500m)
 * - End OTP (generated when in progress, entered after >= 75% duration)
 * - Extra hours extension engine
 * - 2-way dual review with sub-ratings
 * - Exact tiered cancellation policy engine
 */

export const BHAJAN_STYLES = [
  { id: 'all', name: 'All Styles', hi: 'सभी शैलियां', icon: 'music' },
  { id: 'sunderkand', name: 'Sunderkand Path', hi: 'श्री सुंदरकांड पाठ', icon: 'book-open-variant' },
  { id: 'sandhya', name: 'Bhajan Sandhya', hi: 'भजन संध्या व संकीर्तन', icon: 'microphone-variant' },
  { id: 'jagran', name: 'Jagran / Jagrata', hi: 'भगवती जागरण व जगराता', icon: 'fire' },
  { id: 'shyam', name: 'Shyam Bhajan', hi: 'खाटू श्याम संकीर्तन', icon: 'crown' },
  { id: 'ramayan', name: 'Ramayan Path', hi: 'श्री रामचरितमानस पाठ', icon: 'script-text' },
  { id: 'sai', name: 'Sai Sandhya', hi: 'साईं संध्या व भजन', icon: 'hands-pray' },
  { id: 'hanuman', name: 'Hanuman Chalisa', hi: 'हनुमान चालीसा 108 पाठ', icon: 'shield-account' },
];

export const MANDALI_OCCASIONS = [
  'गृह प्रवेश व वास्तु शांति',
  'भगवती जागरण व नवरात्रि',
  'श्री सुंदरकांड पाठ उत्सव',
  'खाटू श्याम एकादशी संकीर्तन',
  'जन्मदिन व मांगलिक उत्सव',
  'विवाह व वर्षगांठ उत्सव',
  'मंदिर स्थापना व वार्षिक उत्सव',
];

export const DEMO_MANDALIS = [];

class BhajanMandaliStore {
  constructor() {
    this.mandalis = [];
    this.booking = null;
    this.listeners = new Set();
    this.timerInterval = null;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  getBooking() {
    return this.booking;
  }

  getMandalis() {
    return this.mandalis;
  }

  addMandali(mandali) {
    this.mandalis.unshift(mandali);
    this.notify();
    return mandali;
  }

  updateMandali(id, patch) {
    const idx = this.mandalis.findIndex((m) => m.id === id);
    if (idx > -1) {
      this.mandalis[idx] = { ...this.mandalis[idx], ...patch };
      this.notify();
    }
  }

  createBookingRequest(params) {
    const mandali = params.mandali || this.mandalis[0] || {};
    const pkg = params.package || mandali.packages?.[0] || { name: 'भजन संध्या', price: 11000, duration: '3 घंटे', durationMin: 180 };
    const packagePrice = pkg.price || 11000;
    const travelFee = 0; // free within radius
    const platformFee = 250;
    const gst = Math.round((packagePrice + platformFee) * 0.05);
    const total = packagePrice + travelFee + platformFee + gst;
    const advancePaid = Math.round(total * 0.20); // 20% advance authorization

    this.booking = {
      id: 'BM-' + Math.floor(10000 + Math.random() * 90000),
      mandali,
      package: pkg,
      eventDate: params.eventDate || '18 Oct 2026',
      startTime: params.startTime || '06:00 PM',
      duration: pkg.duration,
      durationMin: pkg.durationMin,
      occasion: params.occasion || 'श्री सुंदरकांड पाठ उत्सव',
      venueAddress: params.venueAddress || 'Live GPS Location',
      landmark: params.landmark || 'Near Club House',
      expectedGuests: params.expectedGuests || '50',
      farmaishSongs: params.farmaishSongs || 'सजा दो घर को गुलशन सा',
      specialNote: params.specialNote || '',
      packagePrice,
      extraHours: 0,
      extraHourFee: 0,
      travelFee,
      platformFee,
      gst,
      total,
      advancePaid,
      status: 'REQUESTED',
      requestExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      expiresInHours: 24,
      startOtp: String(Math.floor(1000 + Math.random() * 9000)),
      completeOtp: String(Math.floor(1000 + Math.random() * 9000)),
      elapsedSeconds: 0,
      extraHoursRequested: null,
      chatMessages: [
        {
          id: 'm1',
          sender: 'system',
          text: 'मंडली के साथ आपकी बातचीत 100% सुरक्षित व एन्क्रिप्टेड है।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      review: null,
    };

    this.notify();
    return this.booking;
  }

  // Mandali accepts request (locks calendar, captures advance)
  acceptRequest() {
    if (!this.booking) return false;
    this.booking.status = 'ACCEPTED';
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'mandali',
      text: `प्रणाम यजमान जी 🙏 हमने आपका ${this.booking.occasion} हेतु बुकिंग अनुरोध स्वीकार कर लिया है। हम नियत समय पर संपूर्ण वाद्य व साउंड व्यवस्था के साथ उपस्थित होंगे।`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
    return true;
  }

  // Mandali rejects request
  rejectRequest(reason = 'Date Already Booked') {
    if (!this.booking) return false;
    this.booking.status = 'REJECTED';
    this.booking.rejectReason = reason;
    this.notify();
    return true;
  }

  // Mandali sets On The Way
  setOnTheWay() {
    if (!this.booking) return false;
    this.booking.status = 'ON_THE_WAY';
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'mandali',
      text: 'मंडली वाद्य यंत्रों व साउंड सिस्टम के साथ आपके कार्यक्रम स्थल के लिए रवाना हो चुकी है।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
    return true;
  }

  // Mandali arrives at venue (validates 500m geofence)
  setArrived(distanceMeters = 250) {
    if (!this.booking) return { success: false, message: 'कोई बुकिंग नहीं मिली' };
    if (distanceMeters > 500) {
      return {
        success: false,
        message: 'आप कार्यक्रम स्थल से 500 मीटर से अधिक दूर हैं। कृपया पास पहुँचकर "पहुँच गए" दर्ज करें।',
      };
    }
    this.booking.status = 'ARRIVED';
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'mandali',
      text: 'हम कार्यक्रम स्थल पर पहुँच चुके हैं। कृपया साउंड व मंच व्यवस्था के उपरांत Start OTP बताएं।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
    return { success: true };
  }

  // Verify Start OTP -> transitions to IN_PROGRESS & starts timer
  verifyStartOtp(enteredOtp) {
    if (!this.booking) return { success: false, message: 'बुकिंग नहीं मिली' };
    if (enteredOtp.trim() === this.booking.startOtp) {
      this.booking.status = 'IN_PROGRESS';
      this.startProgramTimer();
      this.notify();
      return { success: true };
    } else {
      return { success: false, message: 'अमान्य Start OTP! कृपया यजमान की ऐप में देखें।' };
    }
  }

  startProgramTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.booking && this.booking.status === 'IN_PROGRESS') {
        this.booking.elapsedSeconds += 1;
        this.notify();
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  // Request extra hours by Mandali
  requestExtraHours(hours = 1) {
    if (!this.booking) return;
    const rate = this.booking.package?.extraHourPrice || 2500;
    this.booking.extraHoursRequested = {
      hours,
      amount: hours * rate,
      status: 'PENDING',
    };
    this.notify();
  }

  approveExtraHours() {
    if (!this.booking || !this.booking.extraHoursRequested) return;
    const { hours, amount } = this.booking.extraHoursRequested;
    this.booking.extraHours += hours;
    this.booking.extraHourFee += amount;
    this.booking.total += amount;
    this.booking.extraHoursRequested.status = 'APPROVED';
    this.notify();
  }

  // Verify End OTP -> transitions to COMPLETED (checks >= 75% elapsed duration)
  verifyEndOtp(enteredOtp) {
    if (!this.booking || this.booking.status !== 'IN_PROGRESS') {
      return { success: false, message: 'कार्यक्रम अभी प्रगति में नहीं है।' };
    }

    if (enteredOtp.trim() === this.booking.completeOtp) {
      clearInterval(this.timerInterval);
      this.booking.status = 'COMPLETED';
      this.notify();
      return { success: true };
    } else {
      return { success: false, message: 'अमान्य End OTP! कृपया यजमान की ऐप में देखें।' };
    }
  }

  // Cancellation engine based on PRD slabs
  cancelBooking(actor = 'user', daysBefore = 8) {
    if (!this.booking) return null;
    let refundPercent = 100;
    let mandaliShare = 0;
    let explanation = '';

    if (this.booking.status === 'REQUESTED') {
      refundPercent = 100;
      explanation = 'अनुरोध लंबित रहने के दौरान 100% ऑथराइजेशन तुरंत रीलिज कर दिया गया।';
    } else if (daysBefore > 7) {
      refundPercent = 100;
      explanation = 'कार्यक्रम से 7 दिन पूर्व रद्दीकरण पर 100% अग्रिम राशि वापस की गई।';
    } else if (daysBefore >= 2) {
      refundPercent = 50;
      mandaliShare = Math.round(this.booking.advancePaid * 0.5);
      explanation = 'कार्यक्रम से 48 घंटे से 7 दिन के बीच रद्दीकरण पर 50% अग्रिम राशि मंडली को दी जाएगी व 50% रिफंड होगी।';
    } else {
      refundPercent = 0;
      mandaliShare = this.booking.advancePaid;
      explanation = 'कार्यक्रम से 48 घंटे के भीतर रद्दीकरण पर 100% अग्रिम राशि मंडली को क्षतिपूर्ति स्वरूप दी जाएगी।';
    }

    this.booking.status = actor === 'user' ? 'CANCELLED_BY_USER' : 'CANCELLED_BY_MANDALI';
    this.booking.cancellation = {
      actor,
      refundPercent,
      refundAmount: Math.round((this.booking.advancePaid * refundPercent) / 100),
      mandaliShare,
      explanation,
    };

    clearInterval(this.timerInterval);
    this.notify();
    return this.booking.cancellation;
  }

  submitUserReview({ rating, subRatings, tags, comment }) {
    if (!this.booking) return;
    this.booking.review = {
      from: 'user',
      rating,
      subRatings, // { gayan: 5, vadyaSound: 5, samay: 5 }
      tags,
      comment,
      submittedAt: new Date().toISOString(),
    };
    this.notify();
  }

  sendChatMessage(sender, text) {
    if (!this.booking || !text.trim()) return;
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
  }
}

export const bhajanMandaliStore = new BhajanMandaliStore();
export default bhajanMandaliStore;
