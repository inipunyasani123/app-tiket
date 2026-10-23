import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACARA, MEREK, bukaBerikut, cariAcara, hargaMulai, jadwal, jendela, labelHari, rupiah, rupiahRingkas, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { fmtJam, fmtTglAngka, fmtTglPanjang, hitungMundur, useSekarang } from '../../src/lib/waktu';
import { ribuan } from '../../src/lib/angka';
import { terjual, useData } from '../../src/lib/simpan';
import { BilahAtas } from '../../src/ui/Layar';
import { Judul, Mono, T, Tombol, TombolTautan } from '../../src/ui/dasar';
import { Poster, Raster } from '../../src/ui/Poster';
import { Tokoh } from '../../src/ui/Tokoh';
import { Takik } from '../../src/ui/Karcis';
import { Ikon } from '../../src/ui/Ikon';
import { jamMulai } from '../../src/ui/KartuAcara';
import { Denah, adaDenah } from '../../src/ui/Denah';
import { Peta } from '../../src/ui/Peta';
import { Cincin } from '../../src/ui/Cincin';
import { HalamanTakAda } from '../../src/ui/TakAda';
import { Foto } from '../../src/ui/Foto';

export function generateStaticParams() {
  return ACARA.map((a) => ({ slug: a.slug }));
}

export function generateMetadata(_req, params) {
  const a = cariAcara(params?.slug);
  if (!a) return meta({ judul: 'Acara tidak ditemukan | Karcis Wetan', deskripsi: 'Acara ini tidak ada di Karcis Wetan.', jalur: '/404', noindex: true });
  let judul = `${a.judul} · ${a.kota} | Karcis Wetan`;
  if (judul.length > 60) judul = `${a.judul} | Karcis Wetan`;
  let deskripsi = `${a.ringkas} Tiket mulai ${rupiah(hargaMulai(a))}.`;
  if (deskripsi.length > 155) deskripsi = a.ringkas;
  return meta({ judul, deskripsi, jalur: `/acara/${a.slug}` });
}

const LABEL_PENGISI = { seminar: 'Pembicara', musik: 'Penampil', komedi: 'Penampil', seni: 'Pengisi acara', kuliner: 'Pengisi acara', olahraga: 'Pendamping' };

export default function DetailAcara() {
  const { slug } = useLocalSearchParams();
  const acara = cariAcara(slug);
  if (!acara) return <HalamanTakAda />;
  return <Isi acara={acara} />;
}

function Isi({ acara }) {
  const inset = useSafeAreaInsets();
  const sekarang = useSekarang();
  const data = useData();
  const gulir = useRef(null);
  const posWadah = useRef(0);
  const pos = useRef({});
  const [aktif, setAktif] = useState('tentang');
  const [kabar, setKabar] = useState('');
  const tinta = TINTA[acara.tinta];
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;
  const selesai = st === 'selesai';
  const semuaHabis = acara.tiket.every((k) => terjual(data, acara.slug, k.id) >= k.kuota);
  const disimpan = !!data.disimpan?.includes(acara.slug);

  let hitung = `${labelHari(acara)}, ${jamMulai(acara)}`;
  if (j && st === 'akan') hitung = `Mulai dalam ${hitungMundur(j.mulai - sekarang)}`;
  if (j && st === 'berlangsung') hitung = acara.harian ? `Sedang buka, tutup ${fmtJam(jendela(acara, sekarang).find(([a, b]) => sekarang >= a && sekarang < b)[1])} WIB` : 'Sedang berlangsung';
  if (j && st === 'jeda') hitung = `Tutup sementara, buka lagi ${fmtJam(bukaBerikut(acara, sekarang))} WIB`;
  if (selesai) hitung = 'Acara sudah selesai';

  const multiHari = acara.selesai[0] !== acara.mulai[0];
  let hariSebelum = null;
  const BAGIAN = [['tentang', 'Tentang'], ['susunan', 'Susunan'], ['pengisi', LABEL_PENGISI[acara.kategori]], ['tiket', 'Tiket'], ['lokasi', 'Lokasi']];

  const umumkan = (t) => { setKabar(t); setTimeout(() => setKabar(''), 2600); };
  const ke = (id) => { setAktif(id); gulir.current?.scrollTo({ y: posWadah.current + (pos.current[id] || 0) - 56, animated: true }); };
  const saatGulir = (e) => {
    const y = e.nativeEvent.contentOffset.y + 72;
    let kini = 'tentang';
    for (const [id] of BAGIAN) if (pos.current[id] != null && posWadah.current + pos.current[id] <= y) kini = id;
    if (kini !== aktif) setAktif(kini);
  };
  const catat = (id) => (e) => { pos.current[id] = e.nativeEvent.layout.y; };
  const bagikan = async () => {
    const url = `${MEREK.url}/acara/${acara.slug}`;
    try {
      if (Platform.OS !== 'web') await Share.share({ message: `${acara.judul} · ${url}` });
      else if (navigator.share) await navigator.share({ title: acara.judul, url });
      else { await navigator.clipboard.writeText(url); umumkan('Tautan acara disalin'); }
    } catch { /* dibatalkan */ }
  };

  const t = j ? fmtTglAngka(j.mulai) : null;
  const tAkhir = j && multiHari ? fmtTglAngka(j.selesai) : null;

  return (
    <View style={{ flex: 1, backgroundColor: W.malam }}>
      <ScrollView ref={gulir} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 + inset.bottom }} stickyHeaderIndices={[1]} onScroll={saatGulir} scrollEventThrottle={48}>
        <View>
          <View style={[s.hero, { backgroundColor: tinta.a, paddingTop: inset.top }]}>
            <View style={s.titik} aria-hidden>
              <Raster opasitas={0.22} />
            </View>
            <BilahAtas label={`${acara.kota} · ${acara.kategori}`} warna={W.tinta} kanan={(
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable role="button" aria-label="Simpan acara" aria-pressed={disimpan} onPress={() => { data.simpanAcara(acara.slug); umumkan(disimpan ? 'Dihapus dari simpanan' : 'Disimpan. Saring "Hanya yang kusimpan" di Jelajah.'); }} style={s.bulat}>
                  <Ikon nama={disimpan ? 'hatiPenuh' : 'hati'} warna={disimpan ? W.merahTua : W.tinta} ukuran={20} />
                </Pressable>
                <Pressable role="button" aria-label="Bagikan acara" onPress={bagikan} style={s.bulat}>
                  <Ikon nama="bagikan" warna={W.tinta} ukuran={20} />
                </Pressable>
              </View>
            )} />
            <View style={s.posterBingkai}>
              <Poster acara={acara} />
              <View style={s.selotip} />
            </View>
          </View>

          <View style={s.badan}>
            <Mono warna={tinta.a}>{acara.kota} · {acara.tempat.split(' di ')[0]}</Mono>
            <Judul level={1} ukuran={44} style={{ marginTop: 6 }}>{acara.judul}</Judul>
            <T warna={W.redup} style={{ marginTop: 10 }}>{acara.ringkas}</T>

            <View style={s.ringkasKarcis}>
              <View style={s.rkTanggal}>
                <Text style={s.rkKecil}>{t ? (tAkhir ? `${t.hari}–${tAkhir.hari}` : t.hari) : 'H+'}</Text>
                <Text style={s.rkBesar}>{t ? (tAkhir ? `${t.tgl}–${tAkhir.tgl}` : t.tgl) : Math.max(0, acara.mulai[0])}</Text>
                <Text style={s.rkKecil}>{t ? t.bulan : 'hari'}</Text>
              </View>
              <Takik arah="tegak" latar={W.malam} ukuran={16} />
              <View style={s.rkTengah}>
                <Text style={s.rkLabel}>Jam (WIB)</Text>
                <Text style={s.rkNilai}>{multiHari ? `${fmtJamData(acara.harian[0], acara.harian[1])}–${fmtJamData(acara.harian[2], acara.harian[3])} tiap hari` : `${jamMulai(acara).replace(' WIB', '')}–${fmtJamData(acara.selesai[1], acara.selesai[2])}`}</Text>
                <Text style={s.rkLabel}>Pintu dibuka</Text>
                <Text style={s.rkNilai}>{fmtJamData(acara.pintu[1], acara.pintu[2])} · {acara.usia.split(' (')[0]}</Text>
              </View>
              <Takik arah="tegak" latar={W.malam} ukuran={16} />
              <View style={[s.rkHarga, { backgroundColor: tinta.a }]}>
                <Text style={s.rkKecilGelap}>mulai</Text>
                <Text style={s.rkHargaTeks}>{rupiahRingkas(hargaMulai(acara))}</Text>
              </View>
            </View>
            <View style={[s.status, { backgroundColor: st === 'berlangsung' ? W.hijau : selesai ? W.malam3 : W.kuning }]}>
              <Ikon nama="jam" warna={selesai ? W.terang : W.tinta} ukuran={18} />
              <Text style={[s.statusTeks, selesai && { color: W.terang }]} aria-live="polite">{hitung}</Text>
            </View>
          </View>
        </View>

        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 4 }}>
            {BAGIAN.map(([id, label]) => (
              <Pressable key={id} role="button" aria-current={aktif === id ? 'true' : undefined} onPress={() => ke(id)} style={[s.tab, aktif === id && s.tabAktif]}>
                <Text style={[s.tabTeks, aktif === id && { color: W.tinta, fontFamily: H.tebal }]}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={s.badan} onLayout={(e) => { posWadah.current = e.nativeEvent.layout.y; }}>
          <View onLayout={catat('tentang')}>
            <Judul level={2} ukuran={28} style={s.subjudul}>Tentang acara</Judul>
            {acara.deskripsi.map((p, i) => <T key={i} warna={W.terang} style={{ marginBottom: 10 }}>{p}</T>)}
            <View style={s.foto}>
              <Foto slug={acara.slug} alt={acara.foto} />
              <View style={[s.fotoLabel, { backgroundColor: tinta.a }]}><Text style={s.fotoLabelTeks}>Suasana</Text></View>
            </View>
            <Mono style={{ marginTop: 6 }}>Foto ilustrasi CC0 bernuansa risograf, bukan lokasi acara</Mono>
          </View>

          <View onLayout={catat('susunan')}>
            <Judul level={2} ukuran={28} style={s.subjudul}>Susunan acara</Judul>
            <View style={s.rundown}>
              {acara.rundown.map(([h, jm, mn, isi], i) => {
                const pemisah = multiHari && h !== hariSebelum;
                hariSebelum = h;
                return (
                  <View key={i}>
                    {pemisah ? <Mono warna={W.kuning} style={{ marginTop: i ? 10 : 0, marginBottom: 6 }}>{j ? fmtTglPanjang(j.rundown[i].waktu) : `Hari ke-${h - acara.mulai[0] + 1}`}</Mono> : null}
                    <View style={s.rundownBaris}>
                      <Text style={s.rundownJam}>{fmtJamData(jm, mn)}</Text>
                      <View style={[s.rundownTitik, { backgroundColor: tinta.a }]} />
                      <Text style={s.rundownIsi}>{isi}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View onLayout={catat('pengisi')}>
            <Judul level={2} ukuran={28} style={s.subjudul}>{LABEL_PENGISI[acara.kategori]}</Judul>
            <View style={s.pengisi}>
              {acara.pengisi.map((p) => (
                <View key={p.nama} style={s.kartuPengisi}>
                  <Tokoh gaya={p.gaya} ukuran={64} label={`Ilustrasi ${p.nama}`} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.namaPengisi}>{p.nama}</Text>
                    <Text style={s.peranPengisi}>{p.peran}</Text>
                  </View>
                </View>
              ))}
              <Mono>Ilustrasi & nama rekaan</Mono>
            </View>
          </View>

          <View onLayout={catat('tiket')}>
            <Judul level={2} ukuran={28} style={s.subjudul}>Pilih tiket</Judul>
            {adaDenah(acara) ? (
              <View style={{ marginBottom: 14 }}>
                <Denah acara={acara} onPilih={(id) => router.push({ pathname: '/pesan/[slug]', params: { slug: acara.slug, kategori: id } })} />
                <T ukuran={13} warna={W.redup} style={{ marginTop: 6 }}>Ketuk area untuk langsung memesan. Denah ilustrasi; posisi kursi bebas di dalam area.</T>
              </View>
            ) : null}
            <View style={{ gap: 12 }}>
              {acara.tiket.map((k) => {
                const laku = terjual(data, acara.slug, k.id);
                const sisa = k.kuota - laku;
                const habis = sisa <= 0;
                const persen = Math.min(100, Math.round((laku / k.kuota) * 100));
                return (
                  <View key={k.id} style={[s.kat, habis && { backgroundColor: W.kertas2 }]}>
                    <View style={s.katAtas}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={s.katNama}>{k.nama}</Text>
                        <Text style={s.katCatatan}>{k.catatan}</Text>
                      </View>
                      <Text style={s.katHarga}>{rupiah(k.harga)}</Text>
                    </View>
                    <View style={s.meterBaris}>
                      <View style={[s.meter, { flex: 1 }]} role="progressbar" aria-label={`Terjual ${laku} dari ${k.kuota}`} aria-valuemin={0} aria-valuemax={k.kuota} aria-valuenow={laku}>
                        <View style={[s.meterIsi, { width: `${persen}%`, backgroundColor: habis ? W.tinta2 : tinta.a }]} />
                      </View>
                      {!habis && sisa <= 20 ? (
                        <View style={s.cincin} aria-hidden>
                          <Cincin sisa={sisa} kuota={k.kuota} ukuran={44} />
                          <Text style={s.cincinTeks}>{sisa}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Takik latar={W.malam} ukuran={18} />
                    <View style={s.katBawah}>
                      <Text style={[s.katSisa, sisa > 0 && sisa <= 20 && { color: W.merahTua }]}>
                        {habis ? 'Habis terjual' : sisa <= 20 ? `Hampir habis · sisa ${sisa}` : `Sisa ${ribuan(sisa)} dari ${ribuan(k.kuota)}`}
                      </Text>
                      {habis || selesai ? (
                        <Tombol varian="gelap" kecil label={habis ? 'Habis' : 'Selesai'} disabled />
                      ) : (
                        <TombolTautan href={{ pathname: '/pesan/[slug]', params: { slug: acara.slug, kategori: k.id } }} varian="gelap" kecil label="Pilih" aria-label={`Pilih ${k.nama}, ${rupiah(k.harga)}`} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View onLayout={catat('lokasi')}>
            <Judul level={2} ukuran={28} style={s.subjudul}>Lokasi</Judul>
            <Peta acara={acara} />
            <Text style={s.lokasiNama}>{acara.tempat}</Text>
            <T ukuran={13.5} warna={W.redup}>Peta ilustrasi, bukan peta sungguhan; acara ini rekaan sehingga lokasinya ditulis umum. Titik masuk dan petunjuk arah dikirim lewat aplikasi H-1.</T>
            <Tombol varian="garis" kecil label="Petunjuk arah (dikirim H-1)" kiri={<Ikon nama="lokasi" warna={W.terang} ukuran={18} />} onPress={() => umumkan('Petunjuk arah dikirim lewat aplikasi H-1 (simulasi).')} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
          </View>

          <Judul level={2} ukuran={28} style={s.subjudul}>Ketentuan</Judul>
          {[...acara.syarat, 'Tiket bisa dialihkan ke teman dari halaman e-tiket; kode lama otomatis hangus.', 'Ini aplikasi demo: pembayaran disimulasikan dan tidak ada uang yang ditarik.'].map((x, i) => (
            <View key={i} style={s.syarat}>
              <Text style={s.syaratNo}>{String(i + 1).padStart(2, '0')}</Text>
              <T ukuran={14} warna={W.redup} style={{ flex: 1 }}>{x}</T>
            </View>
          ))}
        </View>
      </ScrollView>

      {kabar ? <View style={[s.kabar, { bottom: 92 + inset.bottom }]} role="status"><Text style={s.kabarTeks}>{kabar}</Text></View> : <View role="status" />}

      <View style={[s.aksi, { paddingBottom: 12 + inset.bottom }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.aksiKecil}>{selesai ? 'Acara selesai' : semuaHabis ? 'Tiket habis' : 'Tiket mulai'}</Text>
          <Text style={s.aksiHarga}>{rupiah(hargaMulai(acara))}</Text>
        </View>
        <Tombol label={selesai || semuaHabis ? 'Lihat kategori' : 'Pilih tiket'} onPress={() => ke('tiket')} style={{ minWidth: 150 }} />
      </View>
    </View>
  );
}

const fmtJamData = (j, m) => `${String(j).padStart(2, '0')}.${String(m).padStart(2, '0')}`;

const s = StyleSheet.create({
  hero: { paddingBottom: 26, overflow: 'hidden' },
  titik: { ...StyleSheet.absoluteFillObject },
  posterBingkai: { width: '58%', alignSelf: 'center', transform: [{ rotate: '-2.5deg' }], marginTop: 4, backgroundColor: W.kertas, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  selotip: { position: 'absolute', top: -10, left: '30%', width: '40%', height: 24, backgroundColor: 'rgba(244,236,220,0.75)', transform: [{ rotate: '3deg' }] },
  badan: { paddingHorizontal: 16, paddingTop: 22 },
  bulat: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(244,236,220,0.85)' },
  ringkasKarcis: { flexDirection: 'row', backgroundColor: W.kertas, borderRadius: 16, overflow: 'hidden', marginTop: 18, minHeight: 104 },
  rkTanggal: { width: 76, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  rkKecil: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  rkKecilGelap: { fontFamily: H.badan, fontSize: 12.5, color: W.tinta },
  rkBesar: { fontFamily: H.display, fontSize: 34, lineHeight: 36, color: W.tinta, fontVariant: ['tabular-nums'] },
  rkTengah: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 1 },
  rkLabel: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  rkNilai: { fontFamily: H.tebal, fontSize: 14.5, lineHeight: 20, color: W.tinta, marginBottom: 4, fontVariant: ['tabular-nums'] },
  rkHarga: { width: 82, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  rkHargaTeks: { fontFamily: H.display, fontSize: 24, lineHeight: 26, color: W.tinta },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  statusTeks: { fontFamily: H.tebal, fontSize: 14, color: W.tinta },
  tabBar: { backgroundColor: W.malam, borderBottomWidth: 1, borderColor: W.garis, paddingVertical: 6, marginTop: 16 },
  tab: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, justifyContent: 'center' },
  tabAktif: { backgroundColor: W.kertas },
  tabTeks: { fontFamily: H.badan, fontSize: 14.5, color: W.terang },
  meterBaris: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginBottom: 12 },
  cincin: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  cincinTeks: { position: 'absolute', fontFamily: H.mono, fontSize: 12, color: W.merahTua },
  lokasiNama: { fontFamily: H.tebal, fontSize: 16, color: W.terang, marginTop: 12, marginBottom: 4 },
  kabar: { position: 'absolute', left: 16, right: 16, backgroundColor: W.kuning, borderRadius: 12, padding: 12, zIndex: 5 },
  kabarTeks: { fontFamily: H.tebal, fontSize: 14, color: W.tinta },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  ubin: { flexGrow: 1, flexBasis: '45%', borderRadius: 16, padding: 14, gap: 6 },
  ubinLebar: { flexBasis: '100%' },
  barisIkon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ubinBesar: { fontFamily: H.display, fontSize: 26, lineHeight: 27, color: W.tinta, textTransform: 'uppercase' },
  ubinSedang: { fontFamily: H.tebal, fontSize: 15, lineHeight: 21 },
  ubinKecil: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.tinta2 },
  subjudul: { marginTop: 28, marginBottom: 12 },
  foto: { borderRadius: 16, overflow: 'hidden', marginTop: 6, backgroundColor: W.malam2 },
  fotoLabel: { position: 'absolute', left: 12, top: 12, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, transform: [{ rotate: '-3deg' }] },
  fotoLabelTeks: { fontFamily: H.display, fontSize: 16, color: W.tinta, textTransform: 'uppercase', letterSpacing: 0.5 },
  pengisi: { gap: 10 },
  kartuPengisi: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: W.malam2, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: W.garis },
  namaPengisi: { fontFamily: H.display, fontSize: 22, lineHeight: 23, color: W.terang, textTransform: 'uppercase' },
  peranPengisi: { fontFamily: H.badan, fontSize: 13.5, color: W.redup },
  rundown: { borderLeftWidth: 2, borderColor: W.garis, marginLeft: 50, paddingLeft: 0 },
  rundownBaris: { flexDirection: 'row', alignItems: 'flex-start', marginLeft: -50, paddingVertical: 7 },
  rundownJam: { width: 46, fontFamily: H.mono, fontSize: 13, color: W.kuning, paddingTop: 1 },
  rundownTitik: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginLeft: -2, marginRight: 12, borderWidth: 2, borderColor: W.malam },
  rundownIsi: { flex: 1, fontFamily: H.badan, fontSize: 15, lineHeight: 21, color: W.terang },
  kat: { backgroundColor: W.kertas, borderRadius: 16, overflow: 'hidden' },
  katAtas: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10, alignItems: 'flex-start' },
  katNama: { fontFamily: H.display, fontSize: 24, lineHeight: 24, color: W.tinta, textTransform: 'uppercase' },
  katCatatan: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
  katHarga: { fontFamily: H.display, fontSize: 24, lineHeight: 26, color: W.tinta },
  meter: { height: 8, borderRadius: 4, backgroundColor: W.kertas2, overflow: 'hidden' },
  meterIsi: { height: 8, borderRadius: 4 },
  katBawah: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingLeft: 14, gap: 10 },
  katSisa: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase', flex: 1 },
  syarat: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  syaratNo: { fontFamily: H.mono, fontSize: 12, color: W.jingga, paddingTop: 2 },
  aksi: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: W.malam2, borderTopWidth: 1, borderColor: W.garis },
  aksiKecil: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
  aksiHarga: { fontFamily: H.display, fontSize: 28, lineHeight: 30, color: W.terang },
});
