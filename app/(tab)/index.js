import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ACARA, KATEGORI, MEREK, bukaBerikut, cariAcara, hargaMulai, jadwal, jendela, rupiahRingkas, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { fmtHariPendek, fmtJam, fmtTglAngka, hitungMundur, useSekarang } from '../../src/lib/waktu';
import { terjual, useData } from '../../src/lib/simpan';
import { Layar } from '../../src/ui/Layar';
import { Chip, Judul, Ketuk, Mono, T } from '../../src/ui/dasar';
import { Poster } from '../../src/ui/Poster';
import { Takik } from '../../src/ui/Karcis';
import { Ikon } from '../../src/ui/Ikon';
import { KartuAcara, jamMulai, labelHari } from '../../src/ui/KartuAcara';
import { BannerPengingat } from '../../src/ui/Pengingat';

export function generateMetadata() {
  return meta({
    judul: 'Karcis Wetan: Demo Aplikasi Tiket Acara | PintuWeb',
    deskripsi: 'Demo aplikasi tiket acara Jawa Timur: beli tiket, e-tiket QR, alihkan ke teman, pengingat WIB, dan mode panitia untuk check-in di gerbang.',
    jalur: '/',
  });
}

const SOROT = 'malam-gending-elektrik';
const HARI_INI = 'pameran-cetak-saring';

export default function Jelajah() {
  const sekarang = useSekarang();
  const [kat, setKat] = useState('semua');
  const daftar = useMemo(() => ACARA.filter((a) => kat === 'semua' || a.kategori === kat), [kat]);

  return (
    <Layar bawah={20}>
      <View style={s.kepala}>
        <View style={s.lencanaMerek} aria-hidden>
          <Text style={s.lencanaTeks}>KW</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Judul level={1} ukuran={34}>{MEREK.nama}</Judul>
          <Mono ukuran={10.5}>Jawa Timur · {ACARA.length} acara · semua jam WIB</Mono>
        </View>
      </View>

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
        <Mono ukuran={10.5} warna={W.kuning} style={{ textAlign: 'center' }}>
          {[...new Set(ACARA.map((a) => a.kota))].join('  ✦  ')}
        </Mono>
      </View>

      <View style={[s.bagian, { gap: 12 }]}>
        <Judul level={2} ukuran={30}>Semua acara</Judul>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16 }} accessibilityLabel="Saring kategori">
          {KATEGORI.map((k) => (
            <Chip key={k.id} label={k.label} aktif={kat === k.id} onPress={() => setKat(k.id)} />
          ))}
        </ScrollView>
        <View style={{ gap: 12 }} role="list" aria-label="Daftar acara">
          {daftar.map((a) => (
            <View key={a.slug} role="listitem">
              <KartuAcara acara={a} sekarang={sekarang} />
            </View>
          ))}
          {daftar.length === 0 ? <T warna={W.redup}>Belum ada acara di kategori ini.</T> : null}
        </View>
      </View>

      <View style={[s.bagian, { marginTop: 8 }]}>
        <T ukuran={13} warna={W.redup}>
          Semua acara, penampil, dan penyelenggara di aplikasi ini rekaan. Pembayaran hanya simulasi dan data tersimpan di perangkatmu sendiri.
        </T>
      </View>
    </Layar>
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
  tglKecil: { fontFamily: H.mono, fontSize: 11, color: W.tinta2, textTransform: 'uppercase' },
  tglBesar: { fontFamily: H.display, fontSize: 40, lineHeight: 40, color: W.tinta },
  sorotJudul: { fontFamily: H.display, fontSize: 26, lineHeight: 25, color: W.tinta, textTransform: 'uppercase' },
  sorotMeta: { fontFamily: H.badan, fontSize: 13, lineHeight: 18, color: W.tinta2 },
  sorotHarga: { alignItems: 'flex-end' },
  mulai: { fontFamily: H.badan, fontSize: 11.5, color: W.tinta2 },
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
