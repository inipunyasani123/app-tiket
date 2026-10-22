// Ilustrasi penampil/pembicara buatan sendiri: figur geometris tanpa wajah (bukan orang sungguhan).
import { Circle, Ellipse, G, Line, Path, Rect, Svg } from './svg';
import { W } from '../lib/tema';

const KULIT = ['#f0c8a0', '#d9a074', '#b07448', '#86553a'];
const GELAP = '#231d33';

function Rambut({ jenis, kulit }) {
  switch (jenis) {
    case 'ikal':
      return <G fill={GELAP}>{[[22, 22], [30, 17], [38, 17], [45, 22], [20, 30], [46, 30], [33, 14]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r="7" />)}</G>;
    case 'topi':
      return <G><Path d="M18 26 C18 12 46 12 46 26 Z" fill={GELAP} /><Rect x="30" y="23" width="24" height="5" rx="2.5" fill={GELAP} /></G>;
    case 'kerudung':
      return <Path d="M14 58 C12 36 16 14 32 13 C48 14 52 36 50 58 L44 58 C46 44 44 25 32 25 C20 25 18 44 20 58 Z" fill={GELAP} />;
    case 'cepak':
      return <Path d="M20 26 C20 15 44 15 44 26 C40 21 24 21 20 26 Z" fill={GELAP} />;
    case 'panjang':
      return <Path d="M18 24 C18 10 46 10 46 24 L48 48 L40 48 L40 26 L24 26 L24 48 L16 48 Z" fill={GELAP} />;
    case 'bob':
      return <Path d="M17 34 C14 16 24 12 32 12 C40 12 50 16 47 34 L42 34 C43 26 40 22 32 22 C24 22 21 26 22 34 Z" fill={GELAP} />;
    case 'sanggul':
      return <G fill={GELAP}><Circle cx="32" cy="11" r="6" /><Path d="M20 26 C20 14 44 14 44 26 C38 20 26 20 20 26 Z" /></G>;
    case 'ikat':
      return <G fill={GELAP}><Path d="M20 26 C20 14 44 14 44 26 C38 20 26 20 20 26 Z" /><Path d="M43 20 C52 22 52 34 48 40 C47 32 45 27 42 25 Z" /></G>;
    default: // botak
      return <Path d="M22 20 C26 16 30 15 34 15" stroke={kulit} strokeWidth="0" />;
  }
}

function Properti({ jenis, tinta }) {
  switch (jenis) {
    case 'mik':
      return <G><Rect x="45" y="36" width="4" height="22" rx="2" fill={GELAP} transform="rotate(18 47 47)" /><Circle cx="44" cy="35" r="5" fill={GELAP} /></G>;
    case 'gitar':
      return <G transform="rotate(-35 50 30)"><Rect x="47" y="8" width="5" height="34" fill={GELAP} /><Rect x="45" y="4" width="9" height="8" rx="2" fill={tinta} stroke={GELAP} strokeWidth="1.5" /></G>;
    case 'kacamata':
      return <G stroke={GELAP} strokeWidth="2" fill="none"><Circle cx="27" cy="30" r="4" /><Circle cx="37" cy="30" r="4" /><Line x1="31" y1="30" x2="33" y2="30" /></G>;
    case 'rakel':
      return <G transform="rotate(-20 46 46)"><Rect x="36" y="44" width="22" height="5" rx="1.5" fill={GELAP} /><Rect x="45" y="36" width="5" height="9" fill={GELAP} /></G>;
    case 'sendok':
      return <G transform="rotate(25 48 40)"><Ellipse cx="48" cy="30" rx="4" ry="6" fill={GELAP} /><Rect x="47" y="34" width="2.5" height="18" fill={GELAP} /></G>;
    case 'peluit':
      return <G><Path d="M26 44 L32 52 L38 44" stroke={GELAP} strokeWidth="1.5" fill="none" /><Rect x="29" y="51" width="8" height="5" rx="2" fill={GELAP} /></G>;
    default:
      return null;
  }
}

export function Tokoh({ gaya, ukuran = 64, label }) {
  const tinta = W[gaya.warna] || W.jingga;
  const kulit = KULIT[gaya.kulit % KULIT.length];
  const berkerudung = gaya.rambut === 'kerudung';
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 64 64" label={label}>
      <Rect width="64" height="64" rx="16" fill={tinta} />
      <Circle cx="50" cy="12" r="14" fill={W.kertas} opacity="0.35" />
      {gaya.rambut === 'panjang' ? <Rambut jenis="panjang" kulit={kulit} /> : null}
      <Path d="M10 64 C10 48 20 42 32 42 C44 42 54 48 54 64 Z" fill={GELAP} />
      <Path d="M14 64 C14 51 22 46 32 46 C42 46 50 51 50 64 Z" fill={W.kertas} opacity="0.18" />
      <Rect x="28" y="34" width="8" height="10" fill={kulit} />
      <Ellipse cx="32" cy="28" rx={berkerudung ? 10 : 12} ry="13" fill={kulit} />
      {gaya.rambut !== 'panjang' ? <Rambut jenis={gaya.rambut} kulit={kulit} /> : null}
      <Properti jenis={gaya.properti} tinta={tinta} />
    </Svg>
  );
}
