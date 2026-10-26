/**
 * Razorpay configuration.
 * Developer: get these from https://dashboard.razorpay.com → Settings → API Keys
 *
 * - RAZORPAY_KEY_ID is a PUBLIC key — safe to keep in the app.
 * - The KEY SECRET must stay ONLY on your backend. Never put it here.
 *
 * Recommended flow:
 *   1. App asks backend to create an order (PaymentService.createOrder)
 *   2. Backend returns { order_id, amount, key_id }
 *   3. App opens Razorpay checkout with that order_id
 *   4. On success, app sends payment_id + signature to backend to VERIFY
 */
export const RAZORPAY = {
  KEY_ID: 'rzp_test_XXXXXXXXXXXXXX', // <-- replace with your real key id
  NAME: 'Vaidic Sanskar',
  DESCRIPTION: 'Devotional services payment',
  THEME_COLOR: '#8B1A1A',
  CURRENCY: 'INR',
};
