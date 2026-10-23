// Grafik kecil dasbor panitia: laju masuk per 15 menit (satu seri, satu tinta) dan bilah rincian.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Line, Path, Svg } from './svg';
import { H, W } from '../lib/tema';
import { fmtJam } from '../lib/waktu';
import { persen } from '../lib/angka';

const LEBAR = 320, TINGGI = 110;

function batang(x, w, h) {
  // sudut atas membulat 4px, menempel di garis dasar
  const r = Math.min(4, w / 2, h);
  const y = TINGGI - h;
  return `M${x} ${TINGGI}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${TINGGI}Z`;
}

/** ember: [{ awal, jumlah }] berurutan, panjang 15 menit. */
export function GrafikLaju({ ember, warna }) {
  const maks = Math.max(1, ...ember.map((e) => e.jumlah));
  const puncak = ember.reduce((a, e, i) => (e.jumlah > ember[a].jumlah ? i : a), 0);
  const [pilih, setPilih] = useState(null);
  const aktif = pilih ?? puncak;
  const jarak = 2;
  const w = (LEBAR - jarak * (ember.length - 1)) / ember.length;
  const e = ember[aktif];
  const total = ember.reduce((n, x) => n + x.jumlah, 0);
  return (
    <View>
      <Text style={s.sorot} aria-live="polite">
        {fmtJam(e.awal)}–{fmtJam(e.awal + 15 * 60000)} WIB · <Text style={{ fontFamily: H.tebal, color: W.terang }}>{e.jumlah} orang</Text>{aktif === puncak && pilih == null ? ' (tersibuk)' : ''}
      </Text>
      <View style={{ marginTop: 8 }}>
        <Svg width="100%" height={TINGGI} viewBox={`0 0 ${LEBAR} ${TINGGI}`} preserveAspectRatio="none" label={`Grafik laju masuk per 15 menit, ${total} orang dalam ${ember.length * 15} menit terakhir, tersibuk ${fmtJam(ember[puncak].awal)} WIB dengan ${ember[puncak].jumlah} orang`}>
          <Line x1="0" y1={TINGGI - 0.5} x2={LEBAR} y2={TINGGI - 0.5} stroke={W.garis} strokeWidth="1" />
          {ember.map((x, i) => (x.jumlah > 0 ? <Path key={i} d={batang(i * (w + jarak), w, Math.max(3, (x.jumlah / maks) * (TINGGI - 6)))} fill={warna} opacity={i === aktif ? 1 : 0.55} /> : null))}
        </Svg>
        <View style={s.kolom}>
          {ember.map((x, i) => (
            <Pressable key={i} role="button" aria-pressed={i === aktif} aria-label={`${fmtJam(x.awal)} sampai ${fmtJam(x.awal + 15 * 60000)}: ${x.jumlah} orang masuk`} onPress={() => setPilih(i)} style={{ flex: 1 }} />
          ))}
        </View>
      </View>
      <View style={s.sumbu}>
        <Text style={s.sumbuTeks}>{fmtJam(ember[0].awal)}</Text>
        <Text style={s.sumbuTeks}>{fmtJam(ember[ember.length - 1].awal + 15 * 60000)}</Text>
      </View>
    </View>
  );
}

/** Bilah rincian mendatar dengan label teks (identitas tidak hanya lewat warna). */
export function BilahRincian({ baris }) {
  return (
    <View style={{ gap: 12 }}>
      {baris.map((b) => (
        <View key={b.label} style={{ gap: 5 }}>
          <View style={s.barisAtas}>
            <Text style={s.label}>{b.label}</Text>
            <Text style={s.nilai}>{b.nilai} <Text style={{ color: W.redup }}>dari {b.total} · {persen(b.nilai, b.total)}</Text></Text>
          </View>
          <View style={s.jalur} role="progressbar" aria-label={`${b.label}: ${b.nilai} dari ${b.total}`} aria-valuemin={0} aria-valuemax={b.total} aria-valuenow={b.nilai}>
            <View style={[s.isi, { width: `${b.total ? Math.min(100, (b.nilai / b.total) * 100) : 0}%`, backgroundColor: b.warna }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  sorot: { fontFamily: H.badan, fontSize: 14, color: W.redup, fontVariant: ['tabular-nums'] },
  kolom: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
  sumbu: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sumbuTeks: { fontFamily: H.mono, fontSize: 12, color: W.redup },
  barisAtas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  label: { fontFamily: H.tebal, fontSize: 14, color: W.terang, flexShrink: 1 },
  nilai: { fontFamily: H.mono, fontSize: 12.5, color: W.terang },
  jalur: { height: 8, borderRadius: 4, backgroundColor: W.malam3, overflow: 'hidden' },
  isi: { height: 8, borderRadius: 4 },
});
