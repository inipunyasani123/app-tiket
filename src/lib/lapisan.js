// Lapisan penuh di atas seluruh aplikasi (termasuk bilah tab), mis. hasil pindai panitia.
import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const Konteks = createContext({ buka: () => {}, tutup: () => {} });

export function PenyediaLapisan({ children }) {
  const [isi, setIsi] = useState(null);
  const buka = useCallback((node) => setIsi(node), []);
  const tutup = useCallback(() => setIsi(null), []);
  const nilai = useMemo(() => ({ buka, tutup }), [buka, tutup]);
  return createElement(
    Konteks.Provider,
    { value: nilai },
    children,
    isi ? createElement(View, { style: s.lapis }, isi) : null,
  );
}

export const useLapisan = () => useContext(Konteks);

const s = StyleSheet.create({ lapis: { ...StyleSheet.absoluteFillObject, zIndex: 100 } });
