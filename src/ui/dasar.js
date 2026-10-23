import { forwardRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { H, W } from '../lib/tema';

export function Judul({ level = 1, ukuran = 40, warna = W.terang, style, children, ...p }) {
  return (
    <Text role="heading" aria-level={level} style={[g.display, { fontSize: ukuran, lineHeight: Math.round(ukuran * 0.92), color: warna }, style]} {...p}>
      {children}
    </Text>
  );
}

export function T({ ukuran = 15, warna = W.terang, tebal, style, children, ...p }) {
  return (
    <Text style={[{ fontFamily: tebal ? H.tebal : H.badan, fontSize: ukuran, lineHeight: Math.round(ukuran * 1.45), color: warna }, style]} {...p}>
      {children}
    </Text>
  );
}

export function Mono({ ukuran = 12, warna = W.redup, style, children, ...p }) {
  ukuran = Math.max(12, ukuran); // label mono minimal 12 px
  return (
    <Text style={[{ fontFamily: H.mono, fontSize: ukuran, lineHeight: Math.round(ukuran * 1.4), letterSpacing: 0.6, color: warna, textTransform: 'uppercase' }, style]} {...p}>
      {children}
    </Text>
  );
}

// Gaya nonaktif yang jelas (garis putus, teks redup), bukan tombol aktif yang dipudarkan.
const MATI = { bg: W.malam2, fg: W.redup, garis: W.garis };
const VARIAN = {
  utama: { bg: W.jingga, fg: W.malam, garis: W.jingga },
  kertas: { bg: W.kertas, fg: W.tinta, garis: W.kertas },
  garis: { bg: 'transparent', fg: W.terang, garis: W.garis },
  gelap: { bg: W.tinta, fg: W.kertas, garis: W.tinta },
  hijau: { bg: W.hijau, fg: W.malam, garis: W.hijau },
};

export const Tombol = forwardRef(function Tombol({ varian = 'utama', kiri, label, onPress, disabled, kecil, style, teksStyle, children, ...p }, ref) {
  const v = disabled ? MATI : VARIAN[varian];
  return (
    <Pressable
      ref={ref}
      role="button"
      onPress={onPress}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      style={({ pressed }) => [
        g.tombol,
        kecil && g.tombolKecil,
        { backgroundColor: v.bg, borderColor: v.garis, borderStyle: disabled ? 'dashed' : 'solid', opacity: pressed ? 0.85 : 1, transform: [{ translateY: pressed ? 1 : 0 }] },
        ratakan(style),
      ]}
      {...p}
    >
      {kiri}
      {label ? <Text style={[g.tombolTeks, kecil && { fontSize: 14 }, { color: v.fg }, teksStyle]}>{label}</Text> : children}
    </Pressable>
  );
});

/**
 * <Link asChild> (Slot) menggabungkan `style` dengan spread objek: larik gaya berubah jadi objek berkunci angka
 * dan gaya fungsi hilang. Kembalikan ke bentuk larik agar React Native Web bisa membacanya.
 */
export function ratakan(st) {
  if (!st || typeof st !== 'object' || Array.isArray(st) || !('0' in st)) return st;
  const larik = [];
  const sisa = {};
  for (const [k, v] of Object.entries(st)) {
    if (/^\d+$/.test(k)) larik.push(v);
    else sisa[k] = v;
  }
  return [...larik, sisa];
}

/** Pressable dengan umpan balik tekan; aman dipakai sebagai anak <Link asChild>. */
export const Ketuk = forwardRef(function Ketuk({ style, tekan = PUDAR, ...p }, ref) {
  const gaya = ratakan(style);
  return <Pressable ref={ref} {...p} style={({ pressed }) => [gaya, pressed && tekan]} />;
});
const PUDAR = { opacity: 0.88 };

/** Tautan bergaya tombol (di web menjadi <a href>). */
export function TombolTautan({ href, replace, ...p }) {
  return (
    <Link href={href} replace={replace} asChild>
      <Tombol {...p} />
    </Link>
  );
}

/** Keping pilihan. `terang` = untuk latar kertas (lembar bawah). */
export function Chip({ aktif, label, onPress, warna = W.jingga, terang, ...p }) {
  const bg = aktif ? (terang ? W.tinta : warna) : 'transparent';
  const fg = aktif ? (terang ? W.kertas : W.malam) : terang ? W.tinta : W.terang;
  return (
    <Pressable
      role="button"
      aria-pressed={!!aktif}
      onPress={onPress}
      style={({ pressed }) => [g.chip, terang && { borderColor: W.tinta2 }, aktif ? { backgroundColor: bg, borderColor: bg } : null, pressed && { opacity: 0.8 }]}
      {...p}
    >
      <Text style={[g.chipTeks, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Garis({ warna = W.garis, style }) {
  return <View style={[{ height: 1, backgroundColor: warna }, style]} />;
}

/** Garis sobek: deretan strip putus-putus. */
export function Perforasi({ warna = W.tinta2, style }) {
  return <View style={[{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: warna, opacity: 0.55 }, style]} />;
}

/** Teks yang hanya dibaca pembaca layar. */
export function SR({ children }) {
  return <Text style={g.sr}>{children}</Text>;
}

export const g = StyleSheet.create({
  display: { fontFamily: H.display, textTransform: 'uppercase', letterSpacing: 0.3 },
  tombol: {
    minHeight: 50, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  tombolKecil: { minHeight: 44, paddingHorizontal: 14, borderRadius: 11 },
  tombolTeks: { fontFamily: H.tebal, fontSize: 16, letterSpacing: 0.2 },
  chip: {
    minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: W.garis,
    alignItems: 'center', justifyContent: 'center',
  },
  chipTeks: { fontFamily: H.tebal, fontSize: 14 },
  sr: Platform.select({
    web: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' },
    default: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  }),
});
