import { Tabs } from 'expo-router';
import { BilahTab } from '../../src/ui/BilahTab';
import { W } from '../../src/lib/tema';

export default function TataTab() {
  return (
    <Tabs tabBar={(p) => <BilahTab {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: W.malam } }}>
      <Tabs.Screen name="index" options={{ title: 'Jelajah' }} />
      <Tabs.Screen name="tiket" options={{ title: 'Tiketku' }} />
      <Tabs.Screen name="panitia" options={{ title: 'Panitia' }} />
    </Tabs>
  );
}
