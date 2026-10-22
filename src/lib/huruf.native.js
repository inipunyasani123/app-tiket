// Android/iOS: muat TTF dari @expo-google-fonts dengan nama keluarga yang sama seperti di web.
import { useFonts } from 'expo-font';
import { BigShoulders_800ExtraBold } from '@expo-google-fonts/big-shoulders/800ExtraBold';
import { SchibstedGrotesk_400Regular } from '@expo-google-fonts/schibsted-grotesk/400Regular';
import { SchibstedGrotesk_700Bold } from '@expo-google-fonts/schibsted-grotesk/700Bold';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';

export function useHuruf() {
  const [siap] = useFonts({ BigShoulders_800ExtraBold, SchibstedGrotesk_400Regular, SchibstedGrotesk_700Bold, JetBrainsMono_600SemiBold });
  return siap;
}
