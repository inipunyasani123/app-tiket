import { Stack } from 'expo-router';
import { PenyediaData } from '../src/lib/simpan';
import { PenyediaLapisan } from '../src/lib/lapisan';
import { useHuruf } from '../src/lib/huruf';
import { W } from '../src/lib/tema';
import { BilahStatus } from '../src/ui/BilahStatus';

export default function Akar() {
  const siap = useHuruf();
  if (!siap) return null;
  return (
    <PenyediaData>
      <PenyediaLapisan>
        <BilahStatus />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.malam }, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tab)" />
          <Stack.Screen name="pesan/[slug]" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </PenyediaLapisan>
    </PenyediaData>
  );
}
