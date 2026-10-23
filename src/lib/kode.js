// Kode tiket: KW-XXXX-XXXX (7 karakter acak + 1 karakter cek berbobot, modulo 31).
// Alfabet tanpa 0/O/1/I/L supaya tidak tertukar saat diketik panitia.
import { ACARA, jendela } from '../data/acara';
import { MENIT } from './waktu';

const ABJAD = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const N = ABJAD.length; // 31, prima

function cek(tujuh) {
  let s = 0;
  for (let i = 0; i < tujuh.length; i++) s += ABJAD.indexOf(tujuh[i]) * (i + 1);
  return ABJAD[s % N];
}

const format = (delapan) => `KW-${delapan.slice(0, 4)}-${delapan.slice(4)}`;

function acak() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 2 ** 32;
  }
  return Math.random();
}

export function buatKode(ada = new Set(), rng = acak) {
  for (;;) {
    let t = '';
    for (let i = 0; i < 7; i++) t += ABJAD[Math.floor(rng() * N)];
    const k = format(t + cek(t));
    if (!ada.has(k)) return k;
  }
}

/** Rapikan masukan panitia. Mengembalikan { kode, status: 'ok'|'format'|'cek' }. */
export function rapikan(masukan) {
  let s = String(masukan || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.startsWith('KARCISWETAN')) s = s.slice(11);
  if (s.startsWith('KW')) s = s.slice(2);
  if (s.length !== 8 || [...s].some((c) => !ABJAD.includes(c))) return { kode: s, status: 'format' };
  const kode = format(s);
  return { kode, status: cek(s.slice(0, 7)) === s[7] ? 'ok' : 'cek' };
}

/** Isi QR pada e-tiket. Pemindai cukup mencari pola KW-XXXX-XXXX di dalamnya. */
export const isiQR = (kode) => `KARCISWETAN:${kode}`;
export function dariQR(teks) {
  const m = String(teks || '').toUpperCase().match(/KW-?[0-9A-Z]{4}-?[0-9A-Z]{4}/);
  return m ? m[0] : String(teks || '');
}

/** Ketik bertahap: sisipkan tanda hubung otomatis. */
export function ketikKode(s) {
  let t = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (t.startsWith('KW')) t = t.slice(2);
  t = t.slice(0, 8);
  if (!t) return '';
  return 'KW-' + (t.length > 4 ? `${t.slice(0, 4)}-${t.slice(4)}` : t);
}

// ---------- Data pembeli lain (rekaan, deterministik per acara) ----------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

const DEPAN = ['Sari', 'Dimas', 'Ayu', 'Rizky', 'Wulan', 'Fajar', 'Nanda', 'Galih', 'Putri', 'Yoga', 'Intan', 'Bima', 'Rara', 'Aldi', 'Tiara', 'Hendra', 'Mega', 'Arif', 'Nisa', 'Satria', 'Dewi', 'Rendi', 'Lintang', 'Bagus'];
const INISIAL = 'ABDHKMNPRSTW';

const tembolok = new Map();
/** Daftar tiket pembeli lain untuk satu acara: { kode → { kategori, pemegang, tiba (ofset 0..1 atau null), dialihkan } } */
export function pembeliLain(slug) {
  if (tembolok.has(slug)) return tembolok.get(slug);
  const acara = ACARA.find((a) => a.slug === slug);
  const rng = mulberry32(hash(slug));
  const peta = new Map();
  const ada = new Set();
  const urut = [];
  for (const kat of acara.tiket) {
    for (let i = 0; i < kat.terjual; i++) {
      const kode = buatKode(ada, rng); ada.add(kode);
      const nama = `${DEPAN[Math.floor(rng() * DEPAN.length)]} ${INISIAL[Math.floor(rng() * INISIAL.length)]}.`;
      // 86% datang; waktu tiba condong ke awal (akar kuadrat) dalam 0..0.85 durasi
      const datang = rng() < 0.86;
      const tiba = datang ? Math.sqrt(rng()) * 0.85 : null;
      const data = { kode, kategori: kat.id, pemegang: nama, tiba, gerbang: rng() < 0.62 ? 'A' : 'B', dialihkan: false };
      peta.set(kode, data); urut.push(data);
    }
  }
  // Beberapa kode lama yang sudah dialihkan pemiliknya (hangus).
  const hangus = [];
  for (let i = 0; i < 3; i++) {
    const kode = buatKode(ada, rng); ada.add(kode);
    const data = { kode, kategori: acara.tiket[0].id, pemegang: `${DEPAN[(i * 7) % DEPAN.length]} ${INISIAL[i]}.`, tiba: null, dialihkan: true };
    peta.set(kode, data); hangus.push(data);
  }
  const hasil = { peta, urut, hangus };
  tembolok.set(slug, hasil);
  return hasil;
}

/** Waktu tiba absolut pembeli lain (atau null bila tidak datang), dipetakan ke jam buka acara. */
export function waktuTiba(acara, data, sekarang) {
  if (data.tiba == null) return null;
  const w = jendela(acara, sekarang);
  const total = w.reduce((n, [a, b]) => n + (b - a), 0);
  let sisa = data.tiba * total;
  for (const [a, b] of w) { if (sisa <= b - a) return Math.round(a + sisa); sisa -= b - a; }
  return w[w.length - 1][1];
}

/** Cari pemilik kode di seluruh acara (untuk pesan "tiket acara lain"). */
export function cariAcaraKode(kode) {
  for (const a of ACARA) if (pembeliLain(a.slug).peta.has(kode)) return a.slug;
  return null;
}

/**
 * Riwayat pemeriksaan contoh dari petugas lain (deterministik): kedatangan sah, sesekali tiket ganda,
 * dan beberapa kode lama yang sudah dialihkan. Hanya yang waktunya sudah lewat. Terbaru dulu.
 */
export function riwayatContoh(acara, sekarang) {
  const { urut, hangus } = pembeliLain(acara.slug);
  const hasil = [];
  for (let i = 0; i < urut.length; i++) {
    const d = urut[i];
    const w = waktuTiba(acara, d, sekarang);
    if (w == null) continue;
    hasil.push({ waktu: w, kode: d.kode, hasil: 'sah', gerbang: d.gerbang, pemegang: d.pemegang, kategori: d.kategori, contoh: true });
    if (i % 23 === 5) hasil.push({ waktu: w + (6 + (i % 29)) * MENIT, kode: d.kode, hasil: 'ganda', gerbang: d.gerbang === 'A' ? 'B' : 'A', pemegang: d.pemegang, kategori: d.kategori, contoh: true });
  }
  hangus.forEach((d, i) => {
    const w = waktuTiba(acara, { tiba: 0.18 + i * 0.27 }, sekarang);
    hasil.push({ waktu: w, kode: d.kode, hasil: 'dialihkan', gerbang: i % 2 ? 'B' : 'A', pemegang: d.pemegang, kategori: d.kategori, contoh: true });
  });
  return hasil.filter((x) => x.waktu <= sekarang).sort((a, b) => b.waktu - a.waktu);
}

/** Kode tersamar untuk daftar: KW-7K3Q-••••. */
export const samarkan = (kode) => kode.slice(0, 8) + '••••';
