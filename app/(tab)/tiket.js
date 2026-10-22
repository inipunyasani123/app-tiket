import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { cariAcara, cariTiketKat, jadwal, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { fmtHariPendek, fmtJam, fmtTgl, hitungMundur, useSekarang } from '../../src/lib/waktu';
import { isiQR } from '../../src/lib/kode';
import { useData } from '../../src/lib/simpan';
import { Layar } from '../../src/ui/Layar';
import { Judul, Ketuk, Mono, T, Tombol, TombolTautan } from '../../src/ui/dasar';
import { Poster } from '../../src/ui/Poster';
import { Takik } from '../../src/ui/Karcis';
import { QR } from '../../src/ui/QR';
import { Ikon } from '../../src/ui/Ikon';
import { BannerPengingat, daftarPengingat, fmtPengingat } from '../../src/ui/Pengingat';
import { jamMulai, labelHari } from '../../src/ui/KartuAcara';

export function generateMetadata() {
  return meta({ judul: 'Tiketku: E-tiket & Dompet | Karcis Wetan', deskripsi: 'Simpan e-tiket QR, atur pengingat acara, dan alihkan tiket ke teman di demo aplikasi Karcis Wetan buatan PintuWeb.', jalur: '/tiket', noindex: true });
}

export default function Tiketku() {
  const data = useData();
  const sekarang = useSekarang();
  const [pilih, setPilih] = useState(null);
  const [yakin, setYakin] = useState(false);

  if (!data.dimuat) {
    return (
      <Layar>
        <Kepala jumlah={null} />
        <View style={{ padding: 16 }}><Mono>Memuat tiket di perangkat ini…</Mono></View>
      </Layar>
    );
  }

  const milikku = data.tiket.filter((t) => !t.milikTeman);
  const sudahMasuk = (t) => !!data.masuk?.[t.acara]?.[t.kode];
  const status = (t) => (sekarang != null ? statusAcara(cariAcara(t.acara), sekarang) : 'akan');
  const aktif = milikku.filter((t) => t.status === 'aktif' && !sudahMasuk(t) && status(t) !== 'selesai');
  const terpakai = milikku.filter((t) => t.status === 'aktif' && (sudahMasuk(t) || status(t) === 'selesai'));
  const dialihkan = milikku.filter((t) => t.status === 'dialihkan');
  const dompet = milikku.filter((t) => t.dompet && t.status === 'aktif');
  const berikut = daftarPengingat(data, sekarang).find((p) => p.waktu > sekarang);
  const terpilih = dompet.find((t) => t.kode === pilih) || dompet[dompet.length - 1];

  return (
    <Layar bawah={24}>
      <Kepala jumlah={aktif.length} />
      <View style={s.bagian}>
        <BannerPengingat sekarang={sekarang} />
      </View>

      {dompet.length ? (
        <View style={s.bagian}>
          <View style={s.judulBaris}>
            <Judul level={2} ukuran={26}>Dompet</Judul>
            <Mono>{dompet.length} kartu · simulasi</Mono>
          </View>
          <View style={{ marginTop: 10 }}>
            {dompet.filter((t) => t !== terpilih).map((t) => (
              <Pressable key={t.kode} role="button" aria-label={`Tampilkan kartu ${cariAcara(t.acara).judul}`} onPress={() => setPilih(t.kode)} style={[s.kartuDompet, s.kartuTertumpuk, { backgroundColor: TINTA[cariAcara(t.acara).tinta].a }]}>
                <Text style={s.dompetJudul} numberOfLines={1}>{cariAcara(t.acara).judul}</Text>
                <Text style={s.dompetKode}>{t.kode}</Text>
              </Pressable>
            ))}
            {terpilih ? <KartuDompet tiket={terpilih} sekarang={sekarang} /> : null}
          </View>
        </View>
      ) : null}

      {berikut ? (
        <View style={s.bagian}>
          <View style={s.pengingatBerikut}>
            <Ikon nama="lonceng" warna={W.kuning} ukuran={20} />
            <View style={{ flex: 1 }}>
              <Text style={s.pbJudul}>Pengingat berikutnya · {berikut.label}</Text>
              <Text style={s.pbIsi}>{berikut.acara.judul}: {fmtPengingat(berikut.waktu)}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={[s.bagian, { gap: 12 }]}>
        <Judul level={2} ukuran={26}>Akan datang</Judul>
        {aktif.length ? aktif.map((t) => <Stub key={t.kode} tiket={t} sekarang={sekarang} />) : (
          <View style={s.kosong}>
            <T warna={W.redup}>Belum ada tiket aktif. Pilih acara di Jelajah, checkout simulasinya cuma butuh semenit.</T>
            <TombolTautan href="/" label="Cari acara" varian="kertas" kecil style={{ alignSelf: 'flex-start' }} />
          </View>
        )}
      </View>

      {terpakai.length ? (
        <View style={[s.bagian, { gap: 12 }]}>
          <Judul level={2} ukuran={26}>Sudah dipakai</Judul>
          {terpakai.map((t) => <Stub key={t.kode} tiket={t} sekarang={sekarang} label={sudahMasuk(t) ? 'Sudah masuk' : 'Acara selesai'} redup />)}
        </View>
      ) : null}

      {dialihkan.length ? (
        <View style={[s.bagian, { gap: 12 }]}>
          <Judul level={2} ukuran={26}>Dialihkan</Judul>
          {dialihkan.map((t) => <Stub key={t.kode} tiket={t} sekarang={sekarang} label={`Ke ${t.dialihkanKe.nama}`} redup />)}
        </View>
      ) : null}

      <View style={[s.bagian, { marginTop: 18, gap: 10 }]}>
        <T ukuran={13} warna={W.redup}>Tiket, pengingat, dan catatan check-in tersimpan di perangkat ini saja (penyimpanan lokal), tanpa server.</T>
        {yakin ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tombol kecil varian="garis" label="Batal" onPress={() => setYakin(false)} />
            <Tombol kecil label="Ya, hapus & mulai ulang" onPress={() => { data.hapusSemua(); setYakin(false); setPilih(null); }} style={{ flex: 1 }} />
          </View>
        ) : (
          <Tombol kecil varian="garis" label="Hapus data demo di perangkat ini" kiri={<Ikon nama="hapus" warna={W.terang} ukuran={18} />} onPress={() => setYakin(true)} />
        )}
      </View>
    </Layar>
  );
}

function Kepala({ jumlah }) {
  return (
    <View style={s.kepala}>
      <Judul level={1} ukuran={40}>Tiketku</Judul>
      <Mono>{jumlah == null ? 'Memuat…' : `${jumlah} tiket aktif · tersimpan di perangkat ini`}</Mono>
    </View>
  );
}

function KartuDompet({ tiket, sekarang }) {
  const acara = cariAcara(tiket.acara);
  const tinta = TINTA[acara.tinta];
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  return (
    <Link href={{ pathname: '/e-tiket', params: { kode: tiket.kode } }} asChild>
      <Ketuk aria-label={`Buka e-tiket ${acara.judul}`} style={[s.kartuDompet, { backgroundColor: tinta.a, paddingBottom: 16 }]}>
        <View style={s.dompetAtas}>
          <View style={{ flex: 1 }}>
            <Text style={s.dompetJudul} numberOfLines={2}>{acara.judul}</Text>
            <Text style={s.dompetMeta}>{j ? `${fmtHariPendek(j.mulai)}, ${fmtTgl(j.mulai)} · ${fmtJam(j.mulai)} WIB` : `${labelHari(acara)} · ${jamMulai(acara)}`}</Text>
          </View>
          <Text style={s.dompetMerek}>KW</Text>
        </View>
        <View style={s.dompetBawah}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.dompetLabel}>Pemegang</Text>
            <Text style={s.dompetNilai}>{tiket.pemegang}</Text>
            <Text style={[s.dompetLabel, { marginTop: 6 }]}>Kode</Text>
            <Text style={s.dompetKode}>{tiket.kode}</Text>
          </View>
          <View style={s.dompetQR}><QR isi={isiQR(tiket.kode)} ukuran={84} /></View>
        </View>
      </Ketuk>
    </Link>
  );
}

function Stub({ tiket, sekarang, label, redup }) {
  const acara = cariAcara(tiket.acara);
  const kat = cariTiketKat(acara, tiket.kategori);
  const tinta = TINTA[acara.tinta];
  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;
  const kapan = j ? (st === 'akan' ? `${fmtHariPendek(j.mulai)}, ${fmtTgl(j.mulai)} · ${hitungMundur(j.mulai - sekarang)} lagi` : `${fmtHariPendek(j.mulai)}, ${fmtTgl(j.mulai)} · ${fmtJam(j.mulai)} WIB`) : `${labelHari(acara)} · ${jamMulai(acara)}`;
  return (
    <Link href={{ pathname: '/e-tiket', params: { kode: tiket.kode } }} asChild>
      <Ketuk aria-label={`E-tiket ${acara.judul}, ${kat.nama}, ${tiket.pemegang}${label ? `, ${label}` : ''}`} style={[s.stub, redup && { opacity: 0.78 }]}>
        <View style={s.stubPoster}><View style={StyleSheet.absoluteFill}><Poster acara={acara} hias tinggi="100%" /></View></View>
        <View style={{ flex: 1, padding: 12, gap: 2 }}>
          <Text style={s.stubJudul} numberOfLines={2}>{acara.judul}</Text>
          <Text style={s.stubMeta}>{kat.nama} · {tiket.pemegang}</Text>
          <Text style={s.stubMeta}>{kapan}</Text>
          {label ? <Text style={[s.stubLabel, { color: tinta.teks }]}>{label}</Text> : null}
        </View>
        <Takik arah="tegak" latar={W.malam} ukuran={18} />
        <View style={s.stubKanan}>
          <Ikon nama="tiket" warna={W.tinta} ukuran={22} />
          <Text style={s.stubKode}>{tiket.kode.slice(3, 7)}</Text>
        </View>
      </Ketuk>
    </Link>
  );
}

const s = StyleSheet.create({
  kepala: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 4 },
  bagian: { paddingHorizontal: 16, marginBottom: 12 },
  judulBaris: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kartuDompet: { borderRadius: 20, padding: 16, borderWidth: 2, borderColor: W.malam },
  kartuTertumpuk: { height: 74, marginBottom: -26, paddingTop: 12 },
  dompetAtas: { flexDirection: 'row', gap: 10 },
  dompetJudul: { fontFamily: H.display, fontSize: 22, lineHeight: 22, color: W.tinta, textTransform: 'uppercase' },
  dompetMeta: { fontFamily: H.badan, fontSize: 13, color: W.tinta, marginTop: 4 },
  dompetMerek: { fontFamily: H.display, fontSize: 22, color: W.tinta, borderWidth: 2, borderColor: W.tinta, borderRadius: 8, paddingHorizontal: 6, alignSelf: 'flex-start' },
  dompetBawah: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16, gap: 12 },
  dompetLabel: { fontFamily: H.mono, fontSize: 10.5, color: W.tinta, textTransform: 'uppercase', opacity: 0.85 },
  dompetNilai: { fontFamily: H.tebal, fontSize: 15, color: W.tinta },
  dompetKode: { fontFamily: H.mono, fontSize: 13, color: W.tinta, letterSpacing: 1 },
  dompetQR: { backgroundColor: W.kertas, padding: 4, borderRadius: 10 },
  pengingatBerikut: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1.5, borderColor: W.kuning, borderStyle: 'dashed', borderRadius: 14, padding: 12 },
  pbJudul: { fontFamily: H.mono, fontSize: 11, color: W.kuning, textTransform: 'uppercase' },
  pbIsi: { fontFamily: H.badan, fontSize: 14, color: W.terang, marginTop: 2 },
  kosong: { gap: 12, borderWidth: 1.5, borderColor: W.garis, borderStyle: 'dashed', borderRadius: 16, padding: 16 },
  stub: { flexDirection: 'row', backgroundColor: W.kertas, borderRadius: 16, overflow: 'hidden', minHeight: 104 },
  stubPoster: { width: 64 },
  stubJudul: { fontFamily: H.display, fontSize: 20, lineHeight: 20, color: W.tinta, textTransform: 'uppercase' },
  stubMeta: { fontFamily: H.badan, fontSize: 12.5, lineHeight: 17, color: W.tinta2 },
  stubLabel: { fontFamily: H.mono, fontSize: 10.5, textTransform: 'uppercase', marginTop: 2 },
  stubKanan: { width: 64, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: W.kertas2 },
  stubKode: { fontFamily: H.mono, fontSize: 11, color: W.tinta },
});
