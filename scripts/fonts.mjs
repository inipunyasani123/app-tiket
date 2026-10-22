// Membuat subset WOFF2 (latin + tanda baca Indonesia) dari TTF @expo-google-fonts untuk versi web.
// Versi Android/iOS memakai TTF aslinya lewat expo-font (src/lib/huruf.native.js).
// node scripts/fonts.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import subsetFont from 'subset-font';

const KARAKTER = (() => {
  let s = '';
  for (let c = 0x20; c <= 0x7e; c++) s += String.fromCharCode(c);
  for (let c = 0xa0; c <= 0xff; c++) s += String.fromCharCode(c);
  return s + '–—‘’“”•…→←↑↓↗×·−₊⁄';
})();

const HURUF = [
  ['big-shoulders/800ExtraBold/BigShoulders_800ExtraBold.ttf', 'BigShoulders_800ExtraBold'],
  ['schibsted-grotesk/400Regular/SchibstedGrotesk_400Regular.ttf', 'SchibstedGrotesk_400Regular'],
  ['schibsted-grotesk/700Bold/SchibstedGrotesk_700Bold.ttf', 'SchibstedGrotesk_700Bold'],
  ['jetbrains-mono/600SemiBold/JetBrainsMono_600SemiBold.ttf', 'JetBrainsMono_600SemiBold'],
];

mkdirSync('public/fonts', { recursive: true });
for (const [src, nama] of HURUF) {
  const ttf = readFileSync(`node_modules/@expo-google-fonts/${src}`);
  const woff2 = await subsetFont(ttf, KARAKTER, { targetFormat: 'woff2' });
  writeFileSync(`public/fonts/${nama}.woff2`, woff2);
  console.log(nama, ttf.length, '→', woff2.length);
}
