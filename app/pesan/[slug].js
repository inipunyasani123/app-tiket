import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACARA, BIAYA_LAYANAN, MAKS_PER_PESANAN, cariAcara, jadwal, rupiah, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { MENIT, fmtRentang, fmtTglPanjang, useSekarang } from '../../src/lib/waktu';
import { terjual, useData } from '../../src/lib/simpan';
import { BilahAtas } from '../../src/ui/Layar';
import { Judul, Ketuk, Mono, T, Tombol, TombolTautan } from '../../src/ui/dasar';
import { Poster } from '../../src/ui/Poster';
import { Takik } from '../../src/ui/Karcis';
import { QR } from '../../src/ui/QR';
import { Ikon } from '../../src/ui/Ikon';
import { jamMulai, labelHari } from '../../src/ui/KartuAcara';
import { HalamanTakAda } from '../../src/ui/TakAda';
import { TiketTerbit } from '../../src/ui/TiketTerbit';
import { Denah, adaDenah } from '../../src/ui/Denah';

export function generateStaticParams() {
  return ACARA.map((a) => ({ slug: a.slug }));
}
export function generateMetadata(_r, params) {
  const a = cariAcara(params?.slug);
  return meta({ judul: 'Pesan tiket | Karcis Wetan', deskripsi: `Checkout simulasi tiket ${a ? a.judul : 'acara'} di demo aplikasi Karcis Wetan.`.slice(0, 155), jalur: `/pesan/${params?.slug}`, noindex: true });
}

const LANGKAH = ['Tiket', 'Data', 'Bayar', 'Selesai'];

export default function Pesan() {
  const { slug, kategori } = useLocalSearchParams();
  const acara = cariAcara(slug);
  if (!acara) return <HalamanTakAda />;
  return <Alur acara={acara} kategoriAwal={kategori} />;
}

function Alur({ acara, kategoriAwal }) {
  const inset = useSafeAreaInsets();
  const data = useData();
  const sekarang = useSekarang(true);
  const gulir = useRef(null);
  const tinta = TINTA[acara.tinta];
  const tersedia = (k) => k.kuota - terjual(data, acara.slug, k.id);
  const awal = acara.tiket.find((k) => k.id === kategoriAwal && tersedia(k) > 0) || acara.tiket.find((k) => tersedia(k) > 0) || acara.tiket[0];

  const [langkah, setLangkah] = useState(0);
  const [katId, setKatId] = useState(awal.id);
  const [jumlah, setJumlah] = useState(1);
  const [pemesan, setPemesan] = useState({ nama: '', email: '', wa: '' });
  const [pemegang, setPemegang] = useState([]);
  const [setuju, setSetuju] = useState(false);
  const [galat, setGalat] = useState({});
  const [metode, setMetode] = useState('qris');
  const [bayar, setBayar] = useState('menunggu');
  const [batas, setBatas] = useState(null);
  const [kode, setKode] = useState([]);
  const [disalin, setDisalin] = useState(false);

  const kat = acara.tiket.find((k) => k.id === katId);
  const sisa = tersedia(kat);
  const maks = Math.max(1, Math.min(MAKS_PER_PESANAN, sisa));
  const gratis = kat.harga === 0;
  const subtotal = kat.harga * jumlah;
  const biaya = gratis ? 0 : BIAYA_LAYANAN * jumlah;
  const total = subtotal + biaya;
  const idPesanan = useMemo(() => 'KW' + Math.floor(Math.random() * 9e5 + 1e5), []);
  const va = useMemo(() => `8808 ${idPesanan.slice(2, 6)} ${idPesanan.slice(4)}21 07`, [idPesanan]);
  const selesaiAcara = sekarang != null && statusAcara(acara, sekarang) === 'selesai';

  useEffect(() => { if (jumlah > maks) setJumlah(maks); }, [maks, jumlah]);
  useEffect(() => { gulir.current?.scrollTo({ y: 0, animated: false }); }, [langkah]);

  const ke = (n) => { setGalat({}); setLangkah(n); };

  function cekData() {
    const g = {};
    if (pemesan.nama.trim().length < 3) g.nama = 'Tulis nama lengkap (minimal 3 huruf).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pemesan.email.trim())) g.email = 'Alamat email belum benar, contoh: nama@email.com.';
    const wa = pemesan.wa.replace(/[\s-]/g, '');
    if (!/^(\+?62|0)8\d{7,12}$/.test(wa)) g.wa = 'Nomor WhatsApp diawali 08 atau 62, 10–14 angka.';
    pemegang.slice(1, jumlah).forEach((n, i) => { if ((n || '').trim().length < 3) g[`p${i + 1}`] = 'Tulis nama pemegang tiket ini.'; });
    if (!setuju) g.setuju = 'Centang persetujuan dulu, ya.';
    setGalat(g);
    return Object.keys(g).length === 0;
  }

  function terbitkan(metodeAkhir) {
    const nama = Array.from({ length: jumlah }, (_, i) => (i === 0 ? pemesan.nama.trim() : (pemegang[i] || '').trim()));
    const hasil = data.beli({ acara: acara.slug, kategori: kat.id, pemegang: nama, pemesan: { ...pemesan, nama: pemesan.nama.trim() }, metode: metodeAkhir, total });
    setKode(hasil);
    ke(3);
  }

  function lanjutData() {
    if (!cekData()) return;
    if (gratis) terbitkan('gratis');
    else { setBatas(Date.now() + 10 * MENIT); setBayar('menunggu'); ke(2); }
  }

  function konfirmasiBayar() {
    setBayar('memeriksa');
    setTimeout(() => { setBayar('lunas'); terbitkan(metode); }, 1400);
  }

  async function salinVA() {
    try { await navigator.clipboard.writeText(va.replace(/\s/g, '')); setDisalin(true); setTimeout(() => setDisalin(false), 1800); } catch { setDisalin(false); }
  }

  const sisaBayar = batas && sekarang ? Math.max(0, batas - sekarang) : 10 * MENIT;
  const mm = String(Math.floor(sisaBayar / MENIT)).padStart(2, '0');
  const ss = String(Math.floor((sisaBayar % MENIT) / 1000)).padStart(2, '0');

  return (
    <View style={{ flex: 1, backgroundColor: W.malam, paddingTop: inset.top }}>
      <BilahAtas label={langkah === 3 ? 'Pesanan selesai' : `Pesan tiket · langkah ${langkah + 1} dari 4`} cadangan={`/acara/${acara.slug}`} />
      <Stepper langkah={langkah} />
      <ScrollView ref={gulir} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 + inset.bottom, gap: 14 }} keyboardShouldPersistTaps="handled">
        {langkah < 3 ? (
          <View style={s.ringkas}>
            <View style={s.ringkasPoster}><Poster acara={acara} hias /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.ringkasJudul} numberOfLines={2}>{acara.judul}</Text>
              <Text style={s.ringkasMeta}>{sekarang ? (acara.harian ? fmtRentang(jadwal(acara, sekarang).mulai, jadwal(acara, sekarang).selesai) : fmtTglPanjang(jadwal(acara, sekarang).mulai)) : labelHari(acara)} · {jamMulai(acara)}</Text>
              <Text style={s.ringkasMeta}>{acara.kota}</Text>
            </View>
          </View>
        ) : null}

        {selesaiAcara && langkah < 3 ? (
          <View style={s.peringatan}><T warna={W.tinta}>Acara ini sudah selesai, jadi penjualan tiket ditutup.</T></View>
        ) : null}

        {langkah === 0 ? (
          <>
            <Judul level={1} ukuran={36}>Pilih tiket</Judul>
            {adaDenah(acara) ? (
              <View role="radiogroup" aria-label="Pilih area di denah">
                <Denah acara={acara} pilih={katId} onPilih={setKatId} />
              </View>
            ) : null}
            <View role="radiogroup" aria-label="Kategori tiket" style={{ gap: 10 }}>
              {acara.tiket.map((k) => {
                const sk = tersedia(k);
                const pilih = k.id === katId;
                return (
                  <Pressable key={k.id} role="radio" aria-checked={pilih} disabled={sk <= 0} onPress={() => setKatId(k.id)} style={[s.opsi, pilih && { borderColor: tinta.a, backgroundColor: W.malam3 }, sk <= 0 && { opacity: 0.6 }]}>
                    <View style={[s.radio, pilih && { borderColor: tinta.a }]}>{pilih ? <View style={[s.radioIsi, { backgroundColor: tinta.a }]} /> : null}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.opsiNama}>{k.nama}</Text>
                      <Text style={s.opsiKet}>{sk <= 0 ? 'Habis terjual' : `${k.catatan} · sisa ${sk}`}</Text>
                    </View>
                    <Text style={s.opsiHarga}>{rupiah(k.harga)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={s.jumlah}>
              <View style={{ flex: 1 }}>
                <Text style={s.opsiNama}>Jumlah tiket</Text>
                <Text style={s.opsiKet}>Maksimal {MAKS_PER_PESANAN} per pesanan</Text>
              </View>
              <Pressable role="button" aria-label="Kurangi jumlah" disabled={jumlah <= 1} onPress={() => setJumlah((n) => Math.max(1, n - 1))} style={[s.stepper, jumlah <= 1 && { opacity: 0.4 }]}>
                <Ikon nama="kurang" warna={W.tinta} ukuran={20} />
              </Pressable>
              <Text style={s.angkaJumlah} aria-live="polite" aria-label={`${jumlah} tiket`}>{jumlah}</Text>
              <Pressable role="button" aria-label="Tambah jumlah" disabled={jumlah >= maks} onPress={() => setJumlah((n) => Math.min(maks, n + 1))} style={[s.stepper, jumlah >= maks && { opacity: 0.4 }]}>
                <Ikon nama="tambah" warna={W.tinta} ukuran={20} />
              </Pressable>
            </View>
            <Rincian kat={kat} jumlah={jumlah} biaya={biaya} total={total} />
            <Tombol label={sisa <= 0 || selesaiAcara ? 'Tidak tersedia' : 'Lanjut isi data'} disabled={sisa <= 0 || selesaiAcara} onPress={() => ke(1)} />
          </>
        ) : null}

        {langkah === 1 ? (
          <>
            <Judul level={1} ukuran={36}>Data pemesan</Judul>
            <T warna={W.redup} ukuran={14}>E-tiket dikirim ke email dan WhatsApp ini (simulasi, tidak ada pesan yang benar-benar terkirim).</T>
            <Isian id="nama" label="Nama lengkap (tertulis di tiket pertama)" nilai={pemesan.nama} ubah={(v) => setPemesan((p) => ({ ...p, nama: v }))} galat={galat.nama} autoComplete="name" />
            <Isian id="email" label="Email" nilai={pemesan.email} ubah={(v) => setPemesan((p) => ({ ...p, email: v }))} galat={galat.email} autoComplete="email" inputMode="email" keyboardType="email-address" autoCapitalize="none" />
            <Isian id="wa" label="Nomor WhatsApp" nilai={pemesan.wa} ubah={(v) => setPemesan((p) => ({ ...p, wa: v }))} galat={galat.wa} autoComplete="tel" inputMode="tel" keyboardType="phone-pad" placeholder="08…" />
            {jumlah > 1 ? (
              <View style={{ gap: 12 }}>
                <Mono warna={W.kuning}>Nama di tiket lainnya</Mono>
                {Array.from({ length: jumlah - 1 }, (_, i) => (
                  <Isian key={i} id={`p${i + 1}`} label={`Pemegang tiket ${i + 2}`} nilai={pemegang[i + 1] || ''} galat={galat[`p${i + 1}`]}
                    ubah={(v) => setPemegang((arr) => { const b = [...arr]; b[i + 1] = v; return b; })} autoComplete="off" />
                ))}
              </View>
            ) : null}
            <Pressable role="checkbox" aria-checked={setuju} onPress={() => setSetuju((v) => !v)} style={s.centang}>
              <View style={[s.kotakCentang, setuju && { backgroundColor: W.jingga, borderColor: W.jingga }]}>{setuju ? <Ikon nama="cek" warna={W.malam} ukuran={18} /> : null}</View>
              <T ukuran={14} style={{ flex: 1 }}>Saya paham ini demo: pembayaran hanya simulasi dan data tersimpan di perangkat ini saja.</T>
            </Pressable>
            {galat.setuju ? <Text style={s.galat} role="alert">{galat.setuju}</Text> : null}
            <Rincian kat={kat} jumlah={jumlah} biaya={biaya} total={total} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tombol varian="garis" label="Kembali" onPress={() => ke(0)} />
              <Tombol label={gratis ? 'Daftar & terbitkan tiket' : 'Lanjut ke pembayaran'} onPress={lanjutData} style={{ flex: 1 }} />
            </View>
          </>
        ) : null}

        {langkah === 2 ? (
          <>
            <Judul level={1} ukuran={36}>Pembayaran</Judul>
            <View role="radiogroup" aria-label="Metode pembayaran" style={{ flexDirection: 'row', gap: 10 }}>
              {[['qris', 'QRIS'], ['va', 'Transfer bank']].map(([id, label]) => (
                <Pressable key={id} role="radio" aria-checked={metode === id} onPress={() => setMetode(id)} style={[s.metode, metode === id && { backgroundColor: W.kertas, borderColor: W.kertas }]}>
                  <Text style={[s.metodeTeks, { color: metode === id ? W.tinta : W.terang }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.tagihan}>
              <View style={s.tagihanAtas}>
                <View style={{ flex: 1 }}>
                  <Mono warna={W.tinta2}>Total tagihan · {idPesanan}</Mono>
                  <Text style={s.total}>{rupiah(total)}</Text>
                </View>
                <View style={s.waktuBayar}>
                  <Mono warna={W.tinta2}>Bayar dalam</Mono>
                  <Text style={s.waktuAngka} aria-label={`${mm} menit ${ss} detik`}>{mm}:{ss}</Text>
                </View>
              </View>
              <Takik latar={W.malam} ukuran={22} />
              {metode === 'qris' ? (
                <View style={s.tagihanBawah}>
                  <View style={s.qrBingkai}>
                    <QR isi={`SIMULASI QRIS KARCIS WETAN ${idPesanan} ${total} - BUKAN TAGIHAN ASLI`} ukuran={188} label="QR pembayaran simulasi, jangan dipindai untuk membayar" />
                    <View style={s.capSimulasi}><Text style={s.capSimulasiTeks}>Simulasi</Text></View>
                  </View>
                  <T ukuran={13.5} warna={W.tinta2} style={{ textAlign: 'center' }}>QRIS sungguhan bisa dibayar dari aplikasi bank atau dompet digital apa pun. Yang ini hanya QR contoh: jangan dipindai untuk membayar.</T>
                </View>
              ) : (
                <View style={[s.tagihanBawah, { alignItems: 'stretch' }]}>
                  <Mono warna={W.tinta2}>Bank Rekaan · virtual account</Mono>
                  <View style={s.va}>
                    <Text style={s.vaAngka} selectable>{va}</Text>
                    {Platform.OS === 'web' ? (
                      <Pressable role="button" onPress={salinVA} style={s.salin} aria-label="Salin nomor virtual account">
                        <Ikon nama={disalin ? 'cek' : 'salin'} warna={W.kertas} ukuran={18} />
                        <Text style={s.salinTeks}>{disalin ? 'Tersalin' : 'Salin'}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <T ukuran={13.5} warna={W.tinta2}>Nomor rekaan untuk demo. Tidak ada rekening sungguhan di baliknya.</T>
                </View>
              )}
            </View>
            <Tombol
              varian="hijau"
              label={bayar === 'memeriksa' ? 'Memeriksa pembayaran…' : 'Saya sudah bayar (simulasi)'}
              disabled={bayar !== 'menunggu' || sisaBayar <= 0}
              onPress={konfirmasiBayar}
              aria-live="polite"
            />
            {sisaBayar <= 0 ? <Text style={s.galat} role="alert">Waktu bayar habis. Kembali lalu ulangi pembayaran.</Text> : null}
            <Tombol varian="garis" label="Kembali ubah data" onPress={() => ke(1)} disabled={bayar === 'memeriksa'} />
          </>
        ) : null}

        {langkah === 3 ? (
          <TiketTerbit acara={acara} kat={kat} kode={kode} nama={Array.from({ length: kode.length }, (_, i) => (i === 0 ? pemesan.nama : pemegang[i]))} gratis={gratis} total={total} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stepper({ langkah }) {
  return (
    <View style={s.stepperBaris} role="list" aria-label="Langkah pemesanan">
      {LANGKAH.map((l, i) => (
        <View key={l} style={s.stepperItem} role="listitem" aria-current={i === langkah ? 'step' : undefined}>
          <View style={[s.lubang, i < langkah && { backgroundColor: W.kertas, borderColor: W.kertas }, i === langkah && { backgroundColor: W.jingga, borderColor: W.jingga }]}>
            {i < langkah ? <Ikon nama="cek" warna={W.malam} ukuran={14} /> : <Text style={[s.lubangNo, i === langkah && { color: W.malam }]}>{i + 1}</Text>}
          </View>
          <Text style={[s.stepperLabel, i === langkah && { color: W.terang, fontFamily: H.tebal }]}>{l}</Text>
          {i < LANGKAH.length - 1 ? <View style={s.stepperGaris} /> : null}
        </View>
      ))}
    </View>
  );
}

function Rincian({ kat, jumlah, biaya, total }) {
  return (
    <View style={s.rincian}>
      <View style={s.rincianBaris}><T ukuran={14} warna={W.redup}>{kat.nama} × {jumlah}</T><T ukuran={14}>{rupiah(kat.harga * jumlah)}</T></View>
      <View style={s.rincianBaris}><T ukuran={14} warna={W.redup}>Biaya layanan</T><T ukuran={14}>{biaya ? rupiah(biaya) : 'Rp0'}</T></View>
      <View style={[s.rincianBaris, { borderTopWidth: 1, borderColor: W.garis, paddingTop: 10, marginTop: 4 }]}>
        <T tebal>Total</T><Text style={s.rincianTotal}>{total ? rupiah(total) : 'Gratis'}</Text>
      </View>
    </View>
  );
}

function Isian({ id, label, nilai, ubah, galat, ...p }) {
  return (
    <View style={{ gap: 6 }}>
      <Text nativeID={`label-${id}`} style={s.label}>{label}</Text>
      <TextInput
        value={nilai}
        onChangeText={ubah}
        aria-labelledby={`label-${id}`}
        aria-invalid={galat ? true : undefined}
        aria-describedby={galat ? `galat-${id}` : undefined}
        style={[s.input, galat && { borderColor: W.merah }]}
        placeholderTextColor={W.tinta2}
        {...p}
      />
      {galat ? <Text nativeID={`galat-${id}`} style={s.galat}>{galat}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  stepperBaris: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10 },
  stepperItem: { flex: 1, alignItems: 'center', gap: 4, position: 'relative' },
  lubang: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: W.garis, alignItems: 'center', justifyContent: 'center', backgroundColor: W.malam, zIndex: 1 },
  lubangNo: { fontFamily: H.mono, fontSize: 12, color: W.redup },
  stepperLabel: { fontFamily: H.badan, fontSize: 12, color: W.redup },
  stepperGaris: { position: 'absolute', top: 13, left: '62%', right: '-38%', borderTopWidth: 2, borderStyle: 'dashed', borderColor: W.garis },
  ringkas: { flexDirection: 'row', gap: 12, backgroundColor: W.malam2, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: W.garis, alignItems: 'center' },
  ringkasPoster: { width: 54, borderRadius: 6, overflow: 'hidden' },
  ringkasJudul: { fontFamily: H.display, fontSize: 20, lineHeight: 20, color: W.terang, textTransform: 'uppercase' },
  ringkasMeta: { fontFamily: H.badan, fontSize: 13, color: W.redup },
  peringatan: { backgroundColor: W.kuning, borderRadius: 12, padding: 12 },
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: W.garis, backgroundColor: W.malam2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: W.redup, alignItems: 'center', justifyContent: 'center' },
  radioIsi: { width: 12, height: 12, borderRadius: 6 },
  opsiNama: { fontFamily: H.tebal, fontSize: 16, color: W.terang },
  opsiKet: { fontFamily: H.badan, fontSize: 13, color: W.redup, marginTop: 2 },
  opsiKetGelap: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
  opsiHarga: { fontFamily: H.display, fontSize: 22, color: W.terang },
  jumlah: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: W.malam2, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: W.garis },
  stepper: { width: 44, height: 44, borderRadius: 22, backgroundColor: W.kertas, alignItems: 'center', justifyContent: 'center' },
  angkaJumlah: { fontFamily: H.display, fontSize: 30, color: W.terang, minWidth: 28, textAlign: 'center' },
  rincian: { gap: 6, backgroundColor: W.malam2, borderRadius: 16, padding: 14 },
  rincianBaris: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rincianTotal: { fontFamily: H.display, fontSize: 26, color: W.jingga },
  label: { fontFamily: H.tebal, fontSize: 14, color: W.terang },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 2, borderColor: W.kertas2, backgroundColor: W.kertas, color: W.tinta, paddingHorizontal: 14, fontFamily: H.badan, fontSize: 16 },
  galat: { fontFamily: H.tebal, fontSize: 13.5, color: W.merah },
  centang: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 4 },
  kotakCentang: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: W.redup, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  metode: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 2, borderColor: W.garis, alignItems: 'center', justifyContent: 'center' },
  metodeTeks: { fontFamily: H.tebal, fontSize: 15 },
  tagihan: { backgroundColor: W.kertas, borderRadius: 20, overflow: 'hidden' },
  tagihanAtas: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  total: { fontFamily: H.display, fontSize: 38, lineHeight: 40, color: W.tinta },
  waktuBayar: { alignItems: 'flex-end' },
  waktuAngka: { fontFamily: H.mono, fontSize: 22, color: W.merahTua },
  tagihanBawah: { padding: 16, alignItems: 'center', gap: 12 },
  qrBingkai: { padding: 8, borderRadius: 14, borderWidth: 2, borderColor: W.tinta, position: 'relative' },
  capSimulasi: { position: 'absolute', bottom: -10, right: -14, backgroundColor: W.merahTua, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, transform: [{ rotate: '-6deg' }] },
  capSimulasiTeks: { fontFamily: H.display, fontSize: 18, color: W.kertas, textTransform: 'uppercase', letterSpacing: 1 },
  va: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: W.kertas2, borderRadius: 12, padding: 12 },
  vaAngka: { flex: 1, fontFamily: H.mono, fontSize: 19, color: W.tinta, letterSpacing: 1 },
  salin: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: W.tinta, borderRadius: 10, paddingHorizontal: 12, minHeight: 40 },
  salinTeks: { fontFamily: H.tebal, fontSize: 14, color: W.kertas },
  sukses: { gap: 8, paddingTop: 6 },
  capLunas: { alignSelf: 'flex-start', borderWidth: 3, borderColor: W.hijau, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3, transform: [{ rotate: '-5deg' }], marginBottom: 6 },
  capLunasTeks: { fontFamily: H.display, fontSize: 26, color: W.hijau, textTransform: 'uppercase', letterSpacing: 1 },
  stub: { flexDirection: 'row', alignItems: 'center', backgroundColor: W.kertas, borderRadius: 14, overflow: 'hidden', minHeight: 64 },
  stubWarna: { width: 56, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  stubNo: { fontFamily: H.display, fontSize: 26, color: W.tinta },
  stubKode: { fontFamily: H.mono, fontSize: 16, color: W.tinta, letterSpacing: 1 },
});
