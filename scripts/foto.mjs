// Unduh foto CC0/PD (sumber di public/images/SUMBER.md) lalu beri efek dupleks risograf per acara:
// gelap → tinta malam, tengah → tinta acara, terang → kertas. Hasil WebP 16:9 (480 & 840 px).
// node scripts/foto.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const UA = 'PintuWebDemo/1.0 (+https://www.pintuweb.id; demo galeri)';
const FOTO = [
  ['pameran-cetak-saring', 'https://upload.wikimedia.org/wikipedia/commons/6/61/Typical_Screen_Printing_Example.JPG', '#ff5fa2', 'centre'],
  ['komedi-pojok-pendopo', 'https://cdn.stocksnap.io/img-thumbs/960w/8KQC04JDT0.jpg', '#5b86ff', 'centre'],
  ['malam-gending-elektrik', 'https://cdn.stocksnap.io/img-thumbs/960w/5FGWJW4Z5D.jpg', '#ff6a2b', 'centre'],
  ['seminar-umkm-naik-kelas', 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxNDkyNC1pbWFnZS1rd3lzZGs5Ni5qcGc.jpg', '#ffd23f', 'centre'],
  ['pasar-rasa-brantas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Vegetable_Satay_-_Bali_2025-11-19.jpg/960px-Vegetable_Satay_-_Bali_2025-11-19.jpg', '#3ddc97', 'centre'],
  ['lari-pagi-lereng-5k', 'https://cdn.stocksnap.io/img-thumbs/960w/2USDVKPSWS.jpg', '#ff5a5f', 'south'],
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const campur = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
function lut(tinta) {
  const gelap = hex('#15121f'), tengah = hex(tinta), terang = hex('#f4ecdc');
  return Array.from({ length: 256 }, (_, l) => { const t = l / 255; return t < 0.55 ? campur(gelap, tengah, t / 0.55) : campur(tengah, terang, (t - 0.55) / 0.45); });
}

mkdirSync('public/images/acara', { recursive: true });
for (const [slug, url, tinta, fokus] of FOTO) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${slug}: ${r.status}`);
  const asli = Buffer.from(await r.arrayBuffer());
  const { data, info } = await sharp(asli).resize(840, 473, { fit: 'cover', position: fokus }).greyscale().normalise().raw().toBuffer({ resolveWithObject: true });
  const peta = lut(tinta);
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) rgb.set(peta[data[i]], i * 3);
  const dupleks = sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } });
  await dupleks.clone().webp({ quality: 70 }).toFile(`public/images/acara/${slug}-840.webp`);
  await dupleks.clone().resize(480, 270).webp({ quality: 70 }).toFile(`public/images/acara/${slug}-480.webp`);
  console.log(slug, 'ok');
  await new Promise((s) => setTimeout(s, 800));
}
