// Denah area/kursi bergaya riso (ilustrasi, bukan denah teknis). Area dipilih lewat keping di atas denah.
import { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Circle, Defs, G, Line, Path, Pattern, Rect, Svg, SvgText } from './svg';
import { H, TINTA, W } from '../lib/tema';
import { rupiahRingkas } from '../data/acara';
import { terjual, useData } from '../lib/simpan';

const AREA = {
  // kategori → area di denah; presale memakai area Reguler
  konser: [
    { id: 'bibir', kat: ['bibir'], nama: 'Bibir Panggung', y: 0.31 },
    { id: 'reguler', kat: ['reguler', 'presale'], nama: 'Reguler', y: 0.62 },
  ],
  komedi: [
    { id: 'depan', kat: ['depan'], nama: 'Kursi Depan', y: 0.27 },
    { id: 'reguler', kat: ['reguler'], nama: 'Kursi Reguler', y: 0.68 },
  ],
};

export function adaDenah(acara) {
  return !!AREA[acara.denah];
}

function statusArea(data, acara, area) {
  const kats = acara.tiket.filter((k) => area.kat.includes(k.id));
  const kuota = kats.reduce((n, k) => n + k.kuota, 0);
  const laku = kats.reduce((n, k) => n + terjual(data, acara.slug, k.id), 0);
  const tersedia = kats.filter((k) => terjual(data, acara.slug, k.id) < k.kuota);
  const kat = tersedia[0] || kats[0];
  return { kuota, laku, sisa: kuota - laku, kat, harga: kat.harga };
}

export function Denah({ acara, pilih, onPilih, judul = 'Denah area' }) {
  const data = useData();
  const id = 'd' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const tinta = TINTA[acara.tinta];
  const areas = AREA[acara.denah];
  if (!areas) return null;
  const st = Object.fromEntries(areas.map((a) => [a.id, statusArea(data, acara, a)]));
  const isi = (a) => {
    const x = st[a.id];
    if (pilih && a.kat.includes(pilih)) return tinta.a;
    if (x.sisa <= 0) return `url(#${id}h)`;
    if (x.sisa <= 20) return W.kuning;
    return W.kertas2;
  };
  const ringkasan = areas.map((a) => `${a.nama} ${st[a.id].sisa <= 0 ? 'habis' : `sisa ${st[a.id].sisa}`}`).join(', ');
  const label = acara.denah === 'konser'
    ? `${judul}: panggung di depan, ${ringkasan}, area makan di kanan belakang, Gerbang A di kiri belakang dan Gerbang B di tengah belakang`
    : `${judul}: panggung di depan, ${ringkasan}, Gerbang A untuk kursi reguler dan Gerbang B untuk kursi depan`;

  return (
    <View style={s.wadah}>
      <View>
        <Svg width="100%" viewBox="0 0 320 230" label={label} style={{ aspectRatio: 320 / 230 }}>
          <Defs>
            <Pattern id={`${id}h`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Rect width="8" height="8" fill={W.kertas2} />
              <Line x1="0" y1="0" x2="0" y2="8" stroke={W.tinta2} strokeWidth="3" />
            </Pattern>
          </Defs>
          <Rect width="320" height="230" rx="14" fill={W.kertas} />
          {acara.denah === 'konser' ? <Konser isi={isi} areas={areas} tinta={tinta} /> : <Komedi isi={isi} areas={areas} st={st} acara={acara} />}
        </Svg>
        {areas.map((a) => {
          const x = st[a.id];
          const habis = x.sisa <= 0;
          const dipilih = pilih && a.kat.includes(pilih);
          const teks = `${a.nama} · ${habis ? 'Habis' : x.sisa <= 20 ? `sisa ${x.sisa}` : rupiahRingkas(x.harga)}`;
          return (
            <View key={a.id} style={[s.barisKeping, { top: `${a.y * 100}%` }]} pointerEvents="box-none">
              <Pressable
                role={onPilih ? 'radio' : 'button'}
                aria-checked={onPilih ? !!dipilih : undefined}
                aria-label={`${a.nama}, ${habis ? 'habis terjual' : `sisa ${x.sisa} dari ${x.kuota}, mulai ${rupiahRingkas(x.harga)}`}`}
                disabled={habis && !!onPilih}
                onPress={() => onPilih?.(x.kat.id)}
                style={[s.keping, dipilih && { backgroundColor: W.tinta, borderColor: W.tinta }, habis && { borderStyle: 'dashed' }]}
              >
                <Text style={[s.kepingTeks, dipilih && { color: W.kertas }]}>{teks}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={s.legenda} aria-hidden>
        <Legenda warna={tinta.a} label="Pilihanmu" />
        <Legenda warna={W.kertas2} label="Tersedia" garis />
        <Legenda warna={W.kuning} label="Hampir habis" />
        <Legenda warna={W.tinta2} label="Habis (arsir)" />
      </View>
    </View>
  );
}

function Legenda({ warna, label, garis }) {
  return (
    <View style={s.legItem}>
      <View style={[s.legKotak, { backgroundColor: warna }, garis && { borderWidth: 1.5, borderColor: W.tinta }]} />
      <Text style={s.legTeks}>{label}</Text>
    </View>
  );
}

function Panggung({ arc }) {
  return (
    <G>
      {arc ? <Path d="M58 46 Q160 -26 262 46 Z" fill={W.tinta} /> : <Rect x="60" y="10" width="200" height="34" rx="6" fill={W.tinta} />}
      <SvgText x="160" y="36" fontSize="15" fontFamily={H.display} fill={W.kertas} textAnchor="middle" letterSpacing="2">PANGGUNG</SvgText>
    </G>
  );
}

function Gerbang({ x, huruf }) {
  return (
    <G>
      <Path d={`M${x - 10} 222 L${x} 210 L${x + 10} 222 Z`} fill={W.jinggaTua} />
      <SvgText x={x + 16} y="222" fontSize="12" fontFamily={H.mono} fill={W.tinta}>GERBANG {huruf}</SvgText>
    </G>
  );
}

function Konser({ isi, areas, tinta }) {
  const [bibir, reguler] = areas;
  return (
    <>
      <Panggung />
      <Rect x="34" y="14" width="18" height="26" rx="3" fill={W.tinta2} />
      <Rect x="268" y="14" width="18" height="26" rx="3" fill={W.tinta2} />
      <Path d="M54 52 L266 52 L282 96 L38 96 Z" fill={isi(bibir)} stroke={W.tinta} strokeWidth="2" />
      <Path d="M36 104 L284 104 L296 188 L24 188 Z" fill={isi(reguler)} stroke={W.tinta} strokeWidth="2" />
      <Rect x="146" y="160" width="28" height="18" rx="3" fill={W.tinta} />
      <SvgText x="160" y="173" fontSize="10" fontFamily={H.mono} fill={W.kertas} textAnchor="middle">FOH</SvgText>
      <Rect x="232" y="196" width="80" height="28" rx="6" fill={tinta.b} opacity="0.85" />
      <SvgText x="272" y="215" fontSize="13" fontFamily={H.display} fill={W.tinta} textAnchor="middle">AREA MAKAN</SvgText>
      <Gerbang x={28} huruf="A" />
      <Gerbang x={126} huruf="B" />
    </>
  );
}

function Komedi({ isi, areas, st, acara }) {
  const [depan, reguler] = areas;
  const kursi = [];
  // 3 baris kursi depan (40 kursi)
  let n = 0;
  const lakuDepan = st.depan.laku;
  [14, 13, 13].forEach((jumlah, r) => {
    const awal = 160 - ((jumlah - 1) * 14) / 2;
    for (let c = 0; c < jumlah; c++) { kursi.push(<Circle key={`d${n}`} cx={awal + c * 14} cy={58 + r * 12} r="4.5" fill={n < lakuDepan ? W.tinta2 : W.kertas} stroke={W.tinta} strokeWidth="1.2" />); n++; }
  });
  // 12 baris × 15 kursi reguler (180 kursi); yang terjual terisi mulai dari depan
  const lakuReg = st.reguler.laku;
  for (let i = 0; i < 180; i++) {
    const r = Math.floor(i / 15), c = i % 15;
    kursi.push(<Circle key={`r${i}`} cx={48 + c * 16} cy={110 + r * 8} r="3.2" fill={i < lakuReg ? W.tinta2 : W.kertas} stroke={W.tinta} strokeWidth="1" />);
  }
  return (
    <>
      <Panggung arc />
      <Rect x="54" y="48" width="212" height="44" rx="10" fill={isi(depan)} stroke={W.tinta} strokeWidth="2" />
      <Rect x="36" y="102" width="248" height="100" rx="10" fill={isi(reguler)} stroke={W.tinta} strokeWidth="2" />
      {kursi}
      <Gerbang x={28} huruf="A" />
      <Gerbang x={196} huruf="B" />
    </>
  );
}

const s = StyleSheet.create({
  wadah: { gap: 10 },
  barisKeping: { position: 'absolute', left: 0, right: 0, alignItems: 'center', marginTop: -22 },
  keping: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: W.tinta, backgroundColor: W.kertas, justifyContent: 'center' },
  kepingTeks: { fontFamily: H.tebal, fontSize: 14, color: W.tinta },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legKotak: { width: 14, height: 14, borderRadius: 4 },
  legTeks: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
});
