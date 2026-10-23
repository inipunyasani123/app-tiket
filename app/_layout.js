import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { JUDUL } from '../src/lib/judul';
import { PenyediaData } from '../src/lib/simpan';
import { PenyediaLapisan } from '../src/lib/lapisan';
import { useHuruf } from '../src/lib/huruf';
import { W } from '../src/lib/tema';
import { BilahStatus } from '../src/ui/BilahStatus';

/** Web: judul tab ikut berganti saat pindah halaman di dalam aplikasi (HTML statis sudah benar sejak awal). */
function JudulTab() {
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const judul = JUDUL[path] ?? JUDUL['/404'];
    if (document.title !== judul) document.title = judul;
  }, [path]);
  return null;
}

export default function Akar() {
  const siap = useHuruf();
  if (!siap) return null;
  return (
    <PenyediaData>
      <PenyediaLapisan>
        <BilahStatus />
        <JudulTab />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.malam }, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tab)" />
          <Stack.Screen name="pesan/[slug]" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </PenyediaLapisan>
    </PenyediaData>
  );
}
