// Service worker sederhana: halaman jaringan-dulu (cadangan tembolok saat luring), aset ber-hash tembolok-dulu.
// Tujuannya agar e-tiket yang pernah dibuka tetap tampil di gerbang walau sinyal hilang.
const VERSI = 'karcis-wetan-v1';
const INTI = ['/', '/tiket', '/panitia', '/e-tiket', '/fonts/BigShoulders_800ExtraBold.woff2', '/fonts/SchibstedGrotesk_400Regular.woff2', '/fonts/SchibstedGrotesk_700Bold.woff2', '/fonts/JetBrainsMono_600SemiBold.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(INTI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSI).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((res) => { if (res.ok) { const salin = res.clone(); caches.open(VERSI).then((c) => c.put(u.pathname, salin)); } return res; })
        .catch(() => caches.match(u.pathname).then((m) => m || caches.match('/'))),
    );
    return;
  }
  if (u.pathname.startsWith('/_expo/static/') || u.pathname.startsWith('/fonts/') || u.pathname.startsWith('/images/')) {
    e.respondWith(
      caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const salin = res.clone(); caches.open(VERSI).then((c) => c.put(r, salin)); } return res; })),
    );
  }
});
