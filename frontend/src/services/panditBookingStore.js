/**
 * Pandit Booking Engine & State Store
 * Implements the Rapido-style Pandit Booking PRD:
 * State Machine:
 * SEARCHING -> ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
 * Alternate: CANCELLED_BY_YAJMAN, CANCELLED_BY_PANDIT, NO_PANDIT_FOUND, DISPUTED
 */

export const POOJA_TYPES = [];

export const DEMO_PANDIT = null;

class PanditBookingStore {
  constructor() {
    this.booking = null;
    this.listeners = new Set();
    this.timerInterval = null;
    this.dispatchTimeout = null;
    this.waveInterval = null;
  }

  getBooking() {
    return this.booking;
  }

  setBooking(b) {
    if (b && !Array.isArray(b.chatMessages)) {
      b.chatMessages = [];
    }
    this.booking = b;
    this.notify();
  }

  setStartOtp(otp) {
    if (this.booking && otp) {
      this.booking.startOtp = String(otp);
      this.notify();
    }
  }

  setCompleteOtp(otp) {
    if (this.booking && otp) {
      this.booking.completeOtp = String(otp);
      this.notify();
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.booking);
      } catch (e) {
        console.error('Listener err', e);
      }
    });
  }

  /**
   * Step 1: Yajman initiates booking request
   */
  createBooking(params) {
    this.clearTimers();

    const startOtp = String(Math.floor(1000 + Math.random() * 9000));
    const completeOtp = String(Math.floor(1000 + Math.random() * 9000));
    const bookingId = 'BK' + Math.floor(10000 + Math.random() * 90000);

    const pooja = params.pooja || POOJA_TYPES[0];
    const withSamagri = params.withSamagri !== false;
    const dakshina = pooja.price;
    const samagriFee = withSamagri ? pooja.samagriFee : 0;
    const platformFee = 50;
    const gst = Math.round((dakshina + samagriFee + platformFee) * 0.05); // 5% GST
    const total = dakshina + samagriFee + platformFee + gst;
    const advancePaid = params.payFull ? total : Math.round(total * (pooja.advancePercent / 100));

    this.booking = {
      id: bookingId,
      pooja,
      type: params.type || 'instant', // 'instant' | 'scheduled'
      scheduledAt: params.scheduledAt || 'Today, 05:00 PM',
      address: params.address || 'Live Location (GPS)',
      area: params.area || 'Current Location',
      landmark: params.landmark || '',
      language: params.language || 'Hindi & Sanskrit',
      yajmanName: params.yajmanName || 'यजमान',
      gotra: params.gotra || 'काश्यप',
      sankalpName: params.sankalpName || `${params.yajmanName || 'यजमान'} एवं सपरिवार`,
      specialNote: params.specialNote || '',
      withSamagri,
      dakshina,
      samagriFee,
      platformFee,
      gst,
      total,
      advancePaid,
      status: 'SEARCHING',
      startOtp,
      completeOtp,
      otpAttempts: 0,
      pandit: null,
      wave: 1, // 1: 5km, 2: 10km, 3: 20km
      waveRadiusKm: 5,
      waveTimeoutSec: 30,
      waveRemainingSec: 30,
      elapsedSeconds: 0,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      arrivedAt: null,
      startedAt: null,
      completedAt: null,
      chatMessages: [
        {
          id: 'sys-1',
          sender: 'system',
          text: 'पंडित जी से आपकी बातचीत सुरक्षित व एन्क्रिप्टेड है।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      dispute: null,
      review: null,
      cancellation: null,
    };

    this.notify();
    this.startDispatchSimulation();
    return this.booking;
  }

  /**
   * Dispatch waves (Wave 1: 5km, Wave 2: 10km, Wave 3: 20km)
   */
  startDispatchSimulation() {
    this.waveInterval = setInterval(() => {
      if (!this.booking || this.booking.status !== 'SEARCHING') {
        clearInterval(this.waveInterval);
        return;
      }

      if (this.booking.waveRemainingSec > 1) {
        this.booking.waveRemainingSec -= 1;
        this.notify();
      } else {
        // Next wave
        if (this.booking.wave === 1) {
          this.booking.wave = 2;
          this.booking.waveRadiusKm = 10;
          this.booking.waveTimeoutSec = 30;
          this.booking.waveRemainingSec = 30;
          this.notify();
        } else if (this.booking.wave === 2) {
          this.booking.wave = 3;
          this.booking.waveRadiusKm = 20;
          this.booking.waveTimeoutSec = 60;
          this.booking.waveRemainingSec = 60;
          this.notify();
        } else {
          // Timeout -> NO_PANDIT_FOUND
          clearInterval(this.waveInterval);
          this.booking.status = 'NO_PANDIT_FOUND';
          this.notify();
        }
      }
    }, 1000);

    // Real dispatch waits for live backend partner acceptance or timeout
  }

  /**
   * Step 2: Pandit accepts request (Atomic Lock simulation)
   */
  acceptBooking(pandit = DEMO_PANDIT) {
    if (!this.booking || this.booking.status !== 'SEARCHING') return false;

    clearInterval(this.waveInterval);
    clearTimeout(this.dispatchTimeout);

    this.booking.status = 'ACCEPTED';
    this.booking.pandit = { ...pandit };
    this.booking.acceptedAt = new Date().toISOString();

    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'pandit',
      text: `प्रणाम यजमान जी 🙏 मैंने आपकी ${this.booking.pooja.name} की सेवा स्वीकार कर ली है।`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.notify();
    return true;
  }

  /**
   * Step 3: Pandit taps "Nikal gaya (On The Way)"
   */
  setOnTheWay() {
    if (!this.booking || this.booking.status !== 'ACCEPTED') return false;
    this.booking.status = 'ON_THE_WAY';
    this.booking.chatMessages = Array.isArray(this.booking.chatMessages) ? this.booking.chatMessages : [];
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'pandit',
      text: 'मैं पूजा सामग्री के साथ आपके स्थान के लिए निकल चुका हूँ। ETA: 15-20 मिनट।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
    return true;
  }

  /**
   * Step 4: Pandit reaches within 200m and taps "Pahunch gaya (Arrived)"
   */
  setArrived(distanceMeters = 120) {
    if (!this.booking || (this.booking.status !== 'ON_THE_WAY' && this.booking.status !== 'ACCEPTED')) {
      return { success: false, message: 'अमान्य स्थिति' };
    }

    if (distanceMeters > 200) {
      return {
        success: false,
        message: 'आप अभी यजमान के स्थान से 200m से अधिक दूर हैं। कृपया पास पहुँचकर बटन दबाएं।',
      };
    }

    this.booking.status = 'ARRIVED';
    this.booking.arrivedAt = new Date().toISOString();
    this.booking.chatMessages = Array.isArray(this.booking.chatMessages) ? this.booking.chatMessages : [];
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender: 'pandit',
      text: 'मैं आपके द्वार पर पहुँच गया हूँ। कृपया Start OTP बताएं।',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
    return { success: true };
  }

  /**
   * Step 5: Pandit enters Start OTP (Given by Yajman)
   */
  verifyStartOtp(enteredOtp) {
    if (!this.booking || this.booking.status !== 'ARRIVED') {
      return { success: false, message: 'कृपया पहले "पहुँच गया" स्थिति दर्ज करें।' };
    }

    if (this.booking.otpAttempts >= 5) {
      this.booking.status = 'DISPUTED';
      this.notify();
      return { success: false, message: 'अधिक गलत OTP प्रयासों के कारण बुकिंग लॉक कर दी गई है।' };
    }

    if (enteredOtp.trim() === this.booking.startOtp) {
      this.booking.status = 'IN_PROGRESS';
      this.booking.startedAt = new Date().toISOString();
      this.booking.otpAttempts = 0;
      this.startPoojaTimer();
      this.notify();
      return { success: true };
    } else {
      this.booking.otpAttempts += 1;
      this.notify();
      return {
        success: false,
        message: `गलत Start OTP! शेष प्रयास: ${5 - this.booking.otpAttempts}`,
      };
    }
  }

  startPoojaTimer() {
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

  setStarted() {
    if (!this.booking) return false;
    this.booking.status = 'IN_PROGRESS';
    this.booking.startedAt = this.booking.startedAt || new Date().toISOString();
    this.startPoojaTimer();
    this.notify();
    return true;
  }

  setCompleted() {
    if (!this.booking) return false;
    clearInterval(this.timerInterval);
    this.booking.status = 'COMPLETED';
    this.booking.completedAt = new Date().toISOString();
    this.notify();
    return true;
  }

  /**
   * Step 6: Pandit enters Complete OTP (Given by Yajman after pooja)
   */
  verifyCompleteOtp(enteredOtp) {
    if (!this.booking || this.booking.status !== 'IN_PROGRESS') {
      return { success: false, message: 'पूजा अभी प्रगति में नहीं है।' };
    }

    if (enteredOtp.trim() === this.booking.completeOtp) {
      clearInterval(this.timerInterval);
      this.booking.status = 'COMPLETED';
      this.booking.completedAt = new Date().toISOString();
      this.notify();
      return { success: true };
    } else {
      return { success: false, message: 'गलत Complete OTP! कृपया यजमान की ऐप में देखें।' };
    }
  }

  /**
   * Cancellation with PRD Policy Engine
   */
  cancelBooking(actor = 'yajman', reason = 'Personal emergency') {
    if (!this.booking) return null;

    const currentStatus = this.booking.status;
    let refundPercent = 100;
    let penaltyFee = 0;
    let explanation = '';

    if (currentStatus === 'SEARCHING') {
      refundPercent = 100;
      penaltyFee = 0;
      explanation = 'खोज के दौरान रद्द करने पर 100% पूरा रिफंड मिलता है।';
    } else if (currentStatus === 'ACCEPTED') {
      refundPercent = 100;
      penaltyFee = 0;
      explanation = 'स्वीकृति के 3 मिनट के भीतर 100% पूरा रिफंड।';
    } else if (currentStatus === 'ON_THE_WAY') {
      refundPercent = 90;
      penaltyFee = 100; // Flat ₹100 given to Pandit
      explanation = 'पंडित जी के प्रस्थान के बाद रद्द करने पर ₹100 यात्रा शुल्क पंडित जी को दिया जाता है।';
    } else if (currentStatus === 'ARRIVED') {
      refundPercent = 50;
      penaltyFee = Math.round(this.booking.dakshina * 0.5);
      explanation = 'पहुँचने के बाद रद्द करने पर 50% दक्षिणा पंडित जी को दी जाती है।';
    } else if (currentStatus === 'IN_PROGRESS') {
      return {
        success: false,
        message: 'पूजा शुरू होने के बाद रद्द नहीं किया जा सकता। आप "शिकायत / Dispute" कर सकते हैं।',
      };
    }

    this.clearTimers();

    this.booking.cancellation = {
      actor,
      reason,
      refundPercent,
      penaltyFee,
      explanation,
      refundAmount: Math.max(0, this.booking.advancePaid - penaltyFee),
      cancelledAt: new Date().toISOString(),
    };

    this.booking.status = actor === 'yajman' ? 'CANCELLED_BY_YAJMAN' : 'CANCELLED_BY_PANDIT';
    this.notify();
    return { success: true, policy: this.booking.cancellation };
  }

  /**
   * Dispute registration
   */
  raiseDispute(reason, details) {
    if (!this.booking) return false;
    this.booking.status = 'DISPUTED';
    this.booking.dispute = {
      reason,
      details,
      ticketId: 'DSP-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    this.notify();
    return true;
  }

  /**
   * Dual Review submission
   */
  submitReview({ rating, tags, comment, tip = 0, from = 'yajman' }) {
    if (!this.booking) return false;
    this.booking.review = {
      from,
      rating,
      tags: tags || [],
      comment,
      tip: Number(tip) || 0,
      submittedAt: new Date().toISOString(),
    };
    this.notify();
    return true;
  }

  /**
   * Send in-app chat message
   */
  sendChatMessage(sender, text) {
    if (!this.booking || !text.trim()) return;
    this.booking.chatMessages.push({
      id: 'm-' + Date.now(),
      sender, // 'yajman' | 'pandit'
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    this.notify();
  }

  clearTimers() {
    clearInterval(this.timerInterval);
    clearInterval(this.waveInterval);
    clearTimeout(this.dispatchTimeout);
  }

  reset() {
    this.clearTimers();
    this.booking = null;
    this.notify();
  }
}

export const panditBookingStore = new PanditBookingStore();
export default panditBookingStore;
