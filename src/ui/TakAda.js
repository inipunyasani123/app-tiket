// Halaman 404 bergaya karcis sobek (noindex lewat generateMetadata di rute 404 & +not-found).
import { StyleSheet, Text, View } from 'react-native';
import { Layar } from './Layar';
import { Judul, Mono, T, TombolTautan } from './dasar';
import { Takik } from './Karcis';
import { H, W } from '../lib/tema';

export function HalamanTakAda() {
  return (
    <Layar isiStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
      <View style={s.karcis}>
        <View style={s.atas}>
          <Mono warna={W.tinta2}>Karcis Wetan · gerbang ?</Mono>
          <Text style={s.angka} aria-hidden>404</Text>
          <Judul level={1} ukuran={34} warna={W.tinta}>Karcis ini tidak terdaftar</Judul>
          <T warna={W.tinta2} style={{ marginTop: 8 }}>Halaman yang kamu cari tidak ada atau sudah dipindah. Coba kembali ke daftar acara.</T>
        </View>
        <Takik latar={W.malam} ukuran={26} />
        <View style={s.bawah}>
          <View style={s.cap}><Text style={s.capTeks}>Ditolak</Text></View>
          <TombolTautan href="/" replace varian="gelap" label="Lihat semua acara" style={{ flex: 1 }} />
        </View>
      </View>
    </Layar>
  );
}

const s = StyleSheet.create({
  karcis: { backgroundColor: W.kertas, borderRadius: 22, overflow: 'hidden', transform: [{ rotate: '-1.5deg' }] },
  atas: { padding: 22, gap: 4 },
  angka: { fontFamily: H.display, fontSize: 120, lineHeight: 112, color: W.jinggaTua, marginTop: 6 },
  bawah: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  cap: { borderWidth: 3, borderColor: W.merahTua, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-8deg' }] },
  capTeks: { fontFamily: H.display, fontSize: 24, color: W.merahTua, textTransform: 'uppercase', letterSpacing: 1 },
});
