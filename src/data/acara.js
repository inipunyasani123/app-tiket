// Data acara rekaan. Jadwal ditulis sebagai ofset dari "hari ini" (WIB) agar demo selalu terasa baru.
// Semua nama penampil, pembicara, dan kolektif di bawah ini rekaan.
import { padaWIB } from '../lib/waktu';

export const MEREK = {
  nama: 'Karcis Wetan',
  tagline: 'Tiket acara Jawa Timur, dari pesan sampai sobek di gerbang',
  url: 'https://app-tiket.pintuweb.id',
  slug: 'tiket',
};

export const KATEGORI = [
  { id: 'semua', label: 'Semua' },
  { id: 'musik', label: 'Musik' },
  { id: 'seminar', label: 'Seminar' },
  { id: 'kuliner', label: 'Kuliner' },
  { id: 'olahraga', label: 'Lari' },
  { id: 'seni', label: 'Seni' },
  { id: 'komedi', label: 'Komedi' },
];

export const BIAYA_LAYANAN = 2500; // per tiket berbayar (rekaan)
export const MAKS_PER_PESANAN = 4;

export const ACARA = [
  {
    slug: 'pameran-cetak-saring',
    jenis: 'pameran seni cetak',
    gerbang: { masuk: 'A', kelas: 'B' },
    denah: null,
    foto: 'Cetakan sablon bermotif bulat dengan tinta merah muda di atas latar gelap',
    judul: 'Pameran Cetak Saring & Zine',
    baris: ['CETAK', 'SARING'],
    kategori: 'seni',
    kota: 'Malang',
    tempat: 'Gudang seni di kawasan kota lama Malang',
    tinta: 'pink',
    poster: 'saring',
    ringkas: 'Tiga hari, seratus lebih karya sablon, poster, dan zine dari kolektif muda Jawa Timur. Masuk gratis, wajib daftar.',
    deskripsi: [
      'Pameran tiga hari untuk karya cetak saring (sablon), poster tempel, dan zine buatan tangan. Kamu bisa melihat proses mencetak langsung di meja kerja terbuka dan membawa pulang cetakan edisi terbatas.',
      'Tiket masuk gratis dan berlaku satu kali masuk di salah satu hari. Kuota dibatasi agar ruang tetap lega. Kelas cetak 90 menit memakai tinta berbasis air; semua bahan disediakan.',
    ],
    mulai: [-1, 9, 0],
    selesai: [1, 21, 0],
    pintu: [-1, 9, 0],
    harian: [9, 0, 21, 0],
    usia: 'Semua umur',
    pengisi: [
      { nama: 'Kolektif Tinta Liar', peran: 'Kurator pameran', gaya: { rambut: 'ikal', kulit: 2, warna: 'pink', properti: 'rakel' } },
      { nama: 'Studio Saring Sore', peran: 'Kelas cetak', gaya: { rambut: 'topi', kulit: 1, warna: 'kuning', properti: 'kacamata' } },
      { nama: 'Arsip Zine Brantas', peran: 'Lapak zine', gaya: { rambut: 'kerudung', kulit: 3, warna: 'biru', properti: null } },
    ],
    rundown: [
      [-1, 9, 0, 'Pintu dibuka, pameran berjalan'],
      [-1, 10, 30, 'Kelas cetak sesi 1 (90 menit)'],
      [0, 9, 0, 'Pintu dibuka'],
      [0, 16, 0, 'Bincang kolektif: dari fotokopi ke sablon'],
      [1, 9, 0, 'Pintu dibuka'],
      [1, 13, 0, 'Kelas cetak sesi 2 (90 menit)'],
      [1, 21, 0, 'Pameran ditutup'],
    ],
    tiket: [
      { id: 'masuk', nama: 'Masuk Gratis', harga: 0, kuota: 400, terjual: 233, catatan: 'Wajib daftar, satu kali masuk di salah satu hari' },
      { id: 'kelas', nama: 'Kelas Cetak 90 Menit', harga: 65000, kuota: 24, terjual: 19, catatan: 'Termasuk kaos polos & tinta' },
    ],
    syarat: ['Tunjukkan QR di gerbang; satu kode untuk satu orang.', 'Kelas cetak dimulai tepat waktu, datang 15 menit lebih awal.'],
  },
  {
    slug: 'komedi-pojok-pendopo',
    jenis: 'pertunjukan komedi tunggal',
    gerbang: { reguler: 'A', depan: 'B' },
    denah: 'komedi',
    foto: 'Mikrofon di atas tiang dengan cahaya panggung kebiruan di belakangnya',
    judul: 'Komedi Tunggal: Pojok Pendopo',
    baris: ['POJOK', 'PENDOPO'],
    kategori: 'komedi',
    kota: 'Surabaya',
    tempat: 'Ruang pertunjukan kecil di pusat kota Surabaya',
    tinta: 'biru',
    poster: 'komedi',
    ringkas: 'Tiga komika rekaan membawakan materi tentang hidup di kota pelabuhan. Kursi terbatas, tanpa kursi berdiri.',
    deskripsi: [
      'Malam komedi tunggal dengan format pertunjukan penuh: tiga penampil, masing-masing 25 menit, ditutup sesi tanya-jawab santai. Materi berbahasa Indonesia dengan sentuhan Suroboyoan.',
      'Kursi diatur bebas sesuai kategori. Pertunjukan untuk usia 17 tahun ke atas.',
    ],
    mulai: [1, 20, 0],
    selesai: [1, 22, 0],
    pintu: [1, 19, 15],
    usia: '17+',
    pengisi: [
      { nama: 'Tegar Wiranata', peran: 'Komika', gaya: { rambut: 'cepak', kulit: 3, warna: 'biru', properti: 'mik' } },
      { nama: 'Nindya Paramitha', peran: 'Komika', gaya: { rambut: 'panjang', kulit: 1, warna: 'kuning', properti: 'mik' } },
      { nama: 'Bayu Sasongko', peran: 'Pembawa acara', gaya: { rambut: 'botak', kulit: 2, warna: 'pink', properti: 'kacamata' } },
    ],
    rundown: [
      [1, 19, 15, 'Pintu dibuka'],
      [1, 20, 0, 'Pembukaan oleh pembawa acara'],
      [1, 20, 10, 'Tiga penampil, masing-masing 25 menit'],
      [1, 21, 40, 'Tanya-jawab & foto bersama'],
    ],
    tiket: [
      { id: 'reguler', nama: 'Kursi Reguler', harga: 60000, kuota: 180, terjual: 166, catatan: 'Kursi bebas di area tengah & belakang' },
      { id: 'depan', nama: 'Kursi Depan', harga: 95000, kuota: 40, terjual: 40, catatan: 'Tiga baris terdepan' },
    ],
    syarat: ['Usia 17 tahun ke atas.', 'Dilarang merekam pertunjukan.'],
  },
  {
    slug: 'malam-gending-elektrik',
    jenis: 'konser musik',
    gerbang: { presale: 'A', reguler: 'A', bibir: 'B' },
    denah: 'konser',
    foto: 'Siluet penonton mengangkat tangan di depan panggung konser bercahaya jingga',
    judul: 'Malam Gending Elektrik',
    baris: ['GENDING', 'ELEKTRIK'],
    kategori: 'musik',
    kota: 'Tulungagung',
    tempat: 'Lapangan terbuka di pusat kota Tulungagung',
    tinta: 'jingga',
    poster: 'gending',
    ringkas: 'Konser musik lokal semalam: keroncong distorsi, gamelan elektronik, dan folk tiga suara di lapangan terbuka.',
    deskripsi: [
      'Konser musik lokal yang mempertemukan gamelan, synthesizer, dan gitar akustik dalam satu panggung terbuka. Tiga penampil rekaan membawakan set masing-masing 45 menit, ditutup kolaborasi bersama.',
      'Area makan & minum tersedia di sisi lapangan. Bawa jaket; angin malam di lapangan cukup kencang.',
    ],
    mulai: [4, 19, 0],
    selesai: [4, 23, 0],
    pintu: [4, 17, 30],
    usia: 'Semua umur (anak di bawah 12 tahun didampingi)',
    pengisi: [
      { nama: 'Orkes Pinggir Kali', peran: 'Keroncong distorsi', gaya: { rambut: 'topi', kulit: 2, warna: 'jingga', properti: 'gitar' } },
      { nama: 'Sinden Sintetis', peran: 'Duo gamelan elektronik', gaya: { rambut: 'sanggul', kulit: 1, warna: 'pink', properti: 'mik' } },
      { nama: 'Kembang Lawe', peran: 'Folk tiga suara', gaya: { rambut: 'kerudung', kulit: 3, warna: 'hijau', properti: 'gitar' } },
    ],
    rundown: [
      [4, 17, 30, 'Pintu dibuka & area makan buka'],
      [4, 19, 0, 'Kembang Lawe'],
      [4, 20, 0, 'Sinden Sintetis'],
      [4, 21, 15, 'Orkes Pinggir Kali'],
      [4, 22, 30, 'Kolaborasi penutup'],
    ],
    tiket: [
      { id: 'presale', nama: 'Presale Lepas Landas', harga: 55000, kuota: 200, terjual: 200, catatan: 'Harga awal' },
      { id: 'reguler', nama: 'Reguler', harga: 75000, kuota: 600, terjual: 431, catatan: 'Area festival berdiri' },
      { id: 'bibir', nama: 'Bibir Panggung', harga: 140000, kuota: 120, terjual: 109, catatan: 'Area terdepan + gelang kain' },
    ],
    syarat: ['Tiket berlaku untuk satu orang, satu kali masuk.', 'Tiket bisa dialihkan sampai 2 jam sebelum acara.'],
  },
  {
    slug: 'seminar-umkm-naik-kelas',
    jenis: 'seminar usaha kecil',
    gerbang: { peserta: 'A', klinik: 'A' },
    denah: null,
    foto: 'Aula berisi deretan kursi putih yang ditata untuk seminar',
    judul: 'Seminar UMKM: Jualan Daring Tanpa Bakar Uang',
    baris: ['UMKM', 'NAIK KELAS'],
    kategori: 'seminar',
    kota: 'Kediri',
    tempat: 'Aula serbaguna di pusat kota Kediri',
    tinta: 'kuning',
    poster: 'umkm',
    ringkas: 'Seminar sehari untuk pemilik usaha kecil: foto produk dari HP, hitung harga jual, dan pembukuan sederhana.',
    deskripsi: [
      'Seminar praktis untuk pemilik usaha kecil yang ingin berjualan daring tanpa menghabiskan modal untuk iklan. Materi dibawakan tiga pembicara rekaan yang menjalankan usaha sendiri.',
      'Peserta mendapat modul cetak, makan siang, dan templat pembukuan. Kategori Klinik Toko menambah sesi konsultasi 20 menit per peserta.',
    ],
    mulai: [8, 8, 30],
    selesai: [8, 15, 0],
    pintu: [8, 7, 45],
    usia: 'Umum',
    pengisi: [
      { nama: 'Wening Kusumadewi', peran: 'Pemilik usaha keripik tempe', gaya: { rambut: 'kerudung', kulit: 2, warna: 'kuning', properti: null } },
      { nama: 'Bagas Prasetyo', peran: 'Pengelola toko daring kerajinan', gaya: { rambut: 'cepak', kulit: 1, warna: 'biru', properti: 'kacamata' } },
      { nama: 'Laras Anindita', peran: 'Pendamping pembukuan UMKM', gaya: { rambut: 'bob', kulit: 3, warna: 'hijau', properti: null } },
    ],
    rundown: [
      [8, 7, 45, 'Registrasi & sarapan ringan'],
      [8, 8, 30, 'Foto produk dari HP'],
      [8, 10, 15, 'Menghitung harga jual yang masuk akal'],
      [8, 12, 0, 'Makan siang'],
      [8, 13, 0, 'Pembukuan sederhana & klinik toko'],
    ],
    tiket: [
      { id: 'peserta', nama: 'Peserta', harga: 45000, kuota: 150, terjual: 96, catatan: 'Modul cetak + makan siang' },
      { id: 'klinik', nama: 'Peserta + Klinik Toko', harga: 110000, kuota: 30, terjual: 24, catatan: 'Tambah konsultasi 20 menit' },
    ],
    syarat: ['Bawa HP yang sudah terisi daya untuk praktik foto produk.', 'Sertifikat peserta dikirim lewat email.'],
  },
  {
    slug: 'pasar-rasa-brantas',
    jenis: 'festival kuliner',
    gerbang: { masuk: 'A', cicip: 'B' },
    denah: null,
    foto: 'Sepiring sate sayur dengan irisan tomat dan cabai, dilihat dari atas',
    judul: 'Festival Kuliner Pasar Rasa Brantas',
    baris: ['PASAR', 'RASA'],
    kategori: 'kuliner',
    kota: 'Blitar',
    tempat: 'Area terbuka tepi sungai di Blitar',
    tinta: 'hijau',
    poster: 'kuliner',
    ringkas: 'Tiga malam, empat puluh lapak UMKM: dari pecel pincuk sampai es dawet. Kupon cicip bikin keliling lebih hemat.',
    deskripsi: [
      'Festival kuliner tiga malam dengan empat puluh lapak UMKM rekaan dari Blitar dan sekitarnya. Ada panggung kecil untuk musik akustik dan demo masak setiap pukul 19.00 WIB.',
      'Tiket masuk berlaku satu kali di salah satu dari tiga malam. Paket Cicip berisi lima kupon yang bisa ditukar di lapak bertanda.',
    ],
    mulai: [11, 16, 0],
    selesai: [13, 23, 0],
    pintu: [11, 16, 0],
    harian: [16, 0, 23, 0],
    usia: 'Semua umur',
    pengisi: [
      { nama: 'Dapur Pawon Kali', peran: 'Demo masak harian', gaya: { rambut: 'topi', kulit: 3, warna: 'jingga', properti: 'sendok' } },
      { nama: 'Trio Teras', peran: 'Musik akustik', gaya: { rambut: 'ikal', kulit: 1, warna: 'hijau', properti: 'gitar' } },
    ],
    rundown: [
      [11, 16, 0, 'Malam pertama: lapak buka'],
      [11, 19, 0, 'Demo masak: sambal tumpang'],
      [12, 19, 0, 'Demo masak: pecel pincuk'],
      [13, 19, 0, 'Demo masak: es dawet'],
      [13, 23, 0, 'Festival ditutup'],
    ],
    tiket: [
      { id: 'masuk', nama: 'Masuk Sekali', harga: 10000, kuota: 3000, terjual: 1210, catatan: 'Pilih salah satu malam' },
      { id: 'cicip', nama: 'Paket Cicip (5 kupon)', harga: 50000, kuota: 500, terjual: 318, catatan: 'Masuk + 5 kupon cicip' },
    ],
    syarat: ['Kupon tidak bisa diuangkan.', 'Bawa botol minum sendiri, ada pos isi ulang gratis.'],
  },
  {
    slug: 'lari-pagi-lereng-5k',
    jenis: 'lari 5 km',
    gerbang: { umum: 'A', pelajar: 'A', santai: 'B' },
    denah: null,
    foto: 'Kaki pelari di jalan aspal dengan langit fajar kemerahan',
    judul: 'Lari Pagi Lereng 5K',
    baris: ['LERENG', '5K'],
    kategori: 'olahraga',
    kota: 'Trenggalek',
    tempat: 'Titik start di jalan desa wisata, Trenggalek',
    tinta: 'merah',
    poster: 'lari',
    ringkas: 'Lari 5 km menyusuri jalan desa dan kebun cengkih. Ada kategori pelajar dan jalan santai 2 km.',
    deskripsi: [
      'Rute 5 km melewati jalan desa, kebun cengkih, dan satu tanjakan pendek yang bisa dilalui sambil jalan. Pos air tersedia setiap 1,5 km dan tim medis siaga di garis finis.',
      'Pengambilan paket lomba (kaos, nomor dada, dan medali finis) dilakukan sehari sebelumnya; jadwal dan titik ambil dikirim lewat aplikasi.',
    ],
    mulai: [17, 5, 30],
    selesai: [17, 9, 0],
    pintu: [17, 4, 45],
    usia: '12 tahun ke atas (jalan santai semua umur)',
    pengisi: [
      { nama: 'Komunitas Lari Subuh', peran: 'Pemandu pemanasan', gaya: { rambut: 'ikat', kulit: 2, warna: 'kuning', properti: 'peluit' } },
      { nama: 'Tim Medis Siaga', peran: 'Pos kesehatan', gaya: { rambut: 'cepak', kulit: 3, warna: 'hijau', properti: null } },
    ],
    rundown: [
      [16, 13, 0, 'Pengambilan paket lomba'],
      [17, 4, 45, 'Area start dibuka'],
      [17, 5, 15, 'Pemanasan bersama'],
      [17, 5, 30, 'Start 5K'],
      [17, 5, 45, 'Start jalan santai 2K'],
      [17, 7, 30, 'Pengumuman & penutupan'],
    ],
    tiket: [
      { id: 'umum', nama: '5K Umum', harga: 120000, kuota: 800, terjual: 642, catatan: 'Kaos, nomor dada, medali' },
      { id: 'pelajar', nama: '5K Pelajar', harga: 85000, kuota: 200, terjual: 151, catatan: 'Tunjukkan kartu pelajar' },
      { id: 'santai', nama: 'Jalan Santai 2K', harga: 50000, kuota: 300, terjual: 120, catatan: 'Kaos + medali' },
    ],
    syarat: ['Peserta wajib dalam kondisi sehat.', 'Nomor dada tidak boleh dipindahtangankan tanpa alihkan tiket di aplikasi.'],
  },
];

/** Label hari statis dari ofset data (aman untuk HTML statis). */
export function labelHari(acara) {
  const a = acara.mulai[0], b = acara.selesai[0];
  if (a <= 0 && b >= 0) return 'Hari ini';
  if (a === 1) return 'Besok';
  if (a === 2) return 'Lusa';
  if (a < 0) return 'Sudah lewat';
  return `Dalam ${a} hari`;
}

/** Teks pencarian: judul, kota, jenis, tempat, pengisi. */
export const teksCari = (a) => [a.judul, a.kota, a.jenis, a.tempat, ...a.pengisi.map((p) => `${p.nama} ${p.peran}`)].join(' ').toLowerCase();

export const cariAcara = (slug) => ACARA.find((a) => a.slug === slug) || null;
export const cariTiketKat = (acara, id) => acara?.tiket.find((t) => t.id === id) || null;

/** Waktu absolut acara relatif terhadap "sekarang". */
export function jadwal(acara, sekarang) {
  const [hm, jm, mm] = acara.mulai;
  const [hs, js, ms] = acara.selesai;
  const [hp, jp, mp] = acara.pintu;
  return {
    mulai: padaWIB(sekarang, hm, jm, mm),
    selesai: padaWIB(sekarang, hs, js, ms),
    pintu: padaWIB(sekarang, hp, jp, mp),
    rundown: acara.rundown.map(([h, j, m, isi]) => ({ waktu: padaWIB(sekarang, h, j, m), isi })),
  };
}

/** Jendela buka [awal, akhir]: satu jendela, atau satu per hari untuk acara beberapa hari (`harian`). */
export function jendela(acara, sekarang) {
  const { mulai, selesai, pintu } = jadwal(acara, sekarang);
  if (!acara.harian) return [[Math.min(mulai, pintu), selesai]];
  const [jb, mb, jt, mt] = acara.harian;
  const hasil = [];
  for (let h = acara.mulai[0]; h <= acara.selesai[0]; h++) hasil.push([padaWIB(sekarang, h, jb, mb), padaWIB(sekarang, h, jt, mt)]);
  return hasil;
}

/** 'akan' | 'berlangsung' | 'jeda' (di antara hari acara) | 'selesai'. `bukaLagi` untuk jeda/akan. */
export function statusAcara(acara, sekarang) {
  const j = jendela(acara, sekarang);
  if (sekarang >= j[j.length - 1][1]) return 'selesai';
  if (sekarang < j[0][0]) return 'akan';
  if (j.some(([a, b]) => sekarang >= a && sekarang < b)) return 'berlangsung';
  return 'jeda';
}
export function bukaBerikut(acara, sekarang) {
  const w = jendela(acara, sekarang).find(([a]) => a > sekarang);
  return w ? w[0] : null;
}

/** Waktu acuan pengingat: mulai acara, atau jendela buka berikutnya untuk acara beberapa hari. */
export function mulaiAcuan(acara, sekarang) {
  if (acara.harian) return bukaBerikut(acara, sekarang);
  const { mulai } = jadwal(acara, sekarang);
  return mulai > sekarang ? mulai : null;
}

export const hargaMulai = (acara) => {
  const tersedia = acara.tiket.filter((t) => t.terjual < t.kuota);
  const daftar = (tersedia.length ? tersedia : acara.tiket).map((t) => t.harga);
  return Math.min(...daftar);
};

export function rupiah(n) {
  if (n === 0) return 'Gratis';
  return 'Rp' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
export function rupiahRingkas(n) {
  if (n === 0) return 'Gratis';
  if (n >= 1000 && n % 1000 === 0) return `Rp${n / 1000}rb`;
  return rupiah(n);
}
