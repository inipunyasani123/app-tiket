// Kerangka HTML (hanya dijalankan saat build). Di layar ≥768px aplikasi tampil dalam bingkai ponsel
// dengan panel samping; di HP tampil layar penuh. Panel & bilah demo adalah HTML statis (tanpa JS).
import { useServerDocumentContext } from 'expo-router/html';
import { qrPath } from '../src/lib/qr';
import { MEREK } from '../src/data/acara';

const KONTAK = `https://www.pintuweb.id/kontak?demo=${MEREK.slug}`;

const HURUF = [
  ['BigShoulders_800ExtraBold', true],
  ['SchibstedGrotesk_400Regular', true],
  ['SchibstedGrotesk_700Bold', false],
  ['JetBrainsMono_600SemiBold', false],
];

const CSS = `
${HURUF.map(([n]) => `@font-face{font-family:${n};src:url(/fonts/${n}.woff2) format("woff2");font-display:swap}`).join('')}
:root{--malam:#15121f;--malam2:#1f1a2e;--garis:#3b3354;--kertas:#f4ecdc;--tinta:#1b1724;--redup:#a89fbd;--jingga:#ff6a2b;--kuning:#ffd23f;--pink:#ff5fa2;--biru:#5b86ff}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--malam);color:var(--kertas);-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{display:flex;flex-direction:column;overflow:hidden;font-family:SchibstedGrotesk_400Regular,system-ui,sans-serif}
#root{display:flex;flex:1;min-height:0;height:100%;position:relative;overflow:hidden;background:var(--malam)}
.panggung{flex:1;min-height:0;display:flex}
.ponsel{flex:1;min-height:0;display:flex}
.layar{flex:1;min-height:0;display:flex;position:relative;overflow:hidden}
.panel{display:none}
:focus-visible{outline:3px solid var(--kuning)!important;outline-offset:2px}
::selection{background:var(--jingga);color:var(--tinta)}
.bilah-demo{flex:none;margin:0;padding:6px 12px;background:#0f1b33;color:#dfe6f3;font:400 12.5px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center}
@media (max-width:430px){.bilah-demo .opsional{display:none}}
.bilah-demo a{color:#fff;font-weight:600;text-decoration:underline;text-underline-offset:3px;display:inline-block;padding:3px 0}
@media (min-width:768px){
  html,body{height:auto;min-height:100%}
  body{overflow:auto;background:var(--malam) radial-gradient(rgba(255,106,43,.16) 1.2px,transparent 1.3px) 0 0/14px 14px}
  .panggung{flex:1 0 auto;align-items:center;justify-content:center;gap:clamp(28px,5vw,72px);padding:24px;min-height:calc(100vh - 40px)}
  .ponsel{flex:none;width:410px;height:min(864px,calc(100vh - 80px));min-height:620px;padding:10px;border-radius:52px;background:#0b0911;box-shadow:0 0 0 1.5px #3b3354,0 30px 80px rgba(0,0,0,.55),0 0 0 9px rgba(255,106,43,.08)}
  .layar{border-radius:42px;transform:translateZ(0)}
  .panel{display:flex;flex-direction:column;gap:22px;width:min(360px,34vw);color:var(--kertas)}
}
@media (min-width:768px) and (max-width:900px){.panel{width:300px}.panel .fitur li:nth-child(n+4){display:none}}
@media (min-width:768px) and (max-height:880px){.panel{gap:16px}.panel h2{font-size:58px}.panel .fitur li{font-size:14px}.panel .catatan{display:none}}
.panel .label{font:600 11.5px/1.3 JetBrainsMono_600SemiBold,ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--kuning);margin:0}
.panel h2{font:800 clamp(52px,6vw,76px)/.88 BigShoulders_800ExtraBold,Impact,sans-serif;text-transform:uppercase;margin:0;letter-spacing:.01em}
.panel h2 span{color:var(--jingga)}
.panel .tagline{font:400 16px/1.5 SchibstedGrotesk_400Regular,system-ui,sans-serif;color:var(--redup);margin:0;max-width:32ch}
.panel .fitur{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.panel .fitur li{display:flex;gap:12px;align-items:flex-start;font:400 14.5px/1.45 SchibstedGrotesk_400Regular,system-ui,sans-serif;color:var(--kertas)}
.panel .fitur b{flex:none;font:600 12px/1 JetBrainsMono_600SemiBold,monospace;color:var(--tinta);background:var(--kertas);border-radius:6px;padding:6px 7px;margin-top:1px}
.panel .qr{display:flex;gap:14px;align-items:center;background:var(--kertas);color:var(--tinta);border-radius:18px;padding:12px;position:relative;overflow:hidden}
.panel .qr::before,.panel .qr::after{content:"";position:absolute;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;background:var(--malam)}
.panel .qr::before{left:-9px}.panel .qr::after{right:-9px}
.panel .qr svg{flex:none;width:104px;height:104px}
.panel .qr p{margin:0;font:400 13px/1.45 SchibstedGrotesk_400Regular,system-ui,sans-serif}
.panel .qr strong{display:block;font:800 22px/1 BigShoulders_800ExtraBold,sans-serif;text-transform:uppercase;margin-bottom:4px}
.panel .qr code{font:600 11px/1.4 JetBrainsMono_600SemiBold,monospace;color:#4a4257;word-break:break-all}
.panel .pesan{display:inline-flex;align-self:flex-start;align-items:center;gap:10px;min-height:48px;padding:0 20px;border-radius:14px;background:var(--jingga);color:var(--tinta);font:700 16px/1 SchibstedGrotesk_700Bold,system-ui,sans-serif;text-decoration:none}
.panel .pesan:hover{background:#ff8a55}
.panel .catatan{font:400 12.5px/1.5 SchibstedGrotesk_400Regular,system-ui,sans-serif;color:var(--redup);margin:0;max-width:36ch}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

const JSONLD = {
  '@context': 'https://schema.org',
  '@type': ['MobileApplication', 'WebApplication'],
  name: MEREK.nama,
  alternateName: 'Demo aplikasi tiket acara',
  description: 'Demo aplikasi tiket acara rekaan buatan PintuWeb: daftar acara, checkout simulasi, e-tiket QR, alihkan tiket, pengingat WIB, dan mode panitia untuk check-in.',
  url: MEREK.url,
  inLanguage: 'id',
  applicationCategory: 'LifestyleApplication',
  applicationSubCategory: 'Tiket acara',
  operatingSystem: 'Android, iOS, Web',
  isAccessibleForFree: true,
  image: `${MEREK.url}/og.jpg`,
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'IDR' },
  creator: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
  publisher: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
};

export default function Root({ children, pathname = '/' }) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  const tautan = MEREK.url + (pathname === '/' || pathname === '/404' ? '' : pathname);
  const qr = qrPath(tautan, 'L');
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#15121f" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/ikon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {HURUF.filter(([, p]) => p).map(([n]) => <link key={n} rel="preload" href={`/fonts/${n}.woff2`} as="font" type="font/woff2" crossOrigin="" />)}
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <div className="panggung">
          <aside className="panel" aria-label="Tentang demo aplikasi ini">
            <p className="label">Demo aplikasi mobile · PintuWeb</p>
            <h2>Karcis <span>Wetan</span></h2>
            <p className="tagline">{MEREK.tagline}. Satu kode untuk Android, iOS, dan web.</p>
            <ul className="fitur">
              <li><b>01</b>Daftar acara, kategori tiket dengan kuota, dan checkout simulasi QRIS atau transfer.</li>
              <li><b>02</b>E-tiket QR unik, simpan ke dompet, dan alihkan ke teman dengan kode baru.</li>
              <li><b>03</b>Pengingat acara dan hitung mundur dalam WIB.</li>
              <li><b>04</b>Mode panitia: pindai atau ketik kode, hitung yang masuk, tolak tiket ganda.</li>
            </ul>
            <div className="qr">
              <svg viewBox={`-2 -2 ${qr.n + 4} ${qr.n + 4}`} shapeRendering="crispEdges" role="img" aria-label="Kode QR untuk membuka halaman ini di HP">
                <rect x="-2" y="-2" width={qr.n + 4} height={qr.n + 4} fill="#f4ecdc" />
                <path d={qr.d} fill="#1b1724" />
              </svg>
              <p><strong>Coba di HP</strong>Pindai kode ini dengan kamera HP, lalu pasang ke layar utama.<br /><code>{tautan.replace('https://', '')}</code></p>
            </div>
            <a className="pesan" href={KONTAK}>Pesan aplikasi seperti ini <span aria-hidden="true">→</span></a>
            <p className="catatan">Dibuat dengan React Native + Expo. Semua acara dan nama di dalamnya rekaan; data tersimpan di perangkatmu.</p>
          </aside>
          <main className="ponsel">
            <div className="layar">{children}</div>
          </main>
        </div>
        <aside className="bilah-demo" aria-label="Tentang situs demo ini">
          Situs demo buatan PintuWeb<span className="opsional"> — nama dan isinya rekaan</span>.{' '}
          <a href={KONTAK}>Buat yang seperti ini →</a>
        </aside>
        {bodyNodes}
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker'in navigator&&location.hostname.endsWith('pintuweb.id'))addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})" }} />
      </body>
    </html>
  );
}
