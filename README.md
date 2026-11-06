# 📋 TaskBoard (Next.js & Vercel Ready)

Aplikasi Taskboard Kanban modern berbasis **Next.js (App Router)**, **React**, **TypeScript**, dan **Tailwind CSS**. Dilengkapi fitur CRUD lengkap, target tanggal/deadline, status pengerjaan, dan catatan tahap progres yang tersimpan aman ke database serta siap langsung di-deploy ke **Vercel**.

---

## ✨ Fitur Utama
1. **CRUD Lengkap**:
   - **Create**: Tambah tugas baru dengan nama tugas, target tanggal, status, dan keterangan progres.
   - **Read**: Papan Kanban 3 Kolom (*Belum Dikerjakan*, *Sedang Dikerjakan*, *Done*) & Toggle ke Tampilan Tabel.
   - **Update**: Edit tugas lewat modal dialog atau ganti status secara instan via Drag & Drop.
   - **Delete**: Hapus tugas dengan dialog konfirmasi aman.
2. **Drag & Drop Interaktif**:
   - Pindahkan kartu tugas antar kolom status secara langsung dengan animasi mulus.
   - Tersedia juga pemilih status cepat (*quick select*) di setiap kartu untuk perangkat layar sentuh / mobile.
3. **Database & Penyimpanan Aman (Tidak Hilang Saat Ditutup)**:
   - **Otomatis Tersimpan di Browser (LocalStorage)**: Langsung berjalan tanpa setup apa pun. Data tetap tersimpan rapi dan tidak akan hilang saat browser ditutup atau direfresh.
   - **Cloud PostgreSQL Ready (Vercel / Neon / Supabase)**: Cukup pasang environment variable `DATABASE_URL` di Vercel atau file `.env.local`, aplikasi akan otomatis membuat tabel dan menyinkronkan data ke PostgreSQL!
   - **Fitur Export & Import JSON**: Cadangkan atau pulihkan data tugas Anda kapan saja hanya dengan 1 klik.
4. **Desain Bersih, Rapi & Responsif (UI/UX)**:
   - Tampilan modern berbasis Tailwind CSS & ikon Lucide.
   - Indikator tanggal pintar (*Terlewat* warna merah, *Hari Ini* warna kuning, *Besok*, dll.).
   - Kotak highlight keterangan tahap progres.
   - Pencarian instan (*real-time search*) dan filter status.
   - Bar persentase penyelesaian proyek otomatis.

---

## 🚀 Menjalankan di Komputer Lokal

1. **Install dependensi** (jika belum):
   ```bash
   npm install
   ```
2. **Jalankan development server**:
   ```bash
   npm run dev
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🌐 Cara Deploy ke Vercel

Projek ini sudah **100% siap untuk Vercel**! Anda bisa mendeploynya dengan salah satu cara berikut:

### Opsi A: Lewat Vercel Dashboard (Rekomendasi)
1. Push repository ini ke **GitHub**, **GitLab**, atau **Bitbucket**.
2. Buka [https://vercel.com](https://vercel.com) dan login.
3. Klik **"Add New Project"** lalu pilih repository Anda.
4. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
5. Klik **"Deploy"**!

### Opsi B: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🗄️ Menghubungkan ke Cloud Database di Vercel (Opsional)

Aplikasi sudah dapat berjalan dan menyimpan data secara otomatis di browser tanpa database eksternal. 

Namun jika Anda ingin data tersinkronisasi antar perangkat atau multi-user di cloud:
1. Di dashboard projek Vercel Anda, buka tab **Storage** lalu buat database **PostgreSQL (Neon / Vercel Postgres / Supabase)**.
2. Hubungkan database tersebut ke projek Anda. Vercel akan otomatis menyuntikkan environment variable `DATABASE_URL` / `POSTGRES_URL`.
3. Aplikasi akan otomatis mendeteksi koneksi tersebut, membuat tabel `tasks`, dan menyimpan data langsung ke PostgreSQL!

---

## 📁 Struktur Projek Next.js
```
taskboard/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts         # GET (list) & POST (create)
│   │       └── [id]/route.ts    # PUT (update) & DELETE (remove)
│   ├── globals.css              # Styling Tailwind CSS
│   ├── layout.tsx               # Root layout & font
│   └── page.tsx                 # Halaman utama TaskBoard
├── components/
│   ├── TaskCard.tsx             # Kartu tugas & drag-and-drop
│   ├── KanbanColumn.tsx         # Kolom status Kanban
│   ├── TaskModal.tsx            # Modal Tambah/Edit tugas
│   ├── DeleteModal.tsx          # Modal konfirmasi hapus
│   └── TaskTableView.tsx        # Tampilan alternatif tabel
├── lib/
│   └── db.ts                    # Driver koneksi cloud PostgreSQL (pg)
├── types/
│   └── task.ts                  # TypeScript types & interface
├── package.json
└── README.md
```
