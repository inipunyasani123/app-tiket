// Foto suasana di Android/iOS. Berkas yang sama dibundel sebagai aset aplikasi.
import { Image } from 'react-native';

const BERKAS = {
  'pameran-cetak-saring': require('../../public/images/acara/pameran-cetak-saring-840.webp'),
  'komedi-pojok-pendopo': require('../../public/images/acara/komedi-pojok-pendopo-840.webp'),
  'malam-gending-elektrik': require('../../public/images/acara/malam-gending-elektrik-840.webp'),
  'seminar-umkm-naik-kelas': require('../../public/images/acara/seminar-umkm-naik-kelas-840.webp'),
  'pasar-rasa-brantas': require('../../public/images/acara/pasar-rasa-brantas-840.webp'),
  'lari-pagi-lereng-5k': require('../../public/images/acara/lari-pagi-lereng-5k-840.webp'),
};

export function Foto({ slug, alt, style }) {
  return <Image source={BERKAS[slug]} accessibilityLabel={alt} style={[{ width: '100%', aspectRatio: 840 / 473 }, style]} resizeMode="cover" />;
}
