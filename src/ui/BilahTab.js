// Bilah tab berbentuk karcis kertas dengan takik di kedua ujung.
import { StyleSheet, Text, View } from 'react-native';
import { Ketuk } from './dasar';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H, W } from '../lib/tema';
import { Ikon } from './Ikon';
import { useData } from '../lib/simpan';

const TAB = [
  { nama: 'index', href: '/', label: 'Jelajah', ikon: 'jelajah' },
  { nama: 'tiket', href: '/tiket', label: 'Tiketku', ikon: 'tiket' },
  { nama: 'panitia', href: '/panitia', label: 'Panitia', ikon: 'panitia' },
];

export function BilahTab({ state }) {
  const inset = useSafeAreaInsets();
  const data = useData();
  const aktifNama = state.routes[state.index]?.name;
  const jumlahTiket = data?.dimuat ? data.tiket.filter((t) => t.status === 'aktif' && !t.milikTeman).length : 0;
  return (
    <View style={[s.luar, { paddingBottom: Math.max(inset.bottom, 10) }]}>
      <View role="navigation" aria-label="Menu utama" style={s.karcis}>
        <View style={[s.takik, { left: -11 }]} />
        <View style={[s.takik, { right: -11 }]} />
        {TAB.map((t) => {
          const aktif = aktifNama === t.nama;
          return (
            <Link key={t.nama} href={t.href} asChild>
              <Ketuk aria-current={aktif ? 'page' : undefined} aria-label={t.nama === 'tiket' && jumlahTiket > 0 ? `${t.label}, ${jumlahTiket} tiket aktif` : t.label} style={[s.item, aktif && s.itemAktif]}>
                <Ikon nama={t.ikon} warna={W.tinta} ukuran={20} />
                <Text style={[s.label, aktif && { fontFamily: H.tebal }]}>{t.label}</Text>
                {t.nama === 'tiket' && jumlahTiket > 0 ? (
                  <View style={s.lencana}>
                    <Text style={s.lencanaTeks}>{jumlahTiket}</Text>
                  </View>
                ) : null}
              </Ketuk>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  luar: { backgroundColor: W.malam, paddingHorizontal: 14, paddingTop: 6 },
  karcis: {
    flexDirection: 'row', backgroundColor: W.kertas, borderRadius: 18, padding: 6, gap: 4,
    overflow: 'hidden', position: 'relative',
  },
  takik: { position: 'absolute', top: '50%', marginTop: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: W.malam },
  item: { flex: 1, minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column', position: 'relative' },
  itemAktif: { backgroundColor: W.jingga },
  label: { fontFamily: H.badan, fontSize: 12.5, color: W.tinta },
  lencana: { position: 'absolute', top: 4, right: '26%', minWidth: 18, height: 18, borderRadius: 9, backgroundColor: W.tinta, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  lencanaTeks: { fontFamily: H.mono, fontSize: 10.5, color: W.kertas },
});
