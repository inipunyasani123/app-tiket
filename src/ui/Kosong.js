// Keadaan kosong bergaya poster riso kecil: satu kalimat + satu aksi.
import { StyleSheet, View } from 'react-native';
import { Circle, G, Line, Path, Pattern, Defs, Rect, Svg, SvgText } from './svg';
import { useId } from 'react';
import { H, W } from '../lib/tema';
import { Judul, T, Tombol, TombolTautan } from './dasar';

export function PosterKosong({ tinta = W.jingga, kata = 'KOSONG', ukuran = 112 }) {
  const id = 'k' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={ukuran} height={ukuran * 4 / 3} viewBox="0 0 150 200">
      <Defs>
        <Pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse"><Circle cx="3.5" cy="3.5" r="1.6" fill={tinta} /></Pattern>
      </Defs>
      <Rect width="150" height="200" fill={W.kertas} />
      <Circle cx="96" cy="70" r="48" fill={`url(#${id})`} />
      <G transform="rotate(-8 70 80)">
        <Rect x="24" y="46" width="96" height="56" rx="8" fill="none" stroke={W.tinta} strokeWidth="3" strokeDasharray="7 6" />
        <Circle cx="24" cy="74" r="9" fill={W.kertas} stroke={W.tinta} strokeWidth="3" />
        <Circle cx="120" cy="74" r="9" fill={W.kertas} stroke={W.tinta} strokeWidth="3" />
        <Line x1="88" y1="50" x2="88" y2="98" stroke={W.tinta} strokeWidth="2.5" strokeDasharray="4 4" />
      </G>
      <Path d="M18 150 L132 150" stroke={tinta} strokeWidth="6" />
      <SvgText x="18" y="182" fontSize="36" fontFamily={H.display} fill={W.tinta}>{kata}</SvgText>
      <G opacity="0.55"><Circle cx="134" cy="16" r="5" stroke={W.tinta} strokeWidth="1" fill="none" /><Line x1="126" y1="16" x2="142" y2="16" stroke={W.tinta} /><Line x1="134" y1="8" x2="134" y2="24" stroke={W.tinta} /></G>
    </Svg>
  );
}

/** Keadaan kosong: poster + judul + kalimat + aksi (href atau onPress). */
export function Kosong({ judul, isi, aksi, href, onPress, tinta, kata, level = 2, ringkas }) {
  return (
    <View style={[s.wadah, ringkas && { paddingVertical: 14 }]}>
      <View style={s.poster}><PosterKosong tinta={tinta} kata={kata} ukuran={ringkas ? 78 : 96} /></View>
      <View style={{ flex: 1, gap: 6 }}>
        <Judul level={level} ukuran={24} warna={W.terang}>{judul}</Judul>
        <T ukuran={14} warna={W.redup}>{isi}</T>
        {aksi && href ? <TombolTautan href={href} label={aksi} varian="kertas" kecil style={{ alignSelf: 'flex-start', marginTop: 4 }} /> : null}
        {aksi && onPress ? <Tombol onPress={onPress} label={aksi} varian="kertas" kecil style={{ alignSelf: 'flex-start', marginTop: 4 }} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wadah: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: W.malam2, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: W.garis },
  poster: { transform: [{ rotate: '-3deg' }], shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
