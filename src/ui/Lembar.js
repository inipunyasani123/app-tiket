// Lembar bawah (bottom sheet) di dalam layar aplikasi — tidak memakai Modal agar tetap di dalam bingkai ponsel di web.
import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { W } from '../lib/tema';
import { Ikon } from './Ikon';
import { Judul } from './dasar';

export function Lembar({ buka, tutup, judul, children }) {
  const inset = useSafeAreaInsets();
  const ref = useRef(null);
  const asal = useRef(null);
  useEffect(() => {
    if (!buka || Platform.OS !== 'web') return undefined;
    asal.current = document.activeElement;
    const t = setTimeout(() => ref.current?.focus?.(), 30);
    const esc = (e) => { if (e.key === 'Escape') tutup(); };
    document.addEventListener('keydown', esc);
    return () => { clearTimeout(t); document.removeEventListener('keydown', esc); asal.current?.focus?.(); };
  }, [buka, tutup]);
  if (!buka) return null;
  return (
    <View style={s.lapis}>
      <Pressable role="button" aria-label="Tutup lembar" style={s.tirai} onPress={tutup} tabIndex={-1} />
      <View ref={ref} role="dialog" aria-modal="true" aria-label={judul} tabIndex={-1} style={[s.lembar, { paddingBottom: 16 + inset.bottom }]}>
        <View style={s.kepala}>
          <View style={s.pegangan} />
          <Judul level={2} ukuran={30} warna={W.tinta} style={{ flex: 1 }}>{judul}</Judul>
          <Pressable role="button" aria-label="Tutup" onPress={tutup} style={({ pressed }) => [s.tutup, pressed && { opacity: 0.7 }]}>
            <Ikon nama="silang" warna={W.tinta} ukuran={20} />
          </Pressable>
        </View>
        <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6, gap: 14 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  lapis: { ...StyleSheet.absoluteFillObject, zIndex: 50, justifyContent: 'flex-end' },
  tirai: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,6,14,0.72)' },
  lembar: { backgroundColor: W.kertas, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '88%', paddingTop: 10 },
  kepala: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 12 },
  pegangan: { position: 'absolute', top: 2, left: '50%', marginLeft: -22, width: 44, height: 5, borderRadius: 3, backgroundColor: W.kertas2 },
  tutup: { width: 44, height: 44, borderRadius: 22, backgroundColor: W.kertas2, alignItems: 'center', justifyContent: 'center' },
});
