// Umpan balik getar di Android/iOS (expo-haptics).
import * as Haptics from 'expo-haptics';

export function getar(jenis = 'sukses') {
  const peta = { sukses: Haptics.NotificationFeedbackType.Success, gagal: Haptics.NotificationFeedbackType.Error, peringatan: Haptics.NotificationFeedbackType.Warning };
  Haptics.notificationAsync(peta[jenis] || peta.sukses).catch(() => {});
}
export function bunyi() {}
