import { meta } from '../src/lib/meta';
import { HalamanTakAda } from '../src/ui/TakAda';

export function generateMetadata() {
  return meta({ judul: 'Halaman tidak ditemukan | Karcis Wetan', deskripsi: 'Halaman ini tidak ada di demo Karcis Wetan. Kembali ke daftar acara untuk mencari tiket.', jalur: '/404', noindex: true });
}

export default HalamanTakAda;
