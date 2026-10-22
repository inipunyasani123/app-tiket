import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { H, TINTA, W } from '../lib/tema';
import { Poster } from './Poster';
import { Takik } from './Karcis';
import { Ketuk, Mono } from './dasar';
import { bukaBerikut, hargaMulai, jadwal, rupiahRingkas, statusAcara } from '../data/acara';
import { fmtHariPendek, fmtJam, fmtTgl } from '../lib/waktu';
import { terjual, useData } from '../lib/simpan';

const dua = (n) => String(n).padStart(2, '0');

/** Label hari statis (tidak butuh jam perangkat): aman untuk HTML statis. */
export function labelHari(acara) {
  const h = acara.mulai[0];
  if (h === 0) return 'Hari ini';
  if (h === 1) return 'Besok';
  if (h === 2) return 'Lusa';
  return `Dalam ${h} hari`;
}
export const jamMulai = (acara) => `${dua(acara.mulai[1])}.${dua(acara.mulai[2])} WIB`;

export function sisaAcara(data, acara) {
  let sisa = 0, kuota = 0;
  for (const k of acara.tiket) { kuota += k.kuota; sisa += k.kuota - terjual(data, acara.slug, k.id); }
  return { sisa, kuota };
}

export function LabelStatus({ acara, sekarang }) {
  if (sekarang == null) return null;
  const st = statusAcara(acara, sekarang);
  if (st === 'akan') return null;
  let teks = 'Selesai';
  if (st === 'berlangsung') teks = acara.harian ? 'Buka sekarang' : 'Berlangsung';
  if (st === 'jeda') { const b = bukaBerikut(acara, sekarang); teks = `Buka lagi ${fmtJam(b)}`; }
  const hidup = st === 'berlangsung';
  return (
    <View style={[s.status, { backgroundColor: hidup ? W.hijau : st === 'jeda' ? W.kuning : W.malam3 }]}>
      <Text style={[s.statusTeks, { color: hidup || st === 'jeda' ? W.malam : W.redup }]}>{teks}</Text>
    </View>
  );
}

/** Kartu acara berbentuk karcis mendatar: poster | info | sobekan harga. */
export function KartuAcara({ acara, sekarang }) {
  const data = useData();
  const tinta = TINTA[acara.tinta];
  const { sisa } = sisaAcara(data, acara);
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  return (
    <Link href={`/acara/${acara.slug}`} asChild>
      <Ketuk aria-label={`${acara.judul}, ${acara.kota}, ${labelHari(acara).toLowerCase()} pukul ${jamMulai(acara)}`} style={s.kartu} tekan={{ transform: [{ scale: 0.985 }] }}>
        <View style={s.poster}>
          <View style={StyleSheet.absoluteFill}>
            <Poster acara={acara} hias tinggi="100%" />
          </View>
        </View>
        <View style={s.isi}>
          <Mono ukuran={10.5} warna={tinta.teks}>{acara.kota}</Mono>
          <Text style={s.judul} numberOfLines={3}>{acara.judul}</Text>
          <Text style={s.meta}>
            {j ? `${fmtHariPendek(j.mulai)}, ${fmtTgl(j.mulai)} · ${fmtJam(j.mulai)} WIB` : `${labelHari(acara)} · ${jamMulai(acara)}`}
          </Text>
          <LabelStatus acara={acara} sekarang={sekarang} />
        </View>
        <Takik arah="tegak" latar={W.malam} ukuran={18} />
        <View style={[s.sobek, { backgroundColor: tinta.a }]}>
          <Text style={s.mulai}>mulai</Text>
          <Text style={s.harga}>{rupiahRingkas(hargaMulai(acara))}</Text>
          <Text style={s.sisa}>{sisa === 0 ? 'Habis' : sisa < 40 ? `Sisa ${sisa}` : 'Tersedia'}</Text>
        </View>
      </Ketuk>
    </Link>
  );
}

const s = StyleSheet.create({
  kartu: { flexDirection: 'row', backgroundColor: W.kertas, borderRadius: 16, overflow: 'hidden', minHeight: 132 },
  poster: { width: 88, backgroundColor: W.kertas2, overflow: 'hidden' },
  isi: { flex: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 10, gap: 4 },
  judul: { fontFamily: H.display, fontSize: 21, lineHeight: 21, color: W.tinta, textTransform: 'uppercase' },
  meta: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.tinta2 },
  sobek: { width: 78, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, gap: 1 },
  mulai: { fontFamily: H.badan, fontSize: 11.5, color: W.tinta },
  harga: { fontFamily: H.display, fontSize: 22, lineHeight: 24, color: W.tinta },
  sisa: { fontFamily: H.mono, fontSize: 10, color: W.tinta, textTransform: 'uppercase', marginTop: 2 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  statusTeks: { fontFamily: H.mono, fontSize: 10.5, textTransform: 'uppercase' },
});
