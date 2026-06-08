<div align="center">

# 🌩️ Peringatan Dini Cuaca BMKG — Kepri

![License](https://img.shields.io/badge/License-MIT-cba6f7?style=for-the-badge&labelColor=302D41)
&nbsp;
![Web](https://img.shields.io/badge/Platform-Web-89b4fa?style=for-the-badge&labelColor=1e2030)
&nbsp;
![BMKG](https://img.shields.io/badge/Data-BMKG-a6e3a1?style=for-the-badge&labelColor=1f3701)
&nbsp;
![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub_Pages-f5c2e7?style=for-the-badge&labelColor=561f3a)

### Pantau peringatan dini cuaca Kepulauan Riau, tampilan kaca ala iOS, data langsung dari BMKG. ⛅

[Buka Website](https://peringatandinicuacakepri.github.io) • [Fitur](#-fitur) • [Tampilan](#-tampilan) • [Bantuan](#-bantuan) • [Sumber Data](#-sumber-data)

</div>

---

## 👋 Sekilas

Halaman ini saya bikin biar ngecek peringatan dini cuaca di **Kepulauan Riau** jadi gampang. Daripada buka banyak situs cuma buat tahu hari ini bakal hujan deras atau enggak, semua infonya saya kumpulin di satu halaman yang enak dilihat.

Datanya ditarik otomatis dari layanan resmi BMKG (area pantauan **Stasiun Meteorologi Hang Nadim, Batam**), jadi yang muncul itu info terbaru. Halamannya juga sengaja dibikin ringan supaya tetap lancar di HP yang udah agak tua.

---

## 📸 Tampilan

<div align="center">

| 💎 Mode Full | 🍃 Mode Ringan |
|:---:|:---:|
| ![Mode Full](screenshots/01-mode-full.png) | ![Mode Ringan](screenshots/02-mode-ringan.png) |
| *Efek Liquid Glass penuh* | *Versi hemat buat perangkat lama* |

<br/>

**🧭 Pilih peta favoritmu**

![Buka di Peta](screenshots/03-buka-di-peta.png)

<br/>

**🔍 Infografis bisa di-zoom & digeser**

| Tampilan peta wilayah | Detail teks peringatan |
|:---:|:---:|
| ![Infografis Zoom](screenshots/04-infografis-zoom.png) | ![Infografis Detail](screenshots/05-infografis-detail.png) |

</div>

---

## ✨ Fitur

- 🌦️ **Peringatan dini otomatis dari BMKG** — ditarik dari feed resmi, lengkap dengan nowcasting (prakiraan 0 sampai 6 jam ke depan)
- 🔄 **Update sendiri** — halaman menyegarkan data tiap beberapa menit, tanpa perlu refresh manual
- 🌗 **Dua mode tampilan** — Mode Full dengan efek kaca penuh, dan Mode Ringan yang lebih hemat buat perangkat lama
- 💎 **Desain Liquid Glass** — gaya kaca buram terinspirasi iOS, dengan kilau lembut dan judul bergradien
- 🔍 **Infografis interaktif** — bisa di-zoom, geser pakai panah, tutup pakai ESC
- 🧭 **Lihat lokasi di peta** — koordinat stasiun bisa langsung dibuka di aplikasi peta yang biasa kamu pakai
- 📱 **Responsif** — rapi di HP mungil sampai monitor lebar
- 🛡️ **Tahan banting** — punya jalur cadangan kalau sumber utama lagi error
- ♿ **Ramah aksesibilitas** — dilengkapi atribut `aria` untuk pembaca layar

---

## ⚙️ Cara Kerjanya

1. Halaman menarik feed peringatan dini (RSS) dari BMKG.
2. Isinya diolah jadi kartu peringatan rapi plus infografis wilayah terdampak.
3. Tiap beberapa menit, halaman ngecek lagi apakah ada pembaruan.
4. Kalau jalur utama gagal, otomatis pindah ke proxy cadangan biar data tetap kebuka.

Semuanya jalan di browser kamu (HTML, CSS, JavaScript biasa), tanpa server khusus.

---

## 🛟 Bantuan

<details>
<summary><b>Ini situs resmi BMKG, ya?</b></summary><br/>
Bukan. Ini proyek pribadi yang menampilkan ulang data BMKG biar lebih enak dibaca. Buat info paling resmi, tetap rujuk ke <a href="https://www.bmkg.go.id">bmkg.go.id</a>.
</details>

<details>
<summary><b>Datanya update berapa sering?</b></summary><br/>
Otomatis tiap 5 menit di Mode Full, dan tiap 10 menit di Mode Ringan biar lebih hemat.
</details>

<details>
<summary><b>Wilayahnya yang mana aja?</b></summary><br/>
Fokusnya Kepulauan Riau, mengikuti area pantauan Stasiun Meteorologi Hang Nadim, Batam.
</details>

<details>
<summary><b>Kok infografisnya kadang nggak muncul?</b></summary><br/>
Infografis dari BMKG memang nggak selalu tersedia tiap saat. Kalau belum ada buat hari itu, halaman bakal kasih tahu dan menyediakan tautan ke situs nowcasting BMKG.
</details>

<details>
<summary><b>Mode Ringan itu buat apa?</b></summary><br/>
Buat perangkat berspesifikasi rendah. Mode ini mematikan efek berat seperti blur dan animasi biar halaman tetap lancar, tapi tampilannya tetap diusahakan rapi.
</details>

<details>
<summary><b>Butuh internet, nggak?</b></summary><br/>
Butuh. Halaman ini ambil data cuaca secara langsung, jadi perlu koneksi internet buat nampilin info terbaru.
</details>

---

## 📊 Sumber Data

| Sumber | Kegunaan |
|:---|:---|
| [BMKG Nowcast API](https://nowcasting.bmkg.go.id/nowcast) | Sumber data resmi peringatan dini dan nowcasting cuaca (0 sampai 6 jam ke depan) |
| [BMKG Alerts RSS](https://www.bmkg.go.id/alerts/nowcast/id/rss.xml) | Feed RSS peringatan dini cuaca dari BMKG |
| [BMKG Infografis](https://nowcasting.bmkg.go.id/infografis/) | Gambar infografis wilayah terdampak (stasiun CKR / Kepri) |
| [Google Fonts](https://fonts.google.com) | Tipografi web (font Plus Jakarta Sans) |
| AllOrigins ([win](https://allorigins.win) & [hexlet](https://allorigins.hexlet.app)) | Proxy CORS untuk menarik data lintas domain dari browser |
| [corsproxy.io](https://corsproxy.io) | Proxy CORS cadangan kalau sumber utama gagal |

Koordinat stasiun yang dipakai ada di sekitar `1.119590, 104.113316` (Batam, Kepri).

> ⚠️ Data cuaca milik **Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)**. Halaman ini cuma menampilkan ulang, bukan sumber resmi.

---

## 🛠️ Dibangun Dengan

HTML, CSS, dan JavaScript polos (tanpa framework), semuanya muat dalam satu berkas `index.html`, dan di-hosting gratis lewat GitHub Pages.

---

## 🤝 Kontribusi

Nemu bug atau punya ide? Mampir aja ke [Issues](https://github.com/peringatandinicuacakepri/peringatandinicuacakepri.github.io/issues). Masukan sekecil apa pun saya terima dengan senang hati. Kalau suka sama proyek ini, kasih ⭐ juga boleh banget, lumayan buat penyemangat.

---

## ✉️ Kontak

Ada pertanyaan atau masukan? Silakan buka [Issues di GitHub](https://github.com/peringatandinicuacakepri/peringatandinicuacakepri.github.io/issues).

---

<div align="center">

Dibuat oleh **Jeremi Totti Manalu** 
(#-peringatan-dini-cuaca-bmkg--kepri)

</div>
