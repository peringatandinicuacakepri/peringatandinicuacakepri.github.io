/* End-to-end smoke test of the real app module in a stubbed DOM.
   Usage: node test_integration.mjs <scenario>   (run from tests/)
   1: online + CAP + <web> image available (alert active, future dates)
   2: online + CAP, but BMKG uploaded no image anywhere
   3: offline with cached RSS
   4: legacy UPDATE text format, CAP unreachable
   5: total fetch failure, no cache -> error card
   6: stale proxy RSS listing an EXPIRED alert -> honest safe state
   7: demo mode (?demo=warning) renders fully offline, no fetch at all */
import { installDom, els } from './dom_stub.mjs';

const scenario = Number(process.argv[2] || 1);

const DESC_ACTIVE = 'Hujan sedang hingga lebat yang dapat disertai petir dan angin kencang akan terjadi pada 20 September 2027, 20:30 WIB di sebagian wilayah Kep. Riau, khususnya di JEMAJA, JEMAJA TIMUR, PALMATAK, SIANTAN, SIANTAN SELATAN, SIANTAN TENGAH, SIANTAN TIMUR. Kondisi diperkirakan dapat berlangsung hingga 20 September 2027, 23:00 WIB.';
const VALIDITY_ACTIVE = 'Senin, 20 September 2027 23:00 WIB';
const DESC_B = 'UPDATE Peringatan Dini Cuaca Wilayah Kep. Riau tgl 13 Oktober 2025 pkl 18:00 WIB berpotensi terjadi Hujan Sedang-Lebat yang dapat disertai Kilat/Petir dan Angin Kencang pada pkl 18:20 WIB di BINTAN PESISIR, GUNUNG KIJANG. Dan dapat meluas ke wilayah TANJUNGPINANG BARAT, TANJUNGPINANG TIMUR. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 20:30 WIB. Prakirawan BMKG - Kep. Riau';
const DESC_EXPIRED = 'Hujan lebat disertai petir akan terjadi pada 20 September 2026, 20:30 WIB di sebagian wilayah Kep. Riau, khususnya di SIANTAN. Kondisi diperkirakan dapat berlangsung hingga 20 September 2026, 23:00 WIB.';

const IS_B = scenario === 4;
const IS_EXPIRED = scenario === 6;
const DESC = IS_B ? DESC_B : (IS_EXPIRED ? DESC_EXPIRED : DESC_ACTIVE);
const ALERT_ID = IS_B ? 'CKR20251013002' : 'CKR20260920006';
const LAST_BUILD = IS_EXPIRED ? 'Sun, 20 Sep 2026 20:20:00 +0700' : 'Mon, 20 Sep 2027 20:20:00 +0700';

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BMKG Nowcasting</title>
    <lastBuildDate>${LAST_BUILD}</lastBuildDate>
    <item>
      <title>Peringatan Dini Cuaca Jambi</title>
      <description>Hujan sedang terjadi di Jambi.</description>
      <link>https://www.bmkg.go.id/alerts/nowcast/id/JMB20260920001_alert.xml</link>
    </item>
    <item>
      <title>Peringatan Dini Cuaca Kep. Riau</title>
      <description>${DESC}</description>
      <link>https://www.bmkg.go.id/alerts/nowcast/id/${ALERT_ID}_alert.xml</link>
      <guid>2.49.0.1.360.0.2026.09.20.15.21.006</guid>
      <pubDate>${LAST_BUILD}</pubDate>
    </item>
  </channel>
</rss>`;

const CAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>2.49.0.1.360.0.2026.09.20.15.21.006</identifier>
  <sent>2027-09-20T20:20:00+07:00</sent>
  <info>
    <language>id</language>
    <event>Hujan Lebat dan Petir</event>
    <effective>2027-09-20T20:30:00+07:00</effective>
    <expires>2027-09-20T23:00:00+07:00</expires>
    <headline>Hujan Lebat disertai Petir di Kep. Riau</headline>
    <description>${DESC_ACTIVE}</description>
    <web>https://nowcasting.bmkg.go.id/infografis/CKR/2027-09-20/infografis.jpg</web>
    <area><areaDesc>06221 196Kep. Riau</areaDesc></area>
  </info>
</alert>`;

const CAP_EXPIRED_XML = CAP_XML
  .replace('2027-09-20T20:30:00+07:00', '2026-09-20T20:30:00+07:00')
  .replace('2027-09-20T23:00:00+07:00', '2026-09-20T23:00:00+07:00')
  .replace('2027-09-20T20:20:00+07:00', '2026-09-20T20:20:00+07:00');

const WEB_IMG = 'https://nowcasting.bmkg.go.id/infografis/CKR/2027-09-20/infografis.jpg';
const API_IMG = 'https://api-apps.bmkg.go.id/api/warningcuaca/image?path=CKR-2026-09-20-CKR20260920006_image0.jpg';

installDom({
  search: scenario === 7 ? '?demo=warning' : '',
  onLine: scenario !== 3,
  imageWhitelist: scenario === 1 ? [API_IMG, WEB_IMG] : [],
  storage: scenario === 3 ? {
    bmkgLastSuccessData: RSS_XML,
    bmkgLastSuccessTime: new Date(Date.now() - 3 * 60000).toISOString()
  } : {}
});

globalThis.fetch = async (url) => {
  const u = String(url);
  if (scenario === 7) throw new Error('demo must not fetch: ' + u);
  if (scenario === 3 || scenario === 5) throw new Error('Failed to fetch');
  if (u.includes('rss.xml')) {
    return { ok: true, status: 200, text: async () => RSS_XML, json: async () => ({ contents: RSS_XML }) };
  }
  if (u.includes('CKR20260920006_alert.xml')) {
    const body = IS_EXPIRED ? CAP_EXPIRED_XML : CAP_XML;
    return { ok: true, status: 200, text: async () => body, json: async () => ({ contents: body }) };
  }
  throw new Error('Failed to fetch');
};

let failures = 0;
function ok(name, cond, extra) {
  if (cond) console.log('PASS', name);
  else { failures++; console.log('FAIL', name, extra !== undefined ? String(extra).slice(0, 400) : ''); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

await import('./app_module.mjs');
await sleep(700);

const dc = els['dc'] ? els['dc'].innerHTML : '';
const mapSlot = els['mapSlot'] ? els['mapSlot'].innerHTML : '';
const chip = els['refreshChipText'] ? els['refreshChipText'].textContent : '';

if (scenario === 7) {
  ok('demo renders warning card', dc.includes('Peringatan Dini Aktif') && dc.includes('time-pill') && !dc.includes('valid-banner'), dc.slice(0, 300));
  ok('demo regions title case', dc.includes('<strong class="desc-region">') && dc.includes('Bunguran Barat'), '');
  ok('demo chip label', chip.includes('MODE DEMO'), chip);
  ok('demo simulated image', mapSlot.includes('mapPreviewImg') && mapSlot.includes('data:image/png'), mapSlot.slice(0, 200));
  ok('demo map overlay', mapSlot.includes('map-overlay'), '');
  ok('demo no added pills UI', !dc.includes('valid-banner') && !dc.includes('region-block') && !dc.includes('region-list'), '');
  ok('demo time pill range', dc.includes('time-pill-from') && dc.includes('time-pill-to'), '');
  ok('demo no em dash', !dc.includes('\u2014'), '');
  console.log(failures ? ('FAILURES: ' + failures) : 'SCENARIO 7 PASSED');
  process.exit(failures ? 1 : 0);
}

if (scenario === 5) {
  ok('error card rendered', dc.includes('Gagal Memuat Data'), dc.slice(0, 200));
  ok('error type shown', dc.includes('CORS') || dc.includes('NETWORK'), '');
  ok('retry button', dc.includes('data-action="reload"') && dc.includes('Coba Lagi'), '');
  ok('error chip', chip.includes('KONEKSI GAGAL'), chip);
  ok('no em dash in error', !dc.includes('\u2014'), '');
  console.log(failures ? ('FAILURES: ' + failures) : 'SCENARIO 5 PASSED');
  process.exit(failures ? 1 : 0);
}

if (scenario === 6) {
  ok('expired flips to safe', dc.includes('Kondusif'), dc.slice(0, 300));
  ok('expired honest note', dc.includes('berakhir') && dc.includes('Minggu, 20 September 2026 23:00 WIB'), dc.slice(0, 500));
  ok('expired note row', dc.includes('berakhir pada') && dc.includes('kondusif'), dc.slice(0, 400));
  ok('no fake active card', !dc.includes('Peringatan Dini Aktif'), '');
  ok('no em dash', !dc.includes('\u2014'), '');
  console.log(failures ? ('FAILURES: ' + failures) : 'SCENARIO 6 PASSED');
  process.exit(failures ? 1 : 0);
}

ok('dc rendered', dc.length > 200, dc.slice(0, 200));
ok('original card order kept', dc.indexOf('pills-row') !== -1 && dc.indexOf('warn-label') !== -1 && dc.indexOf('time-pill') !== -1, '');
ok('no added pills UI', !dc.includes('valid-banner') && !dc.includes('region-block') && !dc.includes('region-list'), '');
if (!IS_B) ok('desc keeps official dates', dc.includes('20 September 2027, 23:00 WIB'), '');
else ok('desc keeps official dates (B)', dc.includes('13 Oktober 2025'), dc.slice(0, 300));
if (!IS_B) ok('time pill range', dc.includes('time-pill') && dc.includes('20:30') && dc.includes('23:00'), '');
else ok('time pill range B', dc.includes('time-pill') && dc.includes('18:20') && dc.includes('20:30'), '');
if (scenario === 1 || scenario === 2) ok('cap pill override', dc.includes('time-pill-from">20:30') && dc.includes('time-pill-to">23:00'), dc.slice(0, 400));
else if (scenario === 3) ok('offline keeps text pill', dc.includes('20:30') && dc.includes('23:00'), '');

if (!IS_B) {
  ok('desc bolded regions title case', dc.includes('<strong class="desc-region">Jemaja, Jemaja Timur, Palmatak, Siantan, Siantan Selatan, Siantan Tengah, Siantan Timur</strong>'), '');
  ok('desc regions title case in text', dc.includes('Jemaja, Jemaja Timur, Palmatak, Siantan, Siantan Selatan, Siantan Tengah, Siantan Timur'), '');
  ok('cta radar link', dc.includes('Lihat Peta Radar') && dc.includes('CKR20260920006_alert.xml'), '');
  ok('published row', dc.includes('Diterbitkan:') && dc.includes('2027'), '');
} else {
  ok('B desc bolded main', dc.includes('<strong class="desc-region">Bintan Pesisir, Gunung Kijang</strong>'), '');
  ok('B desc bolded expansion', dc.includes('<strong class="desc-region">Tanjungpinang Barat, Tanjungpinang Timur</strong>'), '');
  ok('B expansion bolded in text', dc.includes('Tanjungpinang Barat, Tanjungpinang Timur'), '');
  ok('B cta link', dc.includes('CKR20251013002_alert.xml'), '');
  ok('B honest missing map', mapSlot.includes('Infografis belum tersedia') && mapSlot.includes('belum mengunggah infografis'), mapSlot.slice(0, 200));
  ok('B checked url first candidate', mapSlot.includes('map-error-url') && mapSlot.includes('CKR20251013002_image0.jpg'), mapSlot.slice(0, 400));
}
ok('no em dash anywhere', !dc.includes('\u2014') && !mapSlot.includes('\u2014') && !chip.includes('\u2014'), '');

if (scenario === 1) {
  ok('map ok state via api group', mapSlot.includes('mapPreviewImg') && mapSlot.includes(API_IMG), mapSlot.slice(0, 300));
  ok('map overlay present', mapSlot.includes('map-overlay'), '');
  ok('map container accessible', mapSlot.includes('<div class="map-container" id="mapContainerBox" role="button"'), '');
  ok('chip updated', chip.includes('DIPERBARUI'), chip);
} else if (scenario === 2) {
  ok('honest missing state', mapSlot.includes('Infografis belum tersedia') && mapSlot.includes('belum mengunggah infografis') && mapSlot.includes('API gambar'), mapSlot.slice(0, 300));
  ok('retry action present', mapSlot.includes('data-action="retry-infografis"'), '');
  ok('radar link present', mapSlot.includes('nowcasting.bmkg.go.id'), '');
  ok('checked url transparent', mapSlot.includes('map-error-url') && mapSlot.includes('CKR-2026-09-20-CKR20260920006_image0.jpg') && mapSlot.includes('api-apps.bmkg.go.id'), mapSlot.slice(0, 400));
  ok('no broken img tag', !mapSlot.includes('<img'), '');
} else if (scenario === 3) {
  ok('offline chip', chip.includes('MODE OFFLINE'), chip);
  ok('offline map message', mapSlot.includes('offline') || mapSlot.includes('Perangkat sedang offline'), mapSlot.slice(0, 300));
}

console.log(failures ? ('FAILURES: ' + failures) : 'SCENARIO ' + scenario + ' PASSED');
process.exit(failures ? 1 : 0);
