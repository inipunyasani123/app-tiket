// Motif khas: karcis kertas dengan takik setengah lingkaran dan garis sobek.
import { StyleSheet, View } from 'react-native';
import { W } from '../lib/tema';

/** Takik kiri-kanan pada garis sobek. `latar` = warna di belakang karcis. */
export function Takik({ latar = W.malam, ukuran = 22, arah = 'datar', warnaGaris = W.tinta2 }) {
  if (arah === 'tegak') {
    return (
      <View style={[s.tegak]} pointerEvents="none">
        <View style={[s.takik, { width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: latar, top: -ukuran / 2, left: -ukuran / 2 + 1 }]} />
        <View style={[s.garisTegak, { borderColor: warnaGaris }]} />
        <View style={[s.takik, { width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: latar, bottom: -ukuran / 2, left: -ukuran / 2 + 1 }]} />
      </View>
    );
  }
  return (
    <View style={s.datar} pointerEvents="none">
      <View style={[s.takik, { width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: latar, left: -ukuran / 2, top: -ukuran / 2 + 1 }]} />
      <View style={[s.garisDatar, { borderColor: warnaGaris, marginHorizontal: ukuran / 2 + 6 }]} />
      <View style={[s.takik, { width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: latar, right: -ukuran / 2, top: -ukuran / 2 + 1 }]} />
    </View>
  );
}

const s = StyleSheet.create({
  datar: { height: 2, justifyContent: 'center', position: 'relative' },
  garisDatar: { borderTopWidth: 2, borderStyle: 'dashed', opacity: 0.5 },
  tegak: { width: 2, alignSelf: 'stretch', position: 'relative' },
  garisTegak: { flex: 1, borderLeftWidth: 2, borderStyle: 'dashed', opacity: 0.5, marginVertical: 14 },
  takik: { position: 'absolute' },
});
