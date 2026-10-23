import { StyleSheet, Text, View } from 'react-native';
import { Ketuk } from './dasar';
import { Link } from 'expo-router';
import { cariAcara, mulaiAcuan } from '../data/acara';
import { HARI, JAM, awalHari, fmtHariPendek, fmtJam, fmtTgl, hitungMundur } from '../lib/waktu';
import { useData } from '../lib/simpan';
import { H, W } from '../lib/tema';
import { Ikon } from './Ikon';

export const OPSI_PENGINGAT = [
  { id: 'h1', label: 'H-1, pukul 19.00 WIB', waktu: (mulai) => awalHari(mulai) - HARI + 19 * JAM },
  { id: 'j3', label: '3 jam sebelum mulai', waktu: (mulai) => mulai - 3 * JAM },
  { id: 'j1', label: '1 jam sebelum mulai', waktu: (mulai) => mulai - JAM },
];

/** Semua pengingat terjadwal dari tiket aktif, terurut menurut waktu. */
export function daftarPengingat(data, sekarang) {
  if (!data.dimuat || sekarang == null) return [];
  const hasil = [];
  for (const t of data.tiket) {
    if (t.status !== 'aktif' || t.milikTeman || !t.pengingat?.length) continue;
    const acara = cariAcara(t.acara);
    const mulai = mulaiAcuan(acara, sekarang);
    if (mulai == null) continue;
    for (const id of t.pengingat) {
      const o = OPSI_PENGINGAT.find((x) => x.id === id);
      if (o) hasil.push({ tiket: t, acara, mulai, waktu: o.waktu(mulai), label: o.label });
    }
  }
  return hasil.sort((a, b) => a.waktu - b.waktu);
}

export const fmtPengingat = (ts) => `${fmtHariPendek(ts)}, ${fmtTgl(ts)} · ${fmtJam(ts)} WIB`;

/** Banner di atas layar saat waktu pengingat sudah tiba. */
export function BannerPengingat({ sekarang }) {
  const data = useData();
  const jatuh = daftarPengingat(data, sekarang).filter((p) => p.waktu <= sekarang);
  if (!jatuh.length) return null;
  const p = jatuh[jatuh.length - 1];
  return (
    <Link href={{ pathname: '/e-tiket', params: { kode: p.tiket.kode } }} asChild>
      <Ketuk aria-live="polite" style={s.banner}>
        <View style={s.ikon}><Ikon nama="lonceng" warna={W.malam} ukuran={20} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.judul}>Pengingat: {p.acara.judul}</Text>
          <Text style={s.isi}>Mulai {hitungMundur(p.mulai - sekarang)} lagi · {p.acara.kota}. Ketuk untuk membuka e-tiket.</Text>
        </View>
      </Ketuk>
    </Link>
  );
}

const s = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.kuning, borderRadius: 16, padding: 12, marginBottom: 12 },
  ikon: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: W.malam, alignItems: 'center', justifyContent: 'center' },
  judul: { fontFamily: H.tebal, fontSize: 14, color: W.tinta },
  isi: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.tinta },
});
