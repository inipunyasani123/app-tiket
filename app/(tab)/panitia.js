import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ACARA, cariAcara, cariTiketKat, jendela, statusAcara } from '../../src/data/acara';
import { H, TINTA, W } from '../../src/lib/tema';
import { meta } from '../../src/lib/meta';
import { MENIT, fmtJam, fmtStempel, relatifLalu, useSekarang } from '../../src/lib/waktu';
import { cariAcaraKode, dariQR, ketikKode, pembeliLain, rapikan, riwayatContoh, samarkan, waktuTiba } from '../../src/lib/kode';
import { useData } from '../../src/lib/simpan';
import { useLapisan } from '../../src/lib/lapisan';
import { persen, ribuan } from '../../src/lib/angka';
import { bunyi, getar } from '../../src/lib/getar';
import { Layar } from '../../src/ui/Layar';
import { Chip, Judul, Mono, T, Tombol } from '../../src/ui/dasar';
import { Ikon } from '../../src/ui/Ikon';
import { Pemindai } from '../../src/ui/Pemindai';
import { GAYA_HASIL, HasilPindai } from '../../src/ui/HasilPindai';
import { BilahRincian, GrafikLaju } from '../../src/ui/Grafik';
import { Lembar } from '../../src/ui/Lembar';
import { Kosong } from '../../src/ui/Kosong';

export function generateMetadata() {
  return meta({
    judul: 'Mode Panitia: Check-in Tiket di Gerbang | Karcis Wetan',
    deskripsi: 'Mode panitia demo Karcis Wetan: pindai QR atau ketik kode tiket, pantau laju masuk per gerbang, daftar hadir, dan tolak tiket ganda.',
    jalur: '/panitia',
  });
}

const LABEL = { sah: 'Masuk', ganda: 'Ganda', dialihkan: 'Dialihkan', tak: 'Tak dikenal', lain: 'Acara lain', cek: 'Salah ketik', format: 'Format' };
const ALASAN = ['HP pengunjung mati', 'Layar retak / QR tak terbaca', 'Cocokkan dengan KTP', 'Lainnya'];

export default function Panitia() {
  const sekarang = useSekarang();
  const data = useData();
  const lapisan = useLapisan();
  const [mode, setMode] = useState('periksa');
  const [pilihan, setPilihan] = useState(null);
  const [gerbang, setGerbang] = useState('A');
  const [masukan, setMasukan] = useState('');
  const [kabar, setKabar] = useState('');
  const [detail, setDetail] = useState(null);
  const input = useRef(null);

  // Acara bawaan: yang sedang buka, lalu yang terdekat.
  const bawaan = sekarang == null ? ACARA[0].slug
    : (ACARA.find((a) => ['berlangsung', 'jeda'].includes(statusAcara(a, sekarang))) || ACARA.find((a) => statusAcara(a, sekarang) === 'akan') || ACARA[0]).slug;
  const slug = pilihan || bawaan;
  const acara = cariAcara(slug);
  const tinta = TINTA[acara.tinta];
  const st = sekarang != null ? statusAcara(acara, sekarang) : null;
  const menit = sekarang != null ? Math.floor(sekarang / MENIT) : null;

  const lain = useMemo(() => (menit != null ? pembeliLain(slug) : null), [slug, menit != null]);
  const contoh = useMemo(() => (menit != null ? riwayatContoh(acara, menit * MENIT + 59999) : []), [acara, menit]);
  const manual = data.masuk?.[slug] || {};
  const milikSini = data.dimuat ? data.tiket.filter((t) => t.acara === slug) : [];

  const ringkas = useMemo(() => {
    const terdaftarKat = Object.fromEntries(acara.tiket.map((k) => [k.id, k.terjual + milikSini.filter((t) => t.kategori === k.id && !t.asal).length]));
    const terdaftar = Object.values(terdaftarKat).reduce((a, b) => a + b, 0);
    const masukKat = Object.fromEntries(acara.tiket.map((k) => [k.id, 0]));
    const gerb = { A: 0, B: 0 };
    const waktuMasuk = [];
    let ditolak = 0;
    for (const e of contoh) {
      if (e.hasil !== 'sah') { ditolak++; continue; }
      if (manual[e.kode]) continue;
      masukKat[e.kategori]++; gerb[e.gerbang]++; waktuMasuk.push(e.waktu);
    }
    for (const [kode, m] of Object.entries(manual)) {
      const t = milikSini.find((x) => x.kode === kode) || lain?.peta.get(kode);
      if (t) masukKat[t.kategori] = (masukKat[t.kategori] || 0) + 1;
      gerb[m.gerbang] = (gerb[m.gerbang] || 0) + 1; waktuMasuk.push(m.waktu);
    }
    const logSini = data.dimuat ? data.log.filter((l) => l.acara === slug) : [];
    ditolak += logSini.filter((l) => l.hasil !== 'sah').length;
    const masuk = Object.values(masukKat).reduce((a, b) => a + b, 0);
    const akhir = waktuMasuk.length ? Math.max(...waktuMasuk) : null;
    // laju per 15 menit: 3 jam terakhir dari jendela buka yang sedang/terakhir berjalan
    let ember = null;
    if (sekarang != null) {
      const w = jendela(acara, sekarang).filter(([a]) => a <= sekarang).pop();
      if (w && akhir) {
        const ujung = Math.min(sekarang, w[1]);
        const K = 15 * MENIT;
        const mulai = Math.floor(Math.max(w[0], ujung - 180 * MENIT) / K) * K; // sejajar kelipatan 15 menit
        const n = Math.max(1, Math.ceil((ujung - mulai) / K));
        ember = Array.from({ length: n }, (_, i) => ({ awal: mulai + i * 15 * MENIT, jumlah: 0 }));
        for (const t of waktuMasuk) { const i = Math.floor((t - mulai) / (15 * MENIT)); if (i >= 0 && i < n) ember[i].jumlah++; }
        if (ember.every((e) => e.jumlah === 0)) ember = null;
      }
    }
    const riwayat = [...logSini.map((l) => ({ ...l, kamu: true })), ...contoh.filter((e) => !(e.hasil === 'sah' && manual[e.kode]))].sort((a, b) => b.waktu - a.waktu).slice(0, 10);
    return { terdaftar, terdaftarKat, masukKat, masuk, gerb, akhir, ditolak, ember, riwayat };
  }, [acara, contoh, manual, milikSini, lain, data.dimuat, data.log, slug, sekarang]);

  const tutupHasil = useCallback(() => {
    lapisan.tutup();
    if (Platform.OS === 'web') requestAnimationFrame(() => input.current?.focus?.());
  }, [lapisan]);

  const umumkan = (t) => { setKabar(t); setTimeout(() => setKabar(''), 3000); };

  function periksa(teks, alasanManual) {
    if (!data.dimuat || sekarang == null) return;
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
        h = { hasil: 'dialihkan', kode, pemegang: milik?.pemegang || seed.pemegang, ket: milik?.dialihkanKe ? `Sudah dialihkan ke ${milik.dialihkanKe.nama} pada ${fmtStempel(milik.dialihkanKe.waktu)}. Kode lama tidak berlaku.` : 'Pemiliknya sudah mengalihkan tiket ini; kode lama tidak berlaku lagi.' };
      } else {
        const pemegang = milik ? milik.pemegang : seed.pemegang;
        const kat = cariTiketKat(acara, milik ? milik.kategori : seed.kategori);
        const m = manual[kode];
        const tiba = seed ? waktuTiba(acara, seed, sekarang) : null;
        if (m || (tiba != null && tiba <= sekarang)) {
          h = { hasil: 'ganda', kode, pemegang, kategori: kat.nama, ket: `Sudah masuk ${fmtStempel(m ? m.waktu : tiba)} lewat Gerbang ${m ? m.gerbang : seed.gerbang}. Tolak, lalu minta pengunjung menunjukkan identitas bila perlu.` };
        } else {
          data.catatMasuk(slug, kode, gerbang, alasanManual);
          h = { hasil: 'sah', kode, pemegang, kategori: kat.nama, ket: alasanManual ? `Dicatat manual: ${alasanManual}. Gerbang ${gerbang}.` : `Tercatat masuk lewat Gerbang ${gerbang}. Sobek karcis kertas bila ada.` };
        }
      }
    }
    const logId = data.catatLog({ acara: slug, kode: h.kode, hasil: h.hasil, gerbang, ...(alasanManual ? { manual: true } : {}) });
    const sah = h.hasil === 'sah';
    if (data.setel?.getar !== false) getar(sah ? 'sukses' : 'gagal');
    if (data.setel?.bunyi) bunyi(sah ? 'sukses' : 'gagal');
    setMasukan('');
    lapisan.buka(
      <HasilPindai
        hasil={{ ...h, gerbang, waktu: Date.now(), acaraPendek: acara.baris.join(' ') }}
        onTutup={tutupHasil}
        onUrungkan={sah ? () => { data.batalMasuk(slug, h.kode, logId); tutupHasil(); umumkan(`Check-in ${h.kode} diurungkan.`); } : null}
      />,
    );
  }

  const kodeUji = useMemo(() => {
    if (!lain || sekarang == null) return [];
    const daftar = [];
    lain.urut.filter((d) => !manual[d.kode] && (d.tiba == null || waktuTiba(acara, d, sekarang) > sekarang)).slice(0, 2)
      .forEach((d) => daftar.push({ kode: d.kode, ket: `Belum masuk · ${d.pemegang}` }));
    const sudah = lain.urut.find((d) => d.tiba != null && waktuTiba(acara, d, sekarang) <= sekarang && !manual[d.kode]);
    if (sudah) daftar.push({ kode: sudah.kode, ket: `Sudah masuk · uji tiket ganda` });
    daftar.push({ kode: lain.hangus[0].kode, ket: 'Kode lama yang sudah dialihkan' });
    const acaraLain = ACARA.find((a) => a.slug !== slug);
    daftar.push({ kode: pembeliLain(acaraLain.slug).urut[0].kode, ket: `Tiket ${acaraLain.kota} (acara lain)` });
    const k = lain.urut[3].kode;
    daftar.push({ kode: k.slice(0, -1) + (k.endsWith('Z') ? 'Y' : 'Z'), ket: 'Salah ketik satu huruf' });
    milikSini.slice(0, 3).forEach((t) => daftar.unshift({ kode: t.kode, ket: t.milikTeman ? `Milik ${t.pemegang} (hasil alih)` : t.status === 'dialihkan' ? 'Tiketmu (sudah dialihkan)' : 'Tiketmu di perangkat ini' }));
    return daftar;
  }, [lain, sekarang, manual, slug, milikSini, acara]);

  const siap = sekarang != null && data.dimuat;
  const lengkap = masukan.length === 12;
  const labelStatus = st === 'berlangsung' ? 'Gerbang buka' : st === 'jeda' ? 'Tutup sementara' : st === 'selesai' ? 'Acara selesai' : st === 'akan' ? 'Belum buka · mode uji' : 'Memuat…';

  return (
    <View style={{ flex: 1, backgroundColor: W.malam }}>
      <Layar bawah={24}>
        <View style={s.pita} aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => <View key={i} style={s.pitaStrip} />)}
        </View>
        <View style={s.kepala}>
          <Mono warna={W.kuning}>Mode panitia · hanya untuk petugas</Mono>
          <Judul level={1} ukuran={40}>Check-in gerbang</Judul>
        </View>

        <View style={[s.bagian, s.segmen]} role="tablist" aria-label="Tampilan panitia">
          {[['periksa', 'Periksa tiket', 'pindai'], ['hadir', 'Daftar hadir', 'daftar']].map(([id, label, ikon]) => (
            <Pressable key={id} role="tab" aria-selected={mode === id} onPress={() => setMode(id)} style={[s.segItem, mode === id && { backgroundColor: W.kuning }]}>
              <Ikon nama={ikon} warna={mode === id ? W.tinta : W.terang} ukuran={18} />
              <Text style={[s.segTeks, mode === id && { color: W.tinta }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.bagian}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16 }} accessibilityLabel="Pilih acara">
            {ACARA.map((a) => {
              const aktif = a.slug === slug;
              return (
                <Pressable key={a.slug} role="button" aria-pressed={aktif} onPress={() => setPilihan(a.slug)} style={[s.pilihAcara, aktif && { backgroundColor: TINTA[a.tinta].a, borderColor: TINTA[a.tinta].a }]}>
                  <Text style={[s.pilihJudul, aktif && { color: W.tinta }]}>{a.baris.join(' ')}</Text>
                  <Text style={[s.pilihKota, aktif && { color: W.tinta }]}>{a.kota}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {kabar ? <View style={[s.bagian]}><View style={s.kabar} role="status"><Text style={s.kabarTeks}>{kabar}</Text></View></View> : <View role="status" />}

        {mode === 'periksa' ? (
          <>
            <View style={[s.bagian, s.panel]}>
              <View style={s.baris}>
                <Judul level={2} ukuran={26}>Periksa tiket</Judul>
                <View style={s.gerbang} role="radiogroup" aria-label="Gerbang">
                  {['A', 'B'].map((g) => (
                    <Pressable key={g} role="radio" aria-checked={gerbang === g} onPress={() => setGerbang(g)} style={[s.gItem, gerbang === g && { backgroundColor: W.kuning }]}>
                      <Text style={[s.gTeks, gerbang === g && { color: W.tinta }]}>Gerbang {g}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pemindai onKode={(t) => periksa(t)} />
              <View style={{ gap: 6 }}>
                <Text nativeID="label-kode" style={s.label}>Atau ketik kode tiket</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    ref={input}
                    value={masukan}
                    onChangeText={(v) => setMasukan(ketikKode(v))}
                    onSubmitEditing={() => lengkap && periksa(masukan)}
                    aria-labelledby="label-kode"
                    aria-describedby="bantu-kode"
                    placeholder="KW-XXXX-XXXX"
                    placeholderTextColor={W.tinta2}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    maxLength={12}
                    returnKeyType="done"
                    style={s.input}
                  />
                  <Tombol label="Periksa" onPress={() => periksa(masukan)} disabled={!lengkap || !siap} />
                </View>
                <Text nativeID="bantu-kode" style={s.bantu}>{lengkap ? 'Tekan Periksa atau Enter.' : `Ketik lengkap 12 karakter (${masukan.length}/12), contoh KW-7K3Q-9XPA.`}</Text>
              </View>
              <View style={s.setel}>
                <Chip label={data.setel?.getar !== false ? 'Getar: nyala' : 'Getar: mati'} aktif={data.setel?.getar !== false} onPress={() => data.atur({ setel: { ...data.setel, getar: data.setel?.getar === false } })} warna={W.kuning} />
                <Chip label={data.setel?.bunyi ? 'Bunyi: nyala' : 'Bunyi: mati'} aktif={!!data.setel?.bunyi} onPress={() => data.atur({ setel: { ...data.setel, bunyi: !data.setel?.bunyi } })} warna={W.kuning} />
              </View>
            </View>

            <View style={[s.bagian, s.bento]}>
              <View style={[s.ubin, s.ubinBesar, { backgroundColor: W.kertas }]}>
                <View style={s.baris}>
                  <Mono warna={W.tinta2}>Sudah masuk</Mono>
                  <Mono warna={st === 'berlangsung' ? W.hijauTua : W.tinta2}>{labelStatus}</Mono>
                </View>
                {siap ? (
                  <Text style={s.angka} aria-live="polite">{ribuan(ringkas.masuk)}<Text style={s.angkaKecil}> / {ribuan(ringkas.terdaftar)}</Text></Text>
                ) : <View style={s.kerangkaAngka} aria-label="Memuat angka" />}
                <View style={s.meter} role="progressbar" aria-label={`${ringkas.masuk} dari ${ringkas.terdaftar} pengunjung sudah masuk`} aria-valuemin={0} aria-valuemax={ringkas.terdaftar} aria-valuenow={ringkas.masuk}>
                  <View style={[s.meterIsi, { width: siap ? `${Math.min(100, (ringkas.masuk / Math.max(1, ringkas.terdaftar)) * 100)}%` : '0%', backgroundColor: tinta.a }]} />
                </View>
                <Text style={s.ket}>{siap ? `${persen(ringkas.masuk, ringkas.terdaftar)} terdaftar sudah masuk · ${acara.judul}` : 'Membaca data gerbang…'}</Text>
              </View>
              <View style={[s.ubin, { backgroundColor: W.malam3 }]}>
                <Mono>Ditolak</Mono>
                <Text style={[s.angkaSedang, { color: W.merah }]}>{siap ? ringkas.ditolak : '--'}</Text>
                <Text style={s.ketTerang}>ganda, dialihkan, salah</Text>
              </View>
              <View style={[s.ubin, { backgroundColor: W.malam3 }]}>
                <Mono>Terakhir masuk</Mono>
                <Text style={[s.angkaSedang, { fontSize: 30, lineHeight: 42 }]}>{siap && ringkas.akhir ? fmtJam(ringkas.akhir) : '--.--'}</Text>
                <Text style={s.ketTerang}>{siap ? (ringkas.akhir ? relatifLalu(ringkas.akhir, sekarang) : 'belum ada') : 'memuat…'}</Text>
              </View>
            </View>

            <View style={[s.bagian, s.kartuGelap]}>
              <Judul level={2} ukuran={24}>Laju masuk per 15 menit</Judul>
              {siap && ringkas.ember ? (
                <GrafikLaju ember={ringkas.ember} warna={tinta.a} />
              ) : (
                <T ukuran={14} warna={W.redup}>{st === 'akan' ? 'Gerbang belum dibuka. Grafik muncul setelah pengunjung pertama masuk; mode uji tetap bisa mencatat.' : 'Belum ada pengunjung masuk di jendela buka terakhir.'}</T>
              )}
            </View>

            <View style={[s.bagian, s.kartuGelap]}>
              <Judul level={2} ukuran={24}>Rincian</Judul>
              <Mono>Per gerbang</Mono>
              <BilahRincian baris={['A', 'B'].map((g) => ({ label: `Gerbang ${g}`, nilai: ringkas.gerb[g] || 0, total: Math.max(1, ringkas.masuk), warna: g === 'A' ? tinta.a : tinta.b }))} />
              <Mono style={{ marginTop: 6 }}>Per kategori tiket</Mono>
              <BilahRincian baris={acara.tiket.map((k) => ({ label: k.nama, nilai: ringkas.masukKat[k.id] || 0, total: ringkas.terdaftarKat[k.id], warna: tinta.a }))} />
            </View>

            <View style={s.bagian}>
              <Judul level={2} ukuran={24}>Riwayat pemeriksaan</Judul>
              <T ukuran={13} warna={W.redup} style={{ marginTop: 4, marginBottom: 6 }}>10 terakhir dari semua gerbang. Baris bertanda “kamu” dicatat di perangkat ini.</T>
              {ringkas.riwayat.length ? ringkas.riwayat.map((l) => (
                <View key={(l.id || l.kode) + l.waktu + l.hasil} style={s.log}>
                  <Text style={s.logJam}>{fmtJam(l.waktu)}</Text>
                  <View style={[s.logPil, { backgroundColor: GAYA_HASIL[l.hasil].latar }]}><Text style={s.logPilTeks}>{LABEL[l.hasil]}</Text></View>
                  <Text style={s.logKode} numberOfLines={1}>{l.kamu ? l.kode : samarkan(l.kode)}</Text>
                  <Text style={s.logGerbang}>{l.gerbang}{l.kamu ? ' · kamu' : ''}</Text>
                </View>
              )) : <T ukuran={14} warna={W.redup}>Belum ada pemeriksaan untuk acara ini.</T>}
              {data.dimuat && data.log.some((l) => l.acara === slug) ? (
                <Tombol kecil varian="garis" label="Atur ulang catatan di perangkat ini" onPress={() => data.resetPanitia(slug)} style={{ marginTop: 12 }} />
              ) : null}
            </View>

            <View style={s.bagian}>
              <Judul level={2} ukuran={24}>Kode untuk dicoba</Judul>
              <T ukuran={13.5} warna={W.redup} style={{ marginVertical: 6 }}>Ketuk salah satu untuk memeriksanya. Periksa kode yang sama dua kali untuk melihat penolakan tiket ganda.</T>
              <View style={{ gap: 8 }}>
                {kodeUji.length ? kodeUji.map((c) => (
                  <Pressable key={c.kode + c.ket} role="button" aria-label={`Periksa ${c.kode}: ${c.ket}`} onPress={() => periksa(c.kode)} style={({ pressed }) => [s.contoh, pressed && { opacity: 0.8 }]}>
                    <Text style={s.contohKode}>{c.kode}</Text>
                    <Text style={s.contohKet} numberOfLines={1}>{c.ket}</Text>
                    <Ikon nama="kanan" warna={W.redup} ukuran={18} />
                  </Pressable>
                )) : <Mono>Menyiapkan daftar…</Mono>}
              </View>
            </View>
          </>
        ) : (
          <DaftarHadir acara={acara} lain={lain} contoh={contoh} manual={manual} milikSini={milikSini} sekarang={sekarang} siap={siap} onDetail={setDetail} />
        )}
      </Layar>

      <Lembar buka={!!detail} tutup={() => setDetail(null)} judul={detail ? detail.pemegang : 'Detail'}>
        {detail ? <DetailHadir d={detail} acara={acara} onCatat={(alasan) => { setDetail(null); periksa(detail.kode, alasan); }} /> : null}
      </Lembar>
    </View>
  );
}

function DaftarHadir({ acara, lain, contoh, manual, milikSini, sekarang, siap, onDetail }) {
  const [q, setQ] = useState('');
  const [saring, setSaring] = useState('semua');
  const [batas, setBatas] = useState(40);
  const baris = useMemo(() => {
    if (!siap || !lain) return [];
    const masukSeed = new Map(contoh.filter((e) => e.hasil === 'sah').map((e) => [e.kode, e]));
    if (saring === 'ditolak') {
      return contoh.filter((e) => e.hasil !== 'sah').map((e) => ({ kode: e.kode, pemegang: e.pemegang, kategori: e.kategori, status: 'ditolak', alasan: LABEL[e.hasil], waktu: e.waktu, gerbang: e.gerbang }));
    }
    const semua = [
      ...milikSini.map((t) => ({ kode: t.kode, pemegang: t.pemegang, kategori: t.kategori, status: t.status === 'dialihkan' ? 'dialihkan' : manual[t.kode] ? 'masuk' : 'belum', waktu: manual[t.kode]?.waktu, gerbang: manual[t.kode]?.gerbang, milikku: true })),
      ...lain.urut.map((d) => {
        const m = manual[d.kode] || masukSeed.get(d.kode);
        return { kode: d.kode, pemegang: d.pemegang, kategori: d.kategori, status: m ? 'masuk' : 'belum', waktu: m?.waktu, gerbang: m?.gerbang, manual: manual[d.kode]?.manual };
      }),
    ];
    return semua.filter((b) => saring === 'semua' || b.status === saring);
  }, [siap, lain, contoh, manual, milikSini, saring]);
  const kata = q.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const tampil = kata ? baris.filter((b) => `${b.pemegang} ${b.kode}`.toLowerCase().replace(/[^a-z0-9 ]/g, '').includes(kata)) : baris;
  return (
    <View style={s.bagian}>
      <Judul level={2} ukuran={26}>Daftar hadir</Judul>
      <View style={[s.cari, { marginTop: 10 }]}>
        <Ikon nama="cari" warna={W.tinta2} ukuran={20} />
        <TextInput value={q} onChangeText={(v) => { setQ(v); setBatas(40); }} placeholder="Cari nama atau kode" placeholderTextColor={W.tinta2} aria-label="Cari nama atau kode di daftar hadir" autoCorrect={false} style={s.cariInput} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginRight: -16, marginVertical: 10 }}>
        {[['semua', 'Semua'], ['masuk', 'Masuk'], ['belum', 'Belum'], ['ditolak', 'Ditolak']].map(([id, l]) => (
          <Chip key={id} label={l} aktif={saring === id} onPress={() => { setSaring(id); setBatas(40); }} warna={W.kuning} />
        ))}
      </ScrollView>
      <Mono aria-live="polite">{siap ? `${ribuan(tampil.length)} orang · ${acara.judul}` : 'Memuat daftar…'}</Mono>
      <View style={{ marginTop: 8 }} role="list">
        {tampil.slice(0, batas).map((b, i) => (
          <View key={b.kode + i} role="listitem">
            <Pressable role="button" onPress={() => onDetail(b)} aria-label={`${b.pemegang}, ${cariTiketKat(acara, b.kategori)?.nama}, ${b.status === 'masuk' ? `masuk ${fmtJam(b.waktu)} gerbang ${b.gerbang}` : b.status === 'ditolak' ? `ditolak: ${b.alasan}` : b.status}`} style={({ pressed }) => [s.hadir, pressed && { opacity: 0.8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.hadirNama}>{b.pemegang}{b.milikku ? ' · tiketmu' : ''}</Text>
                <Text style={s.hadirMeta}>{samarkan(b.kode)} · {cariTiketKat(acara, b.kategori)?.nama}</Text>
              </View>
              <View style={[s.status, { backgroundColor: b.status === 'masuk' ? W.hijau : b.status === 'belum' ? W.malam3 : W.merah }]}>
                <Text style={[s.statusTeks, { color: b.status === 'belum' ? W.terang : W.tinta }]}>
                  {b.status === 'masuk' ? `Masuk ${fmtJam(b.waktu)}` : b.status === 'belum' ? 'Belum' : b.status === 'ditolak' ? b.alasan : 'Dialihkan'}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>
      {siap && !tampil.length ? <Kosong ringkas judul="Tidak ada nama" isi="Tidak ada pengunjung yang cocok dengan pencarian atau saringan ini." kata="NIHIL" /> : null}
      {tampil.length > batas ? <Tombol kecil varian="garis" label={`Tampilkan 40 lagi (${ribuan(tampil.length - batas)} tersisa)`} onPress={() => setBatas((n) => n + 40)} style={{ marginTop: 12 }} /> : null}
    </View>
  );
}

function DetailHadir({ d, acara, onCatat }) {
  const [alasan, setAlasan] = useState(null);
  const [lainnya, setLainnya] = useState('');
  const kat = cariTiketKat(acara, d.kategori);
  const bisa = d.status === 'belum';
  const alasanAkhir = alasan === 'Lainnya' ? lainnya.trim() : alasan;
  return (
    <>
      <View style={s.detailKisi}>
        <View style={s.detailSel}><Text style={s.detailLabel}>Kode</Text><Text style={s.detailNilai}>{d.kode}</Text></View>
        <View style={s.detailSel}><Text style={s.detailLabel}>Kategori</Text><Text style={s.detailNilai}>{kat?.nama}</Text></View>
        <View style={s.detailSel}><Text style={s.detailLabel}>Status</Text><Text style={s.detailNilai}>{d.status === 'masuk' ? `Masuk ${fmtStempel(d.waktu)} · Gerbang ${d.gerbang}${d.manual ? ' (manual)' : ''}` : d.status === 'ditolak' ? `Ditolak (${d.alasan}) ${fmtJam(d.waktu)}` : d.status === 'dialihkan' ? 'Kode sudah dialihkan' : 'Belum masuk'}</Text></View>
      </View>
      {bisa ? (
        <>
          <Text style={s.detailJudul}>Catat masuk manual</Text>
          <T ukuran={14} warna={W.tinta2}>Untuk pengunjung yang QR-nya tidak bisa ditunjukkan. Alasan wajib diisi dan tercatat di riwayat.</T>
          <Text style={s.detailLabel}>Alasan</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALASAN.map((a) => <Chip key={a} terang label={a} aktif={alasan === a} onPress={() => setAlasan(a)} />)}
          </View>
          {alasan === 'Lainnya' ? (
            <View style={{ gap: 6 }}>
              <Text nativeID="label-alasan" style={s.detailLabel}>Tulis alasannya</Text>
              <TextInput value={lainnya} onChangeText={setLainnya} aria-labelledby="label-alasan" style={s.inputTerang} />
            </View>
          ) : null}
          <Tombol varian="gelap" label="Catat masuk" disabled={!alasanAkhir || alasanAkhir.length < 3} onPress={() => onCatat(alasanAkhir)} />
        </>
      ) : null}
    </>
  );
}

const s = StyleSheet.create({
  pita: { height: 14, flexDirection: 'row', backgroundColor: W.kuning, overflow: 'hidden', marginTop: -8 },
  pitaStrip: { width: 16, height: 40, marginRight: 16, backgroundColor: W.tinta, transform: [{ rotate: '35deg' }], marginTop: -12 },
  kepala: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 4 },
  bagian: { paddingHorizontal: 16, marginBottom: 14 },
  segmen: { flexDirection: 'row', gap: 6, backgroundColor: W.malam2, marginHorizontal: 16, paddingHorizontal: 4, paddingVertical: 4, borderRadius: 14, borderWidth: 1.5, borderColor: W.garis },
  segItem: { flex: 1, minHeight: 44, borderRadius: 10, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  segTeks: { fontFamily: H.tebal, fontSize: 14, color: W.terang },
  pilihAcara: { borderRadius: 14, borderWidth: 1.5, borderColor: W.garis, paddingHorizontal: 12, paddingVertical: 8, minWidth: 112, minHeight: 44 },
  pilihJudul: { fontFamily: H.display, fontSize: 18, lineHeight: 19, color: W.terang, textTransform: 'uppercase' },
  pilihKota: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
  kabar: { backgroundColor: W.kuning, borderRadius: 12, padding: 12 },
  kabarTeks: { fontFamily: H.tebal, fontSize: 14, color: W.tinta },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ubin: { flexGrow: 1, flexBasis: '45%', borderRadius: 18, padding: 14, gap: 4 },
  ubinBesar: { flexBasis: '100%' },
  baris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  angka: { fontFamily: H.display, fontSize: 72, lineHeight: 76, color: W.tinta, marginTop: 4, fontVariant: ['tabular-nums'] },
  angkaKecil: { fontFamily: H.display, fontSize: 30, color: W.tinta2 },
  kerangkaAngka: { height: 64, width: 180, borderRadius: 10, backgroundColor: W.kertas2, marginVertical: 8 },
  angkaSedang: { fontFamily: H.display, fontSize: 40, lineHeight: 42, color: W.terang, fontVariant: ['tabular-nums'] },
  meter: { height: 10, borderRadius: 5, backgroundColor: W.kertas2, overflow: 'hidden', marginVertical: 6 },
  meterIsi: { height: 10, borderRadius: 5 },
  ket: { fontFamily: H.badan, fontSize: 13, color: W.tinta2 },
  ketTerang: { fontFamily: H.badan, fontSize: 12.5, color: W.redup },
  panel: { gap: 14, backgroundColor: W.malam2, marginHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderWidth: 1.5, borderColor: W.garis },
  kartuGelap: { gap: 10, backgroundColor: W.malam2, marginHorizontal: 16, paddingVertical: 16, borderRadius: 20, borderWidth: 1.5, borderColor: W.garis },
  gerbang: { flexDirection: 'row', backgroundColor: W.malam3, borderRadius: 12, padding: 3 },
  gItem: { paddingHorizontal: 10, minHeight: 44, justifyContent: 'center', borderRadius: 9 },
  gTeks: { fontFamily: H.tebal, fontSize: 13, color: W.terang },
  label: { fontFamily: H.tebal, fontSize: 14, color: W.terang },
  bantu: { fontFamily: H.badan, fontSize: 13, color: W.redup },
  input: { flex: 1, minHeight: 50, borderRadius: 12, borderWidth: 2, borderColor: W.kertas2, backgroundColor: W.kertas, color: W.tinta, paddingHorizontal: 14, fontFamily: H.mono, fontSize: 17, letterSpacing: 1 },
  setel: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  log: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderColor: W.garis },
  logJam: { fontFamily: H.mono, fontSize: 12.5, color: W.redup, width: 44 },
  logPil: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, minWidth: 74, alignItems: 'center' },
  logPilTeks: { fontFamily: H.mono, fontSize: 12, color: W.tinta, textTransform: 'uppercase' },
  logKode: { fontFamily: H.mono, fontSize: 13, color: W.terang, flex: 1 },
  logGerbang: { fontFamily: H.mono, fontSize: 12, color: W.redup },
  contoh: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: W.malam2, borderRadius: 12, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 12, minHeight: 48 },
  contohKode: { fontFamily: H.mono, fontSize: 14, color: W.terang, letterSpacing: 0.5 },
  contohKet: { flex: 1, fontFamily: H.badan, fontSize: 13, color: W.redup },
  cari: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: W.kertas, borderRadius: 14, paddingLeft: 14, minHeight: 50 },
  cariInput: { flex: 1, minHeight: 50, fontFamily: H.badan, fontSize: 16, color: W.tinta, paddingRight: 8 },
  hadir: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: W.garis, minHeight: 56 },
  hadirNama: { fontFamily: H.tebal, fontSize: 15, color: W.terang },
  hadirMeta: { fontFamily: H.mono, fontSize: 12, color: W.redup, marginTop: 2 },
  status: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusTeks: { fontFamily: H.mono, fontSize: 12, textTransform: 'uppercase' },
  detailKisi: { gap: 10 },
  detailSel: { gap: 2 },
  detailLabel: { fontFamily: H.mono, fontSize: 12, color: W.tinta2, textTransform: 'uppercase' },
  detailNilai: { fontFamily: H.tebal, fontSize: 16, color: W.tinta },
  detailJudul: { fontFamily: H.display, fontSize: 24, color: W.tinta, textTransform: 'uppercase', marginTop: 6 },
  inputTerang: { minHeight: 50, borderRadius: 12, borderWidth: 2, borderColor: W.tinta2, backgroundColor: '#fffaf0', color: W.tinta, paddingHorizontal: 14, fontFamily: H.badan, fontSize: 16 },
});
