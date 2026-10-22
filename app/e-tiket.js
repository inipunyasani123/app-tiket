import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MEREK, cariAcara, cariTiketKat, jadwal, statusAcara } from '../src/data/acara';
import { H, TINTA, W } from '../src/lib/tema';
import { meta } from '../src/lib/meta';
import { JAM, fmtJam, fmtRentang, fmtStempel, fmtTglPanjang, hitungMundur, useSekarang } from '../src/lib/waktu';
import { isiQR, rapikan } from '../src/lib/kode';
import { useData } from '../src/lib/simpan';
import { BilahAtas } from '../src/ui/Layar';
import { Judul, Mono, T, Tombol, TombolTautan } from '../src/ui/dasar';
import { Poster } from '../src/ui/Poster';
import { Takik } from '../src/ui/Karcis';
import { QR } from '../src/ui/QR';
import { Ikon } from '../src/ui/Ikon';
import { Lembar } from '../src/ui/Lembar';
import { OPSI_PENGINGAT, fmtPengingat } from '../src/ui/Pengingat';
import { jamMulai, labelHari } from '../src/ui/KartuAcara';

export function generateMetadata() {
  return meta({ judul: 'E-tiket | Karcis Wetan', deskripsi: 'E-tiket dengan QR unik di demo aplikasi Karcis Wetan: simpan ke dompet, alihkan ke teman, dan atur pengingat acara.', jalur: '/e-tiket', noindex: true });
}

export default function ETiket() {
  const p = useLocalSearchParams();
  const data = useData();
  const inset = useSafeAreaInsets();
  const kode = String(p.kode || '');
  const tiket = data.dimuat ? data.tiket.find((t) => t.kode === kode) : null;

  let isi;
  if (!data.dimuat) isi = <View style={s.memuat}><Mono>Memuat e-tiket…</Mono></View>;
  else if (tiket) isi = <Karcis tiket={tiket} />;
  else isi = <Kiriman params={p} />;

  return (
    <View style={{ flex: 1, backgroundColor: W.malam, paddingTop: inset.top }}>
      <BilahAtas label="E-tiket" cadangan="/tiket" />
      {isi}
    </View>
  );
}

/** Tiket dari tautan teman (tiket tidak ada di perangkat ini). */
function Kiriman({ params }) {
  const data = useData();
  const r = rapikan(params.kode);
  const acara = cariAcara(String(params.acara || ''));
  const kat = acara ? cariTiketKat(acara, String(params.kat || '')) : null;
  const sah = r.status === 'ok' && acara && kat && params.nama;
  if (!sah) {
    return (
      <View style={s.kosong}>
        <Judul level={1} ukuran={34}>E-tiket tidak ditemukan</Judul>
        <T warna={W.redup}>Tiket ini tidak tersimpan di perangkat ini. Di demo, e-tiket hanya tersimpan di HP atau peramban tempat tiket dibeli.</T>
        <TombolTautan href="/tiket" replace label="Ke Tiketku" />
      </View>
    );
  }
  const terima = () => {
    data.terima({ kode: r.kode, acara: acara.slug, kategori: kat.id, pemegang: String(params.nama), pesanan: 'KIRIMAN', dibuat: Date.now() });
  };
  return (
    <ScrollView contentContainerStyle={s.kosong}>
      <Mono warna={W.kuning}>Kiriman dari teman</Mono>
      <Judul level={1} ukuran={38}>Ada tiket untuk {String(params.nama)}</Judul>
      <View style={s.kiriman}>
        <View style={{ width: 70 }}><Poster acara={acara} hias /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.kirimanJudul}>{acara.judul}</Text>
          <Text style={s.kirimanMeta}>{kat.nama} · {acara.kota}</Text>
          <Text style={s.kirimanKode}>{r.kode}</Text>
        </View>
      </View>
      <T warna={W.redup}>Terima untuk menyimpannya di Tiketku perangkat ini. Kode ini sudah menggantikan kode lama milik pengirim.</T>
      <Tombol label="Terima tiket" onPress={terima} />
    </ScrollView>
  );
}

function Karcis({ tiket }) {
  const data = useData();
  const inset = useSafeAreaInsets();
  const sekarang = useSekarang();
  const acara = cariAcara(tiket.acara);
  const kat = cariTiketKat(acara, tiket.kategori);
  const tinta = TINTA[acara.tinta];
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;
  const masuk = data.masuk?.[acara.slug]?.[tiket.kode];
  const dialihkan = tiket.status === 'dialihkan';
  const batasAlih = j ? (acara.harian ? j.selesai : j.mulai) - 2 * JAM : null;
  const bisaAlih = !dialihkan && !masuk && st !== 'selesai' && (batasAlih == null || sekarang < batasAlih);
  const [lembar, setLembar] = useState(null);
  const [pesan, setPesan] = useState('');
  const tutup = useCallback(() => setLembar(null), []);

  const kabari = (t) => { setPesan(t); setTimeout(() => setPesan(''), 2600); };
  const dompet = () => {
    data.ubahTiket(tiket.kode, { dompet: !tiket.dompet });
    kabari(tiket.dompet ? 'Dikeluarkan dari Dompet' : 'Tersimpan di Dompet Karcis (simulasi)');
  };

  const unduhKalender = () => {
    if (!j) return;
    const z = (ts) => new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Karcis Wetan//Demo PintuWeb//ID', 'BEGIN:VEVENT',
      `UID:${tiket.kode}@app-tiket.pintuweb.id`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(j.mulai)}`, `DTEND:${z(acara.harian ? j.mulai + (acara.harian[2] - acara.harian[0]) * JAM : j.selesai)}`,
      `SUMMARY:${acara.judul} (demo)`, `LOCATION:${acara.tempat}`, `DESCRIPTION:Kode tiket ${tiket.kode} · ${kat.nama}. Acara rekaan dari demo Karcis Wetan.`,
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${acara.judul} mulai 3 jam lagi`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `karcis-wetan-${acara.slug}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    kabari('File kalender (.ics) diunduh');
  };

  const kodeBaru = tiket.dialihkanKe?.kodeBaru;
  const tautanTeman = kodeBaru ? `${MEREK.url}/e-tiket?kode=${kodeBaru}&acara=${acara.slug}&kat=${kat.id}&nama=${encodeURIComponent(tiket.dialihkanKe.nama)}` : '';

  let waktuTeks = `${labelHari(acara)} · ${jamMulai(acara)}`;
  if (j) waktuTeks = acara.harian ? fmtRentang(j.mulai, j.selesai) : fmtTglPanjang(j.mulai);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 + inset.bottom, gap: 16 }}>
        <View style={s.karcis}>
          <View style={[s.pita, { backgroundColor: tinta.a }]}>
            <View style={s.pitaPoster}><Poster acara={acara} hias /></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Mono warna={W.tinta} ukuran={10.5}>E-tiket · {MEREK.nama}</Mono>
              <Judul level={1} ukuran={30} warna={W.tinta}>{acara.judul}</Judul>
            </View>
          </View>
          <View style={s.grid}>
            <Sel label="Tanggal" isi={waktuTeks} lebar />
            <Sel label="Jam (WIB)" isi={acara.harian ? `${String(acara.harian[0]).padStart(2, '0')}.00–${acara.harian[2]}.00` : `${jamMulai(acara).replace(' WIB', '')}`} />
            <Sel label="Pintu" isi={j ? fmtJam(j.pintu) : `${String(acara.pintu[1]).padStart(2, '0')}.${String(acara.pintu[2]).padStart(2, '0')}`} />
            <Sel label="Kota" isi={acara.kota} />
            <Sel label="Kategori" isi={kat.nama} lebar />
            <Sel label="Pemegang" isi={tiket.pemegang} lebar />
          </View>
          <Takik latar={W.malam} ukuran={28} />
          <View style={s.qrArea}>
            {dialihkan ? (
              <View style={s.qrMati}>
                <QR isi={isiQR(tiket.kode)} ukuran={200} warna={W.kertas2} label="QR lama, sudah tidak berlaku" />
                <View style={[s.cap, { borderColor: W.merahTua }]}><Text style={[s.capTeks, { color: W.merahTua }]}>Dialihkan</Text></View>
              </View>
            ) : (
              <View>
                <QR isi={isiQR(tiket.kode)} ukuran={208} label={`QR e-tiket ${tiket.kode}`} />
                {masuk ? <View style={[s.cap, { borderColor: W.hijauTua }]}><Text style={[s.capTeks, { color: W.hijauTua }]}>Sudah masuk</Text><Text style={[s.capKecil, { color: W.hijauTua }]}>{fmtStempel(masuk.waktu)} · Gerbang {masuk.gerbang}</Text></View> : null}
              </View>
            )}
            <Text style={[s.kode, dialihkan && { textDecorationLine: 'line-through', color: W.tinta2 }]} selectable>{tiket.kode}</Text>
            <T ukuran={13} warna={W.tinta2} style={{ textAlign: 'center' }}>
              {dialihkan ? `Kode ini hangus sejak ${fmtStempel(tiket.dialihkanKe.waktu)}. Pemegang baru: ${tiket.dialihkanKe.nama}.`
                : masuk ? 'Tiket sudah dipakai masuk. Kode yang sama akan ditolak di gerbang.'
                  : 'Tunjukkan QR ini ke panitia. Satu kode untuk satu kali masuk. Naikkan kecerahan layar saat dipindai.'}
            </T>
          </View>
          <View style={s.kaki}>
            <Text style={s.seri}>No. {seri(tiket.kode)}</Text>
            <View style={s.hologram} aria-hidden>{[W.pink, W.kuning, W.biru, W.hijau, W.jingga].map((c) => <View key={c} style={[s.holoStrip, { backgroundColor: c }]} />)}</View>
            {tiket.contoh ? <Text style={s.seri}>Tiket contoh</Text> : null}
          </View>
        </View>

        {pesan ? <View style={s.kabar} role="status"><Text style={s.kabarTeks}>{pesan}</Text></View> : <View role="status" />}

        {dialihkan ? (
          <View style={s.panelAlih}>
            <Mono warna={W.kuning}>Sudah dialihkan ke {tiket.dialihkanKe.nama}</Mono>
            <T ukuran={14} warna={W.redup}>Kode baru untuk teman: <Text style={{ fontFamily: H.mono, color: W.terang }}>{kodeBaru}</Text>. Kirim tautan ini ke {tiket.dialihkanKe.kontak} (simulasi):</T>
            <Text style={s.tautan} selectable>{tautanTeman}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tombol varian="kertas" kecil label="Bagikan tautan" kiri={<Ikon nama="bagikan" warna={W.tinta} ukuran={18} />} style={{ flex: 1 }}
                onPress={async () => {
                  try {
                    if (Platform.OS === 'web' && navigator.clipboard) { await navigator.clipboard.writeText(tautanTeman); kabari('Tautan disalin'); }
                    else await Share.share({ message: tautanTeman });
                  } catch { kabari('Salin tautan secara manual'); }
                }} />
              <Tombol varian="garis" kecil label="Lihat tiket baru" style={{ flex: 1 }} onPress={() => router.replace({ pathname: '/e-tiket', params: { kode: kodeBaru } })} />
            </View>
          </View>
        ) : (
          <View style={s.aksi}>
            <Aksi ikon="dompet" label={tiket.dompet ? 'Di dompet' : 'Simpan ke dompet'} aktif={tiket.dompet} onPress={dompet} />
            <Aksi ikon="kirim" label="Kirim ke teman" onPress={() => setLembar('alih')} disabled={!bisaAlih} />
            <Aksi ikon="lonceng" label={tiket.pengingat?.length ? `Pengingat (${tiket.pengingat.length})` : 'Pengingat'} aktif={!!tiket.pengingat?.length} onPress={() => setLembar('ingat')} disabled={st === 'selesai'} />
            {Platform.OS === 'web' ? <Aksi ikon="kalender" label="Ke kalender" onPress={unduhKalender} disabled={!j || st === 'selesai'} /> : null}
          </View>
        )}
        {!dialihkan && !bisaAlih && !masuk && st && st !== 'selesai' ? <T ukuran={13} warna={W.redup}>Pengalihan ditutup 2 jam sebelum acara.</T> : null}
        {st === 'akan' && j ? <T ukuran={13} warna={W.redup}>Acara mulai {hitungMundur(j.mulai - sekarang)} lagi.</T> : null}
      </ScrollView>

      <Lembar buka={lembar === 'alih'} tutup={tutup} judul="Kirim ke teman">
        <FormAlih tiket={tiket} selesai={(nama) => { tutup(); kabari(`Tiket dialihkan ke ${nama}`); }} />
      </Lembar>
      <Lembar buka={lembar === 'ingat'} tutup={tutup} judul="Pengingat acara">
        <AturPengingat tiket={tiket} acara={acara} sekarang={sekarang} />
      </Lembar>
    </View>
  );
}

const seri = (k) => { let h = 7; for (const c of k) h = (h * 31 + c.charCodeAt(0)) % 999983; return String(h % 1e6).padStart(6, '0'); };

function Sel({ label, isi, lebar }) {
  return (
    <View style={[s.sel, lebar && { flexBasis: '100%' }]}>
      <Text style={s.selLabel}>{label}</Text>
      <Text style={s.selIsi}>{isi}</Text>
    </View>
  );
}

function Aksi({ ikon, label, onPress, aktif, disabled }) {
  return (
    <Pressable role="button" onPress={onPress} disabled={disabled} aria-disabled={disabled || undefined} style={({ pressed }) => [s.tAksi, aktif && { backgroundColor: W.jingga, borderColor: W.jingga }, disabled && { opacity: 0.45 }, pressed && { opacity: 0.8 }]}>
      <Ikon nama={ikon} warna={aktif ? W.malam : W.terang} ukuran={22} />
      <Text style={[s.tAksiTeks, aktif && { color: W.malam }]}>{label}</Text>
    </Pressable>
  );
}

function FormAlih({ tiket, selesai }) {
  const data = useData();
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [galat, setGalat] = useState('');
  const kirim = () => {
    const k = kontak.trim();
    const okKontak = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(k) || /^(\+?62|0)8\d{7,12}$/.test(k.replace(/[\s-]/g, ''));
    if (nama.trim().length < 3) return setGalat('Tulis nama teman (minimal 3 huruf).');
    if (!okKontak) return setGalat('Isi nomor WhatsApp (08…) atau email teman.');
    data.alihkan(tiket.kode, nama.trim(), k);
    selesai(nama.trim());
    return null;
  };
  return (
    <>
      <T ukuran={14} warna={W.tinta2}>Teman menerima kode baru dan nama di tiket berubah. Kode lamamu ({tiket.kode}) langsung hangus dan akan ditolak di gerbang.</T>
      <View style={{ gap: 6 }}>
        <Text nativeID="label-nama-teman" style={s.labelGelap}>Nama teman</Text>
        <TextInput value={nama} onChangeText={setNama} aria-labelledby="label-nama-teman" style={s.inputGelap} autoComplete="off" />
      </View>
      <View style={{ gap: 6 }}>
        <Text nativeID="label-kontak-teman" style={s.labelGelap}>WhatsApp atau email teman</Text>
        <TextInput value={kontak} onChangeText={setKontak} aria-labelledby="label-kontak-teman" style={s.inputGelap} autoComplete="off" autoCapitalize="none" />
      </View>
      {galat ? <Text style={s.galatGelap} role="alert">{galat}</Text> : null}
      <Tombol varian="gelap" label="Alihkan tiket" onPress={kirim} />
    </>
  );
}

function AturPengingat({ tiket, acara, sekarang }) {
  const data = useData();
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const ubah = (id) => {
    const ada = tiket.pengingat || [];
    data.ubahTiket(tiket.kode, { pengingat: ada.includes(id) ? ada.filter((x) => x !== id) : [...ada, id] });
  };
  return (
    <>
      <T ukuran={14} warna={W.tinta2}>Pengingat muncul sebagai banner di aplikasi saat waktunya tiba. Semua waktu dalam WIB.</T>
      {OPSI_PENGINGAT.map((o) => {
        const waktu = j ? o.waktu(j.mulai) : null;
        const lewat = waktu != null && waktu <= sekarang;
        const nyala = (tiket.pengingat || []).includes(o.id);
        return (
          <Pressable key={o.id} role="switch" aria-checked={nyala} onPress={() => ubah(o.id)} disabled={lewat && !nyala} style={[s.saklarBaris, lewat && !nyala && { opacity: 0.5 }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.labelGelap}>{o.label}</Text>
              <Text style={s.saklarKet}>{waktu ? (lewat ? `Sudah lewat (${fmtPengingat(waktu)})` : fmtPengingat(waktu)) : 'Menghitung jadwal…'}</Text>
            </View>
            <View style={[s.saklar, nyala && { backgroundColor: W.tinta }]}>
              <View style={[s.saklarBulat, nyala && { transform: [{ translateX: 20 }], backgroundColor: W.jingga }]} />
            </View>
          </Pressable>
        );
      })}
    </>
  );
}

const s = StyleSheet.create({
  memuat: { padding: 24 },
  kosong: { padding: 20, gap: 14 },
  kiriman: { flexDirection: 'row', gap: 12, backgroundColor: W.kertas, borderRadius: 16, padding: 12, alignItems: 'center' },
  kirimanJudul: { fontFamily: H.display, fontSize: 22, lineHeight: 22, color: W.tinta, textTransform: 'uppercase' },
  kirimanMeta: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
  kirimanKode: { fontFamily: H.mono, fontSize: 14, color: W.tinta, marginTop: 4 },
  karcis: { backgroundColor: W.kertas, borderRadius: 22, overflow: 'hidden' },
  pita: { flexDirection: 'row', gap: 14, padding: 14, alignItems: 'center' },
  pitaPoster: { width: 64, transform: [{ rotate: '-4deg' }], backgroundColor: W.kertas },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, rowGap: 12 },
  sel: { flexBasis: '33.33%', paddingRight: 8 },
  selLabel: { fontFamily: H.mono, fontSize: 10.5, color: W.tinta2, textTransform: 'uppercase', letterSpacing: 0.6 },
  selIsi: { fontFamily: H.tebal, fontSize: 15, lineHeight: 20, color: W.tinta, marginTop: 2 },
  qrArea: { alignItems: 'center', padding: 18, gap: 10 },
  qrMati: { position: 'relative' },
  cap: { position: 'absolute', top: '34%', left: -10, right: -10, borderWidth: 4, borderRadius: 12, backgroundColor: 'rgba(244,236,220,0.92)', paddingVertical: 6, alignItems: 'center', transform: [{ rotate: '-9deg' }] },
  capTeks: { fontFamily: H.display, fontSize: 34, lineHeight: 36, textTransform: 'uppercase', letterSpacing: 1.5 },
  capKecil: { fontFamily: H.mono, fontSize: 11 },
  kode: { fontFamily: H.mono, fontSize: 22, color: W.tinta, letterSpacing: 2 },
  kaki: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: W.kertas2, paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  seri: { fontFamily: H.mono, fontSize: 11, color: W.tinta2, textTransform: 'uppercase' },
  hologram: { flexDirection: 'row', height: 14, width: 80, borderRadius: 4, overflow: 'hidden' },
  holoStrip: { flex: 1 },
  kabar: { backgroundColor: W.hijau, borderRadius: 12, padding: 12 },
  kabarTeks: { fontFamily: H.tebal, fontSize: 14, color: W.malam },
  aksi: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tAksi: { flexGrow: 1, flexBasis: '45%', minHeight: 64, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.malam2, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tAksiTeks: { fontFamily: H.tebal, fontSize: 14.5, color: W.terang, flexShrink: 1 },
  panelAlih: { backgroundColor: W.malam2, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1.5, borderColor: W.garis },
  tautan: { fontFamily: H.mono, fontSize: 11.5, color: W.terang, backgroundColor: W.malam3, padding: 10, borderRadius: 10 },
  labelGelap: { fontFamily: H.tebal, fontSize: 15, color: W.tinta },
  inputGelap: { minHeight: 50, borderRadius: 12, borderWidth: 2, borderColor: W.tinta2, backgroundColor: '#fffaf0', color: W.tinta, paddingHorizontal: 14, fontFamily: H.badan, fontSize: 16 },
  galatGelap: { fontFamily: H.tebal, fontSize: 13.5, color: W.merahTua },
  saklarBaris: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: W.kertas2 },
  saklarKet: { fontFamily: H.badan, fontSize: 13, color: W.tinta2, marginTop: 2 },
  saklar: { width: 48, height: 28, borderRadius: 14, backgroundColor: W.kertas2, padding: 3, borderWidth: 1.5, borderColor: W.tinta2 },
  saklarBulat: { width: 20, height: 20, borderRadius: 10, backgroundColor: W.tinta2 },
});
