// Layar "Tiket terbit!": karcis keluar dari celah printer, pratinjau karcis berposter, lalu aksi lanjutan.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { MEREK, jadwal, mulaiAcuan, rupiah } from '../data/acara';
import { H, TINTA, W } from '../lib/tema';
import { fmtJam, fmtTgl, fmtHariPendek, useSekarang } from '../lib/waktu';
import { isiQR } from '../lib/kode';
import { useData } from '../lib/simpan';
import { useGerakDikurangi } from '../lib/gerak';
import { getar } from '../lib/getar';
import { unduhIcs } from '../lib/kalender';
import { OPSI_PENGINGAT, fmtPengingat } from './Pengingat';
import { Poster } from './Poster';
import { QR } from './QR';
import { Takik } from './Karcis';
import { Ikon } from './Ikon';
import { Judul, Ketuk, Mono, SR, T, TombolTautan } from './dasar';

export function TiketTerbit({ acara, kat, kode, nama, gratis, total }) {
  const data = useData();
  const sekarang = useSekarang();
  const kurangi = useGerakDikurangi();
  const tinta = TINTA[acara.tinta];
  const keluar = useRef(new Animated.Value(kurangi ? 1 : 0)).current;
  const [kabar, setKabar] = useState('');

  useEffect(() => {
    getar('sukses');
    if (kurangi) { keluar.setValue(1); return; }
    Animated.timing(keluar, { toValue: 1, duration: 900, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [kurangi, keluar]);

  const j = sekarang != null ? jadwal(acara, sekarang) : null;
  const acuan = sekarang != null ? mulaiAcuan(acara, sekarang) : null;
  const opsi = acuan != null ? (OPSI_PENGINGAT[0].waktu(acuan) > sekarang ? OPSI_PENGINGAT[0] : OPSI_PENGINGAT[1]) : null;
  const tiket = data.tiket.filter((t) => kode.includes(t.kode));
  const sudahIngat = !!opsi && tiket.length > 0 && tiket.every((t) => t.pengingat?.includes(opsi.id));
  const umumkan = (t) => { setKabar(t); setTimeout(() => setKabar(''), 2800); };

  const ingatkan = () => {
    if (!opsi) return;
    tiket.forEach((t) => data.ubahTiket(t.kode, { pengingat: sudahIngat ? (t.pengingat || []).filter((x) => x !== opsi.id) : [...new Set([...(t.pengingat || []), opsi.id])] }));
    umumkan(sudahIngat ? 'Pengingat dimatikan' : `Pengingat aktif: ${fmtPengingat(opsi.waktu(acuan))}`);
  };
  const ajak = async () => {
    const url = `${MEREK.url}/acara/${acara.slug}`;
    try {
      if (Platform.OS !== 'web') await Share.share({ message: `Aku ke ${acara.judul}, ikut yuk: ${url}` });
      else if (navigator.share) await navigator.share({ title: acara.judul, text: `Aku ke ${acara.judul}, ikut yuk!`, url });
      else { await navigator.clipboard.writeText(url); umumkan('Tautan acara disalin, kirim ke temanmu'); }
    } catch { /* dibatalkan */ }
  };

  const geser = keluar.interpolate({ inputRange: [0, 1], outputRange: [-300, 0] });
  const tanggal = j ? (acara.harian ? `${fmtTgl(j.mulai)}–${fmtTgl(j.selesai)}` : `${fmtHariPendek(j.mulai)}, ${fmtTgl(j.mulai)} · ${fmtJam(j.mulai)} WIB`) : '';
  const pesanSr = `${gratis ? 'Pendaftaran berhasil' : `Pembayaran lunas, ${rupiah(total)}`}, ${kode.length} e-tiket terbit.`;

  return (
    <View style={{ gap: 16 }}>
      <View role="status" aria-live="polite"><SR>{pesanSr}</SR></View>
      <View style={s.printer} aria-hidden>
        <View style={s.celah} />
        <Text style={s.printerTeks}>Karcis Wetan · mencetak {kode.length} tiket</Text>
      </View>
      <View style={s.jalurKeluar}>
        <Animated.View style={[s.karcis, { transform: [{ translateY: geser }, { rotate: '-1.2deg' }] }]}>
          <View style={[s.pita, { backgroundColor: tinta.a }]}>
            <View style={s.posterMini}><Poster acara={acara} hias /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Mono warna={W.tinta}>E-tiket · {kat.nama}</Mono>
              <Text style={s.judulKarcis}>{acara.judul}</Text>
              <Text style={s.metaKarcis}>{tanggal}</Text>
            </View>
          </View>
          <View style={s.isiKarcis}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.label}>Pemegang</Text>
              <Text style={s.nilai}>{nama[0]}{kode.length > 1 ? ` +${kode.length - 1}` : ''}</Text>
              <Text style={[s.label, { marginTop: 6 }]}>Kode</Text>
              <Text style={s.kode}>{kode[0]}</Text>
            </View>
            <View style={s.qr}><QR isi={isiQR(kode[0])} ukuran={86} /></View>
          </View>
          <Takik latar={W.malam} ukuran={22} />
          <View style={s.kaki}>
            <Text style={s.kakiTeks}>{acara.kota} · Gerbang {acara.gerbang?.[kat.id] || 'A'}</Text>
            <View style={s.cap}><Text style={s.capTeks}>{gratis ? 'Terdaftar' : 'Lunas'}</Text></View>
          </View>
        </Animated.View>
      </View>

      <View style={{ gap: 6 }}>
        <Judul level={1} ukuran={42}>Tiket terbit!</Judul>
        <T warna={W.redup}>{kode.length} e-tiket sudah masuk ke Tiketku dan bisa dibuka tanpa sinyal. Tunjukkan QR-nya di gerbang.</T>
      </View>

      {kabar ? <View style={s.kabar} role="status"><Text style={s.kabarTeks}>{kabar}</Text></View> : null}

      <View style={s.aksi}>
        <Aksi ikon="lonceng" label={sudahIngat ? 'Pengingat aktif' : opsi?.id === 'h1' ? 'Ingatkan H-1' : 'Ingatkan 3 jam sebelum'} aktif={sudahIngat} onPress={ingatkan} disabled={!opsi} />
        {Platform.OS === 'web' ? <Aksi ikon="kalender" label="Tambah ke kalender" onPress={() => { if (sekarang != null) { unduhIcs(acara, tiket.length ? tiket : kode.map((k) => ({ kode: k })), sekarang); umumkan('File kalender (.ics) diunduh'); } }} /> : null}
        <Aksi ikon="kirim" label="Kirim ke teman" onPress={() => router.push({ pathname: '/e-tiket', params: { kode: kode[0], alih: '1' } })} />
        <Aksi ikon="orang" label="Ajak teman ikut" onPress={ajak} />
      </View>

      {kode.length > 1 ? (
        <View style={{ gap: 8 }}>
          <Mono>Semua tiket di pesanan ini</Mono>
          {kode.map((k, i) => (
            <Link key={k} href={{ pathname: '/e-tiket', params: { kode: k } }} asChild>
              <Ketuk style={s.stub}>
                <Text style={s.stubNo}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.stubKode}>{k}</Text>
                  <Text style={s.stubNama}>{nama[i]}</Text>
                </View>
                <Ikon nama="kanan" warna={W.tinta} />
              </Ketuk>
            </Link>
          ))}
        </View>
      ) : null}

      <TombolTautan href={{ pathname: '/e-tiket', params: { kode: kode[0] } }} replace label="Buka e-tiket" />
      <TombolTautan href="/tiket" replace varian="garis" label="Ke Tiketku" />
    </View>
  );
}

function Aksi({ ikon, label, onPress, aktif, disabled }) {
  return (
    <Pressable role="button" onPress={onPress} disabled={disabled} aria-disabled={disabled || undefined} style={({ pressed }) => [s.tAksi, aktif && { backgroundColor: W.jingga, borderColor: W.jingga }, disabled && { opacity: 0.5 }, pressed && { opacity: 0.8 }]}>
      <Ikon nama={ikon} warna={aktif ? W.malam : W.terang} ukuran={22} />
      <Text style={[s.tAksiTeks, aktif && { color: W.malam }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  printer: { backgroundColor: W.malam3, borderRadius: 14, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, borderWidth: 1.5, borderColor: W.garis, zIndex: 2 },
  celah: { height: 8, borderRadius: 4, backgroundColor: '#07060b', marginBottom: 8 },
  printerTeks: { fontFamily: H.mono, fontSize: 12, color: W.redup, textTransform: 'uppercase', textAlign: 'center' },
  jalurKeluar: { overflow: 'hidden', marginTop: -24, paddingTop: 12, marginHorizontal: 8, paddingHorizontal: 4, paddingBottom: 6 },
  karcis: { backgroundColor: W.kertas, borderRadius: 18, overflow: 'hidden' },
  pita: { flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' },
  posterMini: { width: 52, transform: [{ rotate: '-5deg' }], backgroundColor: W.kertas },
  judulKarcis: { fontFamily: H.display, fontSize: 24, lineHeight: 24, color: W.tinta, textTransform: 'uppercase' },
  metaKarcis: { fontFamily: H.badan, fontSize: 13, color: W.tinta },
  isiKarcis: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center' },
  label: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  nilai: { fontFamily: H.tebal, fontSize: 16, color: W.tinta },
  kode: { fontFamily: H.mono, fontSize: 16, color: W.tinta, letterSpacing: 1 },
  qr: { padding: 4, borderRadius: 10, borderWidth: 2, borderColor: W.tinta },
  kaki: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: W.kertas2 },
  kakiTeks: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  cap: { borderWidth: 3, borderColor: W.hijauTua, borderRadius: 8, paddingHorizontal: 8, transform: [{ rotate: '-7deg' }] },
  capTeks: { fontFamily: H.display, fontSize: 22, color: W.hijauTua, textTransform: 'uppercase', letterSpacing: 1 },
  kabar: { backgroundColor: W.hijau, borderRadius: 12, padding: 12 },
  kabarTeks: { fontFamily: H.tebal, fontSize: 14, color: W.malam },
  aksi: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tAksi: { flexGrow: 1, flexBasis: '45%', minHeight: 60, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.malam2, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tAksiTeks: { fontFamily: H.tebal, fontSize: 14.5, color: W.terang, flexShrink: 1 },
  stub: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas, borderRadius: 14, padding: 12, minHeight: 56 },
  stubNo: { fontFamily: H.display, fontSize: 24, color: W.jinggaTua },
  stubKode: { fontFamily: H.mono, fontSize: 15, color: W.tinta, letterSpacing: 1 },
  stubNama: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
});
