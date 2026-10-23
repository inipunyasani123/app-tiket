// Cincin ketersediaan kecil: busur = sisa dari kuota.
import { Circle, Svg } from './svg';
import { W } from '../lib/tema';

export function Cincin({ sisa, kuota, ukuran = 44, warna = W.merahTua, latar = W.kertas2 }) {
  const r = 18, k = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, sisa / kuota));
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 44 44">
      <Circle cx="22" cy="22" r={r} stroke={latar} strokeWidth="5" fill="none" />
      <Circle cx="22" cy="22" r={r} stroke={warna} strokeWidth="5" fill="none" strokeDasharray={`${(k * p).toFixed(1)} ${k.toFixed(1)}`} strokeLinecap="round" transform="rotate(-90 22 22)" />
    </Svg>
  );
}
