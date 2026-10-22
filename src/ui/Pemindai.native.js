// Pemindai QR di Android/iOS memakai expo-camera. Izin kamera diminta hanya saat tombol ditekan.
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { H, W } from '../lib/tema';
import { Tombol } from './dasar';
import { Ikon } from './Ikon';

export function Pemindai({ onKode }) {
  const [izin, minta] = useCameraPermissions();
  const [aktif, setAktif] = useState(false);
  const [pesan, setPesan] = useState('');
  const terakhir = useRef(0);

  async function nyalakan() {
    setPesan('');
    const r = izin?.granted ? izin : await minta();
    if (!r?.granted) { setPesan('Izin kamera ditolak. Tidak apa-apa, kode bisa diketik di bawah.'); return; }
    setAktif(true);
  }

  return (
    <View style={{ gap: 10 }}>
      {aktif ? (
        <View style={s.kotak}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (Date.now() - terakhir.current < 1800) return;
              terakhir.current = Date.now();
              onKode(data);
            }}
          />
          <View style={s.bidik} pointerEvents="none" />
        </View>
      ) : null}
      <Tombol
        varian={aktif ? 'garis' : 'kertas'}
        label={aktif ? 'Matikan kamera' : 'Pindai QR dengan kamera'}
        kiri={<Ikon nama="kamera" warna={aktif ? W.terang : W.tinta} ukuran={20} />}
        onPress={aktif ? () => setAktif(false) : nyalakan}
      />
      {pesan ? <Text style={s.pesan}>{pesan}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  kotak: { height: 240, borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  bidik: { position: 'absolute', top: '15%', left: '22%', right: '22%', bottom: '15%', borderWidth: 3, borderColor: W.kuning, borderRadius: 16 },
  pesan: { fontFamily: H.tebal, fontSize: 13.5, color: W.kuning },
});
