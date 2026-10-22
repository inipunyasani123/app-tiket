# Sumber gambar — Karcis Wetan (demo app-tiket)

Semua acara, penampil, pembicara, dan penyelenggara di aplikasi ini rekaan.

## Buatan sendiri (kode SVG di repo ini)
- Poster acara (6 desain risograf dua tinta): `src/ui/Poster.js`
- Ilustrasi penampil/pembicara (figur geometris tanpa wajah, bukan orang sungguhan): `src/ui/Tokoh.js`
- Ikon antarmuka: `src/ui/Ikon.js`
- Ikon aplikasi & PWA: dibuat oleh `scripts/ikon.mjs`
- Kode QR: dibuat di perangkat/saat build dengan `qrcode-generator` (MIT)

## Foto suasana (CC0 / domain publik)
Diunduh lalu diberi efek dupleks risograf oleh `scripts/foto.mjs` → `public/images/acara/<slug>-480.webp` dan `-840.webp`.
Foto hanya ilustrasi suasana, bukan lokasi acara. Tidak ada wajah yang dapat dikenali.

| Berkas | Judul asli | Pembuat | Lisensi | Sumber |
| --- | --- | --- | --- | --- |
| pameran-cetak-saring | Typical Screen Printing Example | Inkman | CC0 | https://commons.wikimedia.org/w/index.php?curid=31351499 |
| komedi-pojok-pendopo | Microphone Music | Freestocks.org | CC0 (StockSnap) | https://stocksnap.io/photo/microphone-music-8KQC04JDT0 |
| malam-gending-elektrik | Concert Show | Nainoa Shizuru | CC0 (StockSnap) | https://stocksnap.io/photo/concert-show-5FGWJW4Z5D |
| seminar-umkm-naik-kelas | Conference Meeting Room | rawpixel | CC0 | https://www.rawpixel.com/image/5969710/conference-meeting-room |
| pasar-rasa-brantas | Vegetable Satay - Bali 2025-11-19 | Andy Li | CC0 | https://commons.wikimedia.org/wiki/File:Vegetable_Satay_-_Bali_2025-11-19.jpg |
| lari-pagi-lereng-5k | People Running | kinkate | CC0 (StockSnap) | https://stocksnap.io/photo/people-running-2USDVKPSWS |

## Huruf (SIL Open Font License 1.1)
Big Shoulders, Schibsted Grotesk, JetBrains Mono — dari Google Fonts lewat paket `@expo-google-fonts/*`;
versi web di-subset ke WOFF2 oleh `scripts/fonts.mjs`. Lisensi: `public/fonts/OFL-*.txt`.
