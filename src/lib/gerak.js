// Hormati "kurangi gerakan" (prefers-reduced-motion di web, pengaturan aksesibilitas di HP).
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useGerakDikurangi() {
  const [kurangi, setKurangi] = useState(false);
  useEffect(() => {
    let hidup = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => hidup && setKurangi(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setKurangi(!!v));
    return () => { hidup = false; sub?.remove?.(); };
  }, []);
  return kurangi;
}
