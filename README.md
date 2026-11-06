# 📋 Modern TaskBoard (CRUD PHP, HTML, CSS, JS & Database)

Aplikasi Taskboard berbasis Kanban modern, simpel, rapi, dan responsif dengan fitur CRUD lengkap untuk mencatat tugas, deadline tanggal, status pengerjaan, dan catatan keterangan progres (update sampai tahap mana).

## ✨ Fitur Utama
1. **CRUD Lengkap**:
   - **Create**: Tambah tugas baru dengan nama tugas, target tanggal selesai, status, dan keterangan progres.
   - **Read**: Tampilan interaktif papan Kanban 3 kolom (*Belum Dikerjakan*, *Sedang Dikerjakan*, *Done*) serta toggle ke Tampilan Tabel/List.
   - **Update**: Edit tugas melalui modal interaktif atau langsung ubah status dengan cepat.
   - **Delete**: Hapus tugas dengan dialog konfirmasi aman.
2. **Drag & Drop Interaktif**:
   - Kartu tugas dapat di-drag & drop langsung antar kolom Kanban untuk mengubah status secara real-time.
   - Tersedia juga pemilih status cepat (*quick select*) pada setiap kartu untuk pengguna mobile / touchscreen.
3. **Database Tersimpan Aman (Persistent)**:
   - **SQLite (Default - Langsung Jalan)**: Tidak perlu membuat database manual di phpMyAdmin. File database tersimpan otomatis di `database.sqlite` dan tidak akan hilang saat browser ditutup.
   - **MySQL Support**: Tersedia opsi beralih ke MySQL di Laragon/XAMPP hanya dengan mengganti 1 baris pengaturan di `config.php`.
4. **Dashboard & Statistik Real-Time**:
   - Menghitung otomatis total tugas, jumlah tugas belum dikerjakan, sedang dikerjakan, dan selesai.
   - Progress Bar persentase penyelesaian proyek.
5. **Pencarian & Filter Cepat**:
   - Filter berdasarkan status atau cari tugas berdasarkan nama / catatan keterangan secara instan tanpa reload halaman.
6. **UI/UX Bersih & Rapi**:
   - Desain minimalis modern berbasis Tailwind-inspired design tokens.
   - Badge tanggal pintar (indikator *Hari Ini*, *Besok*, atau *Terlewat* warna merah jika melewati deadline).
   - Animasi transisi halus dan notifikasi toast saat ada perubahan.

---

## 🚀 Cara Menjalankan

### Cara 1: Menggunakan Laragon (Rekomendasi)
Karena folder projek berada di `C:\laragon\www\taskboard`:
1. Buka aplikasi **Laragon**.
2. Klik tombol **Start All**.
3. Buka browser dan kunjungi salah satu URL berikut:
   - [http://localhost/taskboard](http://localhost/taskboard)
   - atau [http://taskboard.test](http://taskboard.test) (jika fitur virtual host Laragon aktif).

### Cara 2: Menggunakan PHP Built-in Server
Jika ingin menjalankan langsung dari terminal tanpa web server penuh:
```bash
cd c:\laragon\www\taskboard
php -S localhost:8000
```
Lalu buka browser di [http://localhost:8000](http://localhost:8000).

---

## 🗄️ Konfigurasi Database (SQLite vs MySQL)

Buka file `config.php`:
```php
// Pilihan: 'sqlite' (bawaan) atau 'mysql'
define('DB_DRIVER', 'sqlite');
```

- **SQLite (Bawaan)**: 
  Sangat praktis, data otomatis tersimpan di file `database.sqlite` di dalam folder ini.
- **MySQL**:
  Jika Anda ingin menggunakan MySQL di Laragon:
  1. Ubah `define('DB_DRIVER', 'mysql');` di `config.php`.
  2. Sistem akan otomatis membuat database `taskboard_db` dan tabel `tasks` bila belum ada.
  3. File SQL manual juga sudah disediakan di file `database.sql`.

---

## 📂 Struktur File
```
c:\laragon\www\taskboard\
│
├── index.php             # Antarmuka utama (Kanban, Toolbar, Modal)
├── config.php            # Konfigurasi database & driver
├── db.php                # Koneksi PDO & auto-migration database
├── api.php               # Endpoint JSON REST API (CRUD & update status)
├── database.sql          # Skema database MySQL
├── database.sqlite       # Database SQLite lokal (dibuat otomatis)
├── assets/
│   ├── css/
│   │   └── style.css     # Styling tampilan modern & responsif
│   └── js/
│       └── app.js        # Logika Drag-and-Drop, AJAX CRUD, search & filter
└── README.md             # Dokumentasi
```
