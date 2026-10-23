// Hasil pemeriksaan tiket layar penuh untuk gerbang: hijau = masuk, merah = ditolak, kuning = cek lagi.
// Terbaca dari jarak lengan, menutup otomatis, lalu siap memindai berikutnya.
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H, W } from '../lib/tema';
import { fmtJam } from '../lib/waktu';
import { useGerakDikurangi } from '../lib/gerak';
import { Ikon } from './Ikon';
import { Tombol } from './dasar';

export const GAYA_HASIL = {
  sah: { latar: W.hijau, cap: 'Masuk', judul: 'Sah, silakan masuk', ikon: 'cek' },
  ganda: { latar: W.merah, cap: 'Ditolak', judul: 'Tiket ganda', ikon: 'silang' },
  dialihkan: { latar: W.merah, cap: 'Ditolak', judul: 'Kode sudah dialihkan', ikon: 'silang' },
  tak: { latar: W.merah, cap: 'Ditolak', judul: 'Kode tidak terdaftar', ikon: 'silang' },
  lain: { latar: W.kuning, cap: 'Salah gerbang', judul: 'Tiket acara lain', ikon: 'info' },
  cek: { latar: W.kuning, cap: 'Cek lagi', judul: 'Kode salah ketik', ikon: 'info' },
  format: { latar: W.kuning, cap: 'Cek lagi', judul: 'Format kode salah', ikon: 'info' },
};

export function HasilPindai({ hasil, onTutup, onUrungkan }) {
  const g = GAYA_HASIL[hasil.hasil];
  const inset = useSafeAreaInsets();
  const kurangi = useGerakDikurangi();
  const durasi = hasil.hasil === 'sah' ? 2500 : 4500;
  const sisa = useRef(new Animated.Value(1)).current;
  const cap = useRef(new Animated.Value(kurangi ? 1 : 0)).current;
  const tombol = useRef(null);
  const tutup = useRef(onTutup);
  tutup.current = onTutup;

  useEffect(() => {
    const t = setTimeout(() => tutup.current(), durasi);
    if (!kurangi) {
      Animated.timing(sisa, { toValue: 0, duration: durasi, easing: Easing.linear, useNativeDriver: false }).start();
      Animated.spring(cap, { toValue: 1, friction: 5, tension: 140, useNativeDriver: Platform.OS !== 'web' }).start();
    } else cap.setValue(1);
    let lepas;
    if (Platform.OS === 'web') {
      requestAnimationFrame(() => tombol.current?.focus?.());
      const tekan = (e) => { if (e.key === 'Escape') tutup.current(); };
      document.addEventListener('keydown', tekan);
      lepas = () => document.removeEventListener('keydown', tekan);
    }
    return () => { clearTimeout(t); lepas?.(); };
  }, [durasi, kurangi, sisa, cap]);

  const skala = cap.interpolate({ inputRange: [0, 1], outputRange: [1.7, 1] });
  return (
    <View style={[s.layar, { backgroundColor: g.latar, paddingTop: inset.top + 22, paddingBottom: inset.bottom + 18 }]}>
      <View style={s.atas}>
        <Text style={s.meta}>Gerbang {hasil.gerbang} · {fmtJam(hasil.waktu)} WIB</Text>
        <Text style={s.meta}>{hasil.acaraPendek}</Text>
      </View>
      <View style={s.tengah} role="alert" aria-live="assertive">
        <View style={s.bulat}><Ikon nama={g.ikon} warna={g.latar} ukuran={58} /></View>
        <Animated.View style={[s.cap, { opacity: cap, transform: [{ scale: skala }, { rotate: '-5deg' }] }]}>
          <Text style={s.capTeks}>{g.cap}</Text>
        </Animated.View>
        <Text style={s.judul}>{g.judul}</Text>
        {hasil.pemegang ? <Text style={s.nama}>{hasil.pemegang}{hasil.kategori ? ` · ${hasil.kategori}` : ''}</Text> : null}
        <Text style={s.ket}>{hasil.ket}</Text>
        <Text style={s.kode}>{hasil.kode}</Text>
      </View>
      <View style={{ gap: 10 }}>
        <View style={s.jalur} aria-hidden>
          <Animated.View style={[s.jalurIsi, { width: sisa.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
        <Tombol ref={tombol} varian="gelap" label="Pindai berikutnya" onPress={onTutup} kiri={<Ikon nama="pindai" warna={W.kertas} ukuran={20} />} />
        {onUrungkan ? <Tombol varian="garis" label="Urungkan check-in" onPress={onUrungkan} style={{ borderColor: W.tinta }} teksStyle={{ color: W.tinta }} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  layar: { flex: 1, paddingHorizontal: 22, justifyContent: 'space-between' },
  atas: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  meta: { fontFamily: H.mono, fontSize: 13, color: W.tinta, textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 1 },
  tengah: { alignItems: 'center', gap: 10 },
  bulat: { width: 104, height: 104, borderRadius: 52, backgroundColor: W.tinta, alignItems: 'center', justifyContent: 'center' },
  cap: { borderWidth: 5, borderColor: W.tinta, borderRadius: 14, paddingHorizontal: 16, marginTop: 6, marginBottom: 8 },
  capTeks: { fontFamily: H.display, fontSize: 76, lineHeight: 84, color: W.tinta, textTransform: 'uppercase', letterSpacing: 2 },
  judul: { fontFamily: H.display, fontSize: 32, lineHeight: 34, color: W.tinta, textTransform: 'uppercase', textAlign: 'center' },
  nama: { fontFamily: H.tebal, fontSize: 21, color: W.tinta, textAlign: 'center' },
  ket: { fontFamily: H.badan, fontSize: 16, lineHeight: 23, color: W.tinta, textAlign: 'center', maxWidth: 330 },
  kode: { fontFamily: H.mono, fontSize: 20, color: W.tinta, letterSpacing: 2 },
  jalur: { height: 6, borderRadius: 3, backgroundColor: 'rgba(27,23,36,0.22)', overflow: 'hidden' },
  jalurIsi: { height: 6, backgroundColor: W.tinta },
});
