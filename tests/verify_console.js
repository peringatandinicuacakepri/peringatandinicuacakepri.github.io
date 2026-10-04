/* Tempel seluruh isi file ini ke konsol browser (F12) pada halaman aplikasi
   untuk verifikasi mandiri cepat. Memakai API debug window.__BMKG__
   plus pemeriksaan DOM. Tidak mengubah tampilan apa pun. */
(function () {
  var B = window.__BMKG__;
  if (!B) { console.error('API debug tidak ditemukan. Pastikan index.html versi terbaru.'); return; }
  var out = [];
  function t(name, cond) { out.push((cond ? 'PASS ' : 'FAIL ') + name); }

  var p = B.parse('Hujan lebat akan terjadi pada 20 September 2026, 20:30 WIB di sebagian wilayah Kep. Riau, khususnya di JEMAJA, SIANTAN TIMUR. Kondisi diperkirakan dapat berlangsung hingga 20 September 2026, 23:00 WIB.');
  t('parser: wilayah kapital per kata', p.mainRegions.join(', ') === 'Jemaja, Siantan Timur');
  t('parser: banner berlaku', B.validity(p) === 'Minggu, 20 September 2026 23:00 WIB');
  t('parser: rentang waktu', JSON.stringify(B.timeRange(p)) === JSON.stringify({ from: '20:30', to: '23:00' }));

  var u = B.parse('UPDATE Peringatan Dini Cuaca Wilayah Kep. Riau tgl 13 Oktober 2025 pkl 18:00 WIB pada pkl 18:20 WIB di BINTAN PESISIR. Dan dapat meluas ke wilayah TANJUNGPINANG BARAT. Kondisi ini diperkirakan masih dapat berlangsung hingga pkl 20:30 WIB');
  t('parser: format UPDATE + wilayah meluas', u.mainRegions[0] === 'Bintan Pesisir' && u.expansionRegions[0] === 'Tanjungpinang Barat');

  var g = B.candidates('https://www.bmkg.go.id/alerts/nowcast/id/CKR20260920006_alert.xml', 'https://nowcasting.bmkg.go.id/infografis/CKR/2026-09-20/infografis.jpg');
  t('url: tag <web> jadi kandidat pertama', g[0].urls[0].indexOf('2026-09-20/infografis.jpg') !== -1);
  t('url: fallback folder lama tersedia', g.reduce(function (a, x) { return a.concat(x.urls); }, []).some(function (x) { return x.indexOf('/2026/09/20/') !== -1; }));

  var dc = document.getElementById('dc');
  t('dom: kartu terrender', !!dc && dc.innerHTML.length > 100);
  t('dom: tanpa em-dash', !dc.innerHTML.includes('—'));
  t('dom: peta tombol asli atau fallback jujur', !!document.querySelector('button.map-container') || !!document.querySelector('.map-error-state'));
  t('dom: lightbox punya slide', B.state().slides >= 1);

  var fail = out.some(function (x) { return x.indexOf('FAIL') === 0; });
  console.log(out.join('\n') + '\n' + (fail ? 'ADA CEK YANG GAGAL' : 'SEMUA CEK LOLOS'));
})();
