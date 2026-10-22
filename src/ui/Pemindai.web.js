// Pemindai QR di web: kamera lewat getUserMedia, deteksi dengan BarcodeDetector bawaan peramban;
// bila tidak ada (mis. Safari/Firefox), jsQR dimuat terpisah hanya saat kamera dinyalakan.
import { createElement, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { H, W } from '../lib/tema';
import { Tombol } from './dasar';
import { Ikon } from './Ikon';

export function Pemindai({ onKode }) {
  const [aktif, setAktif] = useState(false);
  const [pesan, setPesan] = useState('');
  const video = useRef(null);
  const alir = useRef(null);
  const jalan = useRef(false);
  const terakhir = useRef(0);
  const panggil = useRef(onKode);
  panggil.current = onKode;

  const matikan = () => {
    jalan.current = false;
    alir.current?.getTracks().forEach((t) => t.stop());
    alir.current = null;
    setAktif(false);
  };
  useEffect(() => matikan, []);

  async function nyalakan() {
    setPesan('');
    if (!navigator.mediaDevices?.getUserMedia) { setPesan('Kamera tidak tersedia di peramban ini. Pakai input kode di bawah.'); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      alir.current = s;
      setAktif(true);
      requestAnimationFrame(() => mulai(s));
    } catch (e) {
      setPesan(e?.name === 'NotAllowedError' ? 'Izin kamera ditolak. Tidak apa-apa, kode bisa diketik di bawah.' : 'Kamera tidak bisa dibuka. Pakai input kode di bawah.');
    }
  }

  async function mulai(s) {
    const v = video.current;
    if (!v) return;
    v.srcObject = s;
    await v.play().catch(() => {});
    jalan.current = true;
    let deteksi;
    if ('BarcodeDetector' in window) {
      const d = new window.BarcodeDetector({ formats: ['qr_code'] });
      deteksi = async () => (await d.detect(v))[0]?.rawValue;
    } else {
      const jsQR = (await import('jsqr')).default;
      const kanvas = document.createElement('canvas');
      const ctx = kanvas.getContext('2d', { willReadFrequently: true });
      deteksi = async () => {
        const w = 480, h = Math.round((v.videoHeight / v.videoWidth) * 480) || 360;
        kanvas.width = w; kanvas.height = h;
        ctx.drawImage(v, 0, 0, w, h);
        return jsQR(ctx.getImageData(0, 0, w, h).data, w, h)?.data;
      };
    }
    const putar = async () => {
      if (!jalan.current) return;
      try {
        if (v.readyState >= 2 && Date.now() - terakhir.current > 1800) {
          const isi = await deteksi();
          if (isi) { terakhir.current = Date.now(); panggil.current(isi); }
        }
      } catch { /* bingkai dilewati */ }
      setTimeout(putar, 220);
    };
    putar();
  }

  return (
    <View style={{ gap: 10 }}>
      {aktif ? (
        <View style={s.kotak}>
          {createElement('video', { ref: video, muted: true, playsInline: true, 'aria-label': 'Pratinjau kamera pemindai', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })}
          <View style={s.bidik} pointerEvents="none" />
          <Text style={s.petunjuk}>Arahkan ke QR e-tiket</Text>
        </View>
      ) : null}
      <Tombol
        varian={aktif ? 'garis' : 'kertas'}
        label={aktif ? 'Matikan kamera' : 'Pindai QR dengan kamera'}
        kiri={<Ikon nama="kamera" warna={aktif ? W.terang : W.tinta} ukuran={20} />}
        onPress={aktif ? matikan : nyalakan}
      />
      {pesan ? <Text style={s.pesan} role="status">{pesan}</Text> : <Text style={s.catatan}>Opsional: kamera hanya dinyalakan saat kamu menekan tombol ini.</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  kotak: { height: 240, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  bidik: { position: 'absolute', top: '15%', left: '22%', right: '22%', bottom: '15%', borderWidth: 3, borderColor: W.kuning, borderRadius: 16 },
  petunjuk: { position: 'absolute', bottom: 10, alignSelf: 'center', fontFamily: H.tebal, fontSize: 13, color: W.kertas, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pesan: { fontFamily: H.tebal, fontSize: 13.5, color: W.kuning },
  catatan: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
});
