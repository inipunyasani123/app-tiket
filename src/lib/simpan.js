// Penyimpanan di perangkat (AsyncStorage → localStorage di web). Tanpa server.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buatKode, pembeliLain } from './kode';
import { ACARA, cariAcara } from '../data/acara';

const KUNCI = 'karcis-wetan:v1';

const KOSONG = { versi: 1, pesanan: [], tiket: [], masuk: {}, log: [], disimpan: [], pengantar: false, setel: { bunyi: false, getar: true }, dimuat: false };

function semuaKode(s) {
  const ada = new Set(s.tiket.map((t) => t.kode));
  ACARA.forEach((a) => pembeliLain(a.slug).peta.forEach((_, k) => ada.add(k)));
  return ada;
}

function kurangi(s, aksi) {
  switch (aksi.t) {
    case 'muat':
      return { ...KOSONG, ...aksi.data, dimuat: true };
    case 'beli': {
      const tiketBaru = aksi.pemegang.map((nama, i) => ({ kode: aksi.kode[i], acara: aksi.acara, kategori: aksi.kategori, pemegang: nama, pesanan: aksi.id, dibuat: aksi.waktu, status: 'aktif', dompet: false, pengingat: [] }));
      const pesanan = { id: aksi.id, acara: aksi.acara, kategori: aksi.kategori, jumlah: aksi.pemegang.length, total: aksi.total, metode: aksi.metode, pemesan: aksi.pemesan, waktu: aksi.waktu };
      return { ...s, pesanan: [pesanan, ...s.pesanan], tiket: [...tiketBaru, ...s.tiket] };
    }
    case 'ubahTiket':
      return { ...s, tiket: s.tiket.map((t) => (t.kode === aksi.kode ? { ...t, ...aksi.ubah } : t)) };
    case 'alihkan': {
      const lama = s.tiket.find((t) => t.kode === aksi.kode);
      if (!lama || lama.status !== 'aktif') return s;
      const { kodeBaru } = aksi;
      const baru = { ...lama, kode: kodeBaru, pemegang: aksi.nama, asal: lama.kode, milikTeman: true, dibuat: aksi.waktu, dompet: false, pengingat: [], status: 'aktif' };
      return {
        ...s,
        tiket: [baru, ...s.tiket.map((t) => (t.kode === lama.kode ? { ...t, status: 'dialihkan', dialihkanKe: { nama: aksi.nama, kontak: aksi.kontak, waktu: aksi.waktu, kodeBaru } } : t))],
      };
    }
    case 'terima': {
      if (s.tiket.some((t) => t.kode === aksi.tiket.kode)) return s;
      return { ...s, tiket: [{ ...aksi.tiket, status: 'aktif', dompet: false, pengingat: [], diterima: aksi.waktu }, ...s.tiket] };
    }
    case 'masuk': {
      const perAcara = { ...(s.masuk[aksi.acara] || {}), [aksi.kode]: { waktu: aksi.waktu, gerbang: aksi.gerbang, ...(aksi.alasan ? { manual: aksi.alasan } : {}) } };
      return { ...s, masuk: { ...s.masuk, [aksi.acara]: perAcara } };
    }
    case 'batalMasuk': {
      const perAcara = { ...(s.masuk[aksi.acara] || {}) }; delete perAcara[aksi.kode];
      return { ...s, masuk: { ...s.masuk, [aksi.acara]: perAcara }, log: s.log.filter((l) => l.id !== aksi.logId) };
    }
    case 'simpanAcara':
      return { ...s, disimpan: s.disimpan.includes(aksi.slug) ? s.disimpan.filter((x) => x !== aksi.slug) : [...s.disimpan, aksi.slug] };
    case 'atur':
      return { ...s, ...aksi.ubah };
    case 'log':
      return { ...s, log: [aksi.entri, ...s.log].slice(0, 60) };
    case 'resetPanitia': {
      const masuk = { ...s.masuk }; delete masuk[aksi.acara];
      return { ...s, masuk, log: s.log.filter((l) => l.acara !== aksi.acara) };
    }
    case 'hapusSemua':
      return { ...KOSONG, dimuat: true, pengantar: true, ...aksi.contoh };
    default:
      return s;
  }
}

// Satu tiket contoh supaya halaman "Tiket" langsung bisa dicoba.
function contohAwal(waktu) {
  const kode = buatKode(semuaKode({ tiket: [] }));
  return {
    pesanan: [{ id: 'P-CONTOH', acara: 'pameran-cetak-saring', kategori: 'masuk', jumlah: 1, total: 0, metode: 'gratis', pemesan: { nama: 'Pengunjung Demo', email: 'kamu@contoh.id', wa: '' }, waktu }],
    tiket: [{ kode, acara: 'pameran-cetak-saring', kategori: 'masuk', pemegang: 'Pengunjung Demo', pesanan: 'P-CONTOH', dibuat: waktu, status: 'aktif', dompet: true, pengingat: [], contoh: true }],
  };
}

const Konteks = createContext(null);

export function PenyediaData({ children }) {
  const [s, kirim] = useReducer(kurangi, KOSONG);
  const siap = useRef(false);
  const terkini = useRef(s);
  terkini.current = s;

  useEffect(() => {
    let batal = false;
    (async () => {
      let data = null;
      try { const mentah = await AsyncStorage.getItem(KUNCI); data = mentah ? JSON.parse(mentah) : null; } catch { data = null; }
      if (batal) return;
      if (!data || data.versi !== 1) data = { versi: 1, masuk: {}, log: [], ...contohAwal(Date.now()) };
      kirim({ t: 'muat', data });
      siap.current = true;
    })();
    return () => { batal = true; };
  }, []);

  useEffect(() => {
    if (!siap.current || !s.dimuat) return;
    const { dimuat, ...simpan } = s;
    AsyncStorage.setItem(KUNCI, JSON.stringify(simpan)).catch(() => {});
  }, [s]);

  const beli = useCallback((data) => {
    const ada = semuaKode(terkini.current);
    const kode = data.pemegang.map(() => { const k = buatKode(ada); ada.add(k); return k; });
    kirim({ t: 'beli', ...data, kode, id: 'P-' + Date.now().toString(36).toUpperCase(), waktu: Date.now() });
    return kode;
  }, []);
  const ubahTiket = useCallback((kode, ubah) => kirim({ t: 'ubahTiket', kode, ubah }), []);
  const alihkan = useCallback((kode, nama, kontak) => {
    const kodeBaru = buatKode(semuaKode(terkini.current));
    kirim({ t: 'alihkan', kode, nama, kontak, kodeBaru, waktu: Date.now() });
    return kodeBaru;
  }, []);
  const terima = useCallback((tiket) => kirim({ t: 'terima', tiket, waktu: Date.now() }), []);
  const catatMasuk = useCallback((acara, kode, gerbang, alasan) => kirim({ t: 'masuk', acara, kode, gerbang, alasan, waktu: Date.now() }), []);
  const catatLog = useCallback((entri) => { const id = Math.random().toString(36).slice(2); kirim({ t: 'log', entri: { ...entri, waktu: Date.now(), id } }); return id; }, []);
  const batalMasuk = useCallback((acara, kode, logId) => kirim({ t: 'batalMasuk', acara, kode, logId }), []);
  const simpanAcara = useCallback((slug) => kirim({ t: 'simpanAcara', slug }), []);
  const atur = useCallback((ubah) => kirim({ t: 'atur', ubah }), []);
  const resetPanitia = useCallback((acara) => kirim({ t: 'resetPanitia', acara }), []);
  const hapusSemua = useCallback(() => kirim({ t: 'hapusSemua', contoh: contohAwal(Date.now()) }), []);

  const nilai = useMemo(() => ({ ...s, beli, ubahTiket, alihkan, terima, catatMasuk, catatLog, batalMasuk, simpanAcara, atur, resetPanitia, hapusSemua }), [s, beli, ubahTiket, alihkan, terima, catatMasuk, catatLog, batalMasuk, simpanAcara, atur, resetPanitia, hapusSemua]);
  return createElement(Konteks.Provider, { value: nilai }, children);
}

export function useData() {
  return useContext(Konteks);
}

/** Jumlah terjual = data dasar + pembelian di perangkat ini (tiket hasil alih tidak dihitung dua kali). */
export function terjual(data, slug, kategoriId) {
  const acara = cariAcara(slug);
  const kat = acara.tiket.find((t) => t.id === kategoriId);
  const milikku = data.dimuat ? data.tiket.filter((t) => t.acara === slug && t.kategori === kategoriId && !t.asal && !t.contoh).length : 0;
  return Math.min(kat.kuota, kat.terjual + milikku);
}
