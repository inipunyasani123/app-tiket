import { Circle, Path, Rect, Svg } from './svg';
import { W } from '../lib/tema';

// Ikon garis 24×24 buatan sendiri.
const P = {
  jelajah: (c) => <><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill="none" /><Path d="M15.5 8.5l-2 5-5 2 2-5z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" /></>,
  tiket: (c) => <Path d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5V10a2 2 0 000 4v2.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5V14a2 2 0 000-4zM14.5 6v12" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeDasharray="0" fill="none" />,
  pindai: (c) => <><Path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" /><Path d="M4 12h16" stroke={c} strokeWidth="2" strokeLinecap="round" /></>,
  dompet: (c) => <><Path d="M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 7l11-3v3" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" /><Circle cx="16" cy="13.5" r="1.5" fill={c} /></>,
  lonceng: (c) => <Path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15zM10 20.5a2 2 0 004 0" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />,
  kirim: (c) => <Path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />,
  kalender: (c) => <><Rect x="3.5" y="5" width="17" height="15" rx="2" stroke={c} strokeWidth="2" fill="none" /><Path d="M3.5 10h17M8 3v4M16 3v4" stroke={c} strokeWidth="2" strokeLinecap="round" /></>,
  kiri: (c) => <Path d="M15 5l-7 7 7 7" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  kanan: (c) => <Path d="M9 5l7 7-7 7" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  cek: (c) => <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  silang: (c) => <Path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2.4" strokeLinecap="round" />,
  lokasi: (c) => <><Path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" stroke={c} strokeWidth="2" fill="none" /><Circle cx="12" cy="9.5" r="2.5" stroke={c} strokeWidth="2" fill="none" /></>,
  jam: (c) => <><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill="none" /><Path d="M12 7v5l3 2" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" /></>,
  kamera: (c) => <><Path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" /><Circle cx="12" cy="13" r="3.5" stroke={c} strokeWidth="2" fill="none" /></>,
  salin: (c) => <><Rect x="8" y="8" width="12" height="12" rx="2" stroke={c} strokeWidth="2" fill="none" /><Path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke={c} strokeWidth="2" fill="none" /></>,
  tambah: (c) => <Path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" />,
  kurang: (c) => <Path d="M5 12h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" />,
  panitia: (c) => <><Path d="M9 3h6l-1 4h-4z" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" /><Rect x="5" y="7" width="14" height="14" rx="2" stroke={c} strokeWidth="2" fill="none" /><Path d="M9 15l2 2 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  orang: (c) => <><Circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth="2" fill="none" /><Path d="M5 20a7 7 0 0114 0" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none" /></>,
  bagikan: (c) => <Path d="M12 3v12M7 8l5-5 5 5M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
  info: (c) => <><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill="none" /><Path d="M12 11v6M12 7.5v.5" stroke={c} strokeWidth="2.4" strokeLinecap="round" /></>,
  hapus: (c) => <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke={c} strokeWidth="2" strokeLinejoin="round" fill="none" />,
  kunci: (c) => <><Rect x="5" y="10" width="14" height="10" rx="2" stroke={c} strokeWidth="2" fill="none" /><Path d="M8 10V7a4 4 0 018 0v3" stroke={c} strokeWidth="2" fill="none" /></>,
};

export function Ikon({ nama, warna = W.terang, ukuran = 22, label }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" label={label}>
      {P[nama](warna)}
    </Svg>
  );
}
