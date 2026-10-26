import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

/**
 * Central app state (Provider pattern — the lightweight choice from
 * Redux / Provider / Bloc). Split into logical slices: auth, wallet, cart.
 * Convenience hooks: useApp(), useAuth(), useWallet(), useCart().
 *
 * Developer: for larger teams this maps 1:1 onto Redux slices or Bloc cubits.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

const USER_STORAGE_KEY = '@vaidic_sanskar_user_profile';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  /* ---------------- AUTH / PROFILE ---------------- */
  const [user, setUser] = useState(null);

  // Restore user from storage on mount
  React.useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            setUser(parsed);
            if (parsed?.token) setAuthToken(parsed.token);
          } catch (e) { }
        }
      })
      .catch(() => { });
  }, []);

  const login = useCallback((u) => {
    setUser(u);
    if (u) {
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u)).catch(() => { });
    }
    if (u?.token) setAuthToken(u.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => { });
    setAuthToken(null);
  }, []);

  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...patch };
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch(() => { });
      return updated;
    });
  }, []);

  const addAddress = useCallback((addr) => {
    setUser((prev) => {
      const addresses = [...(prev?.addresses || []), { id: Date.now().toString(), ...addr }];
      const updated = { ...(prev || {}), addresses };
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated)).catch(() => { });
      return updated;
    });
  }, []);

  /* ---------------- WALLET ---------------- */
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState([]);

  const addMoney = useCallback((amount, method = 'UPI') => {
    setBalance((b) => b + amount);
    setLedger((l) => [{ id: Date.now().toString(), type: 'credit', title: `Added via ${method}`, amount, at: today() }, ...l]);
  }, []);

  const deduct = useCallback((amount, title) => {
    let ok = false;
    setBalance((b) => { if (b >= amount) { ok = true; return b - amount; } return b; });
    if (ok !== false) {
      setLedger((l) => [{ id: Date.now().toString(), type: 'debit', title, amount, at: today() }, ...l]);
    }
    return ok;
  }, []);

  /* ---------------- CART ---------------- */
  const [cart, setCart] = useState([]);
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const ex = prev.find((p) => p.id === item.id);
      if (ex) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + (item.qty || 1) } : p));
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  }, []);
  const removeFromCart = useCallback((id) => setCart((p) => p.filter((x) => x.id !== id)), []);
  const updateQty = useCallback((id, qty) =>
    setCart((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(0, qty) } : x)).filter((x) => x.qty > 0)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const cartTotal = useMemo(() => cart.reduce((s, p) => s + p.price * p.qty, 0), [cart]);

  const value = {
    // auth
    user, setUser, login, logout, updateProfile, addAddress,
    // wallet
    balance, ledger, addMoney, deduct,
    // cart
    cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

function today() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
export const useAuth = () => { const c = useApp(); return { user: c.user, login: c.login, logout: c.logout, updateProfile: c.updateProfile, addAddress: c.addAddress }; };
export const useWallet = () => { const c = useApp(); return { balance: c.balance, ledger: c.ledger, addMoney: c.addMoney, deduct: c.deduct }; };
export const useCart = () => { const c = useApp(); return { cart: c.cart, addToCart: c.addToCart, removeFromCart: c.removeFromCart, updateQty: c.updateQty, clearCart: c.clearCart, cartTotal: c.cartTotal }; };
