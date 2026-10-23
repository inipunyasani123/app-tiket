// Berkas kalender .ics untuk acara (web). Waktu disimpan dalam UTC; aplikasi kalender menampilkannya di zona lokal.
import { JAM } from './waktu';
import { jadwal } from '../data/acara';

export function unduhIcs(acara, tiket, sekarang) {
  const j = jadwal(acara, sekarang);
  const z = (ts) => new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const akhir = acara.harian ? j.mulai + (acara.harian[2] - acara.harian[0]) * JAM : j.selesai;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Karcis Wetan//Demo PintuWeb//ID', 'BEGIN:VEVENT',
    `UID:${tiket[0].kode}@app-tiket.pintuweb.id`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(j.mulai)}`, `DTEND:${z(akhir)}`,
    `SUMMARY:${acara.judul} (demo)`, `LOCATION:${acara.tempat}`, `DESCRIPTION:Kode tiket ${tiket.map((t) => t.kode).join(', ')}. Acara rekaan dari demo Karcis Wetan.`,
    'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', `DESCRIPTION:${acara.judul} mulai 3 jam lagi`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `karcis-wetan-${acara.slug}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
}
