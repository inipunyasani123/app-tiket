// Membuat ikon aplikasi (karcis jingga bertakik) untuk Android/iOS/PWA dari SVG buatan sendiri.
// node scripts/ikon.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const MALAM = '#15121f', JINGGA = '#ff6a2b', KERTAS = '#f4ecdc';

function karcis({ skala = 1, warna = JINGGA, takik = MALAM, garis = MALAM, titik = true }) {
  const t = (n) => n * skala;
  const raster = titik
    ? Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<circle cx="${t(-250 + c * 52)}" cy="${t(-80 + r * 52)}" r="${t(12 - r * 2)}" fill="${garis}" opacity="0.28"/>`).join('')).join('')
    : '';
  return `<g transform="translate(512 512) rotate(-12)">
    <rect x="${t(-330)}" y="${t(-200)}" width="${t(660)}" height="${t(400)}" rx="${t(56)}" fill="${warna}"/>
    <circle cx="${t(-330)}" cy="0" r="${t(58)}" fill="${takik}"/>
    <circle cx="${t(330)}" cy="0" r="${t(58)}" fill="${takik}"/>
    <line x1="${t(140)}" y1="${t(-170)}" x2="${t(140)}" y2="${t(170)}" stroke="${garis}" stroke-width="${t(16)}" stroke-dasharray="${t(26)} ${t(22)}" stroke-linecap="round"/>
    ${raster}
    <rect x="${t(196)}" y="${t(-110)}" width="${t(80)}" height="${t(220)}" rx="${t(14)}" fill="${KERTAS}"/>
  </g>`;
}

const svg = (isi, latar = MALAM) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${latar ? `<rect width="1024" height="1024" fill="${latar}"/>` : ''}${isi}</svg>`;

const ikon = svg(karcis({}));
const mask = svg(karcis({ skala: 0.78 }));
const depan = svg(karcis({ skala: 0.62, takik: MALAM }), null);
const ikonBulat = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="230" fill="${MALAM}"/>${karcis({ skala: 0.9 })}</svg>`;

const png = (s, n, out) => sharp(Buffer.from(s)).resize(n, n).png({ compressionLevel: 9 }).toFile(out);
await png(ikon, 1024, 'assets/icon.png');
await png(svg(karcis({ skala: 0.7 })), 1024, 'assets/splash-icon.png');
await png(depan, 1024, 'assets/android-icon-foreground.png');
await png(svg('', MALAM), 1024, 'assets/android-icon-background.png');
// Monokrom: putih di atas transparan (alfa dari kecerahan), takik & garis sobek jadi lubang.
const alfa = await sharp(Buffer.from(svg(karcis({ skala: 0.62, warna: '#ffffff', takik: '#000000', garis: '#000000', titik: false }), '#000000'))).greyscale().raw().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#ffffff' } }).joinChannel(alfa, { raw: { width: 1024, height: 1024, channels: 1 } }).png({ compressionLevel: 9 }).toFile('assets/android-icon-monochrome.png');
await png(ikonBulat, 48, 'assets/favicon.png');
await png(ikon, 180, 'public/apple-touch-icon.png');
await png(ikon, 192, 'public/ikon-192.png');
await png(ikon, 512, 'public/ikon-512.png');
await png(mask, 512, 'public/ikon-maskable-512.png');
writeFileSync('public/ikon.svg', ikonBulat.replace('width="1024" height="1024" ', ''));
console.log('ikon selesai');
