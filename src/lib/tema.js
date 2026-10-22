// Token warna & huruf Karcis Wetan: "malam pertunjukan" + karcis cetak riso.
// Semua pasangan teks sudah diuji kontras ≥4.5:1 (lihat README bagian Aksesibilitas).
export const W = {
  malam: '#15121f', // latar aplikasi
  malam2: '#1f1a2e', // permukaan
  malam3: '#2a2340', // permukaan timbul
  garis: '#3b3354',
  kertas: '#f4ecdc', // kertas karcis
  kertas2: '#e8dcc4',
  tinta: '#1b1724', // teks di atas kertas
  tinta2: '#4a4257',
  terang: '#f4ecdc', // teks utama di latar malam
  redup: '#a89fbd', // teks sekunder di latar malam
  jingga: '#ff6a2b', // tinta riso utama
  jinggaTua: '#a8390b', // jingga untuk teks di atas kertas
  pink: '#ff5fa2',
  pinkTua: '#b0245f',
  biru: '#5b86ff',
  biruTua: '#2446b8',
  hijau: '#3ddc97',
  hijauTua: '#0b6e44',
  kuning: '#ffd23f',
  merah: '#ff5a5f',
  merahTua: '#b3252b',
};

// Nama keluarga huruf sama di web (@font-face di +html.js) dan native (expo-font).
export const H = {
  display: 'BigShoulders_800ExtraBold',
  badan: 'SchibstedGrotesk_400Regular',
  tebal: 'SchibstedGrotesk_700Bold',
  mono: 'JetBrainsMono_600SemiBold',
};

// Pasangan tinta riso per acara (poster dua warna).
export const TINTA = {
  pink: { a: W.pink, b: W.biru, teks: W.pinkTua },
  kuning: { a: W.kuning, b: W.biru, teks: W.biruTua },
  jingga: { a: W.jingga, b: W.biru, teks: W.jinggaTua },
  hijau: { a: W.hijau, b: W.jingga, teks: W.hijauTua },
  biru: { a: W.biru, b: W.kuning, teks: W.biruTua },
  merah: { a: W.merah, b: W.biru, teks: W.merahTua },
};
