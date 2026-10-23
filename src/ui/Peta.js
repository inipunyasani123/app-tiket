// Peta lokasi bergaya ilustrasi riso (bukan peta sungguhan): jalan, sungai, titik masuk, parkir, area makan.
import { useId } from 'react';
import { Circle, Defs, G, Line, Path, Pattern, Rect, Svg, SvgText } from './svg';
import { H, TINTA, W } from '../lib/tema';

const ATUR = {
  'pameran-cetak-saring': { tempat: 'GUDANG SENI', sungai: false },
  'komedi-pojok-pendopo': { tempat: 'RUANG PERTUNJUKAN', sungai: false },
  'malam-gending-elektrik': { tempat: 'LAPANGAN', sungai: true },
  'seminar-umkm-naik-kelas': { tempat: 'AULA', sungai: true },
  'pasar-rasa-brantas': { tempat: 'AREA FESTIVAL', sungai: true, tepi: true },
  'lari-pagi-lereng-5k': { tempat: 'START · FINIS', rute: true },
};

function Penanda({ x, y, teks, warna = W.tinta, isi = W.kertas, lebar }) {
  const w = lebar || teks.length * 7.4 + 16;
  return (
    <G>
      <Rect x={x - w / 2} y={y - 11} width={w} height="22" rx="11" fill={isi} stroke={warna} strokeWidth="2" />
      <SvgText x={x} y={y + 4.5} fontSize="12" fontFamily={H.mono} fill={W.tinta} textAnchor="middle">{teks}</SvgText>
    </G>
  );
}

export function Peta({ acara }) {
  const id = 'm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = ATUR[acara.slug] || { tempat: 'LOKASI' };
  const tinta = TINTA[acara.tinta];
  const label = a.rute
    ? `Peta ilustrasi rute lari 5 km: titik start dan finis di jalan desa, pos air tiap 1,5 km, parkir di dekat start. Bukan peta sungguhan.`
    : `Peta ilustrasi ${acara.tempat.toLowerCase()}: ${a.sungai ? 'sungai di sisi selatan, ' : ''}jalan utama di depan, titik masuk Gerbang A dan B, parkir, dan area makan. Bukan peta sungguhan.`;
  return (
    <Svg width="100%" viewBox="0 0 320 200" label={label} style={{ aspectRatio: 320 / 200, borderRadius: 16 }}>
      <Defs>
        <Pattern id={`${id}t`} width="8" height="8" patternUnits="userSpaceOnUse"><Circle cx="4" cy="4" r="1.3" fill={W.tinta} opacity="0.18" /></Pattern>
      </Defs>
      <Rect width="320" height="200" rx="16" fill={W.kertas} />
      <Rect width="320" height="200" rx="16" fill={`url(#${id}t)`} />
      {/* blok bangunan */}
      {[[18, 14, 60, 40], [96, 14, 54, 40], [248, 14, 56, 40], [18, 118, 50, 34], [250, 112, 52, 40]].map(([x, y, w, h], i) => <Rect key={i} x={x} y={y} width={w} height={h} rx="5" fill={W.kertas2} />)}
      {/* jalan utama & jalan samping */}
      <Rect x="0" y="66" width="320" height="30" fill={W.tinta} opacity="0.85" />
      <Line x1="0" y1="81" x2="320" y2="81" stroke={W.kuning} strokeWidth="2" strokeDasharray="10 8" />
      <Rect x="164" y="0" width="22" height="200" fill={W.tinta} opacity="0.85" />
      {a.sungai ? (
        <Path d="M0 176 C50 160 90 196 150 180 C210 164 250 196 320 178 L320 200 L0 200 Z" fill={W.biru} opacity="0.85" />
      ) : null}
      {a.rute ? (
        <G>
          <Path d="M210 110 C260 110 300 130 296 160 C292 190 230 192 200 176 C170 160 120 190 80 176 C40 162 30 130 60 116 C90 102 150 110 210 110 Z" fill="none" stroke={tinta.a} strokeWidth="6" strokeLinecap="round" />
          <Path d="M210 110 C260 110 300 130 296 160 C292 190 230 192 200 176 C170 160 120 190 80 176 C40 162 30 130 60 116 C90 102 150 110 210 110 Z" fill="none" stroke={W.tinta} strokeWidth="1.5" strokeDasharray="4 5" />
          {[[292, 150, '1'], [214, 184, '2'], [120, 180, '3'], [40, 140, '4']].map(([x, y, k]) => (
            <G key={k}><Circle cx={x} cy={y} r="9" fill={W.kertas} stroke={W.tinta} strokeWidth="2" /><SvgText x={x} y={y + 4} fontSize="11" fontFamily={H.mono} fill={W.tinta} textAnchor="middle">{k}</SvgText></G>
          ))}
          <Penanda x={214} y={124} teks="START · FINIS" warna={tinta.teks} isi={tinta.a} />
          <Penanda x={92} y={34} teks="P" lebar={26} />
          <Penanda x={276} y={84} teks="POS AIR" />
        </G>
      ) : (
        <G>
          <Rect x="200" y="108" width={a.tepi ? 110 : 96} height={a.sungai ? 52 : 70} rx="8" fill={tinta.a} stroke={W.tinta} strokeWidth="2" />
          <SvgText x={a.tepi ? 255 : 248} y={a.sungai ? 139 : 147} fontSize="13" fontFamily={H.display} fill={W.tinta} textAnchor="middle">{a.tempat}</SvgText>
          <Penanda x={214} y={100} teks="A" lebar={26} />
          <Penanda x={290} y={100} teks="B" lebar={26} />
          <Penanda x={120} y={128} teks="P" lebar={26} />
          <Penanda x={96} y={34} teks="MAKAN" />
          <Path d="M175 54 L175 44" stroke={W.kertas} strokeWidth="0" />
        </G>
      )}
      <G opacity="0.7">
        <Circle cx="296" cy="184" r="0" />
        <Path d="M300 22 L306 36 L300 32 L294 36 Z" fill={W.tinta} />
        <SvgText x="300" y="50" fontSize="11" fontFamily={H.mono} fill={W.tinta} textAnchor="middle">U</SvgText>
      </G>
    </Svg>
  );
}
