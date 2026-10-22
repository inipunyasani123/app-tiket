import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ACARA, cariAcara, cariTiketKat, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { fmtJam, fmtStempel, relatifLalu, useSekarang } from '../../src/lib/waktu';
import { cariAcaraKode, dariQR, ketikKode, pembeliLain, rapikan, waktuTiba } from '../../src/lib/kode';
import { useData } from '../../src/lib/simpan';
import { Layar } from '../../src/ui/Layar';
import { Judul, Mono, T, Tombol } from '../../src/ui/dasar';
import { Ikon } from '../../src/ui/Ikon';
import { Pemindai } from '../../src/ui/Pemindai';

export function generateMetadata() {
  return meta({
    judul: 'Mode Panitia: Check-in Tiket di Gerbang | Karcis Wetan',
    deskripsi: 'Mode panitia demo Karcis Wetan: pindai QR atau ketik kode tiket, hitung pengunjung yang sudah masuk, dan tolak tiket ganda atau yang sudah dialihkan.',
    jalur: '/panitia',
  });
}

const HASIL = {
  sah: { judul: 'Sah, silakan masuk', warna: W.hijau, cap: 'Masuk' },
  ganda: { judul: 'Tiket ganda', warna: W.merah, cap: 'Ditolak' },
  dialihkan: { judul: 'Kode sudah dialihkan', warna: W.merah, cap: 'Ditolak' },
  lain: { judul: 'Tiket acara lain', warna: W.kuning, cap: 'Salah gerbang' },
  tak: { judul: 'Kode tidak terdaftar', warna: W.merah, cap: 'Ditolak' },
  cek: { judul: 'Kode salah ketik', warna: W.kuning, cap: 'Cek lagi' },
  format: { judul: 'Format kode salah', warna: W.kuning, cap: 'Cek lagi' },
};

export default function Panitia() {
  const sekarang = useSekarang();
  const data = useData();
  const [pilihan, setPilihan] = useState(null);
  const [gerbang, setGerbang] = useState('A');
  const [masukan, setMasukan] = useState('');
  const [hasil, setHasil] = useState(null);
  const gulir = useRef(null);
  const posHasil = useRef(0);

  // Acara bawaan: yang sedang buka, lalu yang terdekat.
  const bawaan = sekarang == null ? ACARA[0].slug
    : (ACARA.find((a) => ['berlangsung', 'jeda'].includes(statusAcara(a, sekarang))) || ACARA.find((a) => statusAcara(a, sekarang) === 'akan') || ACARA[0]).slug;
  const slug = pilihan || bawaan;
  const acara = cariAcara(slug);
  const tinta = TINTA[acara.tinta];
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;

  const lain = useMemo(() => (sekarang != null ? pembeliLain(slug) : null), [slug, sekarang != null]);
  const manual = data.masuk?.[slug] || {};
  const milikSini = data.dimuat ? data.tiket.filter((t) => t.acara === slug) : [];
  const terdaftar = acara.tiket.reduce((n, k) => n + k.terjual, 0) + milikSini.filter((t) => !t.asal && !t.contoh).length + milikSini.filter((t) => t.contoh).length;

  const statistik = useMemo(() => {
    if (!lain || sekarang == null) return { masuk: 0, akhir: null };
    let masuk = 0, akhir = null;
    for (const d of lain.urut) {
      if (manual[d.kode]) continue;
      const w = waktuTiba(acara, d, sekarang);
      if (w != null && w <= sekarang) { masuk++; if (!akhir || w > akhir) akhir = w; }
    }
    for (const m of Object.values(manual)) { masuk++; if (!akhir || m.waktu > akhir) akhir = m.waktu; }
    return { masuk, akhir };
  }, [lain, manual, sekarang, acara]);

  const log = data.dimuat ? data.log.filter((l) => l.acara === slug).slice(0, 8) : [];
  const ditolak = data.dimuat ? data.log.filter((l) => l.acara === slug && l.hasil !== 'sah').length : 0;

  function periksa(teks) {
    if (!data.dimuat) return;
    const r = rapikan(dariQR(teks));
    let h;
    if (r.status !== 'ok') h = { hasil: r.status, kode: r.kode ? ketikKode(r.kode) : String(teks), ket: r.status === 'cek' ? 'Karakter terakhir (digit cek) tidak cocok. Periksa lagi huruf dan angkanya.' : 'Kode berbentuk KW-XXXX-XXXX: 8 huruf/angka tanpa 0, O, 1, I, atau L.' };
    else {
      const kode = r.kode;
      const milik = data.tiket.find((t) => t.kode === kode);
      const seed = lain?.peta.get(kode);
      if ((milik && milik.acara !== slug) || (!milik && !seed && cariAcaraKode(kode))) {
        const a2 = cariAcara(milik ? milik.acara : cariAcaraKode(kode));
        h = { hasil: 'lain', kode, ket: `Kode ini untuk ${a2.judul} (${a2.kota}). Arahkan pengunjung ke acara yang benar.` };
      } else if (!milik && !seed) {
        h = { hasil: 'tak', kode, ket: 'Kode tidak ada di daftar pembeli acara ini. Bisa jadi tiket palsu atau dari perangkat lain.' };
      } else if (milik?.status === 'dialihkan' || seed?.dialihkan) {
        h = { hasil: 'dialihkan', kode, ket: milik?.dialihkanKe ? `Sudah dialihkan ke ${milik.dialihkanKe.nama} pada ${fmtStempel(milik.dialihkanKe.waktu)}. Kode lama tidak berlaku.` : 'Pemiliknya sudah mengalihkan tiket ini; kode lama tidak berlaku lagi.' };
      } else {
        const pemegang = milik ? milik.pemegang : seed.pemegang;
        const kat = cariTiketKat(acara, milik ? milik.kategori : seed.kategori);
        const m = manual[kode];
        const tiba = seed ? waktuTiba(acara, seed, sekarang) : null;
        if (m || (tiba != null && tiba <= sekarang)) {
          h = { hasil: 'ganda', kode, pemegang, ket: `Kode ini sudah masuk ${fmtStempel(m ? m.waktu : tiba)} lewat Gerbang ${m ? m.gerbang : seed.gerbang}. Tolak dan minta tunjukkan identitas bila perlu.` };
        } else {
          data.catatMasuk(slug, kode, gerbang);
          h = { hasil: 'sah', kode, pemegang, ket: `${pemegang} · ${kat.nama}. Tercatat masuk lewat Gerbang ${gerbang}.`.replace('.. ', '. ') };
        }
      }
    }
    setHasil({ ...h, waktu: Date.now() });
    data.catatLog({ acara: slug, kode: h.kode, hasil: h.hasil, gerbang });
    setMasukan('');
    requestAnimationFrame(() => gulir.current?.scrollTo({ y: Math.max(0, posHasil.current - 12), animated: true }));
  }

  const contoh = useMemo(() => {
    if (!lain || sekarang == null) return [];
    const daftar = [];
    const belum = lain.urut.filter((d) => !manual[d.kode] && (d.tiba == null || waktuTiba(acara, d, sekarang) > sekarang)).slice(0, 2);
    belum.forEach((d) => daftar.push({ kode: d.kode, ket: `Belum masuk · ${d.pemegang}` }));
    const sudah = lain.urut.find((d) => d.tiba != null && waktuTiba(acara, d, sekarang) <= sekarang);
    if (sudah) daftar.push({ kode: sudah.kode, ket: 'Sudah masuk (uji tiket ganda)' });
    daftar.push({ kode: lain.hangus[0].kode, ket: 'Kode lama yang sudah dialihkan' });
    const acaraLain = ACARA.find((a) => a.slug !== slug);
    daftar.push({ kode: pembeliLain(acaraLain.slug).urut[0].kode, ket: `Tiket ${acaraLain.kota} (acara lain)` });
    const k = lain.urut[3].kode;
    daftar.push({ kode: k.slice(0, -1) + (k.endsWith('Z') ? 'Y' : 'Z'), ket: 'Salah ketik satu huruf' });
    milikSini.filter((t) => !t.milikTeman || t.status === 'aktif').slice(0, 3).forEach((t) => daftar.unshift({ kode: t.kode, ket: t.milikTeman ? `Milik ${t.pemegang} (hasil alih)` : t.status === 'dialihkan' ? 'Tiketmu (sudah dialihkan)' : 'Tiketmu di perangkat ini' }));
    return daftar;
  }, [lain, sekarang, manual, slug, milikSini, acara]);

  const persen = terdaftar ? Math.min(100, Math.round((statistik.masuk / terdaftar) * 100)) : 0;
  const tampil = hasil ? HASIL[hasil.hasil] : null;

  return (
    <Layar ref={gulir} bawah={24}>
      <View style={s.pita} aria-hidden>
        {Array.from({ length: 16 }).map((_, i) => <View key={i} style={s.pitaStrip} />)}
      </View>
      <View style={s.kepala}>
        <Mono warna={W.kuning}>Mode panitia · hanya untuk petugas</Mono>
        <Judul level={1} ukuran={40}>Check-in gerbang</Judul>
      </View>

      <View style={s.bagian}>
        <Mono style={{ marginBottom: 8 }}>Acara</Mono>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16 }}>
          {ACARA.map((a) => {
            const aktif = a.slug === slug;
            return (
              <Pressable key={a.slug} role="button" aria-pressed={aktif} onPress={() => { setPilihan(a.slug); setHasil(null); }} style={[s.pilihAcara, aktif && { backgroundColor: TINTA[a.tinta].a, borderColor: TINTA[a.tinta].a }]}>
                <Text style={[s.pilihJudul, aktif && { color: W.tinta }]}>{a.baris.join(' ')}</Text>
                <Text style={[s.pilihKota, aktif && { color: W.tinta }]}>{a.kota}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[s.bagian, s.bento]}>
        <View style={[s.ubin, s.ubinBesar, { backgroundColor: W.kertas }]}>
          <View style={s.baris}>
            <Mono warna={W.tinta2}>Sudah masuk</Mono>
            <Mono warna={st === 'berlangsung' ? W.hijauTua : W.tinta2}>{st === 'berlangsung' ? 'Gerbang buka' : st === 'jeda' ? 'Tutup sementara' : st === 'selesai' ? 'Acara selesai' : st === 'akan' ? 'Belum buka · mode uji' : '…'}</Mono>
          </View>
          <Text style={s.angka} aria-live="polite">
            {sekarang == null ? '–' : statistik.masuk}
            <Text style={s.angkaKecil}> / {terdaftar}</Text>
          </Text>
          <View style={s.meter} role="progressbar" aria-label={`${statistik.masuk} dari ${terdaftar} pengunjung sudah masuk`} aria-valuemin={0} aria-valuemax={terdaftar} aria-valuenow={statistik.masuk}>
            <View style={[s.meterIsi, { width: `${persen}%`, backgroundColor: tinta.a }]} />
          </View>
          <Text style={s.ket}>{acara.judul} · {persen}% terdaftar sudah masuk</Text>
        </View>
        <View style={[s.ubin, { backgroundColor: W.malam3 }]}>
          <Mono>Ditolak</Mono>
          <Text style={[s.angkaSedang, { color: W.merah }]}>{data.dimuat ? ditolak : '–'}</Text>
          <Text style={s.ketTerang}>dari pemeriksaan di perangkat ini</Text>
        </View>
        <View style={[s.ubin, { backgroundColor: W.malam3 }]}>
          <Mono>Terakhir masuk</Mono>
          <Text style={[s.angkaSedang, { fontSize: 26, lineHeight: 30 }]}>{statistik.akhir ? fmtJam(statistik.akhir) : '–'}</Text>
          <Text style={s.ketTerang}>{statistik.akhir ? relatifLalu(statistik.akhir, sekarang) : 'belum ada'}</Text>
        </View>
      </View>

      <View style={[s.bagian, s.panel]}>
        <View style={s.baris}>
          <Judul level={2} ukuran={26}>Periksa tiket</Judul>
          <View style={s.segmen} role="radiogroup" aria-label="Gerbang">
            {['A', 'B'].map((g) => (
              <Pressable key={g} role="radio" aria-checked={gerbang === g} onPress={() => setGerbang(g)} style={[s.segItem, gerbang === g && { backgroundColor: W.kuning }]}>
                <Text style={[s.segTeks, gerbang === g && { color: W.tinta }]}>Gerbang {g}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pemindai onKode={periksa} />
        <View style={{ gap: 6 }}>
          <Text nativeID="label-kode" style={s.label}>Atau ketik kode tiket</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={masukan}
              onChangeText={(v) => setMasukan(ketikKode(v))}
              onSubmitEditing={() => masukan && periksa(masukan)}
              aria-labelledby="label-kode"
              placeholder="KW-XXXX-XXXX"
              placeholderTextColor={W.tinta2}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              maxLength={12}
              returnKeyType="done"
              style={s.input}
            />
            <Tombol label="Periksa" onPress={() => periksa(masukan)} disabled={!masukan} />
          </View>
        </View>
      </View>

      <View onLayout={(e) => { posHasil.current = e.nativeEvent.layout.y; }} style={s.bagian} aria-live="assertive">
        {tampil ? (
          <View style={[s.hasil, { borderColor: tampil.warna }]}>
            <View style={s.baris}>
              <Mono>Hasil · {fmtJam(hasil.waktu)} WIB · Gerbang {gerbang}</Mono>
              <View style={[s.cap, { borderColor: tampil.warna }]}><Text style={[s.capTeks, { color: tampil.warna }]}>{tampil.cap}</Text></View>
            </View>
            <View style={[s.baris, { justifyContent: 'flex-start' }]}>
              <Ikon nama={hasil.hasil === 'sah' ? 'cek' : 'silang'} warna={tampil.warna} ukuran={26} />
              <Text style={[s.hasilJudul, { color: tampil.warna }]}>{tampil.judul}</Text>
            </View>
            <Text style={s.hasilKode}>{hasil.kode}</Text>
            <T ukuran={14.5}>{hasil.ket}</T>
          </View>
        ) : null}
      </View>

      <View style={s.bagian}>
        <Judul level={2} ukuran={24}>Kode untuk dicoba</Judul>
        <T ukuran={13.5} warna={W.redup} style={{ marginVertical: 6 }}>Ketuk salah satu untuk memeriksanya. Coba kode yang sama dua kali untuk melihat penolakan tiket ganda.</T>
        <View style={{ gap: 8 }}>
          {contoh.length ? contoh.map((c) => (
            <Pressable key={c.kode + c.ket} role="button" aria-label={`Periksa ${c.kode}: ${c.ket}`} onPress={() => periksa(c.kode)} style={({ pressed }) => [s.contoh, pressed && { opacity: 0.8 }]}>
              <Text style={s.contohKode}>{c.kode}</Text>
              <Text style={s.contohKet} numberOfLines={1}>{c.ket}</Text>
              <Ikon nama="kanan" warna={W.redup} ukuran={18} />
            </Pressable>
          )) : <Mono>Menyiapkan daftar…</Mono>}
        </View>
      </View>

      {log.length ? (
        <View style={s.bagian}>
          <Judul level={2} ukuran={24}>Riwayat di perangkat ini</Judul>
          <View style={{ marginTop: 8 }}>
            {log.map((l) => (
              <View key={l.id} style={s.log}>
                <Text style={s.logJam}>{fmtJam(l.waktu)}</Text>
                <View style={[s.logTitik, { backgroundColor: HASIL[l.hasil].warna }]} />
                <Text style={s.logKode}>{l.kode}</Text>
                <Text style={[s.logHasil, { color: HASIL[l.hasil].warna }]}>{HASIL[l.hasil].cap} · {l.gerbang}</Text>
              </View>
            ))}
          </View>
          <Tombol kecil varian="garis" label="Atur ulang check-in acara ini" onPress={() => { data.resetPanitia(slug); setHasil(null); }} style={{ marginTop: 12 }} />
        </View>
      ) : null}
    </Layar>
  );
}

const s = StyleSheet.create({
  pita: { height: 14, flexDirection: 'row', backgroundColor: W.kuning, overflow: 'hidden', marginTop: -8 },
  pitaStrip: { width: 16, height: 40, marginRight: 16, backgroundColor: W.tinta, transform: [{ rotate: '35deg' }], marginTop: -12 },
  kepala: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 4 },
  bagian: { paddingHorizontal: 16, marginBottom: 14 },
  pilihAcara: { borderRadius: 14, borderWidth: 1.5, borderColor: W.garis, paddingHorizontal: 12, paddingVertical: 8, minWidth: 112 },
  pilihJudul: { fontFamily: H.display, fontSize: 18, lineHeight: 19, color: W.terang, textTransform: 'uppercase' },
  pilihKota: { fontFamily: H.badan, fontSize: 12, color: W.redup },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ubin: { flexGrow: 1, flexBasis: '45%', borderRadius: 18, padding: 14, gap: 4 },
  ubinBesar: { flexBasis: '100%' },
  baris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  angka: { fontFamily: H.display, fontSize: 72, lineHeight: 72, color: W.tinta, marginTop: 4 },
  angkaKecil: { fontFamily: H.display, fontSize: 30, color: W.tinta2 },
  angkaSedang: { fontFamily: H.display, fontSize: 40, lineHeight: 42, color: W.terang },
  meter: { height: 10, borderRadius: 5, backgroundColor: W.kertas2, overflow: 'hidden', marginVertical: 6 },
  meterIsi: { height: 10, borderRadius: 5 },
  ket: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
  ketTerang: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
  panel: { gap: 14, backgroundColor: W.malam2, marginHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderWidth: 1.5, borderColor: W.garis },
  segmen: { flexDirection: 'row', backgroundColor: W.malam3, borderRadius: 12, padding: 3 },
  segItem: { paddingHorizontal: 10, minHeight: 36, justifyContent: 'center', borderRadius: 9 },
  segTeks: { fontFamily: H.tebal, fontSize: 13, color: W.terang },
  label: { fontFamily: H.tebal, fontSize: 14, color: W.terang },
  input: { flex: 1, minHeight: 50, borderRadius: 12, borderWidth: 2, borderColor: W.kertas2, backgroundColor: W.kertas, color: W.tinta, paddingHorizontal: 14, fontFamily: H.mono, fontSize: 17, letterSpacing: 1 },
  hasil: { borderWidth: 2.5, borderRadius: 20, padding: 16, gap: 8, backgroundColor: W.malam2, overflow: 'hidden' },
  cap: { borderWidth: 3, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, transform: [{ rotate: '6deg' }] },
  capTeks: { fontFamily: H.display, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 },
  hasilJudul: { fontFamily: H.display, fontSize: 30, lineHeight: 30, textTransform: 'uppercase', flex: 1 },
  hasilKode: { fontFamily: H.mono, fontSize: 18, color: W.terang, letterSpacing: 1.5 },
  contoh: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: W.malam2, borderRadius: 12, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 12, minHeight: 48 },
  contohKode: { fontFamily: H.mono, fontSize: 14, color: W.terang, letterSpacing: 0.5 },
  contohKet: { flex: 1, fontFamily: H.badan, fontSize: 12.5, color: W.redup },
  log: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: W.garis },
  logJam: { fontFamily: H.mono, fontSize: 12, color: W.redup, width: 42 },
  logTitik: { width: 8, height: 8, borderRadius: 4 },
  logKode: { fontFamily: H.mono, fontSize: 13, color: W.terang, flex: 1 },
  logHasil: { fontFamily: H.mono, fontSize: 11, textTransform: 'uppercase' },
});
