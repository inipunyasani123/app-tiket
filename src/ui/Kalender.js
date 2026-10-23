// Kalender pilih tanggal (5 pekan mulai Senin pekan ini, WIB) dengan titik tinta acara.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { H, W } from '../lib/tema';
import { HARI, awalHari, fmtBulanTahun, fmtTglPanjang, hariKe, tanggalKe } from '../lib/waktu';

const NAMA = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function Kalender({ sekarang, pilih, onPilih, titikHari }) {
  const hariIni = awalHari(sekarang);
  const senin = hariIni - ((hariKe(hariIni) + 6) % 7) * HARI;
  const hari = Array.from({ length: 35 }, (_, i) => senin + i * HARI);
  const judul = fmtBulanTahun(hari[0]) === fmtBulanTahun(hari[34]) ? fmtBulanTahun(hari[0]) : `${fmtBulanTahun(hari[0]).split(' ')[0]}–${fmtBulanTahun(hari[34])}`;
  return (
    <View>
      <Text style={s.judul}>{judul}</Text>
      <View style={s.baris}>{NAMA.map((n) => <Text key={n} style={s.nama}>{n}</Text>)}</View>
      <View style={s.kisi}>
        {hari.map((h) => {
          const lewat = h < hariIni;
          const titik = lewat ? [] : titikHari(h);
          const dipilih = pilih === h;
          return (
            <Pressable
              key={h}
              role="button"
              disabled={lewat}
              aria-pressed={dipilih}
              aria-label={`${fmtTglPanjang(h)}${h === hariIni ? ', hari ini' : ''}: ${titik.length ? `${titik.length} acara` : 'tidak ada acara'}`}
              onPress={() => onPilih(dipilih ? null : h)}
              style={[s.sel, dipilih && s.dipilih, h === hariIni && !dipilih && s.hariIni]}
            >
              <Text style={[s.angka, lewat && { color: W.tinta2, opacity: 0.55 }, dipilih && { color: W.kertas }]}>{tanggalKe(h)}</Text>
              <View style={s.titikBaris}>{titik.slice(0, 3).map((c, i) => <View key={i} style={[s.titik, { backgroundColor: c }]} />)}</View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  judul: { fontFamily: H.display, fontSize: 22, color: W.tinta, textTransform: 'uppercase', marginBottom: 6 },
  baris: { flexDirection: 'row' },
  nama: { flex: 1, textAlign: 'center', fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  kisi: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  sel: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, gap: 3 },
  dipilih: { backgroundColor: W.tinta },
  hariIni: { borderWidth: 2, borderColor: W.jinggaTua },
  angka: { fontFamily: H.tebal, fontSize: 15, color: W.tinta, fontVariant: ['tabular-nums'] },
  titikBaris: { flexDirection: 'row', gap: 3, height: 6 },
  titik: { width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: W.tinta },
});
