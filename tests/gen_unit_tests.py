"""Regenerate test_parse.mjs by embedding the LIVE parser/URL-toolkit source
from index.html plus the test body below. Run after any parser change:
    python3 gen_unit_tests.py && node test_parse.mjs
"""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, '..', 'index.html'), encoding='utf-8').read()
mod = re.findall(r'<script type="module">(.*?)</script>', src, re.S)[0]

def fn_src(name):
    """Ekstraksi satu fungsi utuh berbasis pencocokan kurung, tahan tata letak."""
    i = mod.index('function ' + name + '(')
    d, j = 0, mod.index('{', i)
    while True:
        if mod[j] == '{':
            d += 1
        elif mod[j] == '}':
            d -= 1
            if d == 0:
                break
        j += 1
    return mod[i:j + 1]

CONSTS = """const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
"""
for CONST_NAME in ['MONTH_LOOKUP', 'TZ_OFFSETS']:
    mi = mod.index('const ' + CONST_NAME)
    d, mj = 0, mod.index('{', mi)
    while True:
        if mod[mj] == '{':
            d += 1
        elif mod[mj] == '}':
            d -= 1
            if d == 0:
                break
        mj += 1
    mj = mod.index(';', mj) + 1
    CONSTS += mod[mi:mj] + '\n'
FN_NAMES = ['withImageExtensions', 'localDateParts', 'isTextVariantUrl',
            'parseAlertAssetMeta', 'buildNowcastingImageUrl',
            'buildInfografisCandidateGroups', 'parseNowcastText',
            'wibCalendarKey', 'shortDateLabel', 'formatWibDateTime',
            'buildValidityLabel', 'buildPillOpts', 'buildTimePillHtml',
            'titleCaseRegionText', 'normalizeWarningText', 'escHtml', 'safeUrl',
            'asDateObject', 'extractTimeRange', 'buildDescHtml', 'parseLocalAlertDate', 'normalizeTimeToken', 'looksLikeRegionList',
            'splitRegionList', 'localizeDatesInText', 'monthIndexOf',
            'titleCasePhrase',
            'tzOffsetHours',
            'titleCaseRegionList']
url_toolkit = CONSTS + '\n'.join(fn_src(n) for n in FN_NAMES)
parser = ''
nm = ''
esc = ''

HEAD = '''/* Unit tests for the BMKG URL toolkit + text parser.
   AUTO-GENERATED source snapshot; regenerate with: python3 gen_unit_tests.py */
const INFOGRAFIS_BASE = 'https://nowcasting.bmkg.go.id/infografis';
const DEFAULT_STATION = 'CKR';
'''

BODY = '''
/* ── TESTS ── */
let failures = 0;
function ok(name, cond, extra) {
  if (cond) console.log('PASS', name);
  else { failures++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); }
}

// Format A: live RSS description style
const descA = 'Hujan sedang hingga lebat yang dapat disertai petir dan angin kencang akan terjadi pada 20 September 2026, 20:30 WIB di sebagian wilayah Kep. Riau, khususnya di JEMAJA, JEMAJA TIMUR, PALMATAK, SIANTAN, SIANTAN SELATAN, SIANTAN TENGAH, SIANTAN TIMUR. Kondisi diperkirakan dapat berlangsung hingga 20 September 2026, 23:00 WIB.';
const pa = parseNowcastText(descA);
ok('A province', pa.province === 'Kep. Riau', pa.province);
ok('A tz', pa.tz === 'WIB', pa.tz);
ok('A start', pa.start && pa.start.time === '20:30' && pa.start.dateLabel === '20 September 2026', pa.start);
ok('A end', pa.end && pa.end.time === '23:00' && pa.end.date && pa.end.date.toISOString() === '2026-09-20T16:00:00.000Z', pa.end && pa.end.date && pa.end.date.toISOString());
ok('A validity label', buildValidityLabel(pa) === 'Minggu, 20 September 2026 23:00 WIB', buildValidityLabel(pa));
ok('A main regions count', pa.mainRegions.length === 7, pa.mainRegions);
ok('A region title case', pa.mainRegions[1] === 'Jemaja Timur' && pa.mainRegions[6] === 'Siantan Timur', pa.mainRegions);
ok('A no expansion', pa.expansionRegions.length === 0, pa.expansionRegions);
ok('A time range', JSON.stringify(extractTimeRange(pa)) === JSON.stringify({from:'20:30', to:'23:00'}), extractTimeRange(pa));
const htmlA = buildDescHtml(pa);
ok('A bold regions', htmlA.includes('<strong class="desc-region">Jemaja, Jemaja Timur, Palmatak, Siantan, Siantan Selatan, Siantan Tengah, Siantan Timur</strong>'), htmlA.slice(0, 400));
ok('A original text kept', htmlA.includes('pada 20 September 2026, 20:30 WIB'), '');

// Format B: legacy UPDATE format
const descB = 'UPDATE Peringatan Dini Cuaca Wilayah Kep. Riau tgl 13 Oktober 2025 pkl 18:00 WIB berpotensi terjadi Hujan Sedang-Lebat yang dapat disertai Kilat/Petir dan Angin Kencang pada pkl 18:20 WIB di BINTAN PESISIR, GUNUNG KIJANG. Dan dapat meluas ke wilayah TANJUNGPINANG BARAT, TANJUNGPINANG TIMUR. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 20:30 WIB. Prakirawan BMKG Kep. Riau';
const pb = parseNowcastText(descB);
ok('B header', pb.updateHeader && pb.updateHeader.province === 'Kep. Riau' && pb.updateHeader.time === '18:00' && pb.updateHeader.dateLabel === '13 Oktober 2025', pb.updateHeader);
ok('B start', pb.start && pb.start.time === '18:20' && pb.start.date && pb.start.date.toISOString() === '2025-10-13T11:20:00.000Z', pb.start && pb.start.date && pb.start.date.toISOString());
ok('B end inferred date', pb.end && pb.end.time === '20:30' && pb.end.date && pb.end.date.toISOString() === '2025-10-13T13:30:00.000Z', pb.end);
ok('B validity label', buildValidityLabel(pb) === 'Senin, 13 Oktober 2025 20:30 WIB', buildValidityLabel(pb));
ok('B main regions', pb.mainRegions.length === 2 && pb.mainRegions[0] === 'Bintan Pesisir', pb.mainRegions);
ok('B expansion regions', pb.expansionRegions.length === 2 && pb.expansionRegions[1] === 'Tanjungpinang Timur', pb.expansionRegions);
const htmlB = buildDescHtml(pb);
ok('B bold main', htmlB.includes('<strong class="desc-region">Bintan Pesisir, Gunung Kijang</strong>'), '');
ok('B bold expansion', htmlB.includes('<strong class="desc-region">Tanjungpinang Barat, Tanjungpinang Timur</strong>'), '');

// overnight case
const descC = 'UPDATE Peringatan Dini Cuaca Wilayah Kep. Riau tgl 13 Oktober 2025 pkl 23:00 WIB berpotensi terjadi hujan pada pkl 23:20 WIB di BINTAN. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 01:30 WIB';
const pc = parseNowcastText(descC);
ok('C overnight end', pc.end.date && pc.end.date.toISOString() === '2025-10-13T18:30:00.000Z', pc.end && pc.end.date && pc.end.date.toISOString());

// English month translation
const descD = 'Heavy rain will occur on 13 October 2025, 18:20 WIB in Kep. Riau, khususnya di SIANTAN. Kondisi diperkirakan dapat berlangsung hingga 13 October 2025, 20:30 WIB.';
const pd = parseNowcastText(descD);
ok('D english localized', pd.displayText.includes('13 Oktober 2025') && !pd.displayText.includes('October'), pd.displayText.slice(0,120));
ok('D end parsed', pd.end.date && pd.end.date.toISOString() === '2025-10-13T13:30:00.000Z', pd.end);

// prose guard
const pe = parseNowcastText('pada pkl 18:20 WIB di wilayah sekitar. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 20:00 WIB dan masyarakat dihimbau waspada');
ok('E prose not region', pe.mainRegionsRaw === null || pe.mainRegions.length <= 1, pe.mainRegionsRaw);

// URL toolkit
const link = 'https://www.bmkg.go.id/alerts/nowcast/id/CKR20260920006_alert.xml';
const meta = parseAlertAssetMeta(link);
ok('meta parse', meta && meta.id === 'CKR20260920006' && meta.station === 'CKR' && meta.year === '2026' && meta.month === '09' && meta.day === '20', meta);
ok('nowcast image url', buildNowcastingImageUrl(link, 0) === 'https://nowcasting.bmkg.go.id/infografis/CKR/2026/09/20/CKR20260920006_image0.jpg', buildNowcastingImageUrl(link,0));
const web = 'https://nowcasting.bmkg.go.id/infografis/CKR/2026-09-20/infografis.jpg';
const groups = buildInfografisCandidateGroups(link, web);
ok('group1 = api', groups[0].kind === 'api' && groups[0].urls[0] === 'https://api-apps.bmkg.go.id/api/warningcuaca/image?path=CKR-2026-09-20-CKR20260920006_image0.jpg', groups[0] && groups[0].urls[0]);
ok('group2 = web', groups[1].kind === 'web' && groups[1].urls[0] === web, groups[1] && groups[1].urls[0]);
const kinds = groups.map(g => g.kind).join(',');
ok('group kinds', kinds === 'api,web,alert,alert,daily' || kinds === 'api,web,alert,alert,daily,today', kinds);
const all = groups.flatMap(g => g.urls);
ok('has api image1', all.includes('https://api-apps.bmkg.go.id/api/warningcuaca/image?path=CKR-2026-09-20-CKR20260920006_image1.jpg'), '');
ok('has flat per-alert', all.includes('https://nowcasting.bmkg.go.id/infografis/CKR/2026-09-20/CKR20260920006_image0.jpg'), '');
ok('has hier per-alert', all.includes('https://nowcasting.bmkg.go.id/infografis/CKR/2026/09/20/CKR20260920006_image0.jpg'), '');
ok('has hier daily', all.includes('https://nowcasting.bmkg.go.id/infografis/CKR/2026/09/20/infografis.jpg'), '');
ok('no dupes', new Set(all).size === all.length, all.length);
ok('no em dash in urls', !all.some(u => u.includes('—')), '');
const g2 = buildInfografisCandidateGroups(link, '');
ok('no-web first group', g2[0].kind === 'api' && g2[1].kind === 'alert', g2.map(g=>g.kind).join(','));
const g3 = buildInfografisCandidateGroups('https://www.bmkg.go.id/alerts/nowcast/id/TJB20201013001_alert.xml', '');
ok('today fallback present', g3.some(g => g.kind === 'today'), g3.map(g=>g.kind).join(','));

/* Pill waktu: akhir lintas hari mendapat sufiks tanggal; aria memuat
   keterangan berlaku sampai lengkap. */
const dStart = new Date(Date.UTC(2026, 8, 20, 13, 30)); // 20:30 WIB
const dEndSame = new Date(Date.UTC(2026, 8, 20, 16, 0)); // 23:00 WIB hari sama
const dEndNext = new Date(Date.UTC(2026, 8, 21, 16, 0)); // 23:00 WIB hari berikut
const optsSame = buildPillOpts(dStart, dEndSame, 'WIB');
const optsNext = buildPillOpts(dStart, dEndNext, 'WIB');
ok('pill same-day no suffix', !('toSuffix' in optsSame), optsSame);
ok('pill cross-day suffix', optsNext.toSuffix === '21 Sep', optsNext);
ok('pill full until label', String(optsNext.fullUntil).indexOf('Senin, 21 September 2026 23:00 WIB') === 0, optsNext.fullUntil);
const pillHtml = buildTimePillHtml('20:30', '23:00', 'WIB', optsNext);
ok('pill html suffix rendered', pillHtml.includes('time-pill-date') && pillHtml.includes('(21 Sep)'), pillHtml);
ok('pill html aria until', pillHtml.includes('Berlaku sampai Senin, 21 September 2026 23:00 WIB') && pillHtml.includes('Peringatan berlaku 20:30 sampai Senin, 21 September 2026 23:00 WIB'), pillHtml);
ok('pill html no suffix same day', !buildTimePillHtml('20:30', '23:00', 'WIB', optsSame).includes('time-pill-date'), '');

console.log(failures ? ('FAILURES: ' + failures) : 'ALL UNIT TESTS PASSED');
process.exit(failures ? 1 : 0);
'''

out = HEAD + url_toolkit + '\n' + nm + '\n' + esc + '\n' + parser + '\n' + BODY
open(os.path.join(here, 'test_parse.mjs'), 'w', encoding='utf-8').write(out)
print('test_parse.mjs regenerated from live index.html')
