import { forwardRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { W } from '../lib/tema';
import { Ikon } from './Ikon';
import { Mono } from './dasar';

/** Kerangka layar: latar malam, gulir, ruang aman atas, ruang bawah untuk bilah tab/aksi. */
export const Layar = forwardRef(function Layar({ children, bawah = 24, gulir = true, style, isiStyle, latar = W.malam, ...p }, ref) {
  const inset = useSafeAreaInsets();
  if (!gulir) return <View style={[{ flex: 1, backgroundColor: latar, paddingTop: inset.top }, style]}>{children}</View>;
  return (
    <ScrollView
      ref={ref}
      style={[{ flex: 1, backgroundColor: latar }, style]}
      contentContainerStyle={[{ paddingTop: inset.top + 8, paddingBottom: bawah + inset.bottom }, isiStyle]}
      keyboardShouldPersistTaps="handled"
      {...p}
    >
      {children}
    </ScrollView>
  );
});

/** Bilah atas layar dalam (tombol kembali + label kecil). */
export function BilahAtas({ label, kanan, cadangan = '/', warna = W.terang }) {
  const kembali = () => {
    if (router.canGoBack()) router.back();
    else router.replace(cadangan);
  };
  return (
    <View style={s.bilah}>
      <Pressable role="button" aria-label="Kembali" onPress={kembali} hitSlop={8} style={({ pressed }) => [s.kembali, pressed && { opacity: 0.7 }]}>
        <Ikon nama="kiri" warna={warna} ukuran={22} />
      </Pressable>
      {label ? <Mono warna={warna} style={{ flex: 1 }} numberOfLines={1}>{label}</Mono> : <View style={{ flex: 1 }} />}
      {kanan}
    </View>
  );
}

export const kotak = Platform.select({ web: { boxSizing: 'border-box' }, default: {} });

const s = StyleSheet.create({
  bilah: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, minHeight: 52 },
  kembali: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: W.malam3 },
});
