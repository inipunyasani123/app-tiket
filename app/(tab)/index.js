import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { ACARA, KATEGORI, MEREK, bukaBerikut, cariAcara, hargaMulai, jadwal, jendela, rupiahRingkas, statusAcara, teksCari } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { HARI, awalHari, fmtHariPendek, fmtJam, fmtTgl, fmtTglAngka, hariKe, hitungMundur, useSekarang } from '../../src/lib/waktu';
import { terjual, useData } from '../../src/lib/simpan';
import { Layar } from '../../src/ui/Layar';
import { Chip, Judul, Ketuk, Mono, T, Tombol } from '../../src/ui/dasar';
import { Poster } from '../../src/ui/Poster';
import { Takik } from '../../src/ui/Karcis';
import { Ikon } from '../../src/ui/Ikon';
import { KartuAcara, jamMulai, labelHari } from '../../src/ui/KartuAcara';
import { BannerPengingat } from '../../src/ui/Pengingat';
import { Lembar } from '../../src/ui/Lembar';
import { Kalender } from '../../src/ui/Kalender';
import { Kosong } from '../../src/ui/Kosong';
import { LembarPengantar, PitaPengantar } from '../../src/ui/Pengantar';

export function generateMetadata() {
  return meta({
    judul: 'Karcis Wetan: Demo Aplikasi Tiket Acara | PintuWeb',
    deskripsi: 'Demo aplikasi tiket acara Jawa Timur: beli tiket, e-tiket QR, alihkan ke teman, pengingat WIB, dan mode panitia untuk check-in di gerbang.',
    jalur: '/',
  });
}

const SOROT = 'malam-gending-elektrik';
const HARI_INI = 'pameran-cetak-saring';
const KOTA = [...new Set(ACARA.map((a) => a.kota))];
const WAKTU = [
  { id: 'semua', label: 'Semua tanggal' },
  { id: 'hariini', label: 'Hari ini' },
  { id: 'besok', label: 'Besok' },
  { id: 'akhirpekan', label: 'Akhir pekan' },
];
const HARGA = [
  { id: 'semua', label: 'Semua harga' },
  { id: 'gratis', label: 'Gratis saja', cocok: (p) => p === 0 },
  { id: '50', label: '≤ Rp50rb', cocok: (p) => p > 0 && p <= 50000 },
  { id: '100', label: 'Rp50–100rb', cocok: (p) => p > 50000 && p <= 100000 },
  { id: 'atas', label: '> Rp100rb', cocok: (p) => p > 100000 },
];
const AWAL = { q: '', kat: 'semua', waktu: 'semua', tanggal: null, kota: [], harga: 'semua', simpan: false };

function hariTerpilih(f, sekarang) {
  if (sekarang == null) return null;
  const awal = awalHari(sekarang);
  if (f.waktu === 'hariini') return [awal];
  if (f.waktu === 'besok') return [awal + HARI];
  if (f.waktu === 'akhirpekan') {
    const h = hariKe(awal);
    if (h === 6) return [awal, awal + HARI];
    if (h === 0) return [awal];
    const sabtu = awal + (6 - h) * HARI;
    return [sabtu, sabtu + HARI];
  }
  if (f.waktu === 'tanggal' && f.tanggal != null) return [f.tanggal];
  return null;
}
const adaDiHari = (acara, sekarang, hari) => jendela(acara, sekarang).some(([a, b]) => a < hari + HARI && b > hari);

export default function Jelajah() {
  const sekarang = useSekarang();
  const data = useData();
  const [f, setF] = useState(AWAL);
  const [lembar, setLembar] = useState(null);
  const ubah = (u) => setF((x) => ({ ...x, ...u }));
  const tutup = useCallback(() => setLembar(null), []);

  const saring = useCallback((x) => {
    const q = x.q.trim().toLowerCase();
    const hari = hariTerpilih(x, sekarang);
    const harga = HARGA.find((h) => h.id === x.harga);
    return ACARA.filter((a) => {
      if (x.kat !== 'semua' && a.kategori !== x.kat) return false;
      if (q && !q.split(/\s+/).every((k) => teksCari(a).includes(k))) return false;
      if (x.kota.length && !x.kota.includes(a.kota)) return false;
      if (x.simpan && !data.disimpan?.includes(a.slug)) return false;
      if (harga.cocok && !a.tiket.some((k) => harga.cocok(k.harga) && terjual(data, a.slug, k.id) < k.kuota)) return false;
      if (hari && !hari.some((h) => adaDiHari(a, sekarang, h))) return false;
      if (hari && statusAcara(a, sekarang) === 'selesai') return false;
      return true;
    });
  }, [sekarang, data]);

  const daftar = useMemo(() => saring(f), [saring, f]);
  const jumlahSaring = (f.kota.length ? 1 : 0) + (f.harga !== 'semua' ? 1 : 0) + (f.simpan ? 1 : 0);
  const mencari = f.q.trim() || f.waktu !== 'semua' || jumlahSaring > 0;
  const titikHari = useCallback((h) => ACARA.filter((a) => adaDiHari(a, sekarang, h) && h + HARI > sekarang).map((a) => TINTA[a.tinta].a), [sekarang]);

  let ketKosong = 'Coba kata lain, tanggal lain, atau lihat semua kota.';
  if (f.kota.length === 1 && f.waktu !== 'semua') ketKosong = `Belum ada acara di ${f.kota[0]} pada waktu itu. Coba tanggal atau kota lain.`;
  else if (f.q.trim()) ketKosong = `Tidak ada acara, penampil, atau kota yang cocok dengan "${f.q.trim()}".`;

  return (
    <View style={{ flex: 1, backgroundColor: W.malam }}>
      <Layar bawah={20} keyboardDismissMode="on-drag">
        <View style={s.kepala}>
          <View style={s.lencanaMerek} aria-hidden>
            <Text style={s.lencanaTeks}>KW</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Judul level={1} ukuran={34}>{MEREK.nama}</Judul>
            <Mono>Jawa Timur · {ACARA.length} acara · jam WIB</Mono>
          </View>
        </View>

        <View style={s.bagian}>
          <PitaPengantar onLihat={() => setLembar('pengantar')} />
          <View style={s.cariBaris} role="search">
            <View style={s.cari}>
              <Ikon nama="cari" warna={W.tinta2} ukuran={20} />
              <TextInput
                value={f.q}
                onChangeText={(q) => ubah({ q })}
                placeholder="Cari acara, penampil, atau kota"
                placeholderTextColor={W.tinta2}
                aria-label="Cari acara, penampil, atau kota"
                returnKeyType="search"
                autoCorrect={false}
                style={s.cariInput}
              />
              {f.q ? (
                <Pressable role="button" aria-label="Hapus pencarian" onPress={() => ubah({ q: '' })} style={s.hapusCari}>
                  <Ikon nama="silang" warna={W.tinta} ukuran={16} />
                </Pressable>
              ) : null}
            </View>
            <Pressable role="button" aria-label={jumlahSaring ? `Saring, ${jumlahSaring} aktif` : 'Saring kota, harga, dan simpanan'} onPress={() => setLembar('saring')} style={[s.tSaring, jumlahSaring > 0 && { backgroundColor: W.jingga, borderColor: W.jingga }]}>
              <Ikon nama="saring" warna={jumlahSaring ? W.malam : W.terang} ukuran={20} />
              {jumlahSaring ? <View style={s.lencanaSaring}><Text style={s.lencanaSaringTeks}>{jumlahSaring}</Text></View> : null}
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16, marginTop: 10 }}>
            {WAKTU.map((w) => (
              <Chip key={w.id} label={w.label} aktif={f.waktu === w.id} onPress={() => ubah({ waktu: w.id, tanggal: null })} warna={W.kuning} />
            ))}
            <Chip
              label={f.waktu === 'tanggal' && f.tanggal != null ? `${fmtHariPendek(f.tanggal)}, ${fmtTgl(f.tanggal)}` : 'Pilih tanggal'}
              aktif={f.waktu === 'tanggal'}
              onPress={() => setLembar('kalender')}
              warna={W.kuning}
            />
          </ScrollView>
        </View>

        {mencari ? null : (
          <>
            <View style={s.bagian}>
              <BannerPengingat sekarang={sekarang} />
              <Sorotan acara={cariAcara(SOROT)} sekarang={sekarang} />
            </View>

            <View style={[s.bagian, s.bento]}>
              <HariIni acara={cariAcara(HARI_INI)} sekarang={sekarang} />
              <View style={s.bentoKanan}>
                <UbinTiket />
                <UbinPanitia />
              </View>
            </View>

            <View style={[s.bagian, s.kota]}>
              <Mono warna={W.kuning} style={{ textAlign: 'center' }}>{KOTA.join('  ✦  ')}</Mono>
            </View>
          </>
        )}

        <View style={[s.bagian, { gap: 12 }]}>
          <View style={s.judulBaris}>
            <Judul level={2} ukuran={30}>{mencari ? 'Hasil' : 'Semua acara'}</Judul>
            <Mono aria-live="polite">{daftar.length} acara</Mono>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16 }}>
            {KATEGORI.map((k) => (
              <Chip key={k.id} label={k.label} aktif={f.kat === k.id} onPress={() => ubah({ kat: k.id })} />
            ))}
          </ScrollView>
          <View style={{ gap: 12 }} role="list" aria-label="Daftar acara">
            {daftar.map((a) => (
              <View key={a.slug} role="listitem">
                <KartuAcara acara={a} sekarang={sekarang} />
              </View>
            ))}
          </View>
          {daftar.length === 0 ? (
            <Kosong judul="Belum ada yang cocok" isi={ketKosong} aksi="Lihat semua acara" onPress={() => setF(AWAL)} kata="KOSONG" />
          ) : null}
        </View>

        <View style={[s.bagian, { marginTop: 8 }]}>
          <T ukuran={13} warna={W.redup}>
            Semua acara, penampil, dan penyelenggara di aplikasi ini rekaan. Pembayaran hanya simulasi dan data tersimpan di perangkatmu sendiri.
          </T>
        </View>
      </Layar>

      <Lembar buka={lembar === 'saring'} tutup={tutup} judul="Saring acara">
        <SaringIsi f={f} setF={setF} hitung={(x) => saring(x).length} tutup={tutup} jumlahSimpan={data.disimpan?.length || 0} />
      </Lembar>
      <Lembar buka={lembar === 'kalender'} tutup={tutup} judul="Pilih tanggal">
        {sekarang != null ? (
          <Kalender sekarang={sekarang} pilih={f.waktu === 'tanggal' ? f.tanggal : null} titikHari={titikHari}
            onPilih={(h) => { ubah(h == null ? { waktu: 'semua', tanggal: null } : { waktu: 'tanggal', tanggal: h }); tutup(); }} />
        ) : <Mono warna={W.tinta2}>Menyiapkan kalender…</Mono>}
        <T ukuran={13} warna={W.tinta2}>Titik berwarna = ada acara pada hari itu (warna tinta posternya).</T>
      </Lembar>
      <LembarPengantar buka={lembar === 'pengantar'} tutup={tutup} />
    </View>
  );
}

function SaringIsi({ f, setF, hitung, tutup, jumlahSimpan }) {
  const [x, setX] = useState(f);
  const u = (v) => setX((y) => ({ ...y, ...v }));
  const n = hitung(x);
  return (
    <>
      <Mono warna={W.tinta2}>Kota</Mono>
      <View style={s.kepingBaris}>
        {KOTA.map((k) => (
          <Chip key={k} terang label={k} aktif={x.kota.includes(k)} onPress={() => u({ kota: x.kota.includes(k) ? x.kota.filter((y) => y !== k) : [...x.kota, k] })} />
        ))}
      </View>
      <Mono warna={W.tinta2}>Harga tiket yang masih tersedia</Mono>
      <View style={s.kepingBaris}>
        {HARGA.map((h) => <Chip key={h.id} terang label={h.label} aktif={x.harga === h.id} onPress={() => u({ harga: h.id })} />)}
      </View>
      {jumlahSimpan ? (
        <>
          <Mono warna={W.tinta2}>Simpanan</Mono>
          <View style={s.kepingBaris}>
            <Chip terang label={`Hanya yang kusimpan (${jumlahSimpan})`} aktif={x.simpan} onPress={() => u({ simpan: !x.simpan })} />
          </View>
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Tombol varian="garis" label="Atur ulang" onPress={() => setX({ ...x, kota: [], harga: 'semua', simpan: false })} style={{ borderColor: W.tinta2 }} teksStyle={{ color: W.tinta }} />
        <Tombol varian="gelap" label={n ? `Tampilkan ${n} acara` : 'Tidak ada yang cocok'} disabled={!n} onPress={() => { setF(x); tutup(); }} style={{ flex: 1 }} />
      </View>
    </>
  );
}

function Sorotan({ acara, sekarang }) {
  const data = useData();
  const tinta = TINTA[acara.tinta];
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const t = j ? fmtTglAngka(j.mulai) : null;
  const bibir = acara.tiket.find((x) => x.id === 'bibir');
  const sisaBibir = bibir.kuota - terjual(data, acara.slug, bibir.id);
  return (
    <Link href={`/acara/${acara.slug}`} asChild>
      <Ketuk style={s.sorot}>
        <View style={[s.sorotPoster, { backgroundColor: tinta.a }]}>
          <View style={s.sorotBingkai}>
            <Poster acara={acara} hias />
          </View>
          <View style={[s.selotip, { left: '50%', marginLeft: -58, transform: [{ rotate: '-4deg' }] }]} />
          <View style={s.stiker}>
            <Text style={s.stikerTeks}>Sorotan{'\n'}minggu ini</Text>
          </View>
        </View>
        <Takik latar={W.malam} ukuran={24} />
        <View style={s.sorotInfo}>
          <View style={s.tanggal}>
            <Text style={s.tglKecil}>{t ? t.hari : 'H+'}</Text>
            <Text style={s.tglBesar}>{t ? t.tgl : acara.mulai[0]}</Text>
            <Text style={s.tglKecil}>{t ? t.bulan : 'hari'}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={s.sorotJudul}>{acara.judul}</Text>
            <Text style={s.sorotMeta}>{acara.kota} · {jamMulai(acara)}</Text>
            <Text style={[s.sorotMeta, { color: tinta.teks, fontFamily: H.tebal }]}>
              {sisaBibir > 0 ? `Bibir Panggung sisa ${sisaBibir} tiket` : 'Bibir Panggung habis'}
            </Text>
          </View>
          <View style={s.sorotHarga}>
            <Text style={s.mulai}>mulai</Text>
            <Text style={s.hargaBesar}>{rupiahRingkas(hargaMulai(acara))}</Text>
          </View>
        </View>
      </Ketuk>
    </Link>
  );
}

function HariIni({ acara: bawaan, sekarang }) {
  // Sebelum jam perangkat terbaca, tampilkan acara hari ini dari data; sesudahnya pilih yang masih buka/terdekat.
  const acara = sekarang == null ? bawaan
    : ACARA.find((a) => ['berlangsung', 'jeda'].includes(statusAcara(a, sekarang))) || ACARA.find((a) => statusAcara(a, sekarang) === 'akan') || bawaan;
  const tinta = TINTA[acara.tinta];
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  let ket = `${labelHari(acara)} · ${jamMulai(acara)}`;
  if (st === 'berlangsung' && j) {
    const w = jendela(acara, sekarang).find(([a, b]) => sekarang >= a && sekarang < b);
    ket = `Tutup ${fmtJam(w[1])} WIB · ${hitungMundur(w[1] - sekarang)} lagi`;
  } else if (st === 'jeda') ket = `Tutup sekarang · buka lagi ${fmtJam(bukaBerikut(acara, sekarang))} WIB`;
  else if (st === 'akan' && j) ket = `Buka ${fmtJam(j.pintu)} WIB · ${hitungMundur(j.pintu - sekarang)} lagi`;
  else if (st === 'selesai' && j) ket = `Sudah ditutup ${fmtJam(j.selesai)} WIB`;
  const label = st === 'akan' ? labelHari(acara) : 'Hari ini';
  return (
    <Link href={`/acara/${acara.slug}`} asChild>
      <Ketuk style={[s.ubin, s.ubinHariIni, { backgroundColor: tinta.a }]}>
        <Mono ukuran={10.5} warna={W.tinta}>{label} · {acara.kota}</Mono>
        <View style={s.hariIniPoster}>
          <Poster acara={acara} hias />
        </View>
        <Text style={s.ubinJudul}>{acara.judul}</Text>
        <Text style={s.ubinKet}>{ket}</Text>
      </Ketuk>
    </Link>
  );
}

function UbinTiket() {
  const data = useData();
  const aktif = data.dimuat ? data.tiket.filter((t) => t.status === 'aktif' && !t.milikTeman) : [];
  const dompet = aktif.filter((t) => t.dompet).length;
  return (
    <Link href="/tiket" asChild>
      <Ketuk style={[s.ubin, { backgroundColor: W.kertas }]}>
        <View style={s.barisUbin}>
          <Mono ukuran={10.5} warna={W.tinta2}>Tiketku</Mono>
          <Ikon nama="tiket" warna={W.tinta} ukuran={18} />
        </View>
        <Text style={s.angka}>{data.dimuat ? aktif.length : '·'}</Text>
        <Text style={[s.ubinKet, { color: W.tinta2 }]}>{data.dimuat ? `${dompet} di dompet` : 'memuat…'}</Text>
      </Ketuk>
    </Link>
  );
}

function UbinPanitia() {
  return (
    <Link href="/panitia" asChild>
      <Ketuk style={[s.ubin, s.ubinPanitia]}>
        <View style={s.pita} aria-hidden>
          {Array.from({ length: 9 }).map((_, i) => <View key={i} style={s.pitaStrip} />)}
        </View>
        <View style={s.barisUbin}>
          <Mono ukuran={10.5} warna={W.kuning}>Mode panitia</Mono>
          <Ikon nama="pindai" warna={W.kuning} ukuran={18} />
        </View>
        <Text style={[s.ubinJudul, { color: W.terang, fontSize: 21, lineHeight: 21 }]}>Check-in gerbang</Text>
      </Ketuk>
    </Link>
  );
}

const s = StyleSheet.create({
  kepala: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  cariBaris: { flexDirection: 'row', gap: 10 },
  cari: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: W.kertas, borderRadius: 14, paddingLeft: 14, minHeight: 50 },
  cariInput: { flex: 1, minHeight: 50, fontFamily: H.badan, fontSize: 16, color: W.tinta, paddingRight: 8 },
  hapusCari: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tSaring: { width: 50, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: W.garis, alignItems: 'center', justifyContent: 'center', backgroundColor: W.malam2 },
  lencanaSaring: { position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: W.kertas, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: W.malam },
  lencanaSaringTeks: { fontFamily: H.mono, fontSize: 12, color: W.tinta },
  judulBaris: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kepingBaris: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lencanaMerek: { width: 46, height: 46, borderRadius: 12, backgroundColor: W.jingga, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }], borderWidth: 2, borderColor: W.kertas, borderStyle: 'dashed' },
  lencanaTeks: { fontFamily: H.display, fontSize: 22, color: W.malam },
  bagian: { paddingHorizontal: 16, marginBottom: 14 },
  sorot: { backgroundColor: W.kertas, borderRadius: 20, overflow: 'hidden' },
  sorotPoster: { height: 236, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sorotBingkai: { width: 156, transform: [{ rotate: '-3deg' }], shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6, backgroundColor: W.kertas },
  selotip: { position: 'absolute', top: 10, width: 116, height: 22, backgroundColor: 'rgba(244,236,220,0.78)' },
  stiker: { position: 'absolute', right: 14, bottom: 16, width: 92, height: 92, borderRadius: 46, backgroundColor: W.kuning, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }], borderWidth: 2, borderColor: W.tinta },
  stikerTeks: { fontFamily: H.display, fontSize: 15, lineHeight: 15, color: W.tinta, textAlign: 'center', textTransform: 'uppercase' },
  sorotInfo: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center' },
  tanggal: { width: 58, alignItems: 'center', borderRightWidth: 2, borderColor: W.kertas2, paddingRight: 10 },
  tglKecil: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  tglBesar: { fontFamily: H.display, fontSize: 40, lineHeight: 40, color: W.tinta },
  sorotJudul: { fontFamily: H.display, fontSize: 26, lineHeight: 25, color: W.tinta, textTransform: 'uppercase' },
  sorotMeta: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.tinta2 },
  sorotHarga: { alignItems: 'flex-end' },
  mulai: { fontFamily: H.badan, fontSize: 12, color: W.tinta2 },
  hargaBesar: { fontFamily: H.display, fontSize: 26, lineHeight: 27, color: W.tinta },
  bento: { flexDirection: 'row', gap: 12 },
  bentoKanan: { flex: 1, gap: 12 },
  ubin: { borderRadius: 18, padding: 14, gap: 6, overflow: 'hidden' },
  ubinHariIni: { flex: 1.1 },
  hariIniPoster: { width: 74, alignSelf: 'flex-start', transform: [{ rotate: '3deg' }], marginVertical: 4, backgroundColor: W.kertas },
  ubinJudul: { fontFamily: H.display, fontSize: 22, lineHeight: 22, color: W.tinta, textTransform: 'uppercase' },
  ubinKet: { fontFamily: H.badan, fontSize: 12.5, lineHeight: 17, color: W.tinta },
  barisUbin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  angka: { fontFamily: H.display, fontSize: 54, lineHeight: 54, color: W.tinta },
  ubinPanitia: { flex: 1, backgroundColor: W.malam3, borderWidth: 1.5, borderColor: W.garis, paddingTop: 22 },
  pita: { position: 'absolute', top: 0, left: 0, right: 0, height: 10, flexDirection: 'row', backgroundColor: W.kuning, overflow: 'hidden' },
  pitaStrip: { width: 14, height: 30, marginRight: 14, backgroundColor: W.tinta, transform: [{ rotate: '35deg' }], marginTop: -10 },
  kota: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: W.garis, paddingVertical: 10, marginHorizontal: 16, paddingHorizontal: 0 },
});
