// Pengantar sekali tampil (2 kartu) untuk pengunjung demo. Bisa dilewati & diputar ulang dari Tiketku.
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ACARA } from '../data/acara';
import { useData } from '../lib/simpan';
import { H, W } from '../lib/tema';
import { Lembar } from './Lembar';
import { Poster } from './Poster';
import { Mono, T, Tombol } from './dasar';

const KARTU = [
  {
    judul: 'Pesan tiket acara Jawa Timur',
    poin: ['6 acara rekaan di 6 kota, jadwal mengikuti hari ini (WIB).', 'Bayar dengan QRIS atau transfer simulasi: tidak ada uang yang ditarik.', 'E-tiket QR bisa disimpan, diingatkan, dan dialihkan ke teman.'],
  },
  {
    judul: 'Coba juga mode panitia',
    poin: ['Periksa tiket di gerbang: pindai QR atau ketik kode.', 'Lihat hasilnya layar penuh: hijau masuk, merah ditolak.', 'Coba kode yang sama dua kali untuk melihat penolakan tiket ganda.'],
  },
];

/**
 * Pita pengantar di atas Jelajah (ikut HTML statis agar tidak menggeser tata letak); membuka lembar 2 kartu.
 * Hilang setelah dilihat/dilewati; status disimpan di perangkat dan bisa diputar ulang dari Tiketku.
 */
export function PitaPengantar({ onLihat }) {
  const data = useData();
  if (data.dimuat && data.pengantar) return null;
  return (
    <View style={s.pita}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.pitaJudul}>Baru di demo ini?</Text>
        <Text style={s.pitaIsi}>2 hal yang bisa kamu coba: pesan tiket dan mode panitia.</Text>
      </View>
      <Tombol kecil varian="kertas" label="Lihat" onPress={onLihat} />
      <Tombol kecil varian="garis" label="Tutup" aria-label="Tutup pengantar" onPress={() => data.atur({ pengantar: true })} style={{ paddingHorizontal: 12 }} />
    </View>
  );
}

/** Lembar 2 kartu; dirender di tingkat layar (di luar ScrollView). */
export function LembarPengantar({ buka, tutup }) {
  const data = useData();
  const [langkah, setLangkah] = useState(0);
  const selesai = useCallback(() => { tutup(); setLangkah(0); data.atur({ pengantar: true }); }, [data, tutup]);
  const k = KARTU[langkah];
  return (
    <Lembar buka={buka} tutup={selesai} judul={k.judul}>
      <View style={s.ilustrasi} aria-hidden>
        {langkah === 0 ? (
          [ACARA[2], ACARA[4], ACARA[1]].map((a, i) => (
            <View key={a.slug} style={[s.mini, { transform: [{ rotate: `${[-8, 2, 10][i]}deg` }, { translateY: [6, -4, 8][i] }] }]}><Poster acara={a} hias /></View>
          ))
        ) : (
          <View style={s.cap}><Text style={s.capTeks}>Masuk</Text><Text style={s.capKecil}>Gerbang A · Sah</Text></View>
        )}
      </View>
      <Mono warna={W.tinta2}>Langkah {langkah + 1} dari 2 · demo PintuWeb</Mono>
      {k.poin.map((p) => (
        <View key={p} style={s.poin}>
          <View style={s.titik} />
          <T ukuran={15} warna={W.tinta} style={{ flex: 1 }}>{p}</T>
        </View>
      ))}
      <View style={s.tombol}>
        <Tombol varian="garis" label="Lewati" onPress={selesai} style={{ borderColor: W.tinta2 }} teksStyle={{ color: W.tinta }} />
        {langkah === 0 ? (
          <Tombol varian="gelap" label="Lanjut" onPress={() => setLangkah(1)} style={{ flex: 1 }} />
        ) : (
          <Tombol varian="gelap" label="Coba mode panitia" onPress={() => { selesai(); router.navigate('/panitia'); }} style={{ flex: 1 }} />
        )}
      </View>
    </Lembar>
  );
}

const s = StyleSheet.create({
  pita: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: W.jingga, borderStyle: 'dashed', borderRadius: 16, padding: 10, paddingLeft: 14, marginBottom: 12 },
  pitaJudul: { fontFamily: H.tebal, fontSize: 14, color: W.terang },
  pitaIsi: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.redup },
  ilustrasi: { height: 132, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: W.tinta, borderRadius: 18, overflow: 'hidden' },
  mini: { width: 70, backgroundColor: W.kertas },
  cap: { borderWidth: 5, borderColor: W.hijau, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 4, alignItems: 'center', transform: [{ rotate: '-6deg' }] },
  capTeks: { fontFamily: H.display, fontSize: 52, lineHeight: 56, color: W.hijau, textTransform: 'uppercase', letterSpacing: 2 },
  capKecil: { fontFamily: H.mono, fontSize: 12, color: W.hijau, textTransform: 'uppercase' },
  poin: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  titik: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.jinggaTua, marginTop: 7 },
  tombol: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
