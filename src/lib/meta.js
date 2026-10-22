// Metadata statis per rute (dibaca Expo Router saat build lewat generateMetadata).
import { MEREK } from '../data/acara';

const OG = `${MEREK.url}/og.jpg`;

export function meta({ judul, deskripsi, jalur = '/', noindex = false }) {
  if (judul.length > 60) throw new Error(`Judul > 60 karakter: ${judul}`);
  if (deskripsi.length > 155) throw new Error(`Deskripsi > 155 karakter (${deskripsi.length}): ${deskripsi}`);
  const url = MEREK.url + jalur;
  return {
    title: judul,
    description: deskripsi,
    applicationName: MEREK.nama,
    authors: [{ name: 'PintuWeb', url: 'https://www.pintuweb.id' }],
    creator: 'PintuWeb',
    publisher: 'PintuWeb',
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    openGraph: {
      type: 'website', locale: 'id_ID', url, siteName: MEREK.nama, title: judul, description: deskripsi,
      images: [{ url: OG, width: 1200, height: 630, alt: 'Karcis Wetan: e-tiket kertas dengan QR dan poster riso, demo aplikasi buatan PintuWeb' }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: [OG] },
    appleWebApp: { title: MEREK.nama, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
  };
}
