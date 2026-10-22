// Kode QR sebagai satu path SVG. Pembuat QR dimuat terpisah (import dinamis) agar tidak ikut bundel awal;
// semua QR di aplikasi bergantung pada data perangkat, jadi memang baru tampil setelah halaman hidup.
import { useEffect, useState } from 'react';
import { Path, Rect, Svg } from './svg';
import { W } from '../lib/tema';

let modul = null;

export function QR({ isi, ukuran = 200, warna = W.tinta, latar = W.kertas, label }) {
  const [qr, setQr] = useState(() => (modul ? modul.qrPath(isi) : null));
  useEffect(() => {
    let batal = false;
    if (modul) { setQr(modul.qrPath(isi)); return undefined; }
    import('../lib/qr').then((m) => { modul = m; if (!batal) setQr(m.qrPath(isi)); });
    return () => { batal = true; };
  }, [isi]);
  const n = qr ? qr.n : 25;
  const tepi = 2;
  return (
    <Svg width={ukuran} height={ukuran} viewBox={`${-tepi} ${-tepi} ${n + tepi * 2} ${n + tepi * 2}`} shapeRendering="crispEdges" label={label}>
      <Rect x={-tepi} y={-tepi} width={n + tepi * 2} height={n + tepi * 2} fill={latar} />
      {qr ? <Path d={qr.d} fill={warna} /> : null}
    </Svg>
  );
}
