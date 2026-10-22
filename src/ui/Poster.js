// Poster acara: desain grafis buatan sendiri bergaya cetak risograf dua tinta
// (raster titik, tumpang tinta sedikit meleset, tanda registrasi di sudut).
import { useId } from 'react';
import { Circle, ClipPath, Defs, G, Line, Path, Pattern, Rect, Svg, SvgText } from './svg';
import { H, W } from '../lib/tema';

const K = W.kertas;
const I = W.tinta;

function Registrasi({ x, y, c = I }) {
  return (
    <G opacity="0.55">
      <Circle cx={x} cy={y} r="5" stroke={c} strokeWidth="1" fill="none" />
      <Line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={c} strokeWidth="1" />
      <Line x1={x} y1={y - 9} x2={x} y2={y + 9} stroke={c} strokeWidth="1" />
    </G>
  );
}

/** Raster bergradasi: titik membesar mendekati pusat (cx, cy). */
function Gradasi({ x, y, w, h, jarak = 10, cx, cy, rmax = 4.2, jangkau = 120, c }) {
  const titik = [];
  for (let i = x; i <= x + w; i += jarak) {
    for (let j = y; j <= y + h; j += jarak) {
      const d = Math.hypot(i - cx, j - cy);
      const r = rmax * (1 - d / jangkau);
      if (r > 0.6) titik.push(<Circle key={`${i}-${j}`} cx={i} cy={j} r={r.toFixed(2)} fill={c} />);
    }
  }
  return <G>{titik}</G>;
}

function Teks({ x, y, ukuran, isi, c = I, anchor = 'start', spasi = 0, keluarga = H.display }) {
  return (
    <SvgText x={x} y={y} fontSize={ukuran} fontFamily={keluarga} fill={c} textAnchor={anchor} letterSpacing={spasi}>
      {isi}
    </SvgText>
  );
}

function Saring({ id }) {
  return (
    <>
      <Defs>
        <Pattern id={`${id}r`} width="7" height="7" patternUnits="userSpaceOnUse">
          <Circle cx="3.5" cy="3.5" r="1.7" fill={W.pink} />
        </Pattern>
      </Defs>
      <Rect width="300" height="400" fill={K} />
      <Rect x="38" y="52" width="170" height="170" fill={W.biru} opacity="0.92" transform="rotate(5 123 137)" />
      <Rect x="86" y="86" width="176" height="176" fill={W.pink} opacity="0.88" transform="rotate(-7 174 174)" />
      <Circle cx="226" cy="92" r="58" fill={`url(#${id}r)`} />
      <Rect x="96" y="96" width="156" height="156" fill="none" stroke={I} strokeWidth="2" strokeDasharray="5 5" transform="rotate(-7 174 174)" />
      {/* rakel */}
      <G transform="rotate(-28 110 230)">
        <Rect x="40" y="222" width="150" height="16" rx="3" fill={I} />
        <Rect x="102" y="198" width="26" height="28" rx="4" fill={I} />
      </G>
      <Teks x="22" y="330" ukuran="88" isi="CETAK" />
      <Teks x="22" y="384" ukuran="62" isi="SARING" c={W.pinkTua} spasi="2" />
      <Teks x="278" y="384" ukuran="11" isi="& ZINE" anchor="end" keluarga={H.mono} />
      <Teks x="22" y="36" ukuran="11" isi="PAMERAN · MALANG" keluarga={H.mono} />
      <Registrasi x={274} y={30} />
    </>
  );
}

function Komedi({ id }) {
  return (
    <>
      <Defs>
        <ClipPath id={`${id}k`}>
          <Path d="M120 0 L180 0 L270 300 L30 300 Z" />
        </ClipPath>
      </Defs>
      <Rect width="300" height="400" fill="#1d2550" />
      <G clipPath={`url(#${id}k)`}>
        <Rect width="300" height="300" fill={W.kuning} opacity="0.9" />
        <Gradasi x={20} y={150} w={260} h={150} jarak={9} cx={150} cy={300} rmax={4.4} jangkau={170} c="#1d2550" />
      </G>
      <Path d="M30 300 L270 300 L262 312 L38 312 Z" fill={W.biru} />
      {/* mikrofon & tiang */}
      <Rect x="146" y="140" width="8" height="165" fill={I} />
      <Rect x="124" y="300" width="52" height="8" rx="4" fill={I} />
      <Rect x="136" y="96" width="28" height="52" rx="14" fill={I} />
      <G opacity="0.9">
        <Line x1="141" y1="108" x2="159" y2="108" stroke={W.kuning} strokeWidth="2" />
        <Line x1="141" y1="116" x2="159" y2="116" stroke={W.kuning} strokeWidth="2" />
        <Line x1="141" y1="124" x2="159" y2="124" stroke={W.kuning} strokeWidth="2" />
      </G>
      <Teks x="22" y="356" ukuran="62" isi="POJOK" c={W.kuning} />
      <Teks x="22" y="388" ukuran="34" isi="PENDOPO" c={K} spasi="3" />
      <Teks x="278" y="388" ukuran="11" isi="SURABAYA" anchor="end" c={K} keluarga={H.mono} />
      <Teks x="22" y="36" ukuran="11" isi="KOMEDI TUNGGAL" c={K} keluarga={H.mono} />
      <Registrasi x={274} y={30} c={K} />
    </>
  );
}

function Gending({ id }) {
  const gelombang = 'M0 205 L30 205 L42 170 L58 240 L74 150 L90 250 L106 175 L122 225 L138 190 L154 215 L170 160 L186 250 L202 180 L218 228 L234 195 L250 210 L300 210';
  return (
    <>
      <Defs>
        <Pattern id={`${id}g`} width="8" height="8" patternUnits="userSpaceOnUse">
          <Circle cx="4" cy="4" r="2" fill={W.biru} />
        </Pattern>
      </Defs>
      <Rect width="300" height="400" fill={K} />
      <Rect x="0" y="232" width="300" height="70" fill={`url(#${id}g)`} />
      <Circle cx="150" cy="168" r="112" fill={W.jingga} />
      <Circle cx="150" cy="168" r="84" fill="none" stroke={K} strokeWidth="3" opacity="0.8" />
      <Circle cx="150" cy="168" r="60" fill="none" stroke={K} strokeWidth="3" opacity="0.8" />
      <Circle cx="150" cy="168" r="26" fill={W.jinggaTua} />
      <Circle cx="146" cy="164" r="26" fill="none" stroke={I} strokeWidth="2" opacity="0.6" />
      <Path d={gelombang} stroke={W.biru} strokeWidth="9" fill="none" strokeLinejoin="round" opacity="0.92" />
      <Path d={gelombang} stroke={I} strokeWidth="2" fill="none" strokeLinejoin="round" transform="translate(3 -3)" />
      <Teks x="22" y="346" ukuran="70" isi="GENDING" />
      <Teks x="22" y="388" ukuran="44" isi="ELEKTRIK" c={W.jinggaTua} spasi="4" />
      <Teks x="22" y="36" ukuran="11" isi="KONSER · TULUNGAGUNG" keluarga={H.mono} />
      <Registrasi x={274} y={30} />
    </>
  );
}

function Umkm() {
  const tenda = [];
  for (let i = 0; i < 6; i++) {
    tenda.push(<Rect key={`t${i}`} x={i * 50} y="0" width="25" height="70" fill={W.biru} />);
    tenda.push(<Circle key={`b${i}`} cx={i * 50 + 12.5} cy="70" r="12.5" fill={W.biru} />);
    tenda.push(<Circle key={`k${i}`} cx={i * 50 + 37.5} cy="70" r="12.5" fill={K} />);
  }
  return (
    <>
      <Rect width="300" height="400" fill={W.kuning} />
      <Rect width="300" height="70" fill={K} />
      {tenda}
      {/* grafik naik */}
      <Rect x="40" y="200" width="40" height="70" fill={I} />
      <Rect x="96" y="168" width="40" height="102" fill={I} />
      <Rect x="152" y="126" width="40" height="144" fill={I} />
      <Rect x="208" y="104" width="40" height="166" fill={W.biru} />
      <Rect x="204" y="100" width="40" height="166" fill="none" stroke={I} strokeWidth="2" />
      <Path d="M40 178 L120 140 L170 112 L236 76" stroke={W.biruTua} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M222 70 L242 72 L236 92" stroke={W.biruTua} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="30" y="270" width="240" height="3" fill={I} />
      <Teks x="22" y="350" ukuran="78" isi="UMKM" />
      <Teks x="22" y="388" ukuran="38" isi="NAIK KELAS" c={W.biruTua} spasi="3" />
      <Teks x="278" y="300" ukuran="11" isi="SEMINAR · KEDIRI" anchor="end" keluarga={H.mono} />
    </>
  );
}

function Kuliner({ id }) {
  return (
    <>
      <Defs>
        <Pattern id={`${id}s`} width="7" height="7" patternUnits="userSpaceOnUse">
          <Circle cx="3.5" cy="3.5" r="1.6" fill={W.hijau} />
        </Pattern>
      </Defs>
      <Rect width="300" height="400" fill={K} />
      <Circle cx="150" cy="150" r="104" fill={`url(#${id}s)`} />
      {/* uap */}
      <Path d="M112 112 C98 92 126 80 112 58 M150 108 C136 86 164 74 150 48 M188 112 C174 92 202 80 188 58" stroke={W.hijauTua} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* mangkuk */}
      <Path d="M50 146 L250 146 C250 210 206 250 150 250 C94 250 50 210 50 146 Z" fill={W.jingga} />
      <Path d="M54 146 L254 146" stroke={I} strokeWidth="3" transform="translate(-2 -3)" />
      <Rect x="120" y="250" width="60" height="12" rx="3" fill={W.jinggaTua} />
      <Path d="M70 174 C110 188 190 188 230 174" stroke={K} strokeWidth="3" fill="none" opacity="0.8" />
      {/* sungai */}
      <Path d="M0 282 C40 270 60 294 100 282 C140 270 160 294 200 282 C240 270 260 294 300 282" stroke={W.hijau} strokeWidth="6" fill="none" />
      <Path d="M0 300 C40 288 60 312 100 300 C140 288 160 312 200 300 C240 288 260 312 300 300" stroke={W.hijau} strokeWidth="6" fill="none" opacity="0.7" />
      <Teks x="22" y="356" ukuran="66" isi="PASAR" />
      <Teks x="160" y="356" ukuran="66" isi="RASA" c={W.hijauTua} />
      <Teks x="22" y="386" ukuran="13" isi="FESTIVAL KULINER · BLITAR" keluarga={H.mono} />
      <Teks x="22" y="36" ukuran="11" isi="3 MALAM · 40 LAPAK" keluarga={H.mono} />
      <Registrasi x={274} y={30} />
    </>
  );
}

function Lari({ id }) {
  return (
    <>
      <Defs>
        <Pattern id={`${id}l`} width="8" height="8" patternUnits="userSpaceOnUse">
          <Circle cx="4" cy="4" r="2.1" fill={W.biru} />
        </Pattern>
      </Defs>
      <Rect width="300" height="400" fill={K} />
      <Circle cx="196" cy="120" r="58" fill={W.merah} />
      <Path d="M0 210 L70 120 L120 170 L190 92 L300 196 L300 300 L0 300 Z" fill={`url(#${id}l)`} />
      <Path d="M0 250 L60 186 L130 236 L210 160 L300 230 L300 300 L0 300 Z" fill={W.biru} opacity="0.9" />
      <Path d="M150 300 C150 270 210 262 196 232 C186 212 150 214 160 196" stroke={K} strokeWidth="12" fill="none" strokeLinecap="round" />
      <Path d="M150 300 C150 270 210 262 196 232 C186 212 150 214 160 196" stroke={I} strokeWidth="2.5" fill="none" strokeDasharray="7 7" strokeLinecap="round" />
      <Teks x="22" y="372" ukuran="104" isi="5K" c={W.merahTua} />
      <Teks x="128" y="350" ukuran="44" isi="LERENG" />
      <Teks x="130" y="374" ukuran="12" isi="LARI PAGI · TRENGGALEK" keluarga={H.mono} />
      <Teks x="22" y="36" ukuran="11" isi="START 05.30 WIB" keluarga={H.mono} />
      <Registrasi x={274} y={30} />
    </>
  );
}

const DESAIN = { saring: Saring, komedi: Komedi, gending: Gending, umkm: Umkm, kuliner: Kuliner, lari: Lari };

/** Poster 3:4. `potong` = 'slice' mengisi wadah dengan rasio lain (dipotong di tengah). */
export function Poster({ acara, lebar = '100%', tinggi, rasio = 3 / 4, potong = 'slice', style, hias = false }) {
  const id = 'p' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const Desain = DESAIN[acara.poster];
  return (
    <Svg
      viewBox="0 0 300 400"
      width={lebar}
      height={tinggi}
      preserveAspectRatio={`xMidYMid ${potong}`}
      label={hias ? undefined : `Poster ${acara.judul}`}
      style={{ aspectRatio: tinggi ? undefined : rasio, ...style }}
    >
      <Desain id={id} />
    </Svg>
  );
}

/** Latar raster titik (dekorasi), mengisi wadahnya. */
export function Raster({ warna = W.tinta, jarak = 9, r = 2, opasitas = 0.16 }) {
  const id = 'r' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <Pattern id={id} width={jarak} height={jarak} patternUnits="userSpaceOnUse">
          <Circle cx={jarak / 2} cy={jarak / 2} r={r} fill={warna} opacity={opasitas} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
