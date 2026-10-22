// Matriks QR → satu path SVG (baris digabung agar ringan).
import qrcode from 'qrcode-generator';

export function qrPath(teks, koreksi = 'M') {
  const q = qrcode(0, koreksi);
  q.addData(teks);
  q.make();
  const n = q.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!q.isDark(r, c)) { c++; continue; }
      let p = c;
      while (p < n && q.isDark(r, p)) p++;
      d += `M${c} ${r}h${p - c}v1h${c - p}z`;
      c = p;
    }
  }
  return { n, d };
}
