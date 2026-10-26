import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * useFetch — generic data hook with loading, error and mock fallback.
 *   const { data, loading, error, reload } = useFetch(() => PanditService.list(), mockPandits);
 */
export function useFetch(fetcher, fallback = null, deps = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetcher();
      setData(res); setUsingFallback(false);
    } catch (e) {
      setError(e);
      if (fallback != null) { setData(fallback); setUsingFallback(true); }
    } finally { setLoading(false); }
  }, deps); // eslint-disable-line

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, usingFallback, reload: load };
}

/**
 * useCountdown — ticking timer in seconds. Used by OTP resend and the
 * Vartalap per-minute wallet engine.
 */
export function useCountdown(initialSeconds, { onTick, onEnd } = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const cb = useRef({ onTick, onEnd });
  cb.current = { onTick, onEnd };

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { setRunning(false); cb.current.onEnd?.(); return; }
    const t = setTimeout(() => {
      setSeconds((s) => s - 1);
      cb.current.onTick?.(seconds - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  return {
    seconds,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (s) => { setSeconds(s ?? initialSeconds); },
  };
}
