# PRODUCT REQUIREMENTS DOCUMENT
# Early Warning System (EWS)
### Sistem Pemantauan Anggaran Proyek Kontraktor

| | |
|---|---|
| **Versi** | 1.0.0 |
| **Tanggal** | Juni 2025 |
| **Status** | Draft untuk Demo |
| **Tipe Dokumen** | Product Requirements Document |

---

## 1. Ringkasan Eksekutif

Early Warning System (EWS) adalah aplikasi web fungsional yang dirancang untuk membantu owner perusahaan kontraktor dalam memantau realisasi anggaran proyek secara real-time. Sistem ini memberikan peringatan dini sebelum terjadi budget overrun, menggantikan proses manual berbasis Excel yang selama ini menjadi penyebab keterlambatan deteksi masalah keuangan proyek.

Perusahaan kontraktor yang menjadi target pengguna mengelola lebih dari 15 proyek secara bersamaan dengan beragam jenis pekerjaan. Tantangan utama yang dihadapi adalah ketidakmampuan untuk mendeteksi potensi pembengkakan biaya secara tepat waktu, karena laporan keuangan baru tersedia pada akhir bulan.

### 1.1 Tujuan Produk

- Memberikan visibilitas real-time terhadap realisasi anggaran seluruh proyek
- Mendeteksi potensi budget overrun sebelum terjadi (preventif)
- Memberikan notifikasi otomatis ketika anggaran mendekati atau melebihi threshold
- Menggantikan proses pencatatan manual Excel dengan sistem terpusat yang dapat diakses via mobile
- Menyediakan laporan yang dapat diekspor dalam format PDF dan Excel

### 1.2 Target Pengguna

| Role | Jumlah User | Kebutuhan Utama |
|---|---|---|
| **Owner** | 1 orang | Dashboard ringkas, alert EWS, konfigurasi threshold & notifikasi, akses penuh |
| **Finance** | 1 orang | Input transaksi, verifikasi pengeluaran, export laporan, akses semua proyek |
| **Site Manager** | Per proyek | Pengajuan kebutuhan, monitoring anggaran proyek yang ditangani saja |

---

## 2. Latar Belakang & Analisis Masalah

### 2.1 Kondisi Saat Ini (As-Is)

Proses bisnis saat ini berjalan secara manual dengan alur berikut:

| Tahap | Pelaku | Aktivitas | Media | Masalah |
|---|---|---|---|---|
| 1 | Site Manager | Mengajukan kebutuhan material/jasa | WA / Lisan | Tidak ada jejak digital yang terstruktur |
| 2 | Procurement | Memproses PO ke vendor | Excel / Manual | Data tersebar, tidak terintegrasi |
| 3 | Finance | Mencatat invoice & pengeluaran | Excel | 1 orang menangani 15+ proyek |
| 4 | Owner | Approve pengeluaran | WA / Lisan | Tidak ada agregasi per proyek |
| 5 | Finance | Membuat laporan bulanan | Excel | Overrun baru ketahuan di akhir bulan |

### 2.2 Root Cause Masalah

- Tidak ada sistem peringatan dini — owner baru mengetahui overrun dari laporan bulanan
- Pencatatan manual di Excel rentan terhadap keterlambatan dan human error
- Pengeluaran informal (tanpa bon/kwitansi) yang hanya dilaporkan via WA menciptakan blind spot
- Satu Finance menangani 15+ proyek tanpa alat bantu monitoring yang memadai
- Tidak ada visibilitas real-time terhadap persentase penyerapan anggaran per proyek

### 2.3 Dampak Bisnis

- Profit margin tergerus akibat budget overrun yang tidak terdeteksi tepat waktu
- Estimasi biaya proyek yang kurang akurat karena tidak ada data historis realisasi yang terstruktur
- Risiko keuangan meningkat seiring pertumbuhan jumlah proyek yang ditangani

---

## 3. Solusi & Ruang Lingkup

### 3.1 Deskripsi Solusi

EWS adalah aplikasi web fungsional yang menyediakan dashboard terpusat untuk memantau seluruh proyek, dilengkapi sistem alert otomatis berbasis threshold yang dapat dikonfigurasi per proyek. Sistem ini mencakup alur input transaksi digital yang menggantikan proses manual, notifikasi multi-channel, dan kemampuan ekspor laporan.

### 3.2 Ruang Lingkup (Dalam Scope)

- Manajemen proyek: input proyek baru, setting budget (RAB/global), dan tracking status
- Alur transaksi digital: Site Manager mengajukan kebutuhan → Finance input realisasi → sistem update otomatis
- Dashboard eksekutif: ringkasan semua proyek dengan indikator visual status anggaran
- Engine EWS: kalkulasi real-time persentase penyerapan anggaran dan trigger alert
- Konfigurasi threshold: Owner dapat set level peringatan (%) per proyek secara manual
- Notifikasi multi-channel: in-app, simulasi WhatsApp, simulasi email
- Manajemen role & akses: Owner, Finance, Site Manager dengan hak akses berbeda
- Laporan export: PDF dan Excel per proyek maupun agregat
- Mobile-responsive: dapat diakses nyaman di smartphone

### 3.3 Di Luar Ruang Lingkup (Out of Scope)

- Integrasi langsung dengan sistem akuntansi eksternal (SAP, Accurate, dll)
- Modul payroll atau penggajian
- Fitur manajemen kontrak dan dokumen legal
- Integrasi WhatsApp API nyata (pada fase demo menggunakan simulasi)
- Migrasi data historis dari Excel (belum diputuskan)

---

## 4. Fitur & Persyaratan Fungsional

### 4.1 Modul Autentikasi & Manajemen User

#### 4.1.1 Login Multi-User

- Sistem login berbasis email dan password
- Setiap user memiliki role yang ditentukan: Owner, Finance, atau Site Manager
- Session management dengan timeout otomatis untuk keamanan
- Owner dapat membuat, mengedit, dan menonaktifkan akun user

#### 4.1.2 Hak Akses per Role

| Fitur / Akses | Owner | Finance | Site Manager |
|---|:---:|:---:|:---:|
| Dashboard semua proyek | ✓ | ✓ | ✗ |
| Dashboard proyek sendiri | ✓ | ✓ | ✓ |
| Input/edit proyek baru | ✓ | ✓ | ✗ |
| Ajukan kebutuhan (pengajuan) | ✓ | ✓ | ✓ |
| Input realisasi transaksi | ✓ | ✓ | ✗ |
| Setting threshold EWS | ✓ | ✗ | ✗ |
| Konfigurasi penerima notifikasi | ✓ | ✗ | ✗ |
| Export laporan PDF & Excel | ✓ | ✓ | ✗ |
| Manajemen user & role | ✓ | ✗ | ✗ |

### 4.2 Modul Manajemen Proyek

- Input proyek baru: nama proyek, jenis proyek, nilai PO, tanggal mulai dan selesai, Site Manager penanggung jawab
- Dua metode penetapan budget: (a) RAB terinci per kategori pengeluaran, atau (b) persentase global dari nilai PO
- Update status proyek: Aktif, Selesai, Ditunda, Dibatalkan
- Riwayat perubahan budget jika ada revisi RAB

### 4.3 Modul Input Transaksi

#### 4.3.1 Alur Pengajuan Kebutuhan (Site Manager)

- Form pengajuan kebutuhan: deskripsi item, estimasi biaya, kategori (material/jasa/alat/lainnya), catatan tambahan
- Upload dokumen pendukung (opsional): foto bon, foto kwitansi
- Status pengajuan: Menunggu Persetujuan, Disetujui, Ditolak

#### 4.3.2 Input Realisasi Transaksi (Finance)

- Input berdasarkan jenis dokumen: PO ke vendor, Invoice dari vendor, Bon/Kwitansi, Pengeluaran tanpa dokumen
- Field: nominal, tanggal, vendor/pihak penerima, kategori, keterangan, status approve owner
- Sistem otomatis memperbarui persentase realisasi anggaran setelah transaksi disimpan
- Trigger EWS engine berjalan setiap kali ada transaksi baru

### 4.4 Modul Dashboard

#### 4.4.1 Dashboard Owner (Executive Summary)

- Kartu ringkasan: total proyek aktif, total nilai PO, total realisasi, total sisa anggaran
- Daftar proyek dengan indikator status anggaran berwarna: Hijau (aman), Kuning (waspada), Merah (kritis)
- Progress bar visual untuk setiap proyek menampilkan persentase penyerapan anggaran
- Filter proyek berdasarkan status dan jenis proyek
- Klik proyek untuk masuk ke detail proyek

#### 4.4.2 Dashboard Detail Proyek

- Informasi umum proyek: nilai PO, total budget, realisasi, sisa, persentase terpakai
- Grafik progres penyerapan anggaran dari waktu ke waktu
- Riwayat transaksi: tabel semua pengeluaran dengan filter dan pencarian
- Status threshold EWS aktif untuk proyek tersebut

### 4.5 Modul EWS (Early Warning System)

#### 4.5.1 Konfigurasi Threshold

- Owner dapat menetapkan hingga 3 level threshold per proyek (dalam persentase penyerapan anggaran)
- Contoh: Level 1 Waspada (70%), Level 2 Bahaya (85%), Level 3 Kritis (95%)
- Threshold dapat diubah kapan saja oleh Owner
- Default threshold berlaku jika Owner belum melakukan konfigurasi manual

#### 4.5.2 Logika Alert

| Level Alert | Kondisi Default | Warna Indikator | Keterangan |
|---|---|---|---|
| Aman | < 70% | 🟢 Hijau | Tidak ada alert |
| Waspada | 70% - 84% | 🟡 Kuning | Notifikasi pertama dikirim |
| Bahaya | 85% - 94% | 🟠 Oranye | Notifikasi eskalasi dikirim |
| Kritis | >= 95% | 🔴 Merah | Notifikasi darurat dikirim |
| Overrun | > 100% | 🔴 Merah Gelap | Budget melebihi batas, alert mendesak |

#### 4.5.3 Notifikasi Multi-Channel

- **In-app:** notifikasi muncul di dalam aplikasi dengan badge counter dan riwayat notifikasi
- **Simulasi WhatsApp:** tampilkan preview pesan WhatsApp yang akan dikirim (fase demo)
- **Simulasi Email:** tampilkan preview email notifikasi dengan format lengkap (fase demo)
- **Frekuensi:** alert dikirim satu kali saat threshold pertama kali terlampaui, dan ulang jika ada kenaikan level

#### 4.5.4 Konfigurasi Penerima Notifikasi

- Owner dapat mengatur siapa yang menerima alert untuk setiap level per proyek
- Pilihan penerima: Owner, Finance, Site Manager proyek terkait
- Pengaturan dapat berbeda per proyek dan per level alert

### 4.6 Modul Laporan & Export

- Laporan Ringkasan Semua Proyek: status anggaran semua proyek dalam satu dokumen
- Laporan Detail Per Proyek: riwayat transaksi lengkap, grafik penyerapan, breakdown per kategori
- Format export: PDF (untuk presentasi/arsip) dan Excel (untuk analisis lanjutan)
- Filter laporan: berdasarkan periode waktu, status proyek, atau proyek tertentu
- Laporan mencantumkan tanggal cetak, nama user yang mengunduh, dan periode data

---

## 5. Persyaratan Non-Fungsional

| Kategori | Persyaratan | Detail |
|---|---|---|
| **Aksesibilitas** | Mobile-responsive | Tampilan optimal di smartphone Android/iOS dan desktop |
| **Performa** | Kecepatan loading | Dashboard utama termuat dalam < 3 detik |
| **Keamanan** | Autentikasi | Login dengan session token, akses berbasis role |
| **Keandalan** | Data konsisten | Kalkulasi EWS diperbarui real-time setelah transaksi masuk |
| **Skalabilitas** | Kapasitas proyek | Mendukung minimal 50 proyek aktif bersamaan |
| **Kemudahan Pakai** | UX sederhana | Navigasi intuitif, minimalis, cocok untuk pengguna non-teknis |

---

## 6. Arsitektur & Stack Teknologi (Rekomendasi)

### 6.1 Stack Teknologi

| Komponen | Teknologi | Alasan |
|---|---|---|
| **Frontend** | React.js + Tailwind CSS | Cepat, mobile-responsive, ekosistem komponen lengkap |
| **Backend** | Node.js + Express | Ringan, cocok untuk REST API dan real-time |
| **Database** | PostgreSQL | Relasional, andal untuk data keuangan |
| **Autentikasi** | JWT (JSON Web Token) | Stateless, aman, mudah diimplementasi |
| **Export Laporan** | PDFKit + ExcelJS | Library terpercaya untuk generate PDF dan Excel |
| **Notifikasi WA** | WhatsApp Business API | Fase demo: simulasi; fase produksi: integrasi API resmi |
| **Notifikasi Email** | Nodemailer / SendGrid | Pengiriman email transaksional yang andal |

---

## 7. User Stories

### 7.1 Owner

- Sebagai Owner, saya ingin melihat ringkasan semua proyek dalam satu dashboard agar dapat mengetahui status kesehatan anggaran secara sekilas
- Sebagai Owner, saya ingin menerima notifikasi via WhatsApp dan email ketika realisasi anggaran proyek mendekati batas agar dapat mengambil tindakan sebelum overrun terjadi
- Sebagai Owner, saya ingin mengatur batas threshold peringatan per proyek secara manual agar sistem alert sesuai dengan toleransi risiko setiap proyek
- Sebagai Owner, saya ingin memilih siapa yang menerima notifikasi untuk setiap proyek agar informasi tepat sasaran
- Sebagai Owner, saya ingin mengunduh laporan ringkasan dalam format PDF agar dapat dibagikan ke stakeholder

### 7.2 Finance

- Sebagai Finance, saya ingin menginput transaksi pengeluaran dengan mudah beserta jenisnya (PO/invoice/bon/tanpa dokumen) agar pencatatan lebih terstruktur
- Sebagai Finance, saya ingin melihat semua proyek dan status anggarannya agar dapat memprioritaskan pelaporan
- Sebagai Finance, saya ingin mengekspor laporan detail per proyek ke Excel agar dapat melakukan analisis lebih lanjut

### 7.3 Site Manager

- Sebagai Site Manager, saya ingin mengajukan kebutuhan material atau jasa melalui aplikasi agar tidak perlu lapor via WA setiap saat
- Sebagai Site Manager, saya ingin melihat sisa anggaran proyek saya agar dapat menyesuaikan kebutuhan di lapangan
- Sebagai Site Manager, saya ingin mendapatkan notifikasi jika anggaran proyek saya mendekati batas agar saya dapat lebih selektif dalam pengajuan kebutuhan

---

## 8. Skenario Data Dummy untuk Demo

### 8.1 Daftar Proyek Dummy

| Nama Proyek | Jenis | Nilai PO | Budget | Realisasi |
|---|---|---|---|---|
| Pengadaan Spare Part Turbin A | Pengadaan | Rp 500 Jt | 65% PO | 91% → 🔴 Kritis |
| Pembangunan Gedung Kantor B | Konstruksi | Rp 2 M | RAB | 72% → 🟡 Waspada |
| Perbaikan Mesin Press C | Jasa Perbaikan | Rp 150 Jt | 70% PO | 55% → 🟢 Aman |
| Renovasi Gudang D | Konstruksi | Rp 800 Jt | RAB | 103% → 🔴 Overrun |
| Pengadaan Panel Listrik E | Pengadaan | Rp 300 Jt | 68% PO | 40% → 🟢 Aman |
| Pemasangan CCTV Pabrik F | Pengadaan | Rp 120 Jt | 65% PO | 88% → 🟠 Bahaya |
| Pembangunan Pos Satpam G | Konstruksi | Rp 200 Jt | RAB | 60% → 🟢 Aman |
| Jasa Kalibrasi Alat Ukur H | Jasa | Rp 80 Jt | 70% PO | 95% → 🔴 Kritis |
| Pengadaan Genset Cadangan I | Pengadaan | Rp 450 Jt | 65% PO | 78% → 🟡 Waspada |
| Renovasi Toilet Kantor J | Konstruksi | Rp 150 Jt | RAB | 50% → 🟢 Aman |
| Jasa Cleaning Service K | Jasa | Rp 60 Jt | 80% PO | 105% → 🔴 Overrun |
| Pengadaan UPS Server L | Pengadaan | Rp 200 Jt | 65% PO | 82% → 🟠 Bahaya |
| Perbaikan Atap Gudang M | Konstruksi | Rp 350 Jt | RAB | 45% → 🟢 Aman |
| Jasa Pest Control N | Jasa | Rp 40 Jt | 75% PO | 70% → 🟡 Waspada |
| Pengadaan Peralatan K3 O | Pengadaan | Rp 100 Jt | 70% PO | 65% → 🟢 Aman |

> Data dummy mencakup 15 proyek dengan variasi lengkap status EWS (Aman, Waspada, Bahaya, Kritis, Overrun) untuk mendemonstrasikan seluruh skenario peringatan kepada owner.

---

## 9. Roadmap Pengembangan

### 9.1 Roadmap Produk (Jangka Panjang)

| Fase Produk | Timeline | Deliverable |
|---|---|---|
| **Fase 0 - Demo** | 2-3 Minggu | Aplikasi web fungsional dengan data dummy, mencakup dashboard, input transaksi, EWS, notifikasi simulasi, dan export laporan |
| **Fase 1 - MVP** | 6-8 Minggu | Integrasi database nyata, login multi-user production, notifikasi WA & email nyata, deployment ke server |
| **Fase 2 - Growth** | 4-6 Minggu | Migrasi data historis dari Excel, fitur laporan lanjutan, analitik tren anggaran, notifikasi terjadwal |
| **Fase 3 - Scale** | Ongoing | Integrasi sistem akuntansi, mobile app native, AI-based budget prediction |

### 9.2 Rencana Build Fase Demo (Urutan Pengembangan)

Pengembangan aplikasi demo dilaksanakan secara bertahap dalam 6 fase build yang berurutan. Setiap fase menghasilkan komponen yang langsung dapat diuji sebelum lanjut ke fase berikutnya.

| Fase Build | Nama | Cakupan & Deliverable |
|---|---|---|
| **Fase A** | Fondasi & Autentikasi | Setup project, halaman login multi-user, routing berbasis role (Owner/Finance/Site Manager), session management, halaman awal per role |
| **Fase B** | Manajemen Proyek | Form input proyek baru, setting budget (RAB terinci & global % PO), list proyek dengan filter & status, assignment Site Manager per proyek, data dummy 15+ proyek |
| **Fase C** | Dashboard | Executive summary Owner (kartu ringkasan, progress bar, indikator warna EWS), dashboard detail per proyek (grafik penyerapan, riwayat transaksi), dashboard terbatas Site Manager hanya proyek sendiri |
| **Fase D** | Alur Transaksi | Form pengajuan kebutuhan Site Manager (deskripsi, estimasi, kategori, upload dokumen opsional), form input realisasi Finance (PO/invoice/bon/tanpa dokumen), update otomatis persentase realisasi setelah transaksi masuk |
| **Fase E** | EWS Engine & Notifikasi | Kalkulasi threshold real-time, trigger alert per level (Waspada/Bahaya/Kritis/Overrun), halaman konfigurasi threshold per proyek, konfigurasi penerima notifikasi, in-app notification center, simulasi pesan WhatsApp, simulasi email notifikasi |
| **Fase F** | Laporan & Export | Laporan ringkasan semua proyek, laporan detail per proyek, filter berdasarkan periode dan status, export ke PDF (format rapi siap presentasi), export ke Excel (data terstruktur siap analisis) |

### 9.3 Ketergantungan Antar Fase Build

| Fase Build | Prasyarat | Output untuk Fase Berikutnya |
|---|---|---|
| **Fase A** | Tidak ada (titik awal) | Sistem auth & routing siap digunakan fase B-F |
| **Fase B** | Fase A selesai | Data proyek & struktur budget siap untuk dashboard dan transaksi |
| **Fase C** | Fase A & B selesai | Dashboard siap menampilkan data EWS dari Fase E |
| **Fase D** | Fase A & B selesai | Data transaksi siap menjadi trigger EWS di Fase E |
| **Fase E** | Fase A, B, C & D selesai | Data alert dan notifikasi siap untuk ditampilkan di laporan Fase F |
| **Fase F** | Semua fase selesai | Aplikasi demo lengkap dan siap dipresentasikan ke owner |

---

## 10. Kriteria Sukses Demo

- Owner dapat melihat status semua proyek dalam satu tampilan dashboard tanpa perlu buka file Excel
- Sistem berhasil menampilkan alert berwarna yang berbeda sesuai level threshold yang dikonfigurasi
- Simulasi input transaksi dari Site Manager terbukti langsung memperbarui persentase anggaran dan trigger notifikasi
- Notifikasi simulasi WhatsApp dan email tampil dengan konten yang relevan dan informatif
- Laporan berhasil diekspor dalam format PDF dan Excel dengan data yang akurat
- Tampilan dapat diakses dan nyaman digunakan di smartphone
- Owner memahami value proposition sistem dan tertarik untuk melanjutkan ke fase MVP

---

*Dokumen ini bersifat draft untuk keperluan demo internal. Diperlukan persetujuan owner sebelum pengembangan dilanjutkan ke Fase 1.*

*© 2025 EWS System - Dokumen Internal*
