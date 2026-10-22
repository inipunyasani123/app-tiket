// Semua logika waktu memakai WIB (UTC+7), tidak bergantung zona waktu perangkat.
import { useEffect, useSyncExternalStore } from 'react';

export const MENIT = 60_000;
export const JAM = 60 * MENIT;
export const HARI = 24 * JAM;
const OFSET = 7 * JAM;

const HARI_NAMA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const d = (ts) => new Date(ts + OFSET); // baca dengan getUTC*
const dua = (n) => String(n).padStart(2, '0');

export function awalHari(ts) {
  return Math.floor((ts + OFSET) / HARI) * HARI - OFSET;
}

/** Stempel waktu untuk "hari ini + ofset hari, pukul jam:menit WIB". */
export function padaWIB(sekarang, ofsetHari, jam, menit = 0) {
  return awalHari(sekarang) + ofsetHari * HARI + jam * JAM + menit * MENIT;
}

export const fmtJam = (ts) => { const x = d(ts); return `${dua(x.getUTCHours())}.${dua(x.getUTCMinutes())}`; };
export const fmtHari = (ts) => HARI_NAMA[d(ts).getUTCDay()];
export const fmtHariPendek = (ts) => HARI_PENDEK[d(ts).getUTCDay()];
export const fmtTgl = (ts) => { const x = d(ts); return `${x.getUTCDate()} ${BULAN_PENDEK[x.getUTCMonth()]}`; };
export const fmtTglPanjang = (ts) => { const x = d(ts); return `${HARI_NAMA[x.getUTCDay()]}, ${x.getUTCDate()} ${BULAN[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
export const fmtTglAngka = (ts) => { const x = d(ts); return { tgl: x.getUTCDate(), bulan: BULAN_PENDEK[x.getUTCMonth()], hari: HARI_PENDEK[x.getUTCDay()] }; };
/** "Kam–Jum, 22–23 Okt 2026" untuk acara beberapa hari. */
export function fmtRentang(a, b) {
  const x = d(a), y = d(b);
  const bulanSama = x.getUTCMonth() === y.getUTCMonth();
  const tgl = bulanSama ? `${x.getUTCDate()}–${y.getUTCDate()} ${BULAN_PENDEK[y.getUTCMonth()]}` : `${x.getUTCDate()} ${BULAN_PENDEK[x.getUTCMonth()]}–${y.getUTCDate()} ${BULAN_PENDEK[y.getUTCMonth()]}`;
  return `${HARI_PENDEK[x.getUTCDay()]}–${HARI_PENDEK[y.getUTCDay()]}, ${tgl} ${y.getUTCFullYear()}`;
}
export const fmtStempel = (ts) => `${fmtTgl(ts)} · ${fmtJam(ts)} WIB`;

/** "hari ini", "besok", "lusa", "dalam 5 hari", atau "3 hari lalu". */
export function kapan(ts, sekarang) {
  const selisih = Math.round((awalHari(ts) - awalHari(sekarang)) / HARI);
  if (selisih === 0) return 'hari ini';
  if (selisih === 1) return 'besok';
  if (selisih === 2) return 'lusa';
  if (selisih > 0) return `dalam ${selisih} hari`;
  if (selisih === -1) return 'kemarin';
  return `${-selisih} hari lalu`;
}

/** Hitung mundur ringkas: "3 hari 4 jam", "2 jam 10 menit", "8 menit". */
export function hitungMundur(ms) {
  if (ms <= 0) return '0 menit';
  const h = Math.floor(ms / HARI);
  const j = Math.floor((ms % HARI) / JAM);
  const m = Math.floor((ms % JAM) / MENIT);
  if (h > 0) return j > 0 ? `${h} hari ${j} jam` : `${h} hari`;
  if (j > 0) return m > 0 ? `${j} jam ${m} menit` : `${j} jam`;
  return `${Math.max(1, m)} menit`;
}

export function relatifLalu(ts, sekarang) {
  const s = sekarang - ts;
  if (s < MENIT) return 'baru saja';
  if (s < JAM) return `${Math.floor(s / MENIT)} menit lalu`;
  if (s < HARI) return `${Math.floor(s / JAM)} jam lalu`;
  return fmtStempel(ts);
}

// Jam bersama. Saat render statis & hidrasi bernilai null (cegah ketidakcocokan HTML),
// setelah itu berdetak tiap 15 detik (atau tiap detik bila ada pemakai yang minta).
let nilai = null;
const pendengar = new Set();
let detik = 0;
let pewaktu = null;
function jalankan() {
  clearInterval(pewaktu);
  pewaktu = setInterval(() => { nilai = Date.now(); pendengar.forEach((f) => f()); }, detik > 0 ? 1000 : 15000);
}
function langganan(f) {
  pendengar.add(f);
  if (!pewaktu) { nilai = Date.now(); jalankan(); queueMicrotask(() => pendengar.forEach((g) => g())); }
  return () => { pendengar.delete(f); if (!pendengar.size) { clearInterval(pewaktu); pewaktu = null; } };
}
const ambil = () => nilai;
const ambilServer = () => null;

/** Waktu sekarang (ms) atau null sebelum hidrasi selesai. */
export function useSekarang(perDetik = false) {
  const v = useSyncExternalStore(langganan, ambil, ambilServer);
  useDetik(perDetik);
  return v;
}

function useDetik(aktif) {
  useEffect(() => {
    if (!aktif) return undefined;
    detik += 1; jalankan();
    return () => { detik -= 1; if (pewaktu) jalankan(); };
  }, [aktif]);
}
